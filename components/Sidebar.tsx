"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, ShoppingCart, Menu, LogOut, Settings, ClipboardList } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    description: "Analytics & Insights"
  },
  {
    name: "Order Station",
    href: "/order-station",
    icon: ShoppingCart,
    description: "Take Orders"
  },
  {
    name: "Previous Orders",
    href: "/previous-orders",
    icon: ClipboardList,
    description: "View Order History"
  },
  {
    name: "Menu Management",
    href: "/manage-menu",
    icon: Menu,
    description: "Edit Menu Items"
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed left-0 top-0 z-40">
      {/* Logo/Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <div>
          <h1 className="font-bold text-lg text-gray-900 dark:text-white">MenuInzicht</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Restaurant System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
              )} />
              <div className="flex-1">
                <div className={cn(
                  "font-medium text-sm",
                  isActive ? "text-white" : "text-gray-900 dark:text-white"
                )}>
                  {item.name}
                </div>
                <div className={cn(
                  "text-xs",
                  isActive ? "text-green-100" : "text-gray-500 dark:text-gray-400"
                )}>
                  {item.description}
                </div>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Theme</span>
          <ThemeToggle />
        </div>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white text-sm">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <Button
          onClick={logout}
          variant="outline"
          className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-900"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
