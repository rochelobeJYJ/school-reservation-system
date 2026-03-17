# 🏫 구글 워크스페이스 기반 학생회실(상담실) 예약 시스템

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Google Apps Script](https://img.shields.io/badge/Google_Apps_Script-4285F4?style=flat&logo=google&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap_5-7952B3?style=flat&logo=bootstrap&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

별도의 서버 호스팅이나 DB 구축 없이, **무료인 Google Sheets와 Apps Script만으로 완벽하게 동작하는 예약 관리 시스템**입니다. 학교 내 상담실, 학생회실, 특별실 예약 등에 즉시 도입하여 사용할 수 있도록 최적화되어 있습니다.

## ✨ 주요 기능 (Key Features)

* **💸 100% 무료 서버리스 환경:** Google 계정만 있으면 평생 무료로 운영 가능.
* **📱 완벽한 모바일 최적화 (반응형):** 스마트폰에서도 쾌적한 주간 달력 UI 및 플로팅 예약 버튼(FAB) 지원.
* **🟢 실시간 상태 배너:** 현재 시설이 비어있는지, 사용 중인지 1분 단위로 자동 갱신.
* **🔄 매주 반복 예약 지원:** 한 번의 클릭으로 최대 8주(약 2달) 연속 예약 가능.
* **📧 이메일 자동 알림:** 예약 확정 및 취소 시 예약자와 관리자에게 이메일 자동 발송 (PIN 번호 동봉).
* **🔐 3중 보안 체계:** 공통 비밀번호(무단 접근 방지), 개인 PIN(수정/취소 권한), 관리자 비밀번호(마스터 권한).
* **💾 Local Storage 자동 완성:** 한 번 입력한 정보(이름, 이메일, 비밀번호)를 브라우저에 저장하여 다음 예약 시 피로도 최소화.
* **🎨 직관적인 UI/UX:** SweetAlert2 기반의 세련된 팝업창 및 목적별(학부모, 학생, 회의 등) 컬러 코딩.

## 🚀 설치 및 세팅 방법 (Installation)

코딩을 전혀 몰라도 아래 순서대로 따라 하면 5분 만에 우리 학교만의 예약 시스템을 만들 수 있습니다.

### Step 1. 구글 시트 데이터베이스 준비
1. 새 구글 시트를 생성합니다.
2. 하단 시트 탭 이름을 각각 `설정`과 `예약DB`로 변경합니다.
3. **`설정`** 시트 세팅:
   * A1: `공통비밀번호` / B1: `원하는비밀번호` (예: 1234)
   * A2: `관리자비밀번호` / B2: `원하는마스터비밀번호` (예: admin)
   * A3: `예약목적` / B3~B7: `학부모 상담`, `학생 상담`, `회의`, `학생회`, `기타` 등
   * A8: `관리자이메일` / B8: `알림받을본인이메일@gmail.com`
4. **`예약DB`** 시트 세팅 (1행에 헤더 입력):
   * A1부터 I1까지 차례대로: `예약ID`, `날짜`, `시작시간`, `종료시간`, `예약자명`, `목적`, `PIN`, `기록시간`, `이메일`

### Step 2. 앱스 스크립트 코드 붙여넣기
1. 구글 시트 상단 메뉴에서 **[확장 프로그램] > [Apps Script]**를 클릭합니다.
2. 기본으로 있는 `Code.gs` 파일의 내용을 모두 지우고, 이 레포지토리의 [`Code.gs`](./Code.gs) 코드를 복사해 붙여넣습니다.
3. 좌측 상단의 **[+] 버튼**을 눌러 **[HTML]** 파일을 생성하고, 이름을 `Index`로 지정합니다.
4. `Index.html` 파일에 이 레포지토리의 [`Index.html`](./Index.html) 코드를 복사해 붙여넣고 저장(Ctrl+S)합니다.

### Step 3. 웹 앱 배포 및 권한 승인 (매우 중요)
1. 우측 상단의 **[배포] -> [새 배포]**를 클릭합니다.
2. 유형을 **[웹 앱]**으로 선택합니다.
3. 액세스할 수 있는 사용자를 **[모든 사용자]**로 설정하고 **[배포]**를 누릅니다.
4. ⚠️ **"액세스 승인"** 팝업이 뜨면: `본인 계정 클릭` -> `[고급]` -> `(안전하지 않음)으로 이동` -> `[허용]`을 차례로 클릭합니다. (이메일 발송 기능을 위해 반드시 필요합니다.)
5. 생성된 **웹 앱 URL**을 사용자들에게 공유하면 끝입니다!

## 📸 스크린샷 (Screenshots)
<img width="1868" height="777" alt="image" src="https://github.com/user-attachments/assets/6dd40aae-0a54-4f53-8319-7ea5db75d48c" />


## 🛠 기술 스택 (Tech Stack)
* Frontend: HTML5, Vanilla JS, Bootstrap 5.3, SweetAlert2
* Backend: Google Apps Script (GAS)
* Database: Google Sheets

## 🤝 기여 (Contributing)
버그 리포트나 기능 개선을 위한 Pull Request는 언제나 환영합니다! 

## 📝 라이선스 (License)
이 프로젝트는 [MIT License](LICENSE)를 따릅니다. 누구나 자유롭게 복사, 수정, 배포 및 상업적 사용이 가능합니다. 단, 코드 내의 출처 표기를 유지해 주시기 바랍니다.
