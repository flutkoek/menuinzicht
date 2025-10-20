"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { OrderItem } from './MenuContext'

export interface SavedOrder {
  id: string
  date: string // ISO string
  items: OrderItem[]
  totalPrice: number
  totalItems: number
}

interface OrdersContextType {
  orders: SavedOrder[]
  addOrder: (items: OrderItem[]) => void
  updateOrder: (id: string, items: OrderItem[]) => void
  deleteOrder: (id: string) => void
  getOrderById: (id: string) => SavedOrder | undefined
  getTodayOrders: () => SavedOrder[]
  getTotalRevenue: () => number
  getTotalOrders: () => number
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<SavedOrder[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('restaurantOrders')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setOrders(parsed)
      } catch (error) {
        console.error('Failed to parse orders from localStorage:', error)
      }
    }
  }, [])

  // Save to localStorage whenever orders change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('restaurantOrders', JSON.stringify(orders))
    }
  }, [orders])

  const calculateOrderTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => {
      const basePrice = item.price
      const variantPrice = item.selectedVariant?.priceModifier || 0
      return sum + ((basePrice + variantPrice) * item.quantity)
    }, 0)
  }

  const calculateTotalItems = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }

  const addOrder = (items: OrderItem[]) => {
    const newOrder: SavedOrder = {
      id: `order-${Date.now()}`,
      date: new Date().toISOString(),
      items: items,
      totalPrice: calculateOrderTotal(items),
      totalItems: calculateTotalItems(items)
    }

    setOrders(prev => [newOrder, ...prev])
  }

  const updateOrder = (id: string, items: OrderItem[]) => {
    setOrders(prev => prev.map(order => 
      order.id === id 
        ? {
            ...order,
            items: items,
            totalPrice: calculateOrderTotal(items),
            totalItems: calculateTotalItems(items)
          }
        : order
    ))
  }

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id))
  }

  const getOrderById = (id: string) => {
    return orders.find(order => order.id === id)
  }

  const getTodayOrders = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return orders.filter(order => {
      const orderDate = new Date(order.date)
      orderDate.setHours(0, 0, 0, 0)
      return orderDate.getTime() === today.getTime()
    })
  }

  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + order.totalPrice, 0)
  }

  const getTotalOrders = () => {
    return orders.length
  }

  return (
    <OrdersContext.Provider value={{
      orders,
      addOrder,
      updateOrder,
      deleteOrder,
      getOrderById,
      getTodayOrders,
      getTotalRevenue,
      getTotalOrders
    }}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider')
  }
  return context
}
