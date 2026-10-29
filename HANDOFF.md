# 생애혜택 안내소 — 작업 인수인계

새 대화에서 이 파일부터 읽고 이어서 작업해요.

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
- 콘솔에 앱 등록(이름 saengae-benefit) + AIT_API_KEY Secrets → 허락 받고 테스트 업로드 → 실기기에서 정부 사이트 링크(Device.openURL)·raw.githubusercontent 데이터 받기 확인.
- 상품 링크 채우기(`content.ts` shop url).
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
