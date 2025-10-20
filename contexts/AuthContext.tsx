"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, AuthState, LoginCredentials } from '@/types/user'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user database - In real app, this would be an API call
const mockUsers: User[] = [
  {
    id: '1',
    email: 'rutgervanbasten1@gmail.com',
    name: 'Rutger van Basten',
    role: 'admin',
    company: 'MenuInzicht',
    lastLogin: new Date('2025-09-19T12:00:00Z'), // Fixed date to prevent hydration mismatch
    preferences: {
      theme: 'system',
      language: 'en',
      notifications: true
    }
  }
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  })

  // Check for stored authentication on mount
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('menuinzicht_user')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          localStorage.removeItem('menuinzicht_user')
          setAuthState(prev => ({ ...prev, isLoading: false }))
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
      }
    } else {
      // On server side, just set loading to false
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }))
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Find user in mock database
    const user = mockUsers.find(u => 
      u.email === credentials.email && 
      credentials.password === 'Nijmegen123' // In real app, this would be properly hashed
    )
    
    if (user) {
      const updatedUser = { ...user, lastLogin: new Date() }
      if (typeof window !== 'undefined') {
        localStorage.setItem('menuinzicht_user', JSON.stringify(updatedUser))
      }
      setAuthState({
        user: updatedUser,
        isAuthenticated: true,
        isLoading: false
      })
      return true
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('menuinzicht_user')
    }
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    })
  }

  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData }
      if (typeof window !== 'undefined') {
        localStorage.setItem('menuinzicht_user', JSON.stringify(updatedUser))
      }
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }))
    }
  }

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
