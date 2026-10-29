# 생애혜택 안내소 - 토스쇼핑 추천 상품 갱신 (오늘밥상물가 shop 폴더에 같이 넣고 써요)
# 매주 한 번 실행: 분야별 규칙(shop-rules.json, GitHub) → 토스쇼핑 카테고리 인기 상품 → 이름 규칙으로 고르기
#                 → 내 쉐어링크 발급 → saengae 저장소 docs/data/shop.json 올리기
# ⚠ 오늘밥상물가의 shop-lib.ps1 · shop-config.json 과 같은 폴더에 있어야 해요 (설정·한도·링크 저장을 같이 써요).
#    shop-config.json 의 githubToken 은 saengae 저장소에도 쓰기 권한이 있어야 해요 (README-saengae.txt 참고).

$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not (Test-Path (Join-Path $Here 'shop-lib.ps1'))) {
  Add-Content -Path (Join-Path $Here 'shop-log.txt') -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [생애혜택] shop-lib.ps1 이 없어요. 오늘밥상물가 shop 폴더에 이 파일을 넣어 주세요." -Encoding UTF8
  exit 1
}
. (Join-Path $Here 'shop-lib.ps1')

$SaRepo = 'yogibabayo7-glitch/saengae'
$SaCap = 4500   # 이 스크립트는 하루 한도 1만 개 중 여기까지만 써요 (나머지는 오늘밥상물가 몫)
function SLog($m) { Log "[생애혜택] $m" }

SLog "시작 · 카테고리 $($flat.Count)개 · 오늘 이미 쓴 조회 $($Q.used)개"
if ($Q.used -ge $SaCap) { SLog "오늘 조회 한도를 이미 많이 썼어요($($Q.used)개). 다음에 다시 돌려요."; exit 0 }
$Q.cap = [Math]::Min($Q.cap, $SaCap)

# ── 1. 규칙표 (GitHub saengae 저장소) ──
$SaRulesFile = Join-Path $Here 'saengae-rules.json'
$rules = $null
try {
  $rr = Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/$SaRepo/main/docs/data/shop-rules.json"
  $txt = [Text.Encoding]::UTF8.GetString($rr.RawContentStream.ToArray())
  $rules = $txt | ConvertFrom-Json
  [IO.File]::WriteAllText($SaRulesFile, $txt, $Utf8)
} catch {
  SLog "규칙표를 내려받지 못했어요. 저장해 둔 규칙을 써요. ($($_.Exception.Message))"
  if (Test-Path $SaRulesFile) { $rules = [IO.File]::ReadAllText($SaRulesFile, [Text.Encoding]::UTF8) | ConvertFrom-Json }
}
if (-not $rules) { SLog '규칙표가 없어서 멈춰요.'; exit 1 }
$MaxPer = if ($rules.max) { [int]$rules.max } else { 8 }
$Pages = if ($rules.pages) { [int]$rules.pages } else { 1 }
$CatExclude = '반려|애견|강아지|고양이|펫|성인용품|자동차용품|차량|낚시|캠핑|코스튬|파티'

# 같은 상품의 용량·수량만 다른 것은 뒤로 (한 묶음에 종류가 고루 나오게)
function Base-Name($nm) {
  $b = $nm -replace '\(.*?\)', ' '
  $b = $b -replace '\[.*?\]', ' '
  $b = $b -replace '[\d.,~\-+/]+\s*(kg|g|ml|l|cm|mm|매|개입|개|팩|입|박스|세트|장|롤|p|P|호|단계|사이즈)?', ' '
  return (($b -replace '[,\s]+', ' ').Trim())
}

# 규칙의 cat(정규식)에 맞는 카테고리 고르기: 제외 말 없는 것 중, 마지막 이름이 맞는 것(정확한 칸) 먼저, 깊은 것 먼저, 최대 2개
function Pick-Cats($re) {
  $hits = @($flat | Where-Object { $_.path -match $re -and $_.path -notmatch $CatExclude })
  if (-not $hits.Count) { return @() }
  $leaf = @($hits | Where-Object { $_.name -match $re } | Sort-Object { -$_.level })
  $rest = @($hits | Where-Object { $_.name -notmatch $re } | Sort-Object { -$_.level })
  $pick = @($leaf + $rest)
  # 부모·자식이 같이 뽑히면 자식만 (부모 인기 목록은 넓어서 엉뚱한 게 섞여요)
  $out = New-Object System.Collections.ArrayList
  foreach ($c in $pick) {
    if ($out.Count -ge 2) { break }
    $isParent = $false
    foreach ($o in $out) { if ($o.path.StartsWith($c.path + ' > ')) { $isParent = $true } }
    if ($isParent) { continue }
    [void]$out.Add($c)
  }
  return @($out)
}

# ── 2. 분야별 묶음 ──
$stagesOut = [ordered]@{}
$total = 0
$missing = New-Object System.Collections.ArrayList
$stopped = $false
foreach ($stProp in $rules.stages.PSObject.Properties) {
  $stage = $stProp.Name
  $groupsOut = New-Object System.Collections.ArrayList
  foreach ($g in @($stProp.Value)) {
    if ($stopped) { break }
    $cats = Pick-Cats ([string]$g.cat)
    if (-not $cats.Count) { [void]$missing.Add("$stage/$($g.id)(카테고리 없음: $($g.cat))"); continue }
    $cands = New-Object System.Collections.ArrayList
    $seenId = @{}
    foreach ($c in $cats) {
      $items = @()
      try { $items = @(Get-Best $c.id $Pages) }
      catch { $m = [string]$_; if ($m -like 'BUDGET*' -or $m -like 'QUOTA*') { $stopped = $true; SLog "조회 한도에 닿아서 여기서 멈춰요 ($stage/$($g.id))"; break } else { SLog "카테고리 $($c.path) 조회 실패: $m"; continue } }
      if (-not $items.Count -and $Q.used -ge $Q.cap) { $stopped = $true; break }
      foreach ($it in $items) {
        $id = [string]$it.tacaItemId
        $nm = [string]$it.displayName
        if ($seenId.ContainsKey($id)) { continue }
        if ($it.isSoldOut -or $Block -contains $id -or -not $it.thumbnailUrl) { continue }
        if ($nm -notmatch [string]$g.must) { continue }
        if ($g.not -and $nm -match [string]$g.not) { continue }
        $seenId[$id] = $true
        [void]$cands.Add([pscustomobject]@{ it = $it; rank = [int]$it.rank; base = (Base-Name $nm); cat = $c.name })
      }
    }
    if (-not $cands.Count) { [void]$missing.Add("$stage/$($g.id)(맞는 상품 0개, 본 카테고리: $(($cats | ForEach-Object { $_.path }) -join ' / '))"); continue }
    # 종류가 다른 상품 먼저, 같은 종류의 다른 용량은 뒤로
    $sorted = @($cands | Sort-Object rank)
    $first = New-Object System.Collections.ArrayList; $later = New-Object System.Collections.ArrayList; $seenBase = @{}
    foreach ($x in $sorted) { if ($seenBase.ContainsKey($x.base)) { [void]$later.Add($x) } else { $seenBase[$x.base] = $true; [void]$first.Add($x) } }
    $chosen = @(@($first) + @($later) | Select-Object -First $MaxPer)
    $itemsOut = New-Object System.Collections.ArrayList
    foreach ($x in $chosen) {
      $url = Get-Link $x.it
      if (-not $url) { continue }
      [void]$itemsOut.Add([ordered]@{
        id = [string]$x.it.tacaItemId; name = [string]$x.it.displayName; thumb = [string]$x.it.thumbnailUrl; url = $url
        price = $x.it.displayPrice; reviews = $x.it.reviewCount; cat = $x.cat
      })
    }
    if ($itemsOut.Count) {
      [void]$groupsOut.Add([ordered]@{ id = [string]$g.id; name = [string]$g.name; items = @($itemsOut) })
      $total += $itemsOut.Count
    }
  }
  if ($groupsOut.Count) { $stagesOut[$stage] = @($groupsOut) }
}
Save-Best; Save-Quota; Save-Links

if ($missing.Count) { SLog "상품을 못 채운 묶음 $($missing.Count)개: $($missing -join ' · ')" }
SLog "상품 $total 개 골랐어요 · 오늘 조회 사용 $($Q.used)개"
if ($total -lt 10) { SLog '상품이 너무 적어서 올리지 않아요 (앱엔 지난 상품 그대로).'; exit 1 }

# ── 3. GitHub saengae 저장소에 올리기 (shop.json + 카테고리 이름 목록) ──
$GH = @{ Authorization = "Bearer $($cfg.githubToken)" }
function Put-File($path, $content, $msg) {
  $api = "https://api.github.com/repos/$SaRepo/contents/$path"
  $sha = $null
  try { $sha = (Read-Json (Invoke-WebRequest -UseBasicParsing -UserAgent 'saengae-shop' -Uri $api -Headers $GH)).sha } catch {}
  $body = [ordered]@{ message = $msg; content = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($content)) }
  if ($sha) { $body.sha = $sha }
  Invoke-WebRequest -UseBasicParsing -UserAgent 'saengae-shop' -Method Put -Uri $api -Headers $GH -ContentType 'application/json' -Body ([Text.Encoding]::UTF8.GetBytes(($body | ConvertTo-Json -Compress))) | Out-Null
}
$shop = [ordered]@{
  updatedAt = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
  disclosure = '토스쇼핑 쉐어링크 활동으로, 구매 시 일정액의 수수료를 받을 수 있어요'
  stages = $stagesOut
}
try {
  Put-File 'docs/data/shop.json' ($shop | ConvertTo-Json -Depth 8 -Compress) "생애혜택 토스쇼핑 상품 갱신 ($total 개)"
  SLog "완료! 상품 $total 개를 올렸어요."
} catch { SLog "GitHub에 올리지 못했어요. githubToken 에 saengae 저장소 권한이 있는지 확인해 주세요. ($($_.Exception.Message))"; exit 1 }
# 카테고리 이름 목록은 규칙 다듬을 때 보려고 올려요 (한 달에 한 번이면 충분)
try {
  $catsFile = Join-Path $Here 'saengae-cats-uploaded.txt'
  $stamp = $KstNow.ToString('yyyyMM')
  if (-not (Test-Path $catsFile) -or ([IO.File]::ReadAllText($catsFile)).Trim() -ne $stamp) {
    $lines = ($flat | ForEach-Object { "$($_.id)`t$($_.path)" }) -join "`n"
    Put-File 'docs/data/toss-categories.txt' $lines '토스쇼핑 카테고리 목록 (규칙 다듬기용)'
    [IO.File]::WriteAllText($catsFile, $stamp, $Utf8)
  }
} catch { SLog "카테고리 목록 올리기는 건너뛰었어요: $($_.Exception.Message)" }
