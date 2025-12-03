const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.COUBOX_DB_DATABASE || 'couboxdb',
  process.env.COUBOX_DB_USER || 'root', 
  process.env.COUBOX_DB_PASSWORD || '',
  {
    host: process.env.COUBOX_DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: '+09:00',
    dialectOptions: {
      timezone: '+09:00'
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize; 
