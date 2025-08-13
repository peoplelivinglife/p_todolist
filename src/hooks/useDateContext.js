import { useContext } from 'react'
import { DateContext } from '../contexts/DateContextDefinition'

export const useDateContext = () => {
  const context = useContext(DateContext)
  if (!context) {
    throw new Error('useDateContext must be used within a DateProvider')
  }
  return context
}