const employeeRepository = require('../repositories/employeeRepository');
const logger = require('../utils/logger');

class EmployeeService {
  // 통합 직원 검색
  async searchEmployees(conditions = {}, fields = [], pagination = {}) {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.pageSize || 10; // 요청된 pageSize 사용, 없으면 10

      const result = await employeeRepository.findAll(conditions, { page, limit }, fields);

      const from = (page - 1) * limit + 1;
      const to = from + result.rows.length - 1;

      return {
        success: true,
        data: result.rows,
        pagination: {
          from_data_index_no: from,
          to_data_index_no: to > 0 ? to : 0,
          search_data_count: result.rows.length,
          page: parseInt(page),
          pageSize: parseInt(limit),
          search_total_pages: Math.ceil(result.count / limit),
          all_data: result.count
        }
      };
    } catch (error) {
      logger.error('searchEmployees 오류:', error);
      throw error;
    }
  }
}

module.exports = new EmployeeService(); 