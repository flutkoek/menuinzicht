"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'
import { getDataForRange, RestaurantMetrics } from "@/lib/staticData"

// ===== TYPES =====
export interface DynamicAggregatedChartProps {
  periodA: { start: string; end: string } | null
  periodB: { start: string; end: string } | null
  mode: 'day' | 'week' | 'month' | 'year'
  metric: 'revenue' | 'orders' | 'avgOrderAmount'
}

interface ChartDataPoint {
  name: string
  periodA: number
  periodB: number
}

// ===== COLORS =====
const COLORS = {
  PERIOD_A: '#22c55e', // Green
  PERIOD_B: '#3b82f6', // Blue
} as const

// ===== UTILITY FUNCTIONS =====

// Parse 'YYYY-MM-DD' in local time (no timezone shift)
const parseISODateLocal = (iso: string): Date => {
  return new Date(iso + "T00:00:00");
};

const WEEKDAYS_MON_FIRST = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const getISOWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

const getMonthName = (monthIndex: number): string => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return months[monthIndex]
}

const getMetricValue = (metric: RestaurantMetrics, type: 'revenue' | 'orders' | 'avgOrderAmount'): number => {
  switch (type) {
    case 'revenue': return metric.revenue
    case 'orders': return metric.orders
    case 'avgOrderAmount': return metric.avgOrderAmount
    default: return 0
  }
}

// ===== AGGREGATION HELPERS =====

const groupByDay = (
  data: RestaurantMetrics[],
  metric: 'revenue' | 'orders' | 'avgOrderAmount'
): { [key: string]: number } => {
  const out: { [key: string]: number } = {}
  for (const item of data) {
    const key = item.date // YYYY-MM-DD
    out[key] = getMetricValue(item, metric)
  }
  return out
}

const getISOWeekInfo = (date: Date) => {
  // ISO week-numbering year and week number (local time)
  const tmp = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayNum = tmp.getDay() || 7
  tmp.setDate(tmp.getDate() + 4 - dayNum)
  const weekYear = tmp.getFullYear()
  const yearStart = new Date(weekYear, 0, 1)
  const week = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return { weekYear, week }
}

const groupByWeek = (
  data: RestaurantMetrics[],
  metric: 'revenue' | 'orders' | 'avgOrderAmount'
): { [key: string]: number } => {
  const weekGroups: { [key: string]: number[] } = {}
  
  for (const item of data) {
    const d = parseISODateLocal(item.date)
    const { weekYear, week } = getISOWeekInfo(d)
    const key = `${weekYear}-W${String(week).padStart(2,'0')}` 
    if (!(key in weekGroups)) weekGroups[key] = []
    weekGroups[key].push(getMetricValue(item, metric))
  }
  
  const out: { [key: string]: number } = {}
  Object.keys(weekGroups).forEach(key => {
    const values = weekGroups[key]
    if (metric === 'avgOrderAmount') {
      out[key] = values.reduce((sum, val) => sum + val, 0) / values.length
    } else {
      out[key] = values.reduce((sum, val) => sum + val, 0)
    }
  })
  return out
}

const groupByMonth = (
  data: RestaurantMetrics[],
  metric: 'revenue' | 'orders' | 'avgOrderAmount'
): { [key: string]: number } => {
  const monthGroups: { [key: string]: number[] } = {}
  
  for (const item of data) {
    const d = parseISODateLocal(item.date)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`  // YYYY-MM
    if (!(key in monthGroups)) monthGroups[key] = []
    monthGroups[key].push(getMetricValue(item, metric))
  }
  
  const out: { [key: string]: number } = {}
  Object.keys(monthGroups).forEach(key => {
    const values = monthGroups[key]
    if (metric === 'avgOrderAmount') {
      out[key] = values.reduce((sum, val) => sum + val, 0) / values.length
    } else {
      out[key] = values.reduce((sum, val) => sum + val, 0)
    }
  })
  return out
}

const groupByYear = (
  data: RestaurantMetrics[],
  metric: 'revenue' | 'orders' | 'avgOrderAmount'
): { [key: string]: number } => {
  const yearGroups: { [key: string]: number[] } = {}
  
  for (const item of data) {
    const y = String(parseISODateLocal(item.date).getFullYear())
    if (!(y in yearGroups)) yearGroups[y] = []
    yearGroups[y].push(getMetricValue(item, metric))
  }
  
  const out: { [key: string]: number } = {}
  Object.keys(yearGroups).forEach(key => {
    const values = yearGroups[key]
    if (metric === 'avgOrderAmount') {
      out[key] = values.reduce((sum, val) => sum + val, 0) / values.length
    } else {
      out[key] = values.reduce((sum, val) => sum + val, 0)
    }
  })
  return out
}

// ===== MAIN COMPONENT =====
function DynamicAggregatedChart({ periodA, periodB, mode, metric }: DynamicAggregatedChartProps) {
  if (!periodA && !periodB) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Dynamic Aggregated Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-center text-gray-500">No data selected</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const dataA = periodA ? getDataForRange(periodA.start, periodA.end) : []
  const dataB = periodB ? getDataForRange(periodB.start, periodB.end) : []

  let aggregatedA: { [key: string]: number } = {}
  let aggregatedB: { [key: string]: number } = {}

  if (mode === 'day') {
    aggregatedA = groupByDay(dataA, metric)
    aggregatedB = groupByDay(dataB, metric)
  } else if (mode === 'week') {
    aggregatedA = groupByWeek(dataA, metric)
    aggregatedB = groupByWeek(dataB, metric)
  } else if (mode === 'month') {
    aggregatedA = groupByMonth(dataA, metric)
    aggregatedB = groupByMonth(dataB, metric)
  } else { // year
    aggregatedA = groupByYear(dataA, metric)
    aggregatedB = groupByYear(dataB, metric)
  }

  let combinedKeys = Array.from(new Set([...Object.keys(aggregatedA), ...Object.keys(aggregatedB)]))

  if (mode === 'day') {
    combinedKeys.sort((a,b) => a.localeCompare(b)) // YYYY-MM-DD
  } else if (mode === 'week') {
    // YYYY-Wxx → sort by year then week
    combinedKeys.sort((a,b)=> {
      const [ya, wa] = a.split('-W'); const [yb, wb] = b.split('-W')
      return ya === yb ? Number(wa) - Number(wb) : Number(ya) - Number(yb)
    })
  } else if (mode === 'month') {
    // YYYY-MM
    combinedKeys.sort((a,b) => a.localeCompare(b))
  } else {
    // year
    combinedKeys.sort((a,b) => Number(a) - Number(b))
  }

  // Don't truncate - show all keys from both periods
  // Each period will show 0 for keys it doesn't have

  const chartData = combinedKeys.map(key => ({
    name: key,                               // e.g., 2024-03-15, 2024-W11, 2024-03, 2024
    periodA: aggregatedA[key] || undefined,  // Use undefined instead of 0 to hide bars
    periodB: aggregatedB[key] || undefined,  // Use undefined instead of 0 to hide bars
  }))

  const formatValue = (value: number): string => {
    if (metric === 'revenue' || metric === 'avgOrderAmount') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
    }
    return new Intl.NumberFormat('en-US').format(Math.round(value))
  }

  const getMetricLabel = (): string => {
    switch (metric) {
      case 'revenue': return 'Revenue'
      case 'orders': return 'Orders'
      case 'avgOrderAmount': return 'Average Order Amount'
      default: return ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Dynamic Aggregated Analysis - {getMetricLabel()} ({mode} view)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={mode === 'week' || mode === 'day' ? -45 : 0} textAnchor={mode === 'week' || mode === 'day' ? 'end' : 'middle'} height={mode === 'week' || mode === 'day' ? 80 : 60} />
            <YAxis tickFormatter={formatValue} />
            <Tooltip formatter={(value: number, name: string) => [formatValue(value), name === 'periodA' ? 'Period A' : 'Period B']} labelFormatter={(label) => `${label}`} />
            {periodB ? (
              <Legend formatter={(value) => value === 'periodA' ? 'Period A' : 'Period B'} />
            ) : (
              <Legend formatter={() => 'Period A'} />
            )}
            {periodA && (
              <Bar dataKey="periodA" fill={COLORS.PERIOD_A} name="periodA" radius={[2, 2, 0, 0]}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <LabelList 
                  dataKey="periodA" 
                  position="top" 
                  formatter={(value: any) => value ? formatValue(Number(value)) : ''} 
                  content={(props: any) => {
                    const { x, y, width, value, index } = props
                    if (!value) return null
                    
                    const formattedValue = formatValue(Number(value))
                    const textLength = formattedValue.length
                    
                    // Dynamically adjust box width and font size based on text length
                    const boxWidth = Math.max(45, Math.min(75, textLength * 6.5))
                    const fontSize = textLength > 10 ? 8 : textLength > 8 ? 9 : 10
                    
                    // Calculate bar spacing - if bars are close, stagger more aggressively
                    const barSpacing = width < 30 ? 3 : width < 50 ? 2 : 1
                    const staggerPattern = index % (barSpacing * 2)
                    const yOffset = -18 - (staggerPattern * 6)
                    
                    return (
                      <g>
                        <rect 
                          x={x + width / 2 - boxWidth / 2} 
                          y={y + yOffset} 
                          width={boxWidth} 
                          height={16} 
                          fill="#000000" 
                          rx={3} 
                          opacity={0.85}
                          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                        />
                        <text 
                          x={x + width / 2} 
                          y={y + yOffset + 11} 
                          fill="#ffffff" 
                          textAnchor="middle" 
                          fontSize={fontSize} 
                          fontWeight="700"
                        >
                          {formattedValue}
                        </text>
                      </g>
                    )
                  }}
                />
              </Bar>
            )}
            {periodB && (
              <Bar dataKey="periodB" fill={COLORS.PERIOD_B} name="periodB" radius={[2, 2, 0, 0]}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <LabelList 
                  dataKey="periodB" 
                  position="top" 
                  formatter={(value: any) => value ? formatValue(Number(value)) : ''} 
                  content={(props: any) => {
                    const { x, y, width, value, index } = props
                    if (!value) return null
                    
                    const formattedValue = formatValue(Number(value))
                    const textLength = formattedValue.length
                    
                    // Dynamically adjust box width and font size based on text length
                    const boxWidth = Math.max(45, Math.min(75, textLength * 6.5))
                    const fontSize = textLength > 10 ? 8 : textLength > 8 ? 9 : 10
                    
                    // Calculate bar spacing - if bars are close, stagger more aggressively
                    const barSpacing = width < 30 ? 3 : width < 50 ? 2 : 1
                    const staggerPattern = index % (barSpacing * 2)
                    const yOffset = -18 - (staggerPattern * 6)
                    
                    return (
                      <g>
                        <rect 
                          x={x + width / 2 - boxWidth / 2} 
                          y={y + yOffset} 
                          width={boxWidth} 
                          height={16} 
                          fill="#000000" 
                          rx={3} 
                          opacity={0.85}
                          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                        />
                        <text 
                          x={x + width / 2} 
                          y={y + yOffset + 11} 
                          fill="#ffffff" 
                          textAnchor="middle" 
                          fontSize={fontSize} 
                          fontWeight="700"
                        >
                          {formattedValue}
                        </text>
                      </g>
                    )
                  }}
                />
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-semibold mb-2">Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {periodA && <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.PERIOD_A }}></div><span className="font-medium">Period A:</span><span>{formatValue(chartData.reduce((sum, item) => sum + (item.periodA || 0), 0))}</span></div>}
            {periodB && <div className="flex items-center gap-2"><div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.PERIOD_B }}></div><span className="font-medium">Period B:</span><span>{formatValue(chartData.reduce((sum, item) => sum + (item.periodB || 0), 0))}</span></div>}
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <strong>Aggregation:</strong> {mode === 'day' ? 'Values shown per day' : mode === 'week' ? 'Values aggregated by ISO week' : mode === 'month' ? 'Values aggregated by calendar month' : 'Values aggregated by calendar year'}{metric === 'avgOrderAmount' ? ' (averaged)' : ' (summed for revenue/orders)'}
        </div>
      </CardContent>
    </Card>
  )
}

export { DynamicAggregatedChart }
export default DynamicAggregatedChart
