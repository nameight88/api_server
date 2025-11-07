const TblToken = require('../models/TblToken');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * 토큰 유효성 검증
 * @param {string} token - 검증할 토큰
 * @returns {Object} 토큰 정보 또는 null
 */
const validateToken = async (token) => {
    try {
        const tokenRecord = await TblToken.findOne({
            where: {
                token_value: token,
                endtime: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!tokenRecord) {
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

module.exports = {
    validateToken
};