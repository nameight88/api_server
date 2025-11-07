const employeeRepository = require('../repositories/employeeRepository');
const logger = require('../utils/logger');
const { getMessage } = require('../utils/message');

class EmployeeService {
  // 통합 직원 검색
  async searchEmployees(filters = {}, search = {}, fields = [], pagination = {}, lang = 'ko') {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.pageSize || pagination?.limit || 10;


      // filters에서 lang 제거 (DB 컬럼이 아님)
      const { lang: filterLang, ...dbFilters } = filters;
      
      //  search 객체의 모든 필드를 conditions에 추가
      const conditions = { ...dbFilters, ...search };

      logger.info('Repository 호출 파라미터:', { conditions, page, limit, fields, lang });

      const result = await employeeRepository.findAll(conditions, { page, limit }, fields);


      //  DB 조회 결과가 없는 경우
      if (!result.rows || result.rows.length === 0) {
        logger.info('검색 결과 없음:', { conditions });
        return {
          success: true,
          message: getMessage('NO_DATA_FOUND', lang),
        };
      }

      const from = (page - 1) * limit + 1;
      const to = from + result.rows.length - 1;
      //  정상 조회 결과
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