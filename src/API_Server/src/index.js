'use strict';
require('dotenv').config();

const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');
const employeeRoutes = require('./routes/employee');
const authRoutes = require('./routes/auth');
const requestLogger = require('./middlewares/requestLogger');
const logger = require('./utils/logger');
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3010;

// SSL server 
function loadSSLData(){
  const sslDirectory = "../ssl";
  const ca = fs.readFileSync(path.join(sslDirectory, process.env.SSL_ROOTCA_FILENAME));
  const key = fs.readFileSync(path.join(sslDirectory, process.env.SSL_KEY_FILENAME));
  const cert = fs.readFileSync(path.join(sslDirectory, process.env.SSL_CERT_FILENAME));

  return { ca, key, cert };
}



// 미들웨어 설정
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', 
  credentials: true
}));
app.use(express.static("public"));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// 요청 로깅 미들웨어
app.use(requestLogger);

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'walkup-api-server',
    version: '1.0.0'
  });
});

// API 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

// 루트 경로
app.get('/', (req, res) => {
  res.json({
    message: 'Walkup API Server',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      auth: {
        validate: 'POST /api/auth/validate',  
        create: 'POST /api/auth/create'  
      },
      employees: {
        search: 'POST /api/employees/search',
      }
    }
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 리소스를 찾을 수 없습니다.'
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  // JSON 파싱 에러 처리
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.warn('JSON 파싱 오류:', { 
      error: err.message, 
      url: req.url, 
      ip: req.ip 
    });
    return res.status(400).json({
      success: false,
      message: '잘못된 요청입니다.',
    });
  }

  // 기타 서버 에러
  logger.error('서버 에러:', err);
  res.status(500).json({
    success: false,
    message: '내부 서버 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 데이터베이스 연결 및 서버 시작
async function startServer() {
  try {
    // 데이터베이스 연결 테스트
    await sequelize.authenticate();
    logger.info('데이터베이스 연결 성공');

    let httpServer;
    // SSL/TLS 인증서 로드를 시도합니다.
    // .env 파일에 SSL 관련 환경 변수가 설정되어 있고 파일이 존재하면 HTTPS로, 그렇지 않으면 HTTP로 서버를 시작합니다.
    try {
      const sslData = loadSSLData();
      httpServer = https.createServer({
        ca: sslData.ca,
        key: sslData.key,
        cert: sslData.cert
      }, app);
      logger.info('HTTPS 서버를 시작합니다.');
    } catch (error) {
      logger.warn('SSL 인증서를 로드할 수 없어 HTTP 서버로 시작합니다. (에러: ' + error.message + ')');
      httpServer = http.createServer(app);
      logger.info('HTTP 서버를 시작합니다.');
    }

    httpServer.listen(PORT, () => {
      const protocol = httpServer instanceof https.Server ? 'https' : 'http';
      logger.info(`서버가 ${protocol}://localhost:${PORT} 에서 실행 중입니다.`);
    });

  } catch (error) {
    logger.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

// 프로세스 종료
process.on('SIGINT', async () => {
  logger.info('\n 서버 종료 중...');
  try {
    await sequelize.close();
    logger.info('데이터베이스 연결 종료');
    process.exit(0);
  } catch (error) {
    logger.error('종료 중 오류:', error);
    process.exit(1);
  }
});

startServer();
