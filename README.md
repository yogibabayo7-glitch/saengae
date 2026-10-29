# 생애혜택 안내소 — 혜택 자동 수집

정부24와 같은 데이터(행정안전부 '대한민국 공공서비스(혜택) 정보', 공공데이터포털 15113968)를
매주 월요일 06:20 자동으로 받아 `docs/data/benefits.json`에 저장해요.

| 분야 | key | 무엇을 모으나 |
|---|---|---|
| 국민연금·노후 연금 | `pension` | 서비스명에 국민연금·노령연금·기초연금·반환일시금·분할연금·유족연금·장애연금·크레딧 (공무원·군인·사학연금 제외) |
| 어르신 운전면허 반납 | `elderDriving` | 고령/어르신/65·70·75세 + 운전면허(증) 반납, 고령운전, 어르신 적성검사 |
| 장애인 혜택 | `disability` | 서비스명에 장애인·장애아·장애수당·발달장애 등, 또는 대상이 장애인인 활동지원·보조기기·재활 |

- 지자체 혜택은 `sido`(서울·경기…)·`sigungu`로 나눠져 있어 앱에서 "우리 동네 혜택"으로 거를 수 있어요. 중앙부처는 `sido: "전국"`.
- `benefits-changes.json` = 지난 수집과 비교해 새로 생긴/바뀐/없어진 혜택 → 분기 점검(1·4·7·10월) 때 이것만 보면 됨.
- 안전장치: 받은 서비스가 3,000개 미만이거나 분야 하나라도 0개면 저장 안 하고 실패(앱엔 지난 데이터 그대로).

## 처음 설정
1. 저장소 → Settings → Secrets and variables → Actions → New repository secret
   - Name: `DATA_GO_KR_KEY` / Secret: 공공데이터포털 마이페이지의 **일반 인증키(Decoding)**
2. Actions → '혜택 수집' → Run workflow

## 시험
`node --experimental-strip-types scripts/collect-benefits.ts --fixture test/fixture.json`
