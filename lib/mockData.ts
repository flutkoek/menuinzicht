export type PeriodType = 'day' | 'week' | 'month' | 'year'

export interface RestaurantMetrics {
  date: string
  revenue: number
  orders: number
  avgOrderSize: number
  avgOrderAmount: number
}

export interface PeriodData {
  label: string
  value: string
  metrics: RestaurantMetrics
}

export interface MenuItem {
  id: string
  name: string
  category: 'dish' | 'drink'
  price: number
  soldCount: number
}

export interface MenuData {
  dishes: MenuItem[]
  drinks: MenuItem[]
}

// Generate random but realistic restaurant data
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateRandomMetrics = (baseRevenue = 1500): RestaurantMetrics => {
  const orders = Math.floor(Math.random() * 100) + 20 // 20-120 orders
  const revenue = Math.floor(Math.random() * 2500) + 500 // €500-€3000
  const avgOrderSize = Math.round((Math.random() * 2 + 1) * 10) / 10 // 1.0-3.0 dishes
  const avgOrderAmount = Math.round((revenue / orders) * 100) / 100 // Calculate from revenue/orders

  return {
    date: '',
    revenue,
    orders,
    avgOrderSize,
    avgOrderAmount
  }
}

// Generate daily data for 2024 (365 days)
export const generateDailyData = (): PeriodData[] => {
  const data: PeriodData[] = []
  const year = 2024

  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      const metrics = generateRandomMetrics()
      metrics.date = dateStr

      data.push({
        label: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        }),
        value: dateStr,
        metrics
      })
    }
  }

  return data
}

// Generate weekly data for 2024 (52 weeks)
export const generateWeeklyData = (): PeriodData[] => {
  const data: PeriodData[] = []

  for (let week = 1; week <= 52; week++) {
    // Calculate week start date
    const jan1 = new Date(2024, 0, 1)
    const weekStart = new Date(jan1.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000)

    const metrics = generateRandomMetrics(10500) // Weekly revenue ~7x daily
    metrics.revenue *= 7
    metrics.orders *= 7
    metrics.date = weekStart.toISOString().split('T')[0]

    data.push({
      label: `Week ${week} (2024)`,
      value: `2024-W${week.toString().padStart(2, '0')}`,
      metrics
    })
  }

  return data
}

// Generate monthly data for 2024 (12 months)
export const generateMonthlyData = (): PeriodData[] => {
  const data: PeriodData[] = []
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  for (let month = 0; month < 12; month++) {
    const date = new Date(2024, month, 1)
    const daysInMonth = new Date(2024, month + 1, 0).getDate()

    const metrics = generateRandomMetrics(45000) // Monthly revenue ~30x daily
    metrics.revenue *= daysInMonth
    metrics.orders *= daysInMonth
    metrics.date = date.toISOString().split('T')[0]

    data.push({
      label: `${months[month]} 2024`,
      value: `2024-${(month + 1).toString().padStart(2, '0')}`,
      metrics
    })
  }

  return data
}

// Generate yearly data (2020-2025)
export const generateYearlyData = (): PeriodData[] => {
  const data: PeriodData[] = []

  for (let year = 2020; year <= 2025; year++) {
    const metrics = generateRandomMetrics(540000) // Yearly revenue ~365x daily
    metrics.revenue *= 365
    metrics.orders *= 365
    metrics.date = `${year}-01-01`

    data.push({
      label: year.toString(),
      value: year.toString(),
      metrics
    })
  }

  return data
}

// Cache the generated data
let dailyDataCache: PeriodData[] | null = null
let weeklyDataCache: PeriodData[] | null = null
let monthlyDataCache: PeriodData[] | null = null
let yearlyDataCache: PeriodData[] | null = null

export const getMockData = (period: 'day' | 'week' | 'month' | 'year'): PeriodData[] => {
  switch (period) {
    case 'day':
      if (!dailyDataCache) dailyDataCache = generateDailyData()
      return dailyDataCache
    case 'week':
      if (!weeklyDataCache) weeklyDataCache = generateWeeklyData()
      return weeklyDataCache
    case 'month':
      if (!monthlyDataCache) monthlyDataCache = generateMonthlyData()
      return monthlyDataCache
    case 'year':
      if (!yearlyDataCache) yearlyDataCache = generateYearlyData()
      return yearlyDataCache
    default:
      return []
  }
}

export const getMetricsForPeriod = (period: 'day' | 'week' | 'month' | 'year', value: string): RestaurantMetrics | null => {
  const data = getMockData(period)
  const item = data.find(d => d.value === value)
  return item ? item.metrics : null
}

// Menu Items Data
const DISHES = [
  'Margherita Pizza', 'Pepperoni Pizza', 'Quattro Stagioni', 'Carbonara Pasta', 'Bolognese Pasta',
  'Penne Arrabbiata', 'Risotto Mushroom', 'Chicken Parmesan', 'Grilled Salmon', 'Beef Steak',
  'Caesar Salad', 'Greek Salad', 'Caprese Salad', 'Minestrone Soup', 'Tomato Basil Soup',
  'Fish & Chips', 'Burger Classic', 'Cheeseburger', 'Chicken Wings', 'BBQ Ribs',
  'Pad Thai', 'Chicken Curry', 'Beef Tacos', 'Quesadilla', 'Nachos Supreme',
  'Sushi Roll California', 'Sushi Roll Salmon', 'Tempura Prawns', 'Ramen Noodles', 'Fried Rice',
  'Lamb Chops', 'Pork Tenderloin', 'Duck Breast', 'Seafood Paella', 'Vegetable Stir Fry',
  'Mushroom Risotto', 'Eggplant Parmesan', 'Spinach Lasagna', 'Chicken Tikka Masala', 'Butter Chicken',
  'Fish Tacos', 'Shrimp Scampi', 'Lobster Thermidor', 'Crab Cakes', 'Oysters Rockefeller',
  'Chocolate Cake', 'Tiramisu', 'Cheesecake', 'Ice Cream Sundae', 'Fruit Tart'
]

const DRINKS = [
  'Coca Cola', 'Pepsi', 'Sprite', 'Orange Juice', 'Apple Juice',
  'Water Still', 'Water Sparkling', 'Coffee Espresso', 'Coffee Americano', 'Cappuccino',
  'Latte', 'Hot Chocolate', 'Green Tea', 'Black Tea', 'Herbal Tea',
  'Beer Heineken', 'Beer Corona', 'Wine Red House', 'Wine White House', 'Prosecco'
]

// Generate menu data with random sales
const generateMenuData = (): MenuData => {
  const dishes: MenuItem[] = DISHES.map((name, index) => ({
    id: `dish-${index + 1}`,
    name,
    category: 'dish' as const,
    price: Math.round((Math.random() * 25 + 8) * 100) / 100, // €8-€33
    soldCount: Math.floor(Math.random() * 150) + 5 // 5-155 sold
  }))

  const drinks: MenuItem[] = DRINKS.map((name, index) => ({
    id: `drink-${index + 1}`,
    name,
    category: 'drink' as const,
    price: Math.round((Math.random() * 8 + 2) * 100) / 100, // €2-€10
    soldCount: Math.floor(Math.random() * 200) + 10 // 10-210 sold
  }))

  return { dishes, drinks }
}

// Cache menu data
let menuDataCache: MenuData | null = null

export const getMenuData = (): MenuData => {
  if (!menuDataCache) {
    menuDataCache = generateMenuData()
  }
  return menuDataCache
}

export const getTopItems = (
  category: 'dish' | 'drink',
  type: 'most' | 'least',
  limit: number = 5
): MenuItem[] => {
  const menuData = getMenuData()
  const items = category === 'dish' ? menuData.dishes : menuData.drinks

  const sorted = [...items].sort((a, b) =>
    type === 'most' ? b.soldCount - a.soldCount : a.soldCount - b.soldCount
  )

  return sorted.slice(0, limit)
}
