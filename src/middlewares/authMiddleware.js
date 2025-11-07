const TblToken = require('../models/TblToken');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Bearer 토큰 인증 미들웨어
 * Authorization 헤더에서 Bearer 토큰을 추출하고 DB에서 유효성 검증
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Authorization 헤더 확인
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            logger.warn('Authorization header missing', {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                path: req.path
            });
            return res.status(401).json({
                success: false, 
                error: 'Authorization header is required'
            });
        }

        // Bearer 토큰 형식 확인 및 추출
        const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
        if (!tokenMatch) {
            logger.warn('Invalid authorization header format', {
                ip: req.ip,
                authHeader: authHeader,
                path: req.path
            });
            return res.status(401).json({
                success: false,
                error: 'Authorization header must be in format: Bearer <token>'
            });
        }

        const token = tokenMatch[1];

        // 토큰 길이 검증 (12자리)
        if (token.length !== 12) {
            logger.warn('Invalid token length', {
                ip: req.ip,
                tokenLength: token.length,
                path: req.path
            });
            return res.status(401).json({
                success: false,
                error: 'Invalid token format'
            });
        }

        // DB에서 토큰 검증
        const tokenRecord = await TblToken.findOne({
            where: {
                token_value: token,
                endtime: {
                    [Op.gt]: new Date() // 만료시간이 현재시간보다 큰 경우만
                }
            }
        });

        if (!tokenRecord) {
            logger.warn('Token not found or expired', {
                ip: req.ip,
                token: token,
                path: req.path
            });
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
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
    } catch (error) {
        logger.error('Token validation error', {
            error: error.message,
            stack: error.stack,
            ip: req.ip,
            path: req.path
        });
        
        return res.status(500).json({
            success: false,
            error: 'Internal server error during token validation'
        });
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
            // authenticateToken 미들웨어에서 설정한 tokenInfo 확인
            if (!req.tokenInfo) {
                logger.warn('Token info not found - authentication required first', {
                    ip: req.ip,
                    path: req.path
                });
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
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
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions for this resource'
                });
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
            
            return res.status(500).json({
                success: false,
                error: 'Internal server error during permission check'
            });
        }
    };
};

module.exports = {
    authenticateToken,
    requirePermission
};