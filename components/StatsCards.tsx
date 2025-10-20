"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Euro, 
  ShoppingCart, 
  Utensils, 
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react"
import { RestaurantMetrics } from "@/lib/staticData"

interface StatsCardsProps {
  metricsA: RestaurantMetrics | null
  metricsB?: RestaurantMetrics | null
  isComparing?: boolean
}

export function StatsCards({ metricsA, metricsB, isComparing }: StatsCardsProps) {
  if (!metricsA) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                <p>No data selected.</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const calculateChange = (valueA: number, valueB: number): { percentage: number; trend: 'up' | 'down' | 'neutral' } => {
    if (valueB === 0) return { percentage: 0, trend: 'neutral' }
    const change = ((valueB - valueA) / valueA) * 100 // Period B relative to Period A
    return {
      percentage: Math.abs(change),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-EU').format(num)
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3" />
      case 'down': return <TrendingDown className="w-3 h-3" />
      default: return <Minus className="w-3 h-3" />
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      case 'down': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const stats = [
    {
      title: "Total Revenue",
      valueA: metricsA.revenue,
      valueB: metricsB?.revenue,
      formatValue: (val: number) => formatCurrency(val),
      icon: Euro,
      description: "Total sales revenue"
    },
    {
      title: "Total Orders", 
      valueA: metricsA.orders,
      valueB: metricsB?.orders,
      formatValue: (val: number) => formatNumber(val),
      icon: ShoppingCart,
      description: "Number of orders"
    },
    {
      title: "Avg Order Size",
      valueA: metricsA.avgOrderSize,
      valueB: metricsB?.avgOrderSize,
      formatValue: (val: number) => `${val} dishes`,
      icon: Utensils,
      description: "Average dishes per order"
    },
    {
      title: "Avg Order Amount",
      valueA: metricsA.avgOrderAmount,
      valueB: metricsB?.avgOrderAmount,
      formatValue: (val: number) => formatCurrency(val),
      icon: TrendingUp,
      description: "Average order value"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const change = isComparing && stat.valueB !== undefined 
          ? calculateChange(stat.valueA, stat.valueB)
          : null

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {/* Period A Value */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-green-600">
                    {stat.formatValue(stat.valueA)}
                  </div>
                  {isComparing && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      Period A
                    </Badge>
                  )}
                </div>
                
                {/* Period B Value */}
                {isComparing && stat.valueB !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold text-blue-600">
                      {stat.formatValue(stat.valueB)}
                    </div>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Period B
                    </Badge>
                  </div>
                )}
                
                {/* Change Indicator */}
                {isComparing && change && (
                  <div className="flex items-center gap-2 pt-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getTrendColor(change.trend)}`}
                    >
                      {getTrendIcon(change.trend)}
                      {change.percentage.toFixed(1)}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Period B vs A
                    </span>
                  </div>
                )}
                
                {/* Description when not comparing */}
                {!isComparing && (
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
