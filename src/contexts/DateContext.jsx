import { useState } from 'react'
import { format } from 'date-fns'
import { DateContext } from './DateContextDefinition'

export function DateProvider({ children }) {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const value = {
    selectedDate,
    setSelectedDate,
    selectedDateString: format(selectedDate, 'yyyy.MM.dd')
  }

  return (
    <DateContext.Provider value={value}>
      {children}
    </DateContext.Provider>
  )
}

