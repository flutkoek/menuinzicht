"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface MenuItemVariant {
  id: string
  name: string
  priceModifier: number // Added to base price
}

export interface MenuItem {
  id: string
  name: string
  category: 'top-dish' | 'other-dish' | 'top-drink' | 'other-drink'
  price: number
  description?: string
  variants?: MenuItemVariant[]
}

export interface OrderItem extends MenuItem {
  quantity: number
  selectedVariant?: MenuItemVariant
}

interface MenuContextType {
  menuItems: MenuItem[]
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void
  updateMenuItem: (id: string, item: Omit<MenuItem, 'id'>) => void
  deleteMenuItem: (id: string) => void
  getItemsByCategory: (category: MenuItem['category']) => MenuItem[]
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

const defaultMenuItems: MenuItem[] = [
  // Top Dishes
  { id: '1', name: 'Margherita Pizza', category: 'top-dish', price: 12.50, description: 'Classic tomato and mozzarella' },
  { id: '2', name: 'Pasta Carbonara', category: 'top-dish', price: 14.00, description: 'Creamy bacon pasta' },
  { id: '3', name: 'Caesar Salad', category: 'top-dish', price: 10.50, description: 'Fresh romaine with parmesan', 
    variants: [
      { id: 'v1', name: 'Regular', priceModifier: 0 },
      { id: 'v2', name: 'With Chicken', priceModifier: 3.50 },
      { id: 'v3', name: 'With Shrimp', priceModifier: 5.00 }
    ]
  },
  { id: '4', name: 'Beef Burger', category: 'top-dish', price: 15.00, description: 'Angus beef with fries' },
  
  // Other Dishes
  { id: '5', name: 'Grilled Salmon', category: 'other-dish', price: 18.50, description: 'With seasonal vegetables' },
  { id: '6', name: 'Chicken Tikka', category: 'other-dish', price: 13.50, description: 'Spicy Indian curry' },
  { id: '7', name: 'Vegetable Stir Fry', category: 'other-dish', price: 11.00, description: 'Asian style vegetables' },
  { id: '8', name: 'Fish & Chips', category: 'other-dish', price: 14.50, description: 'Crispy battered cod' },
  
  // Top Drinks
  { id: '9', name: 'Coca Cola', category: 'top-drink', price: 3.50, description: '330ml' },
  { id: '10', name: 'Fresh Orange Juice', category: 'top-drink', price: 4.50, description: 'Freshly squeezed' },
  { id: '11', name: 'Coffee', category: 'top-drink', price: 3.00, description: 'Hot coffee',
    variants: [
      { id: 'v4', name: 'Espresso', priceModifier: 0 },
      { id: 'v5', name: 'Americano', priceModifier: 0.50 },
      { id: 'v6', name: 'Cappuccino', priceModifier: 1.00 },
      { id: 'v7', name: 'Latte', priceModifier: 1.50 }
    ]
  },
  { id: '12', name: 'Beer', category: 'top-drink', price: 5.00, description: 'Draft beer 400ml' },
  
  // Other Drinks
  { id: '13', name: 'Sparkling Water', category: 'other-drink', price: 3.00, description: '500ml' },
  { id: '14', name: 'Iced Tea', category: 'other-drink', price: 3.50, description: 'Refreshing iced tea',
    variants: [
      { id: 'v8', name: 'Lemon', priceModifier: 0 },
      { id: 'v9', name: 'Peach', priceModifier: 0 },
      { id: 'v10', name: 'Mango', priceModifier: 0.50 }
    ]
  },
  { id: '15', name: 'Red Wine', category: 'other-drink', price: 6.50, description: 'Glass 150ml' },
  { id: '16', name: 'Smoothie', category: 'other-drink', price: 5.50, description: 'Fresh fruit smoothie',
    variants: [
      { id: 'v11', name: 'Mixed Berry', priceModifier: 0 },
      { id: 'v12', name: 'Tropical', priceModifier: 0.50 },
      { id: 'v13', name: 'Green Detox', priceModifier: 1.00 }
    ]
  },
]

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('menuItems')
    if (stored) {
      try {
        setMenuItems(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse menu items from localStorage', e)
        setMenuItems(defaultMenuItems)
      }
    } else {
      setMenuItems(defaultMenuItems)
    }
  }, [])

  // Save to localStorage whenever menuItems change
  useEffect(() => {
    if (menuItems.length > 0) {
      localStorage.setItem('menuItems', JSON.stringify(menuItems))
    }
  }, [menuItems])

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }
    setMenuItems(prev => [...prev, newItem])
  }

  const updateMenuItem = (id: string, item: Omit<MenuItem, 'id'>) => {
    setMenuItems(prev => prev.map(i => i.id === id ? { ...item, id } : i))
  }

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(i => i.id !== id))
  }

  const getItemsByCategory = (category: MenuItem['category']) => {
    return menuItems.filter(item => item.category === category)
  }

  return (
    <MenuContext.Provider value={{
      menuItems,
      addMenuItem,
      updateMenuItem,
      deleteMenuItem,
      getItemsByCategory
    }}>
      {children}
    </MenuContext.Provider>
  )
}

export function useMenu() {
  const context = useContext(MenuContext)
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider')
  }
  return context
}
