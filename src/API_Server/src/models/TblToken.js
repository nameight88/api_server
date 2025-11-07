const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// walk-up api server 에서 Agent 를 통해서 클라이언트에게 토큰 값들이 저장
const TblToken = sequelize.define('TblToken',{
    target:{
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue:'',
        comment:'사용자 이름'
    },
    creator:{
        type:DataTypes.STRING(30),
        allowNull:false,
        defaultValue:'',
        comment:'토큰 생성자 이름'
    },
    token_value:{
        type:DataTypes.STRING(16),
        allowNull:false,
        defaultValue:'',
        comment:'16 자리의 스트링으로 토큰 값',
		primaryKey:true
    },
    token_type:{
        type:DataTypes.TINYINT,
        allowNull:false,
        defaultValue:1,
        comment:'0: 관리자 토큰, 1: 일반 사용자 토큰'
    },
    endtime:{
        type:DataTypes.DATE,
        allowNull:false,
        defaultValue:DataTypes.NOW,
        comment:'토큰 만료 시간'
    },
},{
	freezeTableName:true,
	timestamps:false,
	id:false
});

module.exports = TblToken;