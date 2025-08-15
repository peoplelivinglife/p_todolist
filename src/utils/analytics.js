// Google Analytics 유틸리티 함수들

// 페이지 뷰 추적
export const trackPageView = (path, title) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title,
    })
  }
}

// 이벤트 추적
export const trackEvent = (action, category = 'General', label = '', value = 0) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// 할 일 관련 이벤트 추적
export const trackTodoEvent = (action, todoData = {}) => {
  const { hasDate, tag } = todoData
  
  trackEvent(action, 'Todo', '', 1)
  
  // 추가 세부 정보 추적
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: 'Todo',
      custom_parameters: {
        has_date: hasDate ? 'true' : 'false',
        tag: tag || 'unknown'
      }
    })
  }
}

// 사용자 로그인 추적
export const trackUserLogin = () => {
  trackEvent('login', 'User', 'google_auth', 1)
}

// 사용자 로그아웃 추적
export const trackUserLogout = () => {
  trackEvent('logout', 'User', 'google_auth', 1)
}