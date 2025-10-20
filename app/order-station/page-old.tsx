"use client"

import { useState } from "react"
import { useMenu, MenuItem, OrderItem, MenuItemVariant } from "@/contexts/MenuContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle, X, Utensils, Coffee, Pizza, Wine } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AppLayout from "@/components/AppLayout"
import { cn } from "@/lib/utils"

function OrderStationContent() {
  const { getItemsByCategory } = useMenu()
  const { toast } = useToast()
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set())

  const categories = [
    { key: 'top-dish' as const, title: '🥗 Top Dishes', icon: Pizza, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950' },
    { key: 'other-dish' as const, title: '🍕 Other Dishes', icon: Utensils, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950' },
    { key: 'top-drink' as const, title: '☕ Top Drinks', icon: Coffee, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950' },
    { key: 'other-drink' as const, title: '🍹 Other Drinks', icon: Wine, color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-50 dark:bg-cyan-950' },
  ]

  const addToOrder = (item: MenuItem, variant?: MenuItemVariant) => {
    // Add animation
    const itemKey = variant ? `${item.id}-${variant.id}` : item.id
    setAnimatingItems(prev => new Set(prev).add(itemKey))
    setTimeout(() => {
      setAnimatingItems(prev => {
        const next = new Set(prev)
        next.delete(itemKey)
        return next
      })
    }, 300)

    setOrderItems(prev => {
      const existing = prev.find(i => 
        i.id === item.id && 
        (variant ? i.selectedVariant?.id === variant.id : !i.selectedVariant)
      )
      
      if (existing) {
        return prev.map(i => 
          i.id === item.id && (variant ? i.selectedVariant?.id === variant.id : !i.selectedVariant)
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        )
      }
      
      return [...prev, { ...item, quantity: 1, selectedVariant: variant }]
    })

    // Update selected items
    setSelectedItems(prev => new Set(prev).add(itemKey))

    // Show toast
    toast({
      title: "Added to order",
      description: `${item.name}${variant ? ` (${variant.name})` : ''}`,
      duration: 1000,
    })
  }

  const updateQuantity = (orderIndex: number, delta: number) => {
    setOrderItems(prev => {
      const updated = prev.map((item, idx) => {
        if (idx === orderIndex) {
          const newQuantity = item.quantity + delta
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
        }
        return item
      }).filter(item => item.quantity > 0)
      return updated
    })
  }

  const removeItem = (orderIndex: number) => {
    setOrderItems(prev => prev.filter((_, idx) => idx !== orderIndex))
  }

  const clearOrder = () => {
    setOrderItems([])
    toast({
      title: "Order cleared",
      description: "All items removed from order",
    })
  }

  const confirmOrder = () => {
    if (orderItems.length === 0) {
      toast({
        title: "Empty order",
        description: "Please add items to the order first",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Order confirmed!",
      description: `Total: €${totalPrice.toFixed(2)} - ${orderItems.reduce((sum, i) => sum + i.quantity, 0)} items`,
    })
    
    // Clear order after confirmation
    setTimeout(() => {
      setOrderItems([])
    }, 1000)
  }

  const totalPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Order Station</h1>
          <p className="text-gray-600 dark:text-gray-400">Select items to add to the current order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Items - Left Side (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {categories.map(category => {
              const items = getItemsByCategory(category.key)
              if (items.length === 0) return null

              return (
                <div key={category.key}>
                  <h2 className={`text-xl font-bold mb-4 bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                    {category.title}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {items.map(item => (
                      <Card
                        key={item.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 bg-white dark:bg-gray-800 border-2 hover:border-green-500"
                        onClick={() => addToOrder(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                              {item.name}
                            </h3>
                            <Plus className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 ml-2" />
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-green-600 dark:text-green-500">
                              €{item.price.toFixed(2)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {category.key.includes('dish') ? 'Dish' : 'Drink'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary - Right Side (1/3) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 bg-white dark:bg-gray-800 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Current Order
                  {totalItems > 0 && (
                    <Badge className="ml-auto bg-white text-green-600">
                      {totalItems} {totalItems === 1 ? 'item' : 'items'}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {orderItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No items in order</p>
                    <p className="text-sm mt-2">Click on menu items to add them</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                      {orderItems.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              €{item.price.toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeItem(item.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          €{totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span className="text-gray-900 dark:text-white">Total</span>
                        <span className="text-green-600 dark:text-green-500">
                          €{totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        onClick={confirmOrder}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                        size="lg"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Confirm Order
                      </Button>
                      <Button
                        onClick={clearOrder}
                        variant="outline"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-900"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Order
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderStation() {
  return (
    <AppLayout>
      <OrderStationContent />
    </AppLayout>
  )
}
