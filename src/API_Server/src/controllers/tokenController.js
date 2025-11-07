"use strict";
const tokenService = require('../services/tokenService');
const logger = require('../utils/logger');
const{getMessage}=require("../utils/message");
/**
 * 토큰 유효성 검증
 * POST /api/auth/validate
 */
const validateToken = async (req, res) => {
    try {
		const{token,lang="ko"}=req.body;
        if (!token) {
            res.status(400).json({
                success: false,
                error:'Token is required'
            });
			return;
        }

        if (typeof token !== 'string' || token.length !== 16) {
            res.status(400).json({
                success: false,
                error: 'Invalid token format (must be 16 character string)'
            });
			return;
        }

        const tokenInfo = await tokenService.validateToken(token);

        if (!tokenInfo) {
            res.status(401).json({
                success: false,
                message:getMessage("TOKEN_INVALID",lang)
            });
			return;
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
            message: "Failed to validate token"
        });
    }
};
const parseToken=function(authorization){
	const bearerString="Bearer ";
	let i=0;
	if(bearerString.length>authorization.length){
		return null;
	}
	for(i=0;i<bearerString.length;++i){
		if(authorization[i]!==bearerString[i]){
			break;
		}
	}
	if(i!=bearerString.length){
		return null;
	}
	const token=authorization.substring(i);
	return token;
};
const createToken=async function(req,res){
	try{
		const authorization=req.headers["authorization"]||"";
		const{lang="ko"}=req.body;
		const token=parseToken(authorization);
		if(token==null){
			res.status(403).json({
                success:false,
                message:getMessage("PERMISSION_DENIED",lang)
            });
			return;
		}
		const isAdmin=await tokenService.validateAdminToken(token);
		if(isAdmin<0){
            res.status(500).json({
                success:false,
                message: getMessage("SERVER_ERROR",lang)
            });
			return;
		}else if(isAdmin!=1){
            res.status(401).json({
                success:false,
                message: getMessage("AUTH_FAILED",lang)
            });
			return;
        }
		const { target, creator, end_time } = req.body;
		const createTokenResult=await tokenService.createToken(target,creator,end_time);
		if(createTokenResult.code==0){
			res.status(201).json({
				success:true,
				token:createTokenResult.token
			});
		}else{
			res.status(500).json({
				success:false,
				message:getMessage("SERVER_ERROR",lang)
			});
		}
	}catch(e){
		console.error(e);
        res.status(500).json({
            success: false,
            message:getMessage("SERVER_ERROR",lang)
        });
	}
};
const listTokens=async function(req,res){
	try{
		const authorization=req.headers["authorization"]||"";
		const{lang="ko"}=req.body;
		const authToken=parseToken(authorization);
		if(authToken==null){
			res.status(403).json({
				success:false,
				message:getMessage("PERMISSION_DENIED",lang)
			});
			return;
		}
		const isAdmin=await tokenService.validateAdminToken(authToken);
		if(isAdmin<0){
			res.status(500).json({
				success:false,
				message:getMessage("SERVER_ERROR",lang)
			});
			return;
		}else if(isAdmin!=1){
			res.status(401).json({
				success:false,
				message:getMessage("AUTH_FAILED",lang)
			});
			return;
		}
		const listTokenResult=await tokenService.listTokens();
		if(listTokenResult.code==0){
			res.status(200).json({
				success:true,
				tokens:listTokenResult.tokens
			});
		}else{
			res.status(500).json({
				success:false,
				message:getMessage("SERVER_ERROR",lang)
			});
		}
		
	}catch(e){
		console.error(e);
		res.status(500).json({
			success:false,
			message:getMessage("SERVER_ERROR",lang)
		});
	}
};
const updateToken=async function(req,res){
	try{
		const authorization=req.headers["authorization"]||"";
		const{lang="ko"}=req.body;
		const authToken=parseToken(authorization);
		if(authToken==null){
			res.status(403).json({
				success:false,
				message:getMessage("PERMISSION_DENIED",lang)
			});
			return;
		}
		const isAdmin=await tokenService.validateAdminToken(authToken);
		if(isAdmin<0){
			res.status(500).json({
				success:false,
				message:getMessage("SERVER_ERROR",lang)
			});
			return;
		}else if(isAdmin!=1){
			res.status(401).json({
				success:false,
				message:getMessage("AUTH_FAILED",lang)
			});
			return;
        }
		const{token,end_time}=req.body;
		const updateTokenResult=await tokenService.updateToken(token,end_time);
		if(updateTokenResult.code==0){
			res.status(200).json({
				success:true
			});
		}else if(updateTokenResult.code==1){
			res.status(200).json({
				success:false,
				message:getMessage("NO_SUCH_TOKEN",lang)
			});
		}else{
			res.status(500).json({
				success:false,
				message:getMessage("SERVER_ERROR",lang)
			});
		}
		
	}catch(e){
		console.error(e);
		res.status(500).json({
			success:false,
			message:getMessage("SERVER_ERROR",lang)
		});
	}
};
module.exports = {
    validateToken,
	createToken,
	updateToken,
	listTokens
};
