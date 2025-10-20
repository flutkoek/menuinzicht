"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, X } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'
import { getDataForRange, RestaurantMetrics, getItemsSoldByWeekday, ItemSoldData } from "@/lib/staticData"

// ===== TYPES =====
export interface WeekdayAggregatedChartProps {
  periodA: { start: string; end: string } | null
  periodB: { start: string; end: string } | null
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

// Timezone-agnostic weekday calculation using Sakamoto's algorithm
// Returns 0..6 where Monday=0, ..., Sunday=6
const weekdayIndexMondayFirstFromISO = (iso: string): number => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number); // robust if a time part exists
  const t = [0,3,2,5,0,3,5,1,4,6,2,4];
  const Y = m < 3 ? y - 1 : y;
  const w = (Y + Math.floor(Y/4) - Math.floor(Y/100) + Math.floor(Y/400) + t[m - 1] + d) % 7; // 0=Sun..6=Sat
  return w === 0 ? 6 : w - 1; // convert to Monday=0..Sunday=6
};




const WEEKDAYS_MON_FIRST = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const formatValueCompact = (value: number, metric: 'revenue' | 'orders' | 'avgOrderAmount'): string => {
  if (metric === 'revenue') {
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(1)}k`
    }
    return `€${value.toFixed(1)}`
  }
  if (metric === 'avgOrderAmount') {
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(1)}k`
    }
    return `€${value.toFixed(1)}`
  }
  // For orders
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }
  return value.toFixed(1)
}

const getMetricValue = (metric: RestaurantMetrics, type: 'revenue' | 'orders' | 'avgOrderAmount'): number => {
  switch (type) {
    case 'revenue': return metric.revenue
    case 'orders': return metric.orders
    case 'avgOrderAmount': return metric.avgOrderAmount
    default: return 0
  }
}

// ===== AGGREGATION HELPER =====

const groupByWeekday = (
  data: RestaurantMetrics[],
  metric: 'revenue' | 'orders' | 'avgOrderAmount'
): { [weekday: string]: number } => {
  const weekdayGroups: { [weekday: string]: number[] } = {}

  // Initialize all weekdays with empty arrays (Monday-first order)
  WEEKDAYS_MON_FIRST.forEach(day => {
    weekdayGroups[day] = []
  })

  // Group data by weekday
  data.forEach(item => {
    const idx = weekdayIndexMondayFirstFromISO(item.date)
    const name = WEEKDAYS_MON_FIRST[idx]
    const value = getMetricValue(item, metric)

    weekdayGroups[name].push(value)
  })

  // Calculate averages for each weekday
  const result: { [weekday: string]: number } = {}
  WEEKDAYS_MON_FIRST.forEach(weekday => {
    const values = weekdayGroups[weekday]
    if (values.length > 0) {
      // Always compute average regardless of metric type
      result[weekday] = values.reduce((sum, val) => sum + val, 0) / values.length
    } else {
      result[weekday] = 0
    }
  })

  return result
}

// ===== MAIN COMPONENT =====
export default function WeekdayAggregatedChart({ periodA, periodB, metric }: WeekdayAggregatedChartProps) {
  const metricType = metric as 'revenue' | 'orders' | 'avgOrderAmount'
  const [selectedWeekday, setSelectedWeekday] = useState<{ name: string; index: number; period: 'A' | 'B' } | null>(null)
  const [drillDownPeriod, setDrillDownPeriod] = useState<'A' | 'B'>('A')

  if (!periodA) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Weekday Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No data selected.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const dataA = periodA ? getDataForRange(periodA.start, periodA.end) : []
  const dataB = periodB ? getDataForRange(periodB.start, periodB.end) : []

  const aggregatedA = groupByWeekday(dataA, metric)
  const aggregatedB = groupByWeekday(dataB, metric)

  // Fixed weekday order (Monday-first)
  const weekdays = WEEKDAYS_MON_FIRST

  const chartData: ChartDataPoint[] = weekdays.map((weekday, index) => ({
    name: weekday,
    periodA: aggregatedA[weekday] || 0,
    periodB: aggregatedB[weekday] || 0,
    index
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

  // Calculate totals for summary
  const totalA = chartData.reduce((sum, item) => sum + item.periodA, 0)
  const totalB = chartData.reduce((sum, item) => sum + item.periodB, 0)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBarClick = (data: any, period: 'A' | 'B') => {
    if (data && data.name) {
      const weekdayIndex = WEEKDAYS_MON_FIRST.indexOf(data.name)
      setSelectedWeekday({ name: data.name, index: weekdayIndex, period })
      setDrillDownPeriod(period)
    }
  }

  const getDrillDownItems = (): ItemSoldData[] => {
    if (!selectedWeekday) return []
    
    const periodData = drillDownPeriod === 'A' ? periodA : periodB
    if (!periodData) return []
    
    return getItemsSoldByWeekday(periodData.start, periodData.end, selectedWeekday.index)
  }

  const drillDownItems = selectedWeekday ? getDrillDownItems() : []

  // Sort drill-down items based on current metric
  const sortedDrillDownItems = [...drillDownItems].sort((a, b) => {
    if (metric === 'revenue') {
      return b.totalRevenue - a.totalRevenue
    }
    return b.qty - a.qty
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Weekday Analysis - {getMetricLabel()} (average per weekday)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatValue} />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatValue(value),
                name === 'periodA' ? 'Period A' : 'Period B'
              ]}
              labelFormatter={(label) => `${label}`}
            />
            <Legend
              formatter={(value) => value === 'periodA' ? 'Period A' : 'Period B'}
            />

            {/* Period A Bar */}
            {periodA && (
              <Bar
                dataKey="periodA"
                fill={COLORS.PERIOD_A}
                name="periodA"
                radius={[2, 2, 0, 0]}
                onClick={(data) => handleBarClick(data, 'A')}
                cursor="pointer"
              >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <LabelList 
                  dataKey="periodA" 
                  position="inside" 
                  content={(props: any) => {
                    const { x, y, width, height, value } = props
                    if (!value) return null
                    
                    const formattedValue = formatValueCompact(Number(value), metricType)
                    
                    // Calculate optimal font size based on bar height and width
                    let fontSize = 12
                    const estimatedWidth = formattedValue.length * fontSize * 0.6
                    
                    // Adjust font size to fit within bar dimensions
                    if (height < 40 || estimatedWidth > width - 8) {
                      fontSize = 11
                    }
                    if (height < 30 || estimatedWidth > width - 6) {
                      fontSize = 10
                    }
                    if (height < 25 || estimatedWidth > width - 4) {
                      fontSize = 9
                    }
                    if (height < 20) {
                      fontSize = 8
                    }
                    
                    // Determine position: inside if bar is tall enough, otherwise above
                    const minHeightForInside = fontSize * 1.5
                    const isInside = height >= minHeightForInside
                    
                    if (isInside) {
                      // Render inside bar
                      return (
                        <text 
                          x={x + width / 2} 
                          y={y + height / 2 + (fontSize / 3)} 
                          fill="#ffffff" 
                          textAnchor="middle" 
                          fontSize={fontSize} 
                          fontWeight="700"
                        >
                          {formattedValue}
                        </text>
                      )
                    } else {
                      // Render above bar with dark background
                      const boxWidth = Math.max(40, formattedValue.length * fontSize * 0.65)
                      return (
                        <g>
                          <rect 
                            x={x + width / 2 - boxWidth / 2} 
                            y={y - 18} 
                            width={boxWidth} 
                            height={14} 
                            fill="#000000" 
                            rx={2} 
                            opacity={0.85}
                          />
                          <text 
                            x={x + width / 2} 
                            y={y - 8} 
                            fill="#ffffff" 
                            textAnchor="middle" 
                            fontSize={fontSize} 
                            fontWeight="700"
                          >
                            {formattedValue}
                          </text>
                        </g>
                      )
                    }
                  }}
                />
              </Bar>
            )}

            {/* Period B Bar */}
            {periodB && (
              <Bar
                dataKey="periodB"
                fill={COLORS.PERIOD_B}
                name="periodB"
                radius={[2, 2, 0, 0]}
                onClick={(data) => handleBarClick(data, 'B')}
                cursor="pointer"
              >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <LabelList 
                  dataKey="periodB" 
                  position="inside" 
                  content={(props: any) => {
                    const { x, y, width, height, value } = props
                    if (!value) return null
                    
                    const formattedValue = formatValueCompact(Number(value), metricType)
                    
                    // Calculate optimal font size based on bar height and width
                    let fontSize = 12
                    const estimatedWidth = formattedValue.length * fontSize * 0.6
                    
                    // Adjust font size to fit within bar dimensions
                    if (height < 40 || estimatedWidth > width - 8) {
                      fontSize = 11
                    }
                    if (height < 30 || estimatedWidth > width - 6) {
                      fontSize = 10
                    }
                    if (height < 25 || estimatedWidth > width - 4) {
                      fontSize = 9
                    }
                    if (height < 20) {
                      fontSize = 8
                    }
                    
                    // Determine position: inside if bar is tall enough, otherwise above
                    const minHeightForInside = fontSize * 1.5
                    const isInside = height >= minHeightForInside
                    
                    if (isInside) {
                      // Render inside bar
                      return (
                        <text 
                          x={x + width / 2} 
                          y={y + height / 2 + (fontSize / 3)} 
                          fill="#ffffff" 
                          textAnchor="middle" 
                          fontSize={fontSize} 
                          fontWeight="700"
                        >
                          {formattedValue}
                        </text>
                      )
                    } else {
                      // Render above bar with dark background
                      const boxWidth = Math.max(40, formattedValue.length * fontSize * 0.65)
                      return (
                        <g>
                          <rect 
                            x={x + width / 2 - boxWidth / 2} 
                            y={y - 18} 
                            width={boxWidth} 
                            height={14} 
                            fill="#000000" 
                            rx={2} 
                            opacity={0.85}
                          />
                          <text 
                            x={x + width / 2} 
                            y={y - 8} 
                            fill="#ffffff" 
                            textAnchor="middle" 
                            fontSize={fontSize} 
                            fontWeight="700"
                          >
                            {formattedValue}
                          </text>
                        </g>
                      )
                    }
                  }}
                />
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>

        {/* Summary Information */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-semibold mb-2">Summary (Average per Weekday)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {periodA && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.PERIOD_A }}></div>
                <span className="font-medium">Period A Total:</span>
                <span>
                  {formatValue(totalA)}
                </span>
              </div>
            )}
            {periodB && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.PERIOD_B }}></div>
                <span className="font-medium">Period B Total:</span>
                <span>
                  {formatValue(totalB)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Aggregation Info */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <strong>Aggregation:</strong> Shows average {getMetricLabel().toLowerCase()} per weekday across the selected period(s).
          Each bar represents the average for all occurrences of that weekday in the range.
          {periodA && periodB ? ' • Both periods shown for comparison' : ''}
        </div>

        {/* Drill-Down Panel */}
        {!selectedWeekday ? (
          <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              💡 Click on a bar to inspect items sold on that weekday
            </p>
          </div>
        ) : (
          <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Items Sold on {selectedWeekday.name}
                </h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  drillDownPeriod === 'A' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  Period {drillDownPeriod}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {periodB && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDrillDownPeriod(drillDownPeriod === 'A' ? 'B' : 'A')}
                  >
                    Switch to Period {drillDownPeriod === 'A' ? 'B' : 'A'}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedWeekday(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {sortedDrillDownItems.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No items found for this weekday
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-gray-600">
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Item Name</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Category</th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Quantity</th>
                      <th className="text-right py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDrillDownItems.map((item, index) => (
                      <tr 
                        key={`${item.name}-${index}`}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="py-2 px-3 text-gray-900 dark:text-gray-100">{item.name}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400 capitalize">{item.category}</td>
                        <td className="py-2 px-3 text-right font-medium text-gray-900 dark:text-gray-100">{item.qty}</td>
                        <td className="py-2 px-3 text-right font-medium text-gray-900 dark:text-gray-100">
                          €{item.totalRevenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 dark:border-gray-600 font-bold">
                      <td className="py-2 px-3 text-gray-900 dark:text-gray-100" colSpan={2}>Total</td>
                      <td className="py-2 px-3 text-right text-gray-900 dark:text-gray-100">
                        {sortedDrillDownItems.reduce((sum, item) => sum + item.qty, 0)}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-900 dark:text-gray-100">
                        €{sortedDrillDownItems.reduce((sum, item) => sum + item.totalRevenue, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
