"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { getCategoryBreakdown } from "@/lib/staticData"
import { PieChart as PieChartIcon } from "lucide-react"

interface CategoryPieChartsProps {
  periodA: { start: string; end: string } | null
  periodB: { start: string; end: string } | null
  metric?: 'revenue' | 'orders'
}

// Period-specific color palettes
const PERIOD_A_COLORS = [
  '#22c55e', '#16a34a', '#15803d', '#10b981', '#059669',
  '#047857', '#065f46', '#064e3b', '#14b8a6', '#0d9488',
  '#0f766e', '#115e59', '#134e4a', '#166534', '#14532d'
]

const PERIOD_B_COLORS = [
  '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
  '#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81',
  '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'
]

const generateColors = (count: number, period: 'A' | 'B'): string[] => {
  const palette = period === 'A' ? PERIOD_A_COLORS : PERIOD_B_COLORS
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(palette[i % palette.length])
  }
  return result
}

export function CategoryPieCharts({ periodA, periodB, metric = 'orders' }: CategoryPieChartsProps) {
  const [selectedCategory, setSelectedCategory] = useState<'dish' | 'drink'>('dish')
  const selectedMetric = metric === 'revenue' ? 'revenue' : 'items'

  if (!periodA) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Category Contribution
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

  // Get breakdown data for each period
  const dataA = getCategoryBreakdown(periodA.start, periodA.end, selectedMetric, selectedCategory)
  const dataB = periodB ? getCategoryBreakdown(periodB.start, periodB.end, selectedMetric, selectedCategory) : []

  // Transform data for pie charts
  const pieDataA = dataA.map(item => ({
    name: item.name,
    value: selectedMetric === 'items' ? item.items : item.revenue
  }))

  const pieDataB = dataB.map(item => ({
    name: item.name,
    value: selectedMetric === 'items' ? item.items : item.revenue
  }))

  const formatValue = (value: number): string => {
    if (selectedMetric === 'revenue') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
    }
    return `${value.toLocaleString()} items`
  }

  const createCustomTooltip = (data: any[]) => ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]
      const pieTotal = data.reduce((sum, item) => sum + item.value, 0)
      const percentage = pieTotal > 0 ? ((dataPoint.value / pieTotal) * 100).toFixed(1) : '0'
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{dataPoint.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatValue(dataPoint.value)} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  // Generate colors for items - Period A gets green palette, Period B gets blue palette
  const colorsA = generateColors(pieDataA.length, 'A')
  const colorsB = generateColors(pieDataB.length, 'B')
  
  // Calculate totals
  const totalA = pieDataA.reduce((sum, item) => sum + item.value, 0)
  const totalB = pieDataB.reduce((sum, item) => sum + item.value, 0)
  
  const formatTotal = (value: number): string => {
    if (selectedMetric === 'revenue') {
      if (value >= 1000) {
        return `€${(value / 1000).toFixed(1)}k`
      }
      return `€${Math.round(value)}`
    }
    return value.toLocaleString()
  }

  // Dynamic background based on category
  const cardBgClass = selectedCategory === 'dish' 
    ? 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-amber-950 dark:to-orange-950 transition-all duration-500'
    : 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 transition-all duration-500'

  return (
    <Card className={cardBgClass}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Category Contribution
          </CardTitle>
          
          <div className="flex gap-4">
            {/* Category Toggle */}
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === 'dish' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('dish')}
              >
                Dishes
              </Button>
              <Button
                variant={selectedCategory === 'drink' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('drink')}
              >
                Drinks
              </Button>
            </div>

          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className={`grid gap-8 ${periodB ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Period A Pie */}
          <div className="space-y-4 p-6 rounded-2xl border-2 border-green-300 dark:border-green-600 shadow-lg shadow-green-500/20 dark:shadow-green-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/30 dark:hover:shadow-green-500/40 hover:border-green-400 dark:hover:border-green-500">
            <div className="flex flex-col items-center gap-2">
              <h4 className="text-center font-medium text-green-700 dark:text-green-400">
                {periodB ? 'Period A' : `${selectedCategory === 'dish' ? 'Dishes' : 'Drinks'}`}
              </h4>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {selectedMetric === 'revenue' ? 'Total Revenue: ' : 'Total Items Ordered: '}
                {formatTotal(totalA)}
              </p>
            </div>
            {pieDataA.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <p>No {selectedCategory}es found</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieDataA}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieDataA.map((entry, index) => (
                        <Cell key={`cell-a-${index}`} fill={colorsA[index]} />
                      ))}
                    </Pie>
                    <Tooltip content={createCustomTooltip(pieDataA)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {pieDataA.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: colorsA[index] }}
                      />
                      <span className="truncate">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Period B Pie */}
          {periodB && (
            <div className="space-y-4 p-6 rounded-2xl border-2 border-blue-300 dark:border-blue-600 shadow-lg shadow-blue-500/20 dark:shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 dark:hover:shadow-blue-500/40 hover:border-blue-400 dark:hover:border-blue-500">
              <div className="flex flex-col items-center gap-2">
                <h4 className="text-center font-medium text-blue-700 dark:text-blue-400">
                  Period B
                </h4>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {selectedMetric === 'revenue' ? 'Total Revenue: ' : 'Total Items Ordered: '}
                  {formatTotal(totalB)}
                </p>
              </div>
              {pieDataB.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <p>No {selectedCategory}es found</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieDataB}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieDataB.map((entry, index) => (
                          <Cell key={`cell-b-${index}`} fill={colorsB[index]} />
                        ))}
                      </Pie>
                      <Tooltip content={createCustomTooltip(pieDataB)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {pieDataB.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: colorsB[index] }}
                        />
                        <span className="truncate">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CategoryPieCharts
