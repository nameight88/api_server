const employeeService = require('../services/employeeService');
const logger = require('../utils/logger');

class EmployeeController {
  // 통합 직원 검색
  async searchEmployees(req, res) {
    try {
      logger.info('searchEmployees 요청:', { body: req.body, ip: req.ip });

      const { conditions, fields, pagination } = req.body;
      const result = await employeeService.searchEmployees(conditions, fields, pagination);

      logger.info('searchEmployees 응답:', {
        count: result.data.length,
        total: result.pagination?.all_data
      });

      res.json(result);
    } catch (error) {
      logger.error('searchEmployees 오류:', error);
      res.status(500).json({
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new EmployeeController(); 