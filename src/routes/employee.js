const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken, requirePermission } = require('../middlewares/authMiddleware');

// 통합 직원 검색 (인증 + 권한 필요)
// 토큰 타입 1(일반) 또는 0(관리자)만 허용하는 예제
router.post('/search', 
    authenticateToken, 
    requirePermission([0, 1]), // 토큰 타입 0 또는 1만 허용
    employeeController.searchEmployees
);

module.exports = router; 