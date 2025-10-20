"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RestaurantMetrics, getDataForRange } from "@/lib/staticData"
import { TrendingUp, BarChart3, ShoppingCart } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'

interface RevenueChartsProps {
  periodA: { start: string; end: string } | null
  periodB?: { start: string; end: string } | null
  metricsA: RestaurantMetrics | null
  metricsB?: RestaurantMetrics | null
}

// ===== DATE RANGE TYPES =====
interface DateRange {
  start: Date
  end: Date
}

// ===== BUCKET TYPE FOR AGGREGATION =====
type Bucket = {
  label: string               // e.g. "2025-10-02", "2025-W41", "2025-10"
  rangeA?: { start: Date; end: Date; dates: Date[] }
  rangeB?: { start: Date; end: Date; dates: Date[] }
  valueA?: number
  valueB?: number
  // For tooltips:
  tooltipA?: string
  tooltipB?: string
}

// ===== UTILITY FUNCTIONS =====

// ===== COLOR DEFINITIONS =====
// Period A = Green (#22c55e), Period B = Blue (#3b82f6)
// Red/Green only for KPI change indicators (up/down trends)
const COLORS = {
  PERIOD_A: '#22c55e',    // Green for Period A
  PERIOD_B: '#3b82f6',    // Blue for Period B
  TREND_UP: '#22c55e',    // Green for positive change
  TREND_DOWN: '#ef4444',  // Red for negative change
} as const

// ===== TIMEZONE & LOCALE CONFIGURATION =====
// Use Europe/Amsterdam locale for all date operations
const TIMEZONE = 'Europe/Amsterdam'
const LOCALE = 'nl-NL'

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Helper function to get ISO week number (Monday-Sunday)
const getISOWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// Helper function to get start of ISO week (Monday)
const getISOWeekStart = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  return new Date(d.setDate(diff))
}

// Helper function to parse date string to Date object
const parseDate = (dateStr: string): Date => {
  return new Date(dateStr)
}

// Helper function to expand date range into array of dates (inclusive)
const expandDateRange = (start: Date, end: Date): Date[] => {
  const dates: Date[] = []
  const current = new Date(start)
  
  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

// Helper function to format date for labels
const formatDateLabel = (date: Date, mode: 'day' | 'week' | 'month'): string => {
  switch (mode) {
    case 'day':
      return date.toISOString().split('T')[0] // YYYY-MM-DD
    case 'week':
      const year = date.getFullYear()
      const week = getISOWeekNumber(date)
      return `${year}-W${week.toString().padStart(2, '0')}` // YYYY-Www
    case 'month':
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}` // YYYY-MM
  }
}

// Helper function to format date range for tooltips
const formatDateRangeTooltip = (dates: Date[]): string => {
  if (dates.length === 0) return ''
  if (dates.length === 1) return dates[0].toLocaleDateString(LOCALE)
  
  const start = dates[0]
  const end = dates[dates.length - 1]
  return `${start.toLocaleDateString(LOCALE)} - ${end.toLocaleDateString(LOCALE)}`
}

// ===== RANGE-DRIVEN BUCKETING FUNCTIONS =====
// Parse date string to create actual date ranges (for real implementation)
const parseDateString = (dateStr: string): DateRange => {
  // For demo: treat single date as 1-day range
  // In real app: parse "2025-09-02,2025-09-08" format
  const date = new Date(dateStr)
  return { start: date, end: date }
}

// ===== CORE BUCKETING FUNCTION =====
// This function handles range-driven bucketing that reflects exactly what the user selected
function buildBuckets({
  aggregationMode,
  periodA,        // { start: Date, end: Date } or null
  periodB,        // { start: Date, end: Date } or null
  metric,         // 'revenue' | 'orders' | 'avgOrderAmount'
  getMetricsForDate, // (date: Date) => RestaurantMetrics
}: {
  aggregationMode: 'day' | 'week' | 'month'
  periodA: DateRange | null
  periodB: DateRange | null
  metric: 'revenue' | 'orders' | 'avgOrderAmount'
  getMetricsForDate: (date: Date) => RestaurantMetrics
}): Bucket[] {
  
  if (!periodA) return []

  // 1) Expand dates for A and B within their selected ranges (inclusive)
  const datesA = expandDateRange(periodA.start, periodA.end)
  const datesB = periodB ? expandDateRange(periodB.start, periodB.end) : []

  // 2) Group A dates by aggregationMode → create A buckets
  const bucketsA = groupDatesByMode(datesA, aggregationMode)
  
  // 3) If B exists, group B dates similarly → create B buckets
  const bucketsB = datesB.length > 0 ? groupDatesByMode(datesB, aggregationMode) : []

  // ===== BUCKETING & TRUNCATION HAPPENS HERE =====
  // 4) If both A & B present: align by index; truncate to min length
  const minLength = bucketsB.length > 0 ? Math.min(bucketsA.length, bucketsB.length) : bucketsA.length
  const alignedBuckets: Bucket[] = []

  for (let i = 0; i < minLength; i++) {
    const bucketA = bucketsA[i]
    const bucketB = bucketsB[i] || null

    // 5) Aggregate values per bucket
    const { value: valueA, revenue: revenueA, orders: ordersA } = aggregateMetricsForDates(bucketA.dates, getMetricsForDate, metric)
    const { value: valueB, revenue: revenueB, orders: ordersB } = bucketB 
      ? aggregateMetricsForDates(bucketB.dates, getMetricsForDate, metric)
      : { value: 0, revenue: 0, orders: 0 }

    // bucket.label uses A's label at index i
    // preserve per-bucket tooltip info for both A and B
    alignedBuckets.push({
      label: bucketA.label,
      rangeA: {
        start: bucketA.dates[0],
        end: bucketA.dates[bucketA.dates.length - 1],
        dates: bucketA.dates
      },
      rangeB: bucketB ? {
        start: bucketB.dates[0],
        end: bucketB.dates[bucketB.dates.length - 1],
        dates: bucketB.dates
      } : undefined,
      valueA,
      valueB: bucketB ? valueB : 0,
      tooltipA: formatDateRangeTooltip(bucketA.dates),
      tooltipB: bucketB ? formatDateRangeTooltip(bucketB.dates) : undefined
    })
  }

  // 6) Return chronologically sorted buckets
  return alignedBuckets.sort((a, b) => {
    if (!a.rangeA || !b.rangeA) return 0
    return a.rangeA.start.getTime() - b.rangeA.start.getTime()
  })
}

// Helper function to group dates by aggregation mode
function groupDatesByMode(dates: Date[], mode: 'day' | 'week' | 'month'): Array<{ label: string; dates: Date[] }> {
  const groups = new Map<string, Date[]>()

  dates.forEach(date => {
    let key: string
    
    switch (mode) {
      case 'day':
        key = formatDateLabel(date, 'day')
        break
      case 'week':
        // Use ISO week start for consistent grouping
        const weekStart = getISOWeekStart(date)
        key = formatDateLabel(weekStart, 'week')
        break
      case 'month':
        key = formatDateLabel(date, 'month')
        break
    }

    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(date)
  })

  // Convert to array and sort chronologically
  return Array.from(groups.entries())
    .map(([label, dates]) => ({ label, dates: dates.sort((a, b) => a.getTime() - b.getTime()) }))
    .sort((a, b) => a.dates[0].getTime() - b.dates[0].getTime())
}

// ===== METRICS AGGREGATION LOGIC =====
// Helper function to aggregate metrics for a set of dates
function aggregateMetricsForDates(
  dates: Date[], 
  getMetricsForDate: (date: Date) => RestaurantMetrics,
  metric: 'revenue' | 'orders' | 'avgOrderAmount'
): { value: number; revenue: number; orders: number } {
  
  let totalRevenue = 0
  let totalOrders = 0

  // Sum values across the bucket's dates
  dates.forEach(date => {
    const metrics = getMetricsForDate(date)
    totalRevenue += metrics.revenue
    totalOrders += metrics.orders
  })

  let value: number
  switch (metric) {
    case 'revenue':
      value = totalRevenue
      break
    case 'orders':
      value = totalOrders
      break
    case 'avgOrderAmount':
      // ===== AVG ORDER AMOUNT COMPUTATION =====
      // Compute as sum(Revenue)/sum(Orders) within each bucket (avoid averaging averages)
      value = totalOrders > 0 ? totalRevenue / totalOrders : 0
      break
  }

  return { 
    value, 
    revenue: totalRevenue, 
    orders: totalOrders 
  }
}

// Helper function to simulate getting metrics for a specific date
// In a real app, this would fetch actual data from your backend
const getMetricsForDate = (date: Date): RestaurantMetrics => {
  // Simulate realistic daily variation
  const baseRevenue = 5000
  const baseOrders = 150
  
  // Add some randomness based on date to make it realistic
  const dayVariation = Math.sin(date.getTime() / (1000 * 60 * 60 * 24)) * 0.3 + 1
  const randomVariation = 0.8 + Math.random() * 0.4
  
  const revenue = Math.round(baseRevenue * dayVariation * randomVariation)
  const orders = Math.round(baseOrders * dayVariation * randomVariation)
  const avgOrderAmount = revenue / orders
  
  return {
    date: date.toISOString().split('T')[0], // Add the required date field
    revenue,
    orders,
    avgOrderAmount,
    avgOrderSize: Math.round(2 + Math.random() * 2) // 2-4 dishes per order
  }
}

// Helper function to prepare chart data for side-by-side comparison
const prepareChartData = (
  periodA: string | null, 
  periodB: string | null, 
  metricsA: RestaurantMetrics | null, 
  metricsB: RestaurantMetrics | null
) => {
  if (!periodA || !metricsA) return []

  // Create a single data point with both periods for side-by-side bars
  const data = [{
    name: 'Comparison',
    periodA_revenue: metricsA.revenue,
    periodA_orders: metricsA.orders,
    periodA_avgOrderAmount: metricsA.avgOrderAmount,
    periodB_revenue: periodB && metricsB ? metricsB.revenue : 0,
    periodB_orders: periodB && metricsB ? metricsB.orders : 0,
    periodB_avgOrderAmount: periodB && metricsB ? metricsB.avgOrderAmount : 0,
  }]

  return data
}

// ===== INDIVIDUAL CHART COMPONENTS =====

const RevenueChart = ({ data, showPeriodB }: { data: any[], showPeriodB: boolean }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Revenue Trend
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
  
  return (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Revenue Trend
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => formatCurrency(value)} />
          <Tooltip formatter={(value, name) => [
            formatCurrency(Number(value)), 
            name === 'periodA_revenue' ? 'Period A' : 'Period B'
          ]} />
          {showPeriodB ? (
            <Legend formatter={(value) => value === 'periodA_revenue' ? 'Period A' : 'Period B'} />
          ) : (
            <Legend formatter={() => 'Period A'} />
          )}
          {/* Period A - Green */}
          <Bar dataKey="periodA_revenue" fill={COLORS.PERIOD_A} name="Period A">
            <LabelList dataKey="periodA_revenue" position="inside" formatter={(value: any) => formatCurrency(Number(value))} style={{ fontSize: '14px', fill: '#ffffff', fontWeight: 'bold' }} />
          </Bar>
          {/* Period B - Blue */}
          {showPeriodB && (
            <Bar dataKey="periodB_revenue" fill={COLORS.PERIOD_B} name="Period B">
              <LabelList dataKey="periodB_revenue" position="inside" formatter={(value: any) => formatCurrency(Number(value))} style={{ fontSize: '14px', fill: '#ffffff', fontWeight: 'bold' }} />
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
  )
}

const OrdersChart = ({ data, showPeriodB }: { data: any[], showPeriodB: boolean }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Orders Trend
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Orders Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value, name) => [
              Number(value).toLocaleString(), 
              name === 'periodA_orders' ? 'Period A' : 'Period B'
            ]} />
            {showPeriodB ? (
              <Legend formatter={(value) => value === 'periodA_orders' ? 'Period A' : 'Period B'} />
            ) : (
              <Legend formatter={() => 'Period A'} />
            )}
            {/* Period A - Green */}
            <Bar dataKey="periodA_orders" fill={COLORS.PERIOD_A} name="Period A">
              <LabelList dataKey="periodA_orders" position="inside" formatter={(value: any) => Math.round(Number(value)).toLocaleString()} style={{ fontSize: '14px', fill: '#ffffff', fontWeight: 'bold' }} />
            </Bar>
            {/* Period B - Blue */}
            {showPeriodB && (
              <Bar dataKey="periodB_orders" fill={COLORS.PERIOD_B} name="Period B">
                <LabelList dataKey="periodB_orders" position="inside" formatter={(value: any) => Math.round(Number(value)).toLocaleString()} style={{ fontSize: '14px', fill: '#ffffff', fontWeight: 'bold' }} />
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

const AvgOrderAmountChart = ({ data, showPeriodB }: { data: any[], showPeriodB: boolean }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Avg Order Amount
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Avg Order Amount
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value, name) => [
              formatCurrency(Number(value)), 
              name === 'periodA_avgOrderAmount' ? 'Period A' : 'Period B'
            ]} />
            {showPeriodB ? (
              <Legend formatter={(value) => value === 'periodA_avgOrderAmount' ? 'Period A' : 'Period B'} />
            ) : (
              <Legend formatter={() => 'Period A'} />
            )}
            {/* Period A - Green */}
            <Bar dataKey="periodA_avgOrderAmount" fill={COLORS.PERIOD_A} name="Period A">
              <LabelList dataKey="periodA_avgOrderAmount" position="inside" formatter={(value: any) => formatCurrency(Number(value))} style={{ fontSize: '14px', fill: '#ffffff', fontWeight: 'bold' }} />
            </Bar>
            {/* Period B - Blue */}
            {showPeriodB && (
              <Bar dataKey="periodB_avgOrderAmount" fill={COLORS.PERIOD_B} name="Period B">
                <LabelList dataKey="periodB_avgOrderAmount" position="inside" formatter={(value: any) => formatCurrency(Number(value))} style={{ fontSize: '14px', fill: '#ffffff', fontWeight: 'bold' }} />
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ===== MAIN REVENUE CHARTS COMPONENT =====

function RevenueCharts({ 
  periodA, 
  periodB, 
  metricsA, 
  metricsB 
}: RevenueChartsProps) {
  
  if (!metricsA || !periodA) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>No data selected.</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const chartData = prepareChartData(periodA?.start || null, periodB?.start || null, metricsA, metricsB || null)
  const showPeriodB = !!periodB && !!metricsB

  return (
    <div className="space-y-6">
      {/* First 3 Charts - Fixed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={chartData} showPeriodB={showPeriodB} />
        <OrdersChart data={chartData} showPeriodB={showPeriodB} />
        <AvgOrderAmountChart data={chartData} showPeriodB={showPeriodB} />
      </div>
    </div>
  )
}

export { RevenueCharts }
export default RevenueCharts
