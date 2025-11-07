const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Genetec에서 제공 받은 임직원 정보
const CpGenetecEmployee = sequelize.define('CpGenetecEmployee', {
  employee_no: {
    type: DataTypes.STRING(100),
    primaryKey: true,
    allowNull: false,
    comment: '사번'
  },
  credential_guid: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: '',
    comment: '크레덴셜GUID'
  },
  cardholder_guid: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: '',
    comment: '카드홀더GUID'
  },
  card_type: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 32,
    comment: '카드타입 : 32( card_id ), 48 ( card_id + company_id ==> facility_id )'
  },
  card_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: '',
    comment: '카드아이디'
  },
  company_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '회사아이디'
  },
  created_on: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '생성일'
  },
  updated_on: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '수정일'
  },
  is_active: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '삭제여부 1:활성, 0:비활성(삭제)'
  },
  batch_status: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'null: 기본상태, processing: 배치 작업중, ok: 유효한 데이타'
  },
  lang: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'kor',
    comment: 'kor : 한국 en: 영어'
  }
}, {
  tableName: 'cp_genetec_employee',
  timestamps: false, // created_on, updated_on을 직접 관리
  charset: 'utf8mb4',
  collate: 'utf8mb4_0900_ai_ci'
});

module.exports = CpGenetecEmployee;