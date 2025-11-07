const CpGenetecEmployee = require('../models/CpGenetecEmployee');
const { Op } = require('sequelize');

class EmployeeRepository {
  
  // 모든 직원 조회 (페이징 및 동적 필터링)
  async findAll(filters = {}, pagination = {}, columns = []) {
    const { page = 1, limit = 100 } = pagination;
    const offset = (page - 1) * limit;

    const where = {};
    const { searchTerm, ...otherFilters } = filters;

    const andConditions = [];

    // 다른 필터 조건들을 AND로 구성
    for (const key in otherFilters) {
      if (otherFilters.hasOwnProperty(key) && otherFilters[key] !== undefined) {
        if (key === 'batch_status' && otherFilters[key] === 'null') {
          andConditions.push({ [key]: null });
        } else {
          andConditions.push({ [key]: otherFilters[key] });
        }
      }
    }

    // searchTerm을 사용한 OR 조건 검색
    if (searchTerm && searchTerm.trim() !== '') {
      // const searchableFields = ['employee_no', 'card_id']; // 검색 가능한 필드 지정
       const searchableFields = ['employee_no'];
      andConditions.push({
        [Op.or]: searchableFields.map(field => ({
          [field]: { [Op.like]: `%${searchTerm}%` }
        }))
      });
    }

    if (andConditions.length > 0) {
      where[Op.and] = andConditions;
    }

    const queryOptions = {
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_on', 'DESC']]
    };

    if (columns && columns.length > 0) {
      queryOptions.attributes = columns;
    }

    const filteredResult = await CpGenetecEmployee.findAndCountAll(queryOptions);
    const totalTableCount = await CpGenetecEmployee.count();

    return {
      rows: filteredResult.rows,
      count: filteredResult.count,
      totalTableCount: totalTableCount
    };
  }
}

module.exports = new EmployeeRepository(); 