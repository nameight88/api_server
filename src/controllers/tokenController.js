const tokenService = require('../services/tokenService');
const logger = require('../utils/logger');

/**
 * 토큰 유효성 검증
 * POST /api/auth/validate
 */
const validateToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token is required'
            });
        }

        if (typeof token !== 'string' || token.length !== 12) {
            return res.status(400).json({
                success: false,
                error: 'Invalid token format (must be 12 character string)'
            });
        }

        const tokenInfo = await tokenService.validateToken(token);

        if (!tokenInfo) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        logger.info('Token validation API successful', {
            target: tokenInfo.target,
            creator: tokenInfo.creator,
            ip: req.ip
        });

        res.json({
            success: true,
            data: {
                valid: true,
                target: tokenInfo.target,
                creator: tokenInfo.creator,
                token_type: tokenInfo.token_type,
                expires_at: tokenInfo.endtime
            }
        });

    } catch (error) {
        logger.error('Token validation API error', {
            error: error.message,
            stack: error.stack,
            ip: req.ip
        });

        res.status(500).json({
            success: false,
            error: 'Failed to validate token'
        });
    }
};

module.exports = {
    validateToken
};