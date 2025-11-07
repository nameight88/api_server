# Walkup API Server
##### Node 18 version
##### DB MySQL
cp_genetec_employee 테이블 데이터를 전송하는 API 서버입니다.

## 📋 목차

- [프로젝트 구조](#프로젝트-구조)
- [설치 및 실행](#설치-및-실행)
- [API 엔드포인트](#api-엔드포인트)
- [환경 변수](#환경-변수)
- [MVC 패턴](#mvc-패턴)

## 🏗️ 프로젝트 구조

```
walkup-api/
├── src/
│   ├── config/
│   │   └── database.js          # 데이터베이스 설정
│   ├── controllers/
│   │   └── employeeController.js # 직원 컨트롤러
│   ├── middlewares/
│   │   └── requestLogger.js      # 요청 로깅 미들웨어
│   ├── models/
│   │   └── CpGenetecEmployee.js  # 직원 모델
│   ├── repositories/
│   │   └── employeeRepository.js # 직원 데이터 액세스 레이어
│   ├── routes/
│   │   └── employee.js          # 직원 라우터
│   ├── services/
│   │   └── employeeService.js    # 직원 비즈니스 로직
│   ├── utils/
│   │   └── logger.js            # 로거 유틸리티
│   └── index.js                 # 메인 서버 파일
├── logs/                        # 로그 파일들
├── env.example                  # 환경 변수 예시
├── package.json
└── README.md
```

## 🚀 설치 및 실행

### 1. 환경 변수 설정

```bash
# env.example을 참고하여 .env 파일 생성
cp env.example .env
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 서버 실행

```bash
# 개발 환경 (nodemon 사용)
npm run dev

# 프로덕션 환경
npm run prod

# 일반 실행
npm start
```

## 📚 API 엔드포인트

### 기본 정보

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`

### 헬스 체크

```http
GET /health
```

응답:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "walkup-api-server",
  "version": "1.0.0"
}
```

### 직원 데이터 조회

#### 1. 모든 직원 조회

```http
GET /api/employees
```

쿼리 파라미터:
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 100)
- `lang`: 언어 필터 (kor, en)
- `batch_status`: 배치 상태 필터 (null, processing, ok)
- `is_active`: 활성 상태 필터 (0, 1)
- `card_type`: 카드 타입 필터 (32, 48)
- `company_id`: 회사 ID 필터

예시:
```http
GET /api/employees?page=1&limit=50&lang=kor&is_active=1
```

#### 2. 특정 직원 조회

```http
GET /api/employees/{employee_no}
```

예시:
```http
GET /api/employees/EMP001
```

#### 3. 활성 직원 조회

```http
GET /api/employees/status/active
```

#### 4. 배치 상태별 직원 조회

```http
GET /api/employees/batch-status/{status}
```

예시:
```http
GET /api/employees/batch-status/processing
GET /api/employees/batch-status/null
```

#### 5. 카드 타입별 직원 조회

```http
GET /api/employees/card-type/{type}
```

예시:
```http
GET /api/employees/card-type/32
GET /api/employees/card-type/48
```

#### 6. 직원 검색

```http
GET /api/employees/search?q={searchTerm}
```

검색 대상: 사번, 카드 ID, 회사 ID

예시:
```http
GET /api/employees/search?q=EMP001
```

#### 7. 직원 통계 정보

```http
GET /api/employees/stats
```

응답:
```json
{
  "success": true,
  "data": {
    "total": 100,
    "active": 85,
    "inactive": 15,
    "percentage": {
      "active": "85.00",
      "inactive": "15.00"
    }
  }
}
```

### 공통 응답 형식

#### 성공 응답 (목록 조회)
```json
{
  "success": true,
  "data": [
    {
      "employee_no": "EMP001",
      "credential_guid": "guid-123",
      "cardholder_guid": "holder-123",
      "card_type": 32,
      "card_id": "CARD001",
      "company_id": "COMP001",
      "created_on": "2024-01-01T00:00:00.000Z",
      "updated_on": "2024-01-01T00:00:00.000Z",
      "is_active": 1,
      "batch_status": null,
      "lang": "kor"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

#### 성공 응답 (단일 조회)
```json
{
  "success": true,
  "data": {
    "employee_no": "EMP001",
    "credential_guid": "guid-123",
    "cardholder_guid": "holder-123",
    "card_type": 32,
    "card_id": "CARD001",
    "company_id": "COMP001",
    "created_on": "2024-01-01T00:00:00.000Z",
    "updated_on": "2024-01-01T00:00:00.000Z",
    "is_active": 1,
    "batch_status": null,
    "lang": "kor"
  }
}
```

#### 에러 응답
```json
{
  "success": false,
  "message": "에러 메시지",
  "error": "상세 에러 정보 (개발 환경에서만)"
}
```

## 🔧 환경 변수

| 변수명 | 설명 | 기본값 |
|-------|------|--------|
| `DB_HOST` | 데이터베이스 호스트 | localhost |
| `DB_PORT` | 데이터베이스 포트 | 3306 |
| `DB_NAME` | 데이터베이스 이름 | couboxdb |
| `DB_USER` | 데이터베이스 사용자 | root |
| `DB_PASSWORD` | 데이터베이스 비밀번호 | - |
| `PORT` | 서버 포트 | 3000 |
| `NODE_ENV` | 실행 환경 | development |
| `CORS_ORIGIN` | CORS 허용 도메인 | * |
| `LOG_LEVEL` | 로그 레벨 | info |

## 🏛️ MVC 패턴

이 프로젝트는 MVC (Model-View-Controller) 패턴을 따릅니다:

### Model (모델)
- `src/models/CpGenetecEmployee.js`: Sequelize 모델 정의

### View (뷰)
- JSON 응답으로 데이터를 전송 (별도의 뷰 템플릿 없음)

### Controller (컨트롤러)
- `src/controllers/employeeController.js`: HTTP 요청 처리

### 추가 계층

#### Service (서비스)
- `src/services/employeeService.js`: 비즈니스 로직 처리

#### Repository (저장소)
- `src/repositories/employeeRepository.js`: 데이터 액세스 계층

#### Middleware (미들웨어)
- `src/middlewares/requestLogger.js`: 요청 로깅

#### Utils (유틸리티)
- `src/utils/logger.js`: 로깅 유틸리티

## 📝 로깅

- 모든 요청과 응답이 로깅됩니다
- 로그 파일은 `logs/` 디렉터리에 저장됩니다
- 에러 로그와 일반 로그가 분리되어 관리됩니다

## 🔍 데이터베이스 스키마

### cp_genetec_employee 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `employee_no` | varchar(100) | 사번 (PK) |
| `credential_guid` | varchar(100) | 크레덴셜 GUID |
| `cardholder_guid` | varchar(100) | 카드홀더 GUID |
| `card_type` | int | 카드 타입 (32: card_id, 48: card_id + company_id) |
| `card_id` | varchar(100) | 카드 ID |
| `company_id` | varchar(100) | 회사 ID |
| `created_on` | datetime | 생성일 |
| `updated_on` | datetime | 수정일 |
| `is_active` | int | 활성 상태 (1: 활성, 0: 비활성) |
| `batch_status` | varchar(100) | 배치 상태 (null, processing, ok) |
| `lang` | varchar(100) | 언어 (kor, en) |

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

이 프로젝트는 ISC 라이센스를 따릅니다. 