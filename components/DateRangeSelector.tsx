"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"

// ===== TYPES =====
interface DateRange {
  start: Date | null
  end: Date | null
}

interface PeriodState {
  range: DateRange
  pendingStart: Date | null
  currentMonth: Date
}

export interface DateRangeExport {
  periodType: 'day' | 'week' | 'month' | 'year'
  periodA: string | null
  periodB: string | null
  compareEnabled: boolean
  periodAEnd?: string | null
  periodBEnd?: string | null
}

interface DateRangeSelectorProps {
  onRangeChange: (range: DateRangeExport) => void
  initialRange?: DateRangeExport
}

// ===== UTILITY FUNCTIONS =====
const dateToLocalISO = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false
  return date1.toDateString() === date2.toDateString()
}

const isDateInRange = (date: Date, range: DateRange): boolean => {
  if (!range.start || !range.end) return false
  const start = range.start < range.end ? range.start : range.end
  const end = range.start < range.end ? range.end : range.start
  return date >= start && date <= end
}

const isStartDate = (date: Date, range: DateRange): boolean => {
  if (!range.start) return false
  if (!range.end) return isSameDay(date, range.start)
  const start = range.start < range.end ? range.start : range.end
  return isSameDay(date, start)
}

const isEndDate = (date: Date, range: DateRange): boolean => {
  if (!range.start || !range.end) return false
  const end = range.start < range.end ? range.end : range.start
  return isSameDay(date, end)
}

const isMiddleDate = (date: Date, range: DateRange): boolean => {
  if (!range.start || !range.end) return false
  const start = range.start < range.end ? range.start : range.end
  const end = range.start < range.end ? range.end : range.start
  return date > start && date < end
}

// ===== MAIN COMPONENT =====
export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ onRangeChange, initialRange }) => {
  const [periodA, setPeriodA] = useState<PeriodState>({
    range: { start: null, end: null },
    pendingStart: null,
    currentMonth: new Date(2024, 8)
  })

  const [periodB, setPeriodB] = useState<PeriodState>({
    range: { start: null, end: null },
    pendingStart: null,
    currentMonth: new Date(2024, 8)
  })

  const [compareMode, setCompareMode] = useState(initialRange?.compareEnabled || false)

  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const notifyChange = (newPeriodA: PeriodState, newPeriodB: PeriodState, isComparing: boolean) => {
    onRangeChange({
      periodType: 'day',
      periodA: newPeriodA.range.start ? dateToLocalISO(newPeriodA.range.start) : null,
      periodAEnd: newPeriodA.range.end ? dateToLocalISO(newPeriodA.range.end) : newPeriodA.range.start ? dateToLocalISO(newPeriodA.range.start) : null,
      periodB: isComparing && newPeriodB.range.start ? dateToLocalISO(newPeriodB.range.start) : null,
      periodBEnd: isComparing && newPeriodB.range.end ? dateToLocalISO(newPeriodB.range.end) : isComparing && newPeriodB.range.start ? dateToLocalISO(newPeriodB.range.start) : null,
      compareEnabled: isComparing,
    })
  }

  const handleDateClick = (date: Date, period: 'A' | 'B') => {
    if (date.getFullYear() !== 2024 || date > new Date()) return

    const currentPeriod = period === 'A' ? periodA : periodB
    const setPeriod = period === 'A' ? setPeriodA : setPeriodB

    if (!currentPeriod.pendingStart) {
      setPeriod(prev => ({
        ...prev,
        pendingStart: date
      }))
    } else {
      const start = currentPeriod.pendingStart
      const end = date
      const isSameDate = isSameDay(start, end)

      const newRange: DateRange = {
        start: isSameDate ? start : (start < end ? start : end),
        end: isSameDate ? start : (start < end ? end : start)
      }

      const newPeriod = {
        ...currentPeriod,
        range: newRange,
        pendingStart: null
      }

      setPeriod(newPeriod)

      if (period === 'A') {
        notifyChange(newPeriod, periodB, compareMode)
      } else {
        notifyChange(periodA, newPeriod, compareMode)
      }
    }
  }

  const handleCompareToggle = (enabled: boolean) => {
    setCompareMode(enabled)
    if (!enabled) {
      const clearedPeriodB: PeriodState = {
        range: { start: null, end: null },
        pendingStart: null,
        currentMonth: new Date(2024, 8)
      }
      setPeriodB(clearedPeriodB)
      notifyChange(periodA, clearedPeriodB, false)
    } else {
      notifyChange(periodA, periodB, true)
    }
  }

  const navigateMonth = (period: 'A' | 'B', direction: 'prev' | 'next') => {
    const setPeriod = period === 'A' ? setPeriodA : setPeriodB
    setPeriod(prev => {
      const newMonth = new Date(prev.currentMonth)
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1)
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1)
      }
      if (newMonth.getFullYear() < 2024) {
        return { ...prev, currentMonth: new Date(2024, 0, 1) }
      }
      if (newMonth.getFullYear() > 2024) {
        return { ...prev, currentMonth: new Date(2024, 11, 31) }
      }
      return { ...prev, currentMonth: newMonth }
    })
  }

  const jumpToMonth = (period: 'A' | 'B', monthIndex: number) => {
    const setPeriod = period === 'A' ? setPeriodA : setPeriodB
    setPeriod(prev => ({
      ...prev,
      currentMonth: new Date(prev.currentMonth.getFullYear(), monthIndex, 1)
    }))
  }

  const jumpToYear = (period: 'A' | 'B', year: number) => {
    const setPeriod = period === 'A' ? setPeriodA : setPeriodB
    setPeriod(prev => ({
      ...prev,
      currentMonth: new Date(year, prev.currentMonth.getMonth(), 1)
    }))
  }

  const getDayClasses = (date: Date, period: 'A' | 'B') => {
    const baseClasses = "w-9 h-9 flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-200 relative rounded-md"

    const currentPeriod = period === 'A' ? periodA : periodB
    const isOutsideMonth = date.getMonth() !== currentPeriod.currentMonth.getMonth()
    const isDisabled = date.getFullYear() !== 2024 || date > new Date()
    const isToday = isSameDay(date, new Date())

    const isPendingStart = currentPeriod.pendingStart && isSameDay(date, currentPeriod.pendingStart)
    const isInRange = isDateInRange(date, currentPeriod.range)
    const isStart = isStartDate(date, currentPeriod.range)
    const isEnd = isEndDate(date, currentPeriod.range)
    const isMiddle = isMiddleDate(date, currentPeriod.range)

    let classes = baseClasses

    if (isDisabled) {
      classes += " text-gray-300 cursor-not-allowed"
      return classes
    }

    if (isOutsideMonth) {
      classes += " text-gray-400"
    } else {
      classes += " text-gray-900 dark:text-white"
    }

    if (isToday && !isInRange && !isPendingStart) {
      classes += " bg-blue-100 text-blue-600 font-semibold border-2 border-blue-300"
    }

    if (isPendingStart) {
      if (period === 'A') {
        classes += " bg-green-200 text-green-800 border-2 border-dashed border-green-400"
      } else {
        classes += " bg-blue-200 text-blue-800 border-2 border-dashed border-blue-400"
      }
    }

    if (isInRange) {
      if (period === 'A') {
        if (isStart && isEnd) {
          classes += " bg-gradient-to-br from-green-400 to-green-600 text-white font-bold"
        } else if (isStart) {
          classes += " bg-green-400 text-white font-bold rounded-l-lg"
        } else if (isEnd) {
          classes += " bg-green-600 text-white font-bold rounded-r-lg"
        } else if (isMiddle) {
          classes += " bg-green-500 text-white"
        }
      } else {
        if (isStart && isEnd) {
          classes += " bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold"
        } else if (isStart) {
          classes += " bg-blue-400 text-white font-bold rounded-l-lg"
        } else if (isEnd) {
          classes += " bg-blue-600 text-white font-bold rounded-r-lg"
        } else if (isMiddle) {
          classes += " bg-blue-500 text-white"
        }
      }
    }

    if (!isDisabled && !isPendingStart && !isInRange) {
      classes += " hover:bg-gray-100 dark:hover:bg-gray-700"
    }

    return classes
  }

  const renderCalendar = (period: 'A' | 'B') => {
    const currentPeriod = period === 'A' ? periodA : periodB
    const colorScheme = period === 'A' ? 'green' : 'blue'
    const calendarDays = generateCalendarDays(currentPeriod.currentMonth.getFullYear(), currentPeriod.currentMonth.getMonth())

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all ${
        colorScheme === 'green'
          ? 'border-green-500 shadow-lg shadow-green-500/20'
          : 'border-blue-500 shadow-lg shadow-blue-500/20'
      }`}>
        <div className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 ${
          colorScheme === 'green'
            ? 'bg-green-50 dark:bg-green-950/30'
            : 'bg-blue-50 dark:bg-blue-950/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                colorScheme === 'green' ? 'bg-green-500' : 'bg-blue-500'
              }`}></div>
              <h3 className={`text-sm font-semibold ${
                colorScheme === 'green'
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-blue-900 dark:text-blue-100'
              }`}>
                Period {period}
              </h3>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth(period, 'prev')}
              disabled={currentPeriod.currentMonth.getFullYear() === 2024 && currentPeriod.currentMonth.getMonth() === 0}
              className="h-8 w-8 p-0"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <select
                value={currentPeriod.currentMonth.getMonth()}
                onChange={(e) => jumpToMonth(period, parseInt(e.target.value))}
                className={`text-sm font-semibold px-2 py-1 rounded-md border transition-colors focus:outline-none focus:ring-2 ${
                  colorScheme === 'green'
                    ? 'border-green-200 dark:border-green-800 focus:ring-green-500 bg-white dark:bg-gray-800'
                    : 'border-blue-200 dark:border-blue-800 focus:ring-blue-500 bg-white dark:bg-gray-800'
                }`}
                aria-label="Select month"
              >
                {monthNames.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              
              <select
                value={currentPeriod.currentMonth.getFullYear()}
                onChange={(e) => jumpToYear(period, parseInt(e.target.value))}
                className={`text-sm font-semibold px-2 py-1 rounded-md border transition-colors focus:outline-none focus:ring-2 ${
                  colorScheme === 'green'
                    ? 'border-green-200 dark:border-green-800 focus:ring-green-500 bg-white dark:bg-gray-800'
                    : 'border-blue-200 dark:border-blue-800 focus:ring-blue-500 bg-white dark:bg-gray-800'
                }`}
                aria-label="Select year"
              >
                {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth(period, 'next')}
              disabled={currentPeriod.currentMonth.getFullYear() === 2024 && currentPeriod.currentMonth.getMonth() === 11}
              className="h-8 w-8 p-0"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {weekDays.map(day => (
              <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}

            {calendarDays.map((date, index) => (
              <div
                key={index}
                className={getDayClasses(date, period)}
                onClick={() => handleDateClick(date, period)}
              >
                {date.getDate()}
              </div>
            ))}
          </div>
        </div>

        {currentPeriod.range.start && (
          <div className={`px-4 py-2 border-t border-gray-200 dark:border-gray-700 ${
            colorScheme === 'green'
              ? 'bg-green-50 dark:bg-green-950/20'
              : 'bg-blue-50 dark:bg-blue-950/20'
          }`}>
            <div className={`text-xs font-medium ${
              colorScheme === 'green'
                ? 'text-green-800 dark:text-green-200'
                : 'text-blue-800 dark:text-blue-200'
            }`}>
              {!currentPeriod.range.end || isSameDay(currentPeriod.range.start, currentPeriod.range.end) ? (
                <span>
                  {currentPeriod.range.start.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              ) : (
                <span>
                  {currentPeriod.range.start.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })} - {currentPeriod.range.end?.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                  {currentPeriod.range.end && (
                    <span className="ml-1 opacity-75">
                      ({Math.abs(Math.ceil((currentPeriod.range.end.getTime() - currentPeriod.range.start.getTime()) / (1000 * 60 * 60 * 24))) + 1} days)
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Date Range Selector
          </CardTitle>

          <div className="flex items-center gap-3">
            <Switch
              id="compare-mode"
              checked={compareMode}
              onCheckedChange={handleCompareToggle}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-blue-500"
            />
            <Label htmlFor="compare-mode" className="text-sm font-medium cursor-pointer">
              Compare with Period B
            </Label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
            <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span>
              <strong>Click twice:</strong> Start date, then end date.
              <span className="hidden sm:inline"> Same date = single day.</span>
            </span>
          </div>
        </div>

        <div className={`grid gap-4 ${compareMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {renderCalendar('A')}
          {compareMode && renderCalendar('B')}
        </div>

        <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
          {!compareMode ? (
            periodA.range.start ? "✓ Period A selected" : "Select Period A"
          ) : !periodA.range.start ? (
            "Select Period A first"
          ) : !periodB.range.start ? (
            "Now select Period B for comparison"
          ) : (
            "✓ Both periods selected - ready to compare"
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default DateRangeSelector
