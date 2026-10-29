# 생애혜택 안내소 — 작업 인수인계

새 대화에서 이 파일부터 읽고 이어서 작업해요.

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

## 다음 할 일
- **앱 소스(토스 미니앱) 위치 확인 필요** — 이 저장소·컴퓨터 문서/바탕화면에서 못 찾음. 찾으면 `app-kit/benefits.ts` 복사 → 분야 탭(연금·면허 반납·장애인) + 시·도/시·군·구 선택 + 상세(정부24 새 창) 화면에 연결.
- 화면에 '정부24 등록 기준 · 날짜 기준(updatedLabel)' 표시, 면허 반납은 '정부24에 등록된 지자체만' 문구.
- 토스 미니앱에서 raw.githubusercontent.com 호출이 막히는지 테스트(QR)로 확인 — 막히면 Pages 켜기.
- (선택) GitHub Pages 켜기: 저장소 Settings → Pages → Branch main, 폴더 /docs → Save.
