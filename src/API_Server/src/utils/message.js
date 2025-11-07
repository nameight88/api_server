/**
 * 다국어 메시지 관리
 */
const messages = {
  // 성공 메시지
  SEARCH_SUCCESS: {
    ko: '검색이 완료되었습니다.',
    en: 'Search completed successfully.'
  },
  NO_DATA_FOUND: {
    ko: 'DB에 없는 데이터입니다.',
    en: 'Data not found in database.'
  },
  AUTH_SUCCESS: {
    ko: '인증에 성공했습니다.',
    en: 'Authentication successful.'
  },
  TOKEN_CREATED: {
    ko: '토큰이 생성되었습니다.',
    en: 'Token created successfully.'
  },
  
  // 400 - 잘못된 요청
  BAD_REQUEST: {
    ko: '잘못된 요청입니다.',
    en: 'Bad request.'
  },
  REQUIRED_FIELD_MISSING: {
    ko: '잘못된 요청입니다.',
    en: 'Bad request.'
  },
  TOKEN_MISSING: {
    ko: '잘못된 요청입니다.',
    en: 'Bad request.'
  },
  
  // 401 - 인증 실패
  UNAUTHORIZED: {
    ko: '인증에 실패했습니다.',
    en: 'Authentication failed.'
  },
  AUTH_FAILED: {
    ko: '인증에 실패했습니다.',
    en: 'Authentication failed.'
  },
  TOKEN_INVALID: {
    ko: '인증에 실패했습니다.',
    en: 'Authentication failed.'
  },
  
  // 403 - 접근 금지
  FORBIDDEN: {
    ko: '접근이 금지되었습니다.',
    en: 'Access forbidden.'
  },
  PERMISSION_DENIED: {
    ko: '접근이 금지되었습니다.',
    en: 'Access forbidden.'
  },
  
  // 404 - 리소스 없음
  NOT_FOUND: {
    ko: '요청한 리소스를 찾을 수 없습니다.',
    en: 'The requested resource was not found.'
  },
  EMPLOYEE_NOT_FOUND: {
    ko: '요청한 리소스를 찾을 수 없습니다.',
    en: 'The requested resource was not found.'
  },
  
  // 500 - 서버 오류
  INTERNAL_SERVER_ERROR: {
    ko: '서버 내부에서 오류가 발생했습니다.',
    en: 'Internal server error occurred.'
  },
  SERVER_ERROR: {
    ko: '서버 내부에서 오류가 발생했습니다.',
    en: 'Internal server error occurred.'
  },
  DATABASE_ERROR: {
    ko: '서버 내부에서 오류가 발생했습니다.',
    en: 'Internal server error occurred.'
  },
  NO_SUCH_TOKEN:{
    ko:"토큰이 없습니다.",
    en:"No such token"
  }
};

/**
 * 언어에 맞는 메시지 반환
 * @param {string} key - 메시지 키
 * @param {string} lang - 언어 ('ko' | 'en')
 * @returns {string} 해당 언어의 메시지
 */
const getMessage = (key, lang = 'ko') => {
  const message = messages[key];
  if (!message) {
    return lang === 'en' ? 'Unknown error' : '알 수 없는 오류';
  }
  return message[lang] || message.ko;
};
/**
 * 다국어 메시지 객체 반환
 * @param {string} key - 메시지 키
 * @returns {object} { ko: string, en: string }
const getMessageObject = (key) => {
  return messages[key] || {
    ko: '알 수 없는 오류',
    en: 'Unknown error'
  };
};
*/
module.exports = {
  messages,
  getMessage,
  /*getMessageObject*/
};
