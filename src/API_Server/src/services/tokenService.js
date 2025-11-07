"use strict";
const TblToken=require("../models/TblToken");
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const crypto=require("crypto");
const sequelize=require("../config/database");
const stringLength=16;
function randomString(length){
	const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const bytes=crypto.randomBytes(length);
	let result="";
	for(let i=0;i<length;i++){
		result+=chars[bytes[i]%chars.length];
	}
	return result;
}
const validateAdminToken=async function(token){
	try{
		const[results]=await sequelize.query("select 1 from TblToken where token_value=:token and token_type=0 limit 1;",{
			replacements:{
				token
			}
		});
		if(results.length==0){
			return 0;
		}
		return 1;
	}catch(e){
		console.error(e);
		return-1;
	}
};
/**
 * 토큰 유효성 검증
 * @param {string} token - 검증할 토큰
 * @returns {Object} 토큰 정보 또는 null
 */
const validateToken = async (token) => {
    try{
		const[results]=await sequelize.query("select target,creator,token_type,endtime from TblToken where token_value=:token and(endtime>now()or token_type=0)limit 1;",{
			replacements:{
				token
			}
		});
		if(results.length==0){
			return null;
		}
		const tokenRecord=results[0];
        if(!tokenRecord){
            return null;
        }

        return {
            target: tokenRecord.target,
            creator: tokenRecord.creator,
            token_type: tokenRecord.token_type,
            endtime: tokenRecord.endtime
        };

    } catch (error) {
        logger.error('Token validation error', {
            error: error.message,
            token: token
        });
        return null;
    }
};
const deleteTokens=async function(tx){
	await sequelize.query("delete from TblToken where endtime<now();",{
		transaction:tx
	});
};
const createToken=async function(target,creator,endtime){
	const result={};
	try{
		let token_value;
		while(true){
			token_value=randomString(stringLength);
			const[results]=await sequelize.query("select 1 as v from TblToken where token_value=:token_value",{
				replacements:{token_value}
			});
			if(results.length==0){
				break;
			}
		}
		const t=await sequelize.transaction();
		try{
			const tokenRecord=await TblToken.create({
				target,
				creator,
				token_value,
				token_type:1,
				endtime:endtime
			},{
				transaction:t
			});
			if(tokenRecord==null){
				result.code=-1;
				await t.rollback();
				return result;
			}
			await deleteTokens(t);
			await t.commit();
			result.code=0;
			result.token=token_value;
			return result;
		}catch(ex1){
			console.error(ex1);
			try{
				await t.rollback();
			}catch(ex2){
			}
			result.code=-2;
			return result;
		}
    }catch(error){
        logger.error("Token creation error",{
            error:error.message,
        });
        return result;
    }
};
const listTokens=async function(){
	try{
		const[results]=await sequelize.query("select token_value,creator,target,endtime,token_type from TblToken;");
		return{code:0,tokens:results};
	}catch(ex1){
		console.error(ex1);
		return{code:-1};
	}
};
const updateToken=async function(token,endTime){
	try{
		const tx=await sequelize.transaction();
		try{
			const[results]=await sequelize.query("update TblToken set endTime=:endTime where token_value=:token and token_type=1;",{
				replacements:{
					endTime,
					token
				},transaction:tx
			});
			const affected=results.affectedRows;
			if(affected==0){
				await tx.rollback();
				return{code:1};
			}
			await deleteTokens(tx);
			await tx.commit();
			return{code:0};
		}catch(ex1){
			console.error(ex1);
			try{
				await tx.rollback();
			}catch(ex2){
				console.error(ex2);
			}
			return{code:-2};
		}
	}catch(ex2){
		console.error(ex2);
		return{code:-3};
	}
};
module.exports={
	validateAdminToken,
    validateToken,
	createToken,
	updateToken,
	listTokens
};
