const employeeService = require('../services/employeeService');
const logger = require('../utils/logger');
const { getMessage } = require('../utils/message');

class EmployeeController {
  // 통합 직원 검색
  async searchEmployees(req, res) {
    try {
      logger.info('searchEmployees 요청:', { body: req.body, ip: req.ip });

      //  filters, search, fields, pagination, lang을 각각 분리
      const { conditions = {}, search = {}, fields, pagination, lang = 'ko' } = req.body;
      
      //  디버깅: 파라미터 확인
      logger.info('파라미터 확인:', { conditions, search, fields, pagination, lang });
      
      const result = await employeeService.searchEmployees(conditions, search, fields, pagination, lang);

      logger.info('searchEmployees 응답:', {
        count: result.data ? result.data.length : 0,
        total: result.pagination?.all_data,
        message: result.message,
        lang: lang
      });

      //  데이터가 없으면 404 상태 코드로 반환
      if (!result.success) {
        return res.status(404).json(result);
      }

      //  정상 데이터는 200으로 반환
      res.json(result);
    } catch (error) {
      logger.error('searchEmployees 오류 상세:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // 언어 설정
      const lang = req.body.lang || 'ko';
      
      // 비즈니스 로직 오류와 시스템 오류 구분
      if (error.name === 'ValidationError' || error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message: getMessage('BAD_REQUEST', lang),
          error: error.message
        });
      }

      // 서버 내부 오류
      res.status(500).json({
        success: false,
        message: getMessage('SERVER_ERROR', lang),
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new EmployeeController(); 