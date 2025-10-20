"use client"

import { useState } from "react"
import { useOrders, SavedOrder } from "@/contexts/OrdersContext"
import { OrderItem } from "@/contexts/MenuContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ClipboardList, Eye, Edit, Trash2, Plus, Minus, X, Calendar, ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import AppLayout from "@/components/AppLayout"
import FeedbackSection from "@/components/FeedbackSection"
import { cn } from "@/lib/utils"

function PreviousOrdersContent() {
  const { orders, updateOrder, deleteOrder } = useOrders()
  const { toast } = useToast()
  
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<SavedOrder | null>(null)
  const [editItems, setEditItems] = useState<OrderItem[]>([])

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getItemPrice = (item: OrderItem) => {
    const basePrice = item.price
    const variantPrice = item.selectedVariant?.priceModifier || 0
    return basePrice + variantPrice
  }

  const handleView = (order: SavedOrder) => {
    setSelectedOrder(order)
    setViewDialogOpen(true)
  }

  const handleEdit = (order: SavedOrder) => {
    setSelectedOrder(order)
    setEditItems([...order.items])
    setEditDialogOpen(true)
  }

  const handleDelete = (order: SavedOrder) => {
    if (confirm(`Are you sure you want to delete this order from ${formatDate(order.date)}?`)) {
      deleteOrder(order.id)
      toast({
        title: "Order deleted",
        description: "The order has been removed",
      })
    }
  }

  const updateQuantity = (index: number, delta: number) => {
    setEditItems(prev => {
      const updated = prev.map((item, idx) => {
        if (idx === index) {
          const newQuantity = item.quantity + delta
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
        }
        return item
      }).filter(item => item.quantity > 0)
      return updated
    })
  }

  const removeItem = (index: number) => {
    setEditItems(prev => prev.filter((_, idx) => idx !== index))
  }

  const handleSaveEdit = () => {
    if (!selectedOrder || editItems.length === 0) {
      toast({
        title: "Error",
        description: "Order must have at least one item",
        variant: "destructive",
      })
      return
    }

    updateOrder(selectedOrder.id, editItems)
    toast({
      title: "Order updated",
      description: "The order has been updated successfully",
    })
    setEditDialogOpen(false)
  }

  const calculateEditTotal = () => {
    return editItems.reduce((sum, item) => sum + (getItemPrice(item) * item.quantity), 0)
  }

  const calculateEditItems = () => {
    return editItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  // Group orders by date
  const groupedOrders = orders.reduce((acc, order) => {
    const dateKey = formatDate(order.date)
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(order)
    return acc
  }, {} as Record<string, SavedOrder[]>)

  const sortedDates = Object.keys(groupedOrders).sort((a, b) => {
    const dateA = new Date(groupedOrders[a][0].date)
    const dateB = new Date(groupedOrders[b][0].date)
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Previous Orders</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">View and manage all past orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-950">
                  <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-500">
                    €{orders.reduce((sum, o) => sum + o.totalPrice, 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-950">
                  <Calendar className="w-6 h-6 text-green-600 dark:text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Order</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-500">
                    €{orders.length > 0 ? (orders.reduce((sum, o) => sum + o.totalPrice, 0) / orders.length).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-950">
                  <ClipboardList className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
            <CardContent className="p-12">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">No orders yet</p>
                <p className="text-sm">Orders will appear here once you confirm them in the Order Station</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(dateKey => (
              <Card key={dateKey} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                    {dateKey}
                    <Badge variant="outline" className="ml-auto">
                      {groupedOrders[dateKey].length} {groupedOrders[dateKey].length === 1 ? 'order' : 'orders'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {groupedOrders[dateKey].map(order => (
                      <div
                        key={order.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {formatTime(order.date)}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {order.items.slice(0, 3).map((item, idx) => (
                                <span key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                                  {item.quantity}× {item.name}
                                  {item.selectedVariant && ` (${item.selectedVariant.name})`}
                                  {idx < Math.min(order.items.length, 3) - 1 && ','}
                                </span>
                              ))}
                              {order.items.length > 3 && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  +{order.items.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold text-green-600 dark:text-green-500">
                              €{order.totalPrice.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleView(order)}
                                className="hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-400"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(order)}
                                className="hover:bg-green-50 dark:hover:bg-green-950 hover:border-green-400"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(order)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-900 hover:border-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Order Details</DialogTitle>
              <DialogDescription>
                {selectedOrder && (
                  <>
                    {formatDate(selectedOrder.date)} at {formatTime(selectedOrder.date)}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 py-4">
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {item.name}
                        </h4>
                        {item.selectedVariant && (
                          <p className="text-xs text-green-600 dark:text-green-500 font-medium">
                            {item.selectedVariant.name}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          €{getItemPrice(item).toFixed(2)} × {item.quantity} = €{(getItemPrice(item) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-sm">
                        {item.quantity}×
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-green-600 dark:text-green-500 text-2xl">
                      €{selectedOrder.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Edit Order</DialogTitle>
              <DialogDescription>
                {selectedOrder && (
                  <>
                    {formatDate(selectedOrder.date)} at {formatTime(selectedOrder.date)}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {editItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
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
              <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Items</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {calculateEditItems()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-green-600 dark:text-green-500 text-2xl">
                    €{calculateEditTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Feedback Section */}
        <FeedbackSection />
      </div>
    </div>
  )
}

export default function PreviousOrders() {
  return (
    <AppLayout>
      <PreviousOrdersContent />
    </AppLayout>
  )
}
