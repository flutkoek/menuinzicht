"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DynamicAggregatedChart } from "@/components/DynamicAggregatedChart"
import { dataStats } from "@/lib/staticData"

export default function DynamicChartTestPage() {
  // Chart configuration state
  const [chartMode, setChartMode] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders' | 'avgOrderAmount'>('revenue')
  
  // Test scenarios
  const [periodA, setPeriodA] = useState<{ start: string, end: string } | null>({
    start: '2024-03-01',
    end: '2024-03-31'
  })
  
  const [periodB, setPeriodB] = useState<{ start: string, end: string } | null>({
    start: '2024-06-01',
    end: '2024-06-30'
  })

  const [enablePeriodB, setEnablePeriodB] = useState(true)

  const testScenarios = [
    {
      name: "Single Day Comparison",
      periodA: { start: '2024-03-15', end: '2024-03-15' },
      periodB: { start: '2024-06-15', end: '2024-06-15' },
      description: "Compare single days - should show only the weekday of selected dates"
    },
    {
      name: "Week Comparison",
      periodA: { start: '2024-03-11', end: '2024-03-17' },
      periodB: { start: '2024-06-10', end: '2024-06-16' },
      description: "Compare full weeks - should show specific week numbers"
    },
    {
      name: "Month Comparison",
      periodA: { start: '2024-03-01', end: '2024-03-31' },
      periodB: { start: '2024-06-01', end: '2024-06-30' },
      description: "Compare full months - should show March vs June"
    },
    {
      name: "Multi-Week Period",
      periodA: { start: '2024-03-01', end: '2024-03-21' },
      periodB: { start: '2024-06-01', end: '2024-06-21' },
      description: "Compare 3-week periods - should aggregate by weekday/week/month"
    },
    {
      name: "Quarter Comparison",
      periodA: { start: '2024-01-01', end: '2024-03-31' },
      periodB: { start: '2024-04-01', end: '2024-06-30' },
      description: "Compare Q1 vs Q2 - good for month view"
    }
  ]

  const applyScenario = (scenario: typeof testScenarios[0]) => {
    setPeriodA(scenario.periodA)
    setPeriodB(scenario.periodB)
    setEnablePeriodB(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dynamic Aggregated Chart Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the dynamic aggregated analysis component with various scenarios
          </p>
        </div>

        {/* Test Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>Test Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testScenarios.map((scenario, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">{scenario.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {scenario.description}
                  </p>
                  <Button 
                    onClick={() => applyScenario(scenario)}
                    size="sm"
                    className="w-full"
                  >
                    Apply Scenario
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Manual Period Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Period Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Period A */}
              <div className="space-y-4">
                <h3 className="font-semibold text-green-600">Period A (Green)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="periodA-start">Start Date</Label>
                    <Input
                      id="periodA-start"
                      type="date"
                      value={periodA?.start || ''}
                      onChange={(e) => setPeriodA(prev => prev ? { ...prev, start: e.target.value } : { start: e.target.value, end: '' })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="periodA-end">End Date</Label>
                    <Input
                      id="periodA-end"
                      type="date"
                      value={periodA?.end || ''}
                      onChange={(e) => setPeriodA(prev => prev ? { ...prev, end: e.target.value } : { start: '', end: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Period B */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-blue-600">Period B (Blue)</h3>
                  <Button
                    variant={enablePeriodB ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEnablePeriodB(!enablePeriodB)}
                  >
                    {enablePeriodB ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                {enablePeriodB && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="periodB-start">Start Date</Label>
                      <Input
                        id="periodB-start"
                        type="date"
                        value={periodB?.start || ''}
                        onChange={(e) => setPeriodB(prev => prev ? { ...prev, start: e.target.value } : { start: e.target.value, end: '' })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="periodB-end">End Date</Label>
                      <Input
                        id="periodB-end"
                        type="date"
                        value={periodB?.end || ''}
                        onChange={(e) => setPeriodB(prev => prev ? { ...prev, end: e.target.value } : { start: '', end: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Chart Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mode Selection */}
              <div className="space-y-4">
                <h3 className="font-semibold">View Mode</h3>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  {(['day', 'week', 'month', 'year'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setChartMode(mode)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors capitalize ${
                        chartMode === mode
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metric Selection */}
              <div className="space-y-4">
                <h3 className="font-semibold">Metric</h3>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  {([
                    { key: 'revenue', label: 'Revenue' },
                    { key: 'orders', label: 'Orders' },
                    { key: 'avgOrderAmount', label: 'Avg Order Amount' }
                  ] as const).map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setChartMetric(m.key)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        chartMetric === m.key
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Component */}
        <DynamicAggregatedChart
          periodA={periodA}
          periodB={enablePeriodB ? periodB : null}
          mode={chartMode}
          metric={chartMetric}
        />

        {/* Data Info */}
        <Card>
          <CardHeader>
            <CardTitle>Static Data Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Data Range:</strong> {dataStats.dateRange.start} - {dataStats.dateRange.end}
              </div>
              <div>
                <strong>Total Records:</strong> {dataStats.totalRows} days
              </div>
              <div>
                <strong>Years:</strong> {dataStats.years.join(', ')}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-4">
              <div>
                <strong>2023:</strong> {dataStats.rowsByYear[2023]} days
              </div>
              <div>
                <strong>2024:</strong> {dataStats.rowsByYear[2024]} days (leap year)
              </div>
              <div>
                <strong>2025:</strong> {dataStats.rowsByYear[2025]} days
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <strong>Note:</strong> Data is deterministic and consistent across all runs. 
              Uses realistic restaurant metrics with formulas based on day of year and month.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
