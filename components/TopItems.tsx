"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getTopItems, MenuItem } from "@/lib/mockData"
import { Crown, TrendingDown, Utensils, Coffee } from "lucide-react"

interface TopItemsProps {
  isComparing?: boolean
  periodA?: { start: string; end: string } | null
  periodB?: { start: string; end: string } | null
}

export function TopItems({ isComparing = false, periodA = null, periodB = null }: TopItemsProps) {
  const [selectedCategory, setSelectedCategory] = useState<'dish' | 'drink'>('dish')
  const [selectedType, setSelectedType] = useState<'most' | 'least'>('most')

  // Only fetch items if periodA is selected
  const itemsA = periodA ? getTopItems(selectedCategory, selectedType, 5) : []
  // For Period B, get a different set of items by getting more items and taking the next 5
  // This simulates different time periods having different top items
  const allItemsForB = (isComparing && periodB) ? getTopItems(selectedCategory, selectedType, 10) : []
  const itemsB = (isComparing && periodB) ? allItemsForB.slice(5, 10) : []

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const ItemCard = ({ 
    items, 
    title, 
    colorScheme, 
    icon: Icon 
  }: { 
    items: MenuItem[]
    title: string
    colorScheme: 'green' | 'blue' | 'red'
    icon: React.ComponentType<{ className?: string }>
  }) => {
    const bgColor = colorScheme === 'green' 
      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
      : colorScheme === 'blue'
      ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
      : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
    
    const textColor = colorScheme === 'green'
      ? 'text-green-700 dark:text-green-300'
      : colorScheme === 'blue'
      ? 'text-blue-700 dark:text-blue-300'
      : 'text-red-700 dark:text-red-300'

    return (
      <Card className={`${bgColor} border-2`}>
        <CardHeader className="pb-3">
          <CardTitle className={`text-lg flex items-center gap-2 ${textColor}`}>
            <Icon className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No data available for this period</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      colorScheme === 'green' 
                        ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300'
                        : colorScheme === 'blue'
                        ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {index + 1}
                  </Badge>
                  <div>
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} each
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{item.soldCount}</div>
                  <div className="text-xs text-muted-foreground">sold</div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    )
  }

  // Show empty state if no period is selected
  if (!periodA) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Top Performing Items
          </h3>
          <p className="text-sm text-muted-foreground">
            Please select a date range to view top performing items
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Performing Items
          </h3>
          <p className="text-sm text-muted-foreground">
            {isComparing 
              ? "Compare Period A (green) vs Period B (blue) side by side"
              : "View your best and worst performing menu items"
            }
          </p>
          {periodA && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Period A: {periodA.start} to {periodA.end}
              {isComparing && periodB && (
                <span className="ml-2">| Period B: {periodB.start} to {periodB.end}</span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {/* Category Toggle */}
          <div className="flex border rounded-lg p-1">
            <Button
              variant={selectedCategory === 'dish' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory('dish')}
              className="flex items-center gap-2"
            >
              <Utensils className="w-4 h-4" />
              Dishes
            </Button>
            <Button
              variant={selectedCategory === 'drink' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory('drink')}
              className="flex items-center gap-2"
            >
              <Coffee className="w-4 h-4" />
              Drinks
            </Button>
          </div>
          
          {/* Type Toggle - Always visible */}
          <div className="flex border rounded-lg p-1">
            <Button
              variant={selectedType === 'most' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedType('most')}
              className="flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Most Sold
            </Button>
            <Button
              variant={selectedType === 'least' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedType('least')}
              className="flex items-center gap-2"
            >
              <TrendingDown className="w-4 h-4" />
              Least Sold
            </Button>
          </div>
        </div>
      </div>

      {/* Items Display */}
      {isComparing ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ItemCard
            items={itemsA}
            title={`Top 5 ${selectedType === 'most' ? 'Most' : 'Least'} Sold ${selectedCategory === 'dish' ? 'Dishes' : 'Drinks'} - Period A`}
            colorScheme="green"
            icon={selectedType === 'most' ? Crown : TrendingDown}
          />
          <ItemCard
            items={itemsB}
            title={`Top 5 ${selectedType === 'most' ? 'Most' : 'Least'} Sold ${selectedCategory === 'dish' ? 'Dishes' : 'Drinks'} - Period B`}
            colorScheme="blue"
            icon={selectedType === 'most' ? Crown : TrendingDown}
          />
        </div>
      ) : (
        <div className="max-w-2xl">
          <ItemCard
            items={itemsA}
            title={`Top 5 ${selectedType === 'most' ? 'Most' : 'Least'} Sold ${selectedCategory === 'dish' ? 'Dishes' : 'Drinks'}`}
            colorScheme={selectedType === 'most' ? 'green' : 'red'}
            icon={selectedType === 'most' ? Crown : TrendingDown}
          />
        </div>
      )}
    </div>
  )
}
