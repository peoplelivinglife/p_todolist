import { useState } from 'react'
import { addDays, subDays } from 'date-fns'
import { addDoc, updateDoc, doc, db } from '../lib/firebase'
import { formatISODate } from '../utils/dateUtils'

/**
 * 공통 이벤트 핸들러를 제공하는 커스텀 훅
 */
export function useEventHandlers(showToast) {
  const [showCalendar, setShowCalendar] = useState(false)

  // 달력 토글
  const onToggleCalendar = () => {
    setShowCalendar(prev => !prev)
  }

  // 날짜 선택
  const onPickDate = (date, setDate, additionalCallback) => {
    setDate(date)
    setShowCalendar(false)
    if (additionalCallback) additionalCallback(date)
  }

  // 이전 날짜로 이동
  const onPrevDay = (currentDate, setDate) => {
    setDate(prevDate => subDays(prevDate, 1))
  }

  // 다음 날짜로 이동
  const onNextDay = (currentDate, setDate) => {
    setDate(prevDate => addDays(prevDate, 1))
  }

  // 새 할 일 생성
  const onCreateTask = async (payload) => {
    try {
      const result = await addDoc('todos', {
        ...payload,
        date: payload.date ? formatISODate(payload.date) : null,
        completed: false,
        createdAt: new Date()
      })
      
      if (showToast) {
        showToast('할 일이 등록되었습니다', 'success')
      }
      
      return result
    } catch (error) {
      console.error('Error creating task:', error)
      if (showToast) {
        showToast('네트워크 오류, 다시 시도해주세요', 'error')
      }
      throw error
    }
  }

  // 완료 상태 토글
  const onToggleDone = async (taskId, nextCompleted) => {
    try {
      const taskRef = doc(db, 'todos', taskId)
      await updateDoc(taskRef, {
        completed: nextCompleted,
        updatedAt: new Date()
      })
      
      return true
    } catch (error) {
      console.error('Error toggling task completion:', error)
      if (showToast) {
        showToast('네트워크 오류, 다시 시도해주세요', 'error')
      }
      throw error
    }
  }

  // 날짜 배정
  const onAssignDate = async (taskId, date) => {
    try {
      const taskRef = doc(db, 'todos', taskId)
      await updateDoc(taskRef, {
        date: formatISODate(date),
        updatedAt: new Date()
      })
      
      if (showToast) {
        showToast('할 일이 배정되었습니다', 'success')
      }
      
      return true
    } catch (error) {
      console.error('Error assigning date:', error)
      if (showToast) {
        showToast('네트워크 오류, 다시 시도해주세요', 'error')
      }
      throw error
    }
  }

  return {
    showCalendar,
    setShowCalendar,
    onToggleCalendar,
    onPickDate,
    onPrevDay,
    onNextDay,
    onCreateTask,
    onToggleDone,
    onAssignDate
  }
}