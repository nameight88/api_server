"use strict";
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize=require("../config/database");
const{getMessage}=require("../utils/message");

/**
 * Bearer 토큰 인증 미들웨어
 * Authorization 헤더에서 Bearer 토큰을 추출하고 DB에서 유효성 검증
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Authorization 헤더 확인
        const authHeader = req.headers['authorization'];
        const{lang="ko"}=req.body;
        if (!authHeader) {
            logger.warn('Authorization header missing', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path
            });
            res.status(401).json({
                success: false, 
                message:getMessage("AUTH_FAILED",lang)
            });
			return;
        }

        // Bearer 토큰 형식 확인 및 추출
        const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
        if (!tokenMatch) {
            logger.warn('Invalid authorization header format', {
                ip: req.ip,
                authHeader: authHeader,
                path: req.path
            });
            res.status(401).json({
                success: false,
                message:getMessage("AUTH_FAILED",lang)
            });
			return;
        }
        const token = tokenMatch[1];
        // 토큰 길이 검증 (16자리)
        if (token.length !== 16) {
            logger.warn('Invalid token length', {
                ip: req.ip,
                tokenLength: token.length,
                path: req.path
            });
            res.status(401).json({
                success: false,
                message:getMessage("TOKEN_INVALID",lang)
            });
			return;
        }
		const[results]=await sequelize.query("select target,creator,token_type,endtime from TblToken where token_value=:token and(endtime>now()or token_type=0)limit 1;",{
			replacements:{
				token
			}
		});
		if(results.length==0){
			res.status(401).json({
                success:false,
                message:getMessage("TOKEN_INVALID",lang)
			});
			return;
		}
		const tokenRecord=results[0];
        if (!tokenRecord) {
            logger.warn('Token not found or expired', {
                ip: req.ip,
                token: token,
                path: req.path
            });
            res.status(401).json({
                success: false,
                message:getMessage("TOKEN_INVALID",lang)
            });
			return;
        }

        // 토큰 정보를 요청 객체에 추가
        req.tokenInfo = {
            target: tokenRecord.target,
            creator: tokenRecord.creator,
            token_type: tokenRecord.token_type,
            endtime: tokenRecord.endtime
        };

        logger.info('Token validated successfully', {
            ip: req.ip,
            target: tokenRecord.target,
            creator: tokenRecord.creator,
            token_type: tokenRecord.token_type,
            path: req.path
        });
        next();
    }catch(error){
        logger.error('Token validation error', {
            error: error.message,
            stack: error.stack,
            ip: req.ip,
            path: req.path
        });
        res.status(500).json({
            success: false,
            message:getMessage("SERVER_ERROR",lang)
        });
		return;
    }
};

/**
 * 권한 검증 미들웨어
 * 특정 토큰 타입만 허용하는 미들웨어
 * @param {Array} allowedTokenTypes - 허용할 토큰 타입 배열 (예: [0, 1])
 */
const requirePermission = (allowedTokenTypes = []) => {
    return (req, res, next) => {
        try {
			const{lang="ko"}=req.body;
            // authenticateToken 미들웨어에서 설정한 tokenInfo 확인
            if (!req.tokenInfo) {
                logger.warn('Token info not found - authentication required first', {
                    ip: req.ip,
                    path: req.path
                });
                res.status(401).json({
                    success: false,
                    message:getMessage("AUTH_FAILED",lang)
                });
				return;
            }
            const userTokenType = req.tokenInfo.token_type;
            // 허용된 토큰 타입인지 확인
            if (!allowedTokenTypes.includes(userTokenType)) {
                logger.warn('Insufficient permissions', {
                    ip: req.ip,
                    userTokenType: userTokenType,
                    allowedTypes: allowedTokenTypes,
                    target: req.tokenInfo.target,
                    path: req.path
                });
                res.status(403).json({
                    success: false,
                    message:getMessage("PERMISSION_DENIED",lang)
                });
				return;
            }
            logger.info('Permission granted', {
                ip: req.ip,
                userTokenType: userTokenType,
                target: req.tokenInfo.target,
                path: req.path
            });
            next();
        } catch (error) {
            logger.error('Permission check error', {
                error: error.message,
                stack: error.stack,
                ip: req.ip,
                path: req.path
            });
            res.status(500).json({
                success: false,
                message:getMessage("SERVER_ERROR",lang)
            });
			return;
        }
    };
};
module.exports={
    authenticateToken,
    requirePermission
};