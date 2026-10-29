# 생애혜택 안내소 — 작업 인수인계

새 대화에서 이 파일부터 읽고 이어서 작업해요.

## 10/29 20:25 — 혜택 자동 수집 시작
- 출처: 행정안전부 '대한민국 공공서비스(혜택) 정보' (공공데이터포털 15113968, 정부24와 같은 데이터). 10/29 20시 활용신청 승인, 바로 호출됨.
- 비밀 값: `DATA_GO_KR_KEY` (사장님이 GitHub Secrets에 넣음). Base URL api.odcloud.kr/api 확인.
- `scripts/collect-benefits.ts` → `docs/data/benefits.json`(앱용), `benefits-changes.json`(지난번 대비 새로/바뀜/없어짐), `services-index.json`(정부24 전체 서비스 이름 목록, 규칙 점검용).
- 자동 실행: `.github/workflows/collect-benefits.yml` 매주 월 06:20(한국). 수동: `gh api -X POST repos/yogibabayo7-glitch/saengae/actions/workflows/collect-benefits.yml/dispatches -f ref=main`
- 첫 결과(10/29): 정부24 전체 10,942개 중 연금 7 · 어르신 면허 반납 16 · 장애인 673. 지역(sido) 전국 96, 서울 130, 경기 101 …, 기타 2(달성교육재단·세종문화회관).
- 지역: 광주·전남은 '전남광주통합특별시'로 바뀌어 있어 '전남·광주' 하나로 묶음.

## ⚠ 알아 둘 것
- 정부24 데이터엔 **국민연금 노령연금 자체가 없음**(국민연금공단 급여라 공공서비스 목록에 없음). 노령연금 수급 나이·감액 등은 국민연금공단 자료로 직접 확인한 고정 내용으로 앱에 두고, 분기 점검(1·4·7·10월) 때 공단 자료와 대조해야 함.
- 어르신 운전 적성검사(나이별 갱신 주기)도 정부24 서비스가 아니라 도로교통법 내용 → 고정 내용 + 분기 점검.
- 면허 반납 보상은 지자체 16곳만 정부24에 등록돼 있음(등록 안 한 지자체도 있음). 앱엔 '정부24에 등록된 지자체 기준'이라고 밝히기.

## 다음 할 일
- 앱 소스(토스 미니앱)가 이 저장소에 아직 없음 → 앱에서 benefits.json 읽어 분야·지역별로 보여주기.
- 앱에서 읽을 주소: GitHub Pages 켜면 https://yogibabayo7-glitch.github.io/saengae/data/benefits.json (Settings → Pages → main /docs). 켜기 전엔 raw.githubusercontent.com 주소.
- benefits.json 1.1MB → 앱이 처음 열 때 무거우면 분야별 파일로 나누기.
