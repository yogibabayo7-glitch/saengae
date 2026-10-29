생애혜택 안내소 - 토스쇼핑 상품 자동 갱신 (내 컴퓨터에서 매주 일요일 한 번)

하는 일
  분야(임신·출산/아이/결혼/집 구할 때/어르신/장애인)마다 정해 둔 생활용품 묶음(기저귀·체온계·혈압계·지팡이 …)의
  토스쇼핑 인기 상품을 가져와 내 쉐어링크를 만들고, 생애혜택 앱이 읽는 목록(shop.json)을 GitHub saengae 저장소에 올려요.
  어떤 상품을 고를지는 GitHub의 docs/data/shop-rules.json 규칙표를 매번 내려받아 써요 → 규칙을 고쳐도 PC 파일은 안 바꿔요.

준비 (오늘밥상물가 shop 폴더를 이미 쓰고 있으면 2분이면 끝나요)
  1. 이 4개 파일을 오늘밥상물가 shop 폴더(bapsang-shop.ps1·shop-lib.ps1·shop-config.json 있는 곳)에 복사해요.
       saengae-shop.ps1 / saengae-install.ps1 / saengae_install.bat / saengae_run_now.bat
     설정(shop-config.json)·조회 한도(quota.txt)·링크 저장(link-cache.json)은 오늘밥상물가 것을 같이 써요.
  2. GitHub 토큰에 saengae 저장소 권한 추가
       github.com → 오른쪽 위 프로필 → Settings → Developer settings → Personal access tokens → Fine-grained tokens
       → bapsang-shop 토큰 클릭 → Repository access → Only select repositories 에 saengae 추가 → Save
     (토큰 값은 그대로라 shop-config.json 은 안 고쳐요)
  3. saengae_install.bat 더블클릭 → 매주 일요일 8:30 자동 실행 등록 + 지금 한 번 실행
     "완료! 상품 ○○개를 올렸어요" 가 나오면 끝. 앱은 다음에 열 때 새 상품을 받아요.

그 뒤
  - 기록은 shop-log.txt 에 [생애혜택] 으로 시작하는 줄로 남아요.
  - "상품을 못 채운 묶음" 줄이 있으면 그 묶음은 앱에 회색 이름만 보여요 → Claude에게 그 줄을 보여 주면 규칙을 고쳐요.
  - 하루 조회 한도(1만 개)는 오늘밥상물가와 같이 써요. 이 스크립트는 4,500개까지만 쓰고 멈춰요.
  - 특정 상품을 빼야 하면 shop-config.json 의 "block" 에 상품 번호를 넣어요 (오늘밥상물가와 같음).
  - 바로 다시 돌리려면 saengae_run_now.bat.
