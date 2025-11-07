const CpGenetecEmployee = require('../models/CpGenetecEmployee');
const { Op } = require('sequelize');

class EmployeeRepository {
  
  async findAll(conditions = {}, pagination = {}, columns = []) {
    const { page = 1, limit = 100 } = pagination;
    const offset = (page - 1) * limit;

    const where = {};
    const andConditions = [];

    for (const key in conditions) {
      if (conditions.hasOwnProperty(key) && conditions[key] !== undefined) {
        if (key === 'batch_status' && conditions[key] === 'null') {
          andConditions.push({ [key]: null });
        } else if (conditions[key] === null) {
          andConditions.push({ [key]: null });
        } else {
          andConditions.push({ [key]: conditions[key] });
        }
      }
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