import { format, parse } from 'date-fns'

/**
 * 'YYYY.MM.DD' 형식을 'YYYY-MM-DD' ISO 형식으로 변환
 * @param {string} dateStr - 'YYYY.MM.DD' 형식의 날짜 문자열
 * @returns {string} 'YYYY-MM-DD' 형식의 날짜 문자열
 */
export const toISO = (dateStr) => {
  try {
    const date = parse(dateStr, 'yyyy.MM.dd', new Date())
    return format(date, 'yyyy-MM-dd')
  } catch {
    console.error('Invalid date format for toISO:', dateStr)
    return null
  }
}

/**
 * 'YYYY-MM-DD' ISO 형식을 'YYYY.MM.DD' 형식으로 변환
 * @param {string} isoStr - 'YYYY-MM-DD' 형식의 날짜 문자열
 * @returns {string} 'YYYY.MM.DD' 형식의 날짜 문자열
 */
export const fromISO = (isoStr) => {
  try {
    const date = parse(isoStr, 'yyyy-MM-dd', new Date())
    return format(date, 'yyyy.MM.dd')
  } catch {
    console.error('Invalid ISO date format for fromISO:', isoStr)
    return null
  }
}

/**
 * Date 객체를 'YYYY.MM.DD' 형식으로 변환
 * @param {Date} date - Date 객체
 * @returns {string} 'YYYY.MM.DD' 형식의 날짜 문자열
 */
export const formatDisplayDate = (date) => {
  try {
    return format(date, 'yyyy.MM.dd')
  } catch {
    console.error('Invalid date for formatDisplayDate:', date)
    return null
  }
}

/**
 * Date 객체를 ISO 형식으로 변환
 * @param {Date} date - Date 객체
 * @returns {string} 'YYYY-MM-DD' 형식의 날짜 문자열
 */
export const formatISODate = (date) => {
  try {
    return format(date, 'yyyy-MM-dd')
  } catch {
    console.error('Invalid date for formatISODate:', date)
    return null
  }
}