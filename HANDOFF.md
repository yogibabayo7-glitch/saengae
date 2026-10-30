# 생애혜택 안내소 — 작업 인수인계

새 대화에서 이 파일부터 읽고 이어서 작업해요.

## 10/30 — v0.2.3: '집 구할 때' 숨김 (첫 검토용)
- 앱인토스 서비스 오픈 정책 3-9) 부동산 카테고리(전세보증금/보험·대출 비교·이사 등) 한시적 출시 불가 → 반려 막으려고 숨김.
- `content.ts` `HIDE_HOUSING = true`: 집 구할 때 분야 + 청년 '전세 보증료 돌려받기' 카드(hideWithHousing) 숨김. 결혼 카드의 디딤돌·버팀목 대출 문구·기금e든든 링크 뺌. 제한 풀리면 false로.
- 분야가 홀수면 마지막 타일 가로 꽉 채움. 번들 `release/saengae-benefit-0.2.3.ait`. 첫 등록은 이 번들로.

## 10/30 — 첫 콘솔 등록
- 첫 등록 번들: 0.2.1 → 정책 확인 후 0.2.3(집 구할 때 숨김)으로 바꿈.
- 콘솔용 로고 `release/store/app-logo-600.png`·`app-logo-dark-600.png`(만드는 스크립트 tools/make-logo.cjs).

## 10/30 — v0.2.1: 사람 모양 아이콘을 직접 그린 3D 아이콘으로 바꿈 (사장님 요청)
- 이유: 비슷한 토스 미니앱 '정픽: 맞춤 혜택'과 사람 모양 아이콘(토스 기본 이모지)이 거의 같아 보임.
- `src/StageIcon.tsx`: 임신·출산(하트 배), 아이(풍선), 청년(가방끈·별), 어르신(안경·지팡이), 장애인(휠체어) — 점토 느낌 SVG(그라데이션·반사광·그림자). 결혼·집·모든 나이·우리 동네는 이모지 그대로.
- 홈 타일 54px, 분야 제목 38px. 미리보기 그림 `docs/icons-preview.png`.
- 새 번들 `release/saengae-benefit-0.2.1.ait` (콘솔엔 안 올림, 사장님 허락 기다림).

## 10/30 — 주간 점검
- 상품: shop.json(10/29 21:49)은 규칙을 다시 맞추기(21:55) 전 결과라 엉뚱한 상품(물티슈 케이스·멀티탭 정리함·침구청소기·행주걸이 등) 24개 섞여 있었음 → 새 규칙으로 걸러서 뺌. 지금 채워진 묶음 4개(체온계·가습기·밥솥·혈당계), 나머지는 비어서 앱에서 숨김.
- 규칙 24개 묶음 cat 모두 toss-categories.txt 실제 경로와 맞는 것 확인. 11/1(일) PC 실행 뒤 다음 점검 때 묶음별 3개 이상인지 다시 볼 것.
- 혜택 수집: 수동 실행 3번 모두 성공. 첫 정기 실행은 11/2(월) 06:20. 새로 추가: 농지연금·농업인 연금보험료 지원·주택연금 보증(연금 분야).
- 앱 내용: 혼인 세액공제(2026 혼인신고까지, 폐지 검토 보도), 2027 혼인지원금·아이맞이지원금(국회 심의 중), 어르신 코로나 접종(~2027.6.30, 질병청 9/18) 모두 그대로 맞음 → 고친 것 없음, 새 번들 없음.
- 남은 일: 12월 국회 예산 통과 후 2027 지원금·기초연금·장애인연금 금액 반영.

## 10/29 21:45 — v0.2.0: 맨 위로 버튼 + 토스쇼핑 상품 여러 개 (사장님 요청, 실기기 테스트 1·2·3 모두 OK 확인)
- 사장님 실기기 확인(21:25): 정부 사이트 링크·우리 동네 목록·뒤로가기 모두 정상.
- `src/App.tsx` 스크롤 600px 넘으면 오른쪽 아래 ▲ 버튼(`.to-top`), 누르면 맨 위로.
- 상품: `src/shop.ts`가 `docs/data/shop.json`(BASES 순서로 받음, 폰에 저장)을 읽고, `ShopBox`가 분야별 묶음마다 가로 스크롤 상품 카드(사진·이름·가격) 여러 개. shop.json 없으면 content.ts 이름만 회색.
- 상품 자동 수집은 **사장님 PC**에서 (쉐어링크 API는 출발지 IP 등록이라 GitHub Actions로 못 돌림, bapsang과 같은 이유):
  - `tools/shop/saengae-shop.ps1` — 오늘밥상물가 shop 폴더에 넣고 그 폴더의 shop-lib.ps1·shop-config.json·quota.txt·link-cache.json을 같이 씀. 매주 일요일 8:30(`saengae_install.bat`), 하루 한도 중 4,500개까지만.
  - 규칙표 `docs/data/shop-rules.json`(분야 → 묶음: cat=카테고리 경로 정규식, must/not=이름 규칙, max 8). 스크립트가 매번 내려받음 → 규칙만 고치면 PC 파일 안 바꿔도 됨.
  - 첫 실행 때 `docs/data/toss-categories.txt`(토스쇼핑 카테고리 전체 경로)도 올림 → 이걸 보고 cat 정규식 다듬기. 못 채운 묶음은 shop-log.txt "[생애혜택] 상품을 못 채운 묶음" 줄에 나옴.
  - ⚠ 사장님이 할 일: ① 파일 4개 복사 ② GitHub 토큰(bapsang-shop)에 saengae 저장소 추가 ③ saengae_install.bat 실행. (README-saengae.txt)
- ⚠ 카테고리 이름은 토스쇼핑 실제 목록을 못 보고 짐작으로 적음(기저귀·체온계·혈압계…). 첫 실행 로그와 toss-categories.txt 보고 반드시 다듬을 것.

## 10/29 20:55 — 토스 미니앱 v0.1.0 만듦 (사이트 index.html 내용 전부 옮김)
- 앱 소스 = 이 저장소 뿌리(오늘밥상물가 bapsang과 같은 틀: React + Vite + @apps-in-toss/web-framework 3.9.0).
  - `src/data/content.ts` 사이트 내용 전부(8분야 카드·자세히·변경사항·상품 자리·바닥글). 금액·조건 고칠 땐 여기만. 분기 점검 때 `CHECKED_AT`도.
  - `src/App.tsx` 홈(분야 타일 + 변경사항) → 분야 화면(카드·확인 목록·상품) → 자세히(아래에서 올라오는 창). `src/Local.tsx` 우리 동네 혜택(정부24 자동수집 데이터: 분야 3개 탭 + 시·도/시·군·구 + 검색 + 상세 + 정부24 버튼). `src/benefits.ts` = app-kit/benefits.ts 복사본. `src/back.ts`(뒤로가기 층), `src/platform.ts`(링크 열기·이벤트·배너 광고 자리).
  - 상품(제휴) 링크: `content.ts` 각 분야 `shop[].url`에 토스 쉐어링크/브랜드커넥트 주소 넣으면 버튼 + 수수료 문구 켜짐. 지금은 전부 비어 있어 회색 이름만.
  - 배너 광고: GitHub 저장소 Variables `BANNER_AD_ID`(콘솔 광고 그룹 ID) 넣으면 홈·분야 아래에 붙음. 비우면 자리 없음.
- 빌드: `npm run build` → `saengae-benefit.ait`. 미리보기: `npm run preview-build` → docs/preview (브라우저에서 http로 열어야 함, file://은 빈 화면).
- 10/29 20:54 390px 미리보기 점검: 홈·어르신·자세히(연금 표)·우리 동네(서울 장애인 218건)·동네 상세·집 구할 때 모두 정상, 콘솔 오류 0.
- ⚠ `apps-in-toss.config.ts` appName = `saengae-benefit`. **토스 콘솔에 아직 앱을 안 만들었으면** 콘솔에서 이 이름으로 앱을 만들거나, 만든 이름을 알려 주면 맞춰야 올라감.
- 테스트 업로드: `.github/workflows/test-deploy.yml` (bapsang과 같음, 사장님 허락 때만). 비밀 값 `AIT_API_KEY` 이 저장소 Secrets에도 넣어야 함(bapsang 키가 '전체 앱'이면 같은 값).
  - 실행: `gh api -X POST repos/yogibabayo7-glitch/saengae/actions/workflows/test-deploy.yml/dispatches -f ref=main -f 'inputs[memo]=…'`
- 콘솔 업로드 규칙(bapsang과 같음): 사장님이 '올려'라고 할 때만, 그 전엔 미리보기로 확인, 검토 요청은 사장님이 직접.

## 다음 할 일
- (보류, 사장님 10/29 21:35) 앱이 안정화되면 어르신 분야 맨 아래에 '관절·뼈 건강기능식품' 묶음 추가 — 이름에 건강기능식품/식약처 있는 것만, 효능 문구 없이 카드만. 의약품(관절약)은 온라인 판매 금지라 제외.
- 콘솔에 앱 등록(이름 saengae-benefit) + AIT_API_KEY Secrets → 허락 받고 테스트 업로드 → 실기기에서 정부 사이트 링크(Device.openURL)·raw.githubusercontent 데이터 받기 확인.
- ~~상품 링크 채우기~~ → PC 스크립트로 자동(위 10/29 21:45). 사장님 PC 설정 후 첫 결과 보고 규칙 다듬기.
- (선택) GitHub Pages 켜기: Settings → Pages → main /docs → Save (데이터 주소 1순위).

## 10/29 20:25 — 혜택 자동 수집 시작
- 출처: 행정안전부 '대한민국 공공서비스(혜택) 정보' (공공데이터포털 15113968, 정부24와 같은 데이터). 10/29 20시 활용신청 승인, 바로 호출됨.
- 비밀 값: `DATA_GO_KR_KEY` (사장님이 GitHub Secrets에 넣음). Base URL api.odcloud.kr/api 확인.
- `scripts/collect-benefits.ts` → `docs/data/benefits.json`(앱용), `benefits-changes.json`(지난번 대비 새로/바뀜/없어짐), `services-index.json`(정부24 전체 서비스 이름 목록, 규칙 점검용).
- 자동 실행: `.github/workflows/collect-benefits.yml` 매주 월 06:20(한국). 수동: `gh api -X POST repos/yogibabayo7-glitch/saengae/actions/workflows/collect-benefits.yml/dispatches -f ref=main`
- 첫 결과(10/29): 정부24 전체 10,942개 중 연금 7 · 어르신 면허 반납 16 · 장애인 673. 지역(sido) 전국 96, 서울 130, 경기 101 …, 기타 2(달성교육재단·세종문화회관).
- 지역: 광주·전남은 '전남광주통합특별시'로 바뀌어 있어 '전남·광주' 하나로 묶음.

## 10/29 20:40 — 앱이 읽을 준비
- 수집 스크립트가 앱용 가벼운 파일도 만듦: `docs/data/app/index.json`(목록, 전송 약 45KB) + `app/region/<시도코드>.json`(상세, 눌렀을 때만).
- `app-kit/benefits.ts` = 미니앱에 복사할 읽기 코드: `loadIndex()`(폰에 저장한 지난 데이터 먼저 → 새 데이터로 교체, 인터넷 안 되면 지난 데이터), `filterBenefits({cat, sido, sigungu, q})`(시·도 고르면 전국+그 시·도), `sigunguOf()`, `loadDetail()`, `toLines()`, `updatedLabel()`.
- 주소 순서: GitHub Pages → raw.githubusercontent (Pages 안 켜도 동작).
- 시험 실행(--fixture)은 이제 /tmp/saengae-test에 써서 진짜 데이터 안 덮어씀.

## ⚠ 알아 둘 것
- 정부24 데이터엔 **국민연금 노령연금 자체가 없음**(국민연금공단 급여라 공공서비스 목록에 없음). 노령연금 수급 나이·감액 등은 국민연금공단 자료로 직접 확인한 고정 내용으로 앱에 두고, 분기 점검(1·4·7·10월) 때 공단 자료와 대조해야 함.
- 어르신 운전 적성검사(나이별 갱신 주기)도 정부24 서비스가 아니라 도로교통법 내용 → 고정 내용 + 분기 점검.
- 면허 반납 보상은 지자체 16곳만 정부24에 등록돼 있음(등록 안 한 지자체도 있음). 앱엔 '정부24에 등록된 지자체 기준'이라고 밝히기.

## (10/29 20:40 시점 할 일 — 20:55 앱 만들면서 처리됨)
- ~~앱 소스 위치 확인~~ → 이 저장소 뿌리에 새로 만듦. `app-kit/benefits.ts` → `src/benefits.ts`로 복사해 연결함.
- 화면에 '정부24 등록 기준 · 날짜 기준(updatedLabel)' 표시, 면허 반납은 '정부24에 등록된 지자체만' 문구.
- 토스 미니앱에서 raw.githubusercontent.com 호출이 막히는지 테스트(QR)로 확인 — 막히면 Pages 켜기.
- (선택) GitHub Pages 켜기: 저장소 Settings → Pages → Branch main, 폴더 /docs → Save.
