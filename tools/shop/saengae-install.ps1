# 생애혜택 안내소 상품 갱신을 매주 일요일 오전 8시 30분 자동으로 돌리도록 등록해요 (오늘밥상물가 9:40보다 먼저)
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$script = Join-Path $Here 'saengae-shop.ps1'
$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$script`""
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 8:30am
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries
Register-ScheduledTask -TaskName 'SaengaeShop' -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
Write-Host '매주 일요일 오전 8시 30분에 자동으로 돌도록 등록했어요. (컴퓨터가 꺼져 있었으면 켜질 때 돌아요)'
Write-Host '지금 한 번 바로 실행해 볼게요...'
& $script
Write-Host ''
Read-Host '엔터를 누르면 닫혀요'
