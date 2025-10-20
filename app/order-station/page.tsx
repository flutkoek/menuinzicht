"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMenu, MenuItem, OrderItem, MenuItemVariant } from "@/contexts/MenuContext"
import { useOrders } from "@/contexts/OrdersContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle, X, Utensils, Coffee, Pizza, Wine, Sparkles, Calendar, ClipboardList } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AppLayout from "@/components/AppLayout"
import FeedbackSection from "@/components/FeedbackSection"
import { cn } from "@/lib/utils"

function OrderStationContent() {
  const { getItemsByCategory } = useMenu()
  const { addOrder } = useOrders()
  const { toast } = useToast()
  const router = useRouter()
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set())

  const categories = [
    { key: 'top-dish' as const, title: 'Top Dishes', icon: Pizza, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950', borderColor: 'border-orange-200 dark:border-orange-800' },
    { key: 'other-dish' as const, title: 'Other Dishes', icon: Utensils, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950', borderColor: 'border-amber-200 dark:border-amber-800' },
    { key: 'top-drink' as const, title: 'Top Drinks', icon: Coffee, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950', borderColor: 'border-blue-200 dark:border-blue-800' },
    { key: 'other-drink' as const, title: 'Other Drinks', icon: Wine, color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-50 dark:bg-cyan-950', borderColor: 'border-cyan-200 dark:border-cyan-800' },
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
    setSelectedItems(new Set())
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

    // Save order to context
    addOrder(orderItems)

    toast({
      title: "Order confirmed!",
      description: `Total: €${totalPrice.toFixed(2)} - ${totalItems} items`,
      duration: 2000,
    })
    
    // Clear order after confirmation
    setTimeout(() => {
      setOrderItems([])
      setSelectedItems(new Set())
    }, 1500)
  }

  const getItemPrice = (item: OrderItem) => {
    const basePrice = item.price
    const variantPrice = item.selectedVariant?.priceModifier || 0
    return basePrice + variantPrice
  }

  const totalPrice = orderItems.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0)
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0)

  const getItemQuantityInOrder = (item: MenuItem, variant?: MenuItemVariant) => {
    const orderItem = orderItems.find(i => 
      i.id === item.id && 
      (variant ? i.selectedVariant?.id === variant.id : !i.selectedVariant)
    )
    return orderItem?.quantity || 0
  }

  // Get today's date
  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Sticky Order Summary Bar */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-500" />
                <span className="font-semibold text-gray-900 dark:text-white">Current Order</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Today: {formattedDate}</span>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </Badge>
                <div className="text-2xl font-bold text-green-600 dark:text-green-500">
                  €{totalPrice.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push('/previous-orders')}
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                View Previous Orders
              </Button>
              {orderItems.length > 0 && (
                <Button
                  onClick={clearOrder}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
              <Button
                onClick={confirmOrder}
                disabled={orderItems.length === 0}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Items - Left Side (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {categories.map(category => {
              const items = getItemsByCategory(category.key)
              if (items.length === 0) return null

              return (
                <div key={category.key}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-r",
                      category.color
                    )}>
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {category.title}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {items.map(item => {
                      const hasVariants = item.variants && item.variants.length > 0
                      
                      return (
                        <Card
                          key={item.id}
                          className={cn(
                            "group relative overflow-hidden transition-all duration-300",
                            "hover:shadow-2xl hover:-translate-y-1",
                            "bg-white dark:bg-gray-800 border-2",
                            hasVariants 
                              ? "cursor-default" 
                              : "cursor-pointer active:scale-95",
                            selectedItems.has(item.id) && !hasVariants
                              ? "border-green-500 bg-green-50 dark:bg-green-950/20 ring-2 ring-green-500/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-green-400"
                          )}
                          onClick={() => !hasVariants && addToOrder(item)}
                        >
                          {/* Quantity Badge */}
                          {!hasVariants && getItemQuantityInOrder(item) > 0 && (
                            <div className="absolute top-2 right-2 z-10">
                              <Badge className="bg-green-600 text-white font-bold px-2 py-1 shadow-lg">
                                {getItemQuantityInOrder(item)}x
                              </Badge>
                            </div>
                          )}

                          {/* Pulse Animation */}
                          {animatingItems.has(item.id) && (
                            <div className="absolute inset-0 bg-green-400/20 animate-ping rounded-lg" />
                          )}

                          <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight pr-2">
                                {item.name}
                              </h3>
                              {!hasVariants && (
                                <Plus className={cn(
                                  "w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-125",
                                  selectedItems.has(item.id)
                                    ? "text-green-600 dark:text-green-500"
                                    : "text-gray-400 dark:text-gray-500"
                                )} />
                              )}
                            </div>
                            
                            {item.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {item.description}
                              </p>
                            )}

                            {/* Variants */}
                            {hasVariants && (
                              <div className="space-y-2 mb-3">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                  Select Option:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {item.variants!.map(variant => {
                                    const itemKey = `${item.id}-${variant.id}`
                                    const quantity = getItemQuantityInOrder(item, variant)
                                    
                                    return (
                                      <Button
                                        key={variant.id}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          addToOrder(item, variant)
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className={cn(
                                          "relative transition-all duration-200",
                                          selectedItems.has(itemKey)
                                            ? "bg-green-100 dark:bg-green-950 border-green-500 text-green-700 dark:text-green-400 font-semibold"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-800",
                                          animatingItems.has(itemKey) && "scale-110"
                                        )}
                                      >
                                        {variant.name}
                                        {variant.priceModifier > 0 && (
                                          <span className="ml-1 text-xs">+€{variant.priceModifier.toFixed(2)}</span>
                                        )}
                                        {quantity > 0 && (
                                          <Badge className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-1.5 py-0.5">
                                            {quantity}
                                          </Badge>
                                        )}
                                      </Button>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <span className="text-2xl font-bold text-green-600 dark:text-green-500">
                                €{item.price.toFixed(2)}
                                {hasVariants && <span className="text-sm text-gray-500 ml-1">+</span>}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {category.key.includes('dish') ? 'Dish' : 'Drink'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Details - Right Side (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="bg-white dark:bg-gray-800 shadow-xl border-2 border-gray-200 dark:border-gray-700">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-t-lg">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Order Details
                  </h3>
                </div>
                <CardContent className="p-4">
                  {orderItems.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="font-medium">No items yet</p>
                      <p className="text-sm mt-2">Click on menu items to start ordering</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4 max-h-[500px] overflow-y-auto pr-2">
                        {orderItems.map((item, index) => (
                          <div
                            key={`${item.id}-${item.selectedVariant?.id || 'default'}-${index}`}
                            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-green-400 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                {item.name}
                              </h4>
                              {item.selectedVariant && (
                                <p className="text-xs text-green-600 dark:text-green-500 font-medium">
                                  {item.selectedVariant.name}
                                </p>
                              )}
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                €{getItemPrice(item).toFixed(2)} × {item.quantity} = €{(getItemPrice(item) * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(index, -1)}
                                className="h-7 w-7 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-bold text-sm text-gray-900 dark:text-white">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(index, 1)}
                                className="h-7 w-7 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItem(index)}
                                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 ml-1"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            €{totalPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span className="text-gray-900 dark:text-white">Total</span>
                          <span className="text-green-600 dark:text-green-500 text-2xl">
                            €{totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="max-w-[1800px] mx-auto px-6 pb-6">
          <FeedbackSection />
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
