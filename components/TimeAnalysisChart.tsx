"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, X, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'
import { getTimeSeriesData, getItemsSoldByTime, ItemSoldData } from "@/lib/staticData"

interface TimeAnalysisChartProps {
  periodA: { start: string; end: string } | null
  periodB: { start: string; end: string } | null
}

const COLORS = {
  PERIOD_A: '#22c55e',
  PERIOD_B: '#3b82f6',
} as const

export function TimeAnalysisChart({ periodA, periodB }: TimeAnalysisChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'items' | 'revenue' | 'avgOrderAmount'>('items')
  const [intervalMinutes, setIntervalMinutes] = useState<number>(15)
  const [selectedInterval, setSelectedInterval] = useState<{ time: string; period: 'A' | 'B' } | null>(null)
  const [drillDownPeriod, setDrillDownPeriod] = useState<'A' | 'B'>('A')

  if (!periodA) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Analysis (15-minute intervals)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Please select a date range to view time analysis</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const dataA = getTimeSeriesData(periodA.start, periodA.end, intervalMinutes)
  const dataB = periodB ? getTimeSeriesData(periodB.start, periodB.end, intervalMinutes) : []

  // Combine data for chart
  const allTimes = Array.from(new Set([...dataA.map(d => d.time), ...dataB.map(d => d.time)])).sort()

  const chartData = allTimes.map(time => {
    const pointA = dataA.find(d => d.time === time)
    const pointB = dataB.find(d => d.time === time)
    return {
      time,
      periodA: pointA ? pointA[selectedMetric] : undefined,
      periodB: pointB ? pointB[selectedMetric] : undefined,
    }
  })

  const formatValue = (value: number): string => {
    if (selectedMetric === 'revenue' || selectedMetric === 'avgOrderAmount') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
    }
    return Math.round(value).toString()
  }

  const getMetricLabel = (): string => {
    switch (selectedMetric) {
      case 'items': return 'Items'
      case 'revenue': return 'Revenue'
      case 'avgOrderAmount': return 'Avg Order Amount'
    }
  }

  const handleBarClick = (data: any, period: 'A' | 'B') => {
    if (data && data.time) {
      setSelectedInterval({ time: data.time, period })
      setDrillDownPeriod(period)
    }
  }

  const getDrillDownItems = (): ItemSoldData[] => {
    if (!selectedInterval) return []

    // Use drillDownPeriod instead of selectedInterval.period for switching
    const periodData = drillDownPeriod === 'A' ? periodA : periodB
    if (!periodData) return []

    // Get items for the selected interval window
    const [hour, minute] = selectedInterval.time.split(':').map(Number)
    const totalMinutes = hour * 60 + minute
    const endTotalMinutes = totalMinutes + intervalMinutes
    const endHour = Math.floor(endTotalMinutes / 60)
    const endMinute = endTotalMinutes % 60
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`

    return getItemsSoldByTime(periodData.start, periodData.end, selectedInterval.time, endTime)
  }

  const drillDownItems = selectedInterval ? getDrillDownItems() : []

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Time Analysis
              </CardTitle>

              <div className="flex flex-wrap gap-2 items-center">
                {/* Interval Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Interval:</span>
                  <Select value={String(intervalMinutes)} onValueChange={(value) => {
                    setIntervalMinutes(Number(value))
                    setSelectedInterval(null) // Reset drill-down when interval changes
                  }}>
                    <SelectTrigger className="w-[130px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                      <SelectItem value="300">5 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Metric Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant={selectedMetric === 'items' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMetric('items')}
                  >
                    Items
                  </Button>
                  <Button
                    variant={selectedMetric === 'revenue' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMetric('revenue')}
                  >
                    Revenue
                  </Button>
                  <Button
                    variant={selectedMetric === 'avgOrderAmount' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMetric('avgOrderAmount')}
                  >
                    Avg Order
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval="preserveStartEnd"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tickFormatter={formatValue} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatValue(value),
                      name === 'periodA' ? 'Period A' : 'Period B'
                    ]}
                    labelFormatter={(label) => {
                      const [hour, minute] = label.split(':').map(Number)
                      const totalMinutes = hour * 60 + minute
                      const endTotalMinutes = totalMinutes + intervalMinutes
                      const endHour = Math.floor(endTotalMinutes / 60)
                      const endMinute = endTotalMinutes % 60
                      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
                      return `${label} – ${endTime}`
                    }}
                  />
                  {periodB ? (
                    <Legend formatter={(value) => value === 'periodA' ? 'Period A' : 'Period B'} />
                  ) : (
                    <Legend formatter={() => 'Period A'} />
                  )}

                  {periodA && (
                    <Bar
                      dataKey="periodA"
                      fill={COLORS.PERIOD_A}
                      name="periodA"
                      radius={[2, 2, 0, 0]}
                      onClick={(data) => handleBarClick(data, 'A')}
                      style={{ cursor: 'pointer' }}
                    />
                  )}

                  {periodB && (
                    <Bar
                      dataKey="periodB"
                      fill={COLORS.PERIOD_B}
                      name="periodB"
                      radius={[2, 2, 0, 0]}
                      onClick={(data) => handleBarClick(data, 'B')}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                Click on any bar to inspect items sold during that time interval
              </div>
            </div>

            {/* Always visible drill-down panel */}
            <div className="lg:col-span-1">
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                {!selectedInterval ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Click a bar to do deep-dive analysis</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b">
                      <div className="text-sm font-semibold">
                        {(() => {
                          const [hour, minute] = selectedInterval.time.split(':').map(Number)
                          const totalMinutes = hour * 60 + minute
                          const endTotalMinutes = totalMinutes + intervalMinutes
                          const endHour = Math.floor(endTotalMinutes / 60)
                          const endMinute = endTotalMinutes % 60
                          const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
                          return `${selectedInterval.time} – ${endTime}`
                        })()}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedInterval(null)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>

                    {periodB && (
                      <div className="flex gap-2">
                        <Button
                          variant={drillDownPeriod === 'A' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDrillDownPeriod('A')}
                          className={drillDownPeriod === 'A' ? 'bg-green-500 hover:bg-green-600 text-xs' : 'text-xs'}
                        >
                          Period A
                        </Button>
                        <Button
                          variant={drillDownPeriod === 'B' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setDrillDownPeriod('B')}
                          className={drillDownPeriod === 'B' ? 'bg-blue-500 hover:bg-blue-600 text-xs' : 'text-xs'}
                        >
                          Period B
                        </Button>
                      </div>
                    )}

                    {drillDownItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No items found
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {drillDownItems.map((item, index) => (
                          <div
                            key={`${item.name}-${index}`}
                            className="text-xs py-2 border-b border-gray-200 dark:border-gray-700"
                          >
                            <div className="font-medium truncate">{item.name}</div>
                            <div className="flex justify-between mt-1 text-gray-600 dark:text-gray-400">
                              <span className={`px-1.5 py-0.5 rounded text-xs ${
                                item.category === 'dish'
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              }`}>
                                {item.category}
                              </span>
                              <span>Qty: {item.qty}</span>
                              <span>€{item.totalRevenue.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 border-t-2 font-bold text-xs flex justify-between">
                          <span>Total</span>
                          <span>Qty: {drillDownItems.reduce((sum, item) => sum + item.qty, 0)}</span>
                          <span>€{drillDownItems.reduce((sum, item) => sum + item.totalRevenue, 0).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default TimeAnalysisChart
