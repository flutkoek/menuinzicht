"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AggregatedChart } from "./RevenueCharts"
import { RestaurantMetrics } from "@/lib/mockData"

// ===== ACCEPTANCE TEST SCENARIOS =====
// These test the range-driven bucketing functionality

interface TestScenario {
  name: string
  description: string
  periodA: string
  periodB: string | null
  expectedBehavior: string
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    name: "Days - Only Period A",
    description: "Period A: 2025-09-02 → 2025-09-03 (2 days), Period B: not selected",
    periodA: "2025-09-02",
    periodB: null,
    expectedBehavior: "Chart shows exactly 2 bars (labels 2025-09-02, 2025-09-03), green only."
  },
  {
    name: "Days - Both A & B (different dates)",
    description: "Period A: 2025-09-02 → 2025-09-03, Period B: 2025-09-09 → 2025-09-11",
    periodA: "2025-09-02",
    periodB: "2025-09-09",
    expectedBehavior: "Truncate to min length (2 buckets): A=2025-09-02 vs B=2025-09-09, A=2025-09-03 vs B=2025-09-10"
  },
  {
    name: "Weeks - Partial weeks",
    description: "Period A: 2025-09-02 → 2025-09-08 (crosses week boundary), Period B: not selected",
    periodA: "2025-09-02",
    periodB: null,
    expectedBehavior: "Chart shows 2 week buckets (e.g., 2025-W36, 2025-W37) aggregating only selected days; green only."
  },
  {
    name: "Months - Partial month",
    description: "Period A: 2025-10-05 → 2025-10-20, Period B: 2025-11-01 → 2025-11-30",
    periodA: "2025-10-05",
    periodB: "2025-11-01",
    expectedBehavior: "1 bucket after truncation: A=2025-10 (aggregates 10/05–10/20), B=2025-11 (aggregates 11/01–11/30)"
  }
]

// Mock metrics for testing
const mockMetricsA: RestaurantMetrics = {
  date: "2025-09-02",
  revenue: 5000,
  orders: 150,
  avgOrderAmount: 33.33,
  avgOrderSize: 3
}

const mockMetricsB: RestaurantMetrics = {
  date: "2025-09-09",
  revenue: 5500,
  orders: 165,
  avgOrderAmount: 33.33,
  avgOrderSize: 3
}

export function AggregatedChartTests() {
  const [currentScenario, setCurrentScenario] = useState<TestScenario>(TEST_SCENARIOS[0])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Aggregated Chart - Acceptance Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Test Scenarios</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {TEST_SCENARIOS.map((scenario, index) => (
                  <Button
                    key={index}
                    variant={currentScenario.name === scenario.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentScenario(scenario)}
                    className="text-left justify-start h-auto p-3"
                  >
                    <div>
                      <div className="font-medium">{scenario.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {scenario.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Current Test: {currentScenario.name}</h4>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Setup:</strong> {currentScenario.description}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Expected:</strong> {currentScenario.expectedBehavior}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Chart */}
      <AggregatedChart
        periodA={currentScenario.periodA}
        periodB={currentScenario.periodB}
        metricsA={mockMetricsA}
        metricsB={currentScenario.periodB ? mockMetricsB : null}
      />

      {/* Color Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Color Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Period A - Green (#22c55e)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Period B - Blue (#3b82f6)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span>Positive Delta - Green</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Negative Delta - Red</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
