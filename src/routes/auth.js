const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const requestLogger = require('../middlewares/requestLogger');

// 요청 로깅 미들웨어 적용
router.use(requestLogger);

/**
 * @route POST /api/auth/validate
 * @desc 토큰 유효성 검증
 * @body {string} token - 검증할 토큰 (필수, 12자리)
 * @access Public
 */
router.post('/validate', tokenController.validateToken);

module.exports = router;