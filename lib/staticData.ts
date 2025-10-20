// ===== DETERMINISTIC RESTAURANT DATA =====
// This file provides a consistent dataset for 2023, 2024, 2025

export interface RestaurantMetrics {
  date: string        // YYYY-MM-DD
  revenue: number     // total revenue of that day
  orders: number      // total orders of that day
  avgOrderSize: number
  avgOrderAmount: number
  timeSeriesData?: TimeSeriesInterval[]
}

export interface TimeSeriesInterval {
  time: string        // HH:MM format (09:00 - 00:00)
  orders: number
  revenue: number
  avgOrderAmount: number
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  name: string
  category: 'dish' | 'drink'
  price: number
  qty: number
}

export interface TimeSeriesDataPoint {
  time: string
  items: number
  revenue: number
  avgOrderAmount: number
}

export interface ItemSoldData {
  name: string
  category: 'dish' | 'drink'
  qty: number
  totalRevenue: number
}

// Helper function to check if a year is a leap year
const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

// Helper to format date as YYYY-MM-DD (local, no timezone shift)
const formatDateLocal = (year: number, month: number, day: number): string => {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
};

// Generate deterministic data for a single year with realistic time-based variation
const generateYearData = (year: number): RestaurantMetrics[] => {
  const data: RestaurantMetrics[] = []
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const daysInYear = isLeapYear(year) ? 366 : 365
  
  // Iterate through each month and day
  let dayOfYear = 0;
  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= daysInMonth[month - 1]; day++) {
      dayOfYear++;
      
      // Add time-based variation for realism
      // Weekend boost (Saturday = 6, Sunday = 0)
      const dateObj = new Date(year, month - 1, day)
      const dayOfWeek = dateObj.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const weekendMultiplier = isWeekend ? 1.3 : 1.0
      
      // Seasonal variation (summer months busier)
      const seasonalBoost = month >= 5 && month <= 8 ? 1.15 : 1.0
      
      // Weekly cycle variation
      const weekCycle = Math.sin((dayOfYear / 7) * Math.PI) * 0.1 + 1.0
      
      // Base values with variation
      const baseOrders = 100 + (dayOfYear % 50)
      const orders = Math.round(baseOrders * weekendMultiplier * seasonalBoost * weekCycle)
      
      const avgOrderSize = 2 + ((dayOfYear % 3) * 0.5)
      
      // avgOrderAmount varies independently per day with time-based factors
      const baseAvgOrder = 20 + (month * 2)
      const dailyVariation = Math.sin((dayOfYear * 7) / 365 * Math.PI * 2) * 3 // ±€3 variation
      const avgOrderAmount = baseAvgOrder + dailyVariation + (isWeekend ? 5 : 0) // Weekend orders are larger
      
      const revenue = Math.round(orders * avgOrderAmount)
      
      data.push({
        date: formatDateLocal(year, month, day),
        revenue,
        orders,
        avgOrderSize,
        avgOrderAmount: Math.round(avgOrderAmount * 100) / 100 // Round to 2 decimals
      })
    }
  }
  
  return data
}

// Generate all data for 2023, 2024, 2025
const generate2023Data = (): RestaurantMetrics[] => generateYearData(2023)
const generate2024Data = (): RestaurantMetrics[] => generateYearData(2024)
const generate2025Data = (): RestaurantMetrics[] => generateYearData(2025)

// Export the complete dataset
export const restaurantData: RestaurantMetrics[] = [
  ...generate2023Data(),
  ...generate2024Data(),
  ...generate2025Data()
]

// Get data for a specific date range (inclusive)
// Uses string comparison (works because YYYY-MM-DD is lexicographically sortable)
export function getDataForRange(start: string, end: string): RestaurantMetrics[] {
  return restaurantData.filter(item => {
    return item.date >= start && item.date <= end
  })
}

// Get data for a specific year
export function getDataForYear(year: number): RestaurantMetrics[] {
  const yearStr = String(year);
  return restaurantData.filter(item => item.date.startsWith(yearStr))
}

// Export individual year data for convenience
export const data2023 = generate2023Data()
export const data2024 = generate2024Data()
export const data2025 = generate2025Data()

// Validation: Ensure data consistency
const validateData = () => {
  const errors: string[] = []
  
  restaurantData.forEach((item, index) => {
    // Check revenue calculation
    const expectedRevenue = Math.round(item.orders * item.avgOrderAmount)
    if (item.revenue !== expectedRevenue) {
      errors.push(`Row ${index}: revenue mismatch. Expected ${expectedRevenue}, got ${item.revenue}`)
    }
    
    // Check realistic ranges
    if (item.revenue < 1500 || item.revenue > 10000) {
      errors.push(`Row ${index}: revenue ${item.revenue} outside expected range (1500-10000)`)
    }
    
    if (item.orders < 80 || item.orders > 250) {
      errors.push(`Row ${index}: orders ${item.orders} outside expected range (80-250)`)
    }
    
    if (item.avgOrderSize < 2 || item.avgOrderSize > 3.5) {
      errors.push(`Row ${index}: avgOrderSize ${item.avgOrderSize} outside expected range (2-3.5)`)
    }
    
    if (item.avgOrderAmount < 15 || item.avgOrderAmount > 55) {
      errors.push(`Row ${index}: avgOrderAmount ${item.avgOrderAmount} outside expected range (15-55)`)
    }
  })
  
  if (errors.length > 0) {
    console.warn('Data validation errors:', errors)
  }
  
  return errors.length === 0
}

// Run validation in development
if (process.env.NODE_ENV === 'development') {
  validateData()
}

// Export summary statistics
export const dataStats = {
  totalRows: restaurantData.length,
  years: [2023, 2024, 2025],
  dateRange: {
    start: restaurantData[0]?.date,
    end: restaurantData[restaurantData.length - 1]?.date
  },
  rowsByYear: {
    2023: data2023.length,
    2024: data2024.length,
    2025: data2025.length
  }
}

// ===== TIME SERIES DATA GENERATION =====

const MENU_ITEMS = {
  dishes: [
    { id: 'd1', name: 'Margherita Pizza', price: 12.50 },
    { id: 'd2', name: 'Pasta Carbonara', price: 14.00 },
    { id: 'd3', name: 'Caesar Salad', price: 9.50 },
    { id: 'd4', name: 'Grilled Salmon', price: 18.00 },
    { id: 'd5', name: 'Beef Burger', price: 13.50 },
    { id: 'd6', name: 'Chicken Tikka', price: 15.00 },
    { id: 'd7', name: 'Vegetable Stir Fry', price: 11.00 },
    { id: 'd8', name: 'Fish & Chips', price: 14.50 },
  ],
  drinks: [
    { id: 'dr1', name: 'Coca Cola', price: 3.00 },
    { id: 'dr2', name: 'Orange Juice', price: 4.00 },
    { id: 'dr3', name: 'Coffee', price: 3.50 },
    { id: 'dr4', name: 'Beer', price: 5.00 },
    { id: 'dr5', name: 'Wine Glass', price: 7.00 },
    { id: 'dr6', name: 'Water', price: 2.00 },
  ]
}

const generateTimeSeriesForDate = (date: string, dayOfYear: number): TimeSeriesInterval[] => {
  const intervals: TimeSeriesInterval[] = []
  const [year, month, day] = date.split('-').map(Number)
  const dateObj = new Date(year, month - 1, day)
  const dayOfWeek = dateObj.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  
  // Generate 15-minute intervals from 09:00 to 00:00
  for (let hour = 9; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      
      // No orders before 10:00
      if (hour < 10) {
        intervals.push({
          time,
          orders: 0,
          revenue: 0,
          avgOrderAmount: 0,
          items: []
        })
        continue
      }
      
      // Realistic intraday pattern with specific percentages
      let demandMultiplier = 1.0
      const randomVariation = 0.9 + Math.random() * 0.2 // ±10% base variation
      const periodBias = (dayOfYear % 7 < 3) ? 0.9 : 1.1 // Period A/B differ by ±10%
      
      if (hour >= 10 && hour < 12) {
        // Low activity (5-15% of peak)
        demandMultiplier = 0.05 + Math.random() * 0.1
      } else if (hour >= 12 && hour < 13) {
        // Lunch peak (100% with ±20% randomness)
        const lunchVariation = 0.8 + Math.random() * 0.4
        demandMultiplier = 1.0 * lunchVariation
      } else if (hour >= 13 && hour < 17) {
        // Moderate level (40-60% of peak, small random noise)
        demandMultiplier = 0.4 + Math.random() * 0.2
      } else if (hour >= 17 && hour < 20) {
        // Dinner peak (120-150% of lunch peak, random ±25%)
        const dinnerVariation = 0.75 + Math.random() * 0.5
        demandMultiplier = 1.35 * dinnerVariation
      } else if (hour >= 20 && hour < 22) {
        // Taper off gradually
        const taperRate = (22 - hour) / 2 // Gradual decline
        demandMultiplier = 0.6 * taperRate + Math.random() * 0.1
      } else {
        // Very low volume (5-10%)
        demandMultiplier = 0.05 + Math.random() * 0.05
      }
      
      // Base orders per 15-min interval
      const baseOrders = 8 + (dayOfYear % 4)
      const weekendBoost = isWeekend ? 1.25 : 1.0
      const orders = Math.max(0, Math.round(baseOrders * demandMultiplier * weekendBoost * randomVariation * periodBias))
      
      // Generate items for this interval
      const items: OrderItem[] = []
      for (let i = 0; i < orders; i++) {
        // Each order has 1-3 dishes and 0-2 drinks
        const numDishes = 1 + Math.floor((dayOfYear + hour + minute + i) % 3)
        const numDrinks = Math.floor((dayOfYear + hour + minute + i + 1) % 3)
        
        for (let d = 0; d < numDishes; d++) {
          const dish = MENU_ITEMS.dishes[(dayOfYear + hour + minute + i + d) % MENU_ITEMS.dishes.length]
          items.push({
            ...dish,
            category: 'dish',
            qty: 1
          })
        }
        
        for (let dr = 0; dr < numDrinks; dr++) {
          const drink = MENU_ITEMS.drinks[(dayOfYear + hour + minute + i + dr) % MENU_ITEMS.drinks.length]
          items.push({
            ...drink,
            category: 'drink',
            qty: 1
          })
        }
      }
      
      const revenue = items.reduce((sum, item) => sum + (item.price * item.qty), 0)
      const avgOrderAmount = orders > 0 ? revenue / orders : 0
      
      intervals.push({
        time,
        orders,
        revenue: Math.round(revenue * 100) / 100,
        avgOrderAmount: Math.round(avgOrderAmount * 100) / 100,
        items
      })
    }
  }
  
  return intervals
}

// Cache for time series data
const timeSeriesCache = new Map<string, TimeSeriesInterval[]>()

const getTimeSeriesForDate = (date: string): TimeSeriesInterval[] => {
  if (!timeSeriesCache.has(date)) {
    const dayData = restaurantData.find(d => d.date === date)
    if (dayData) {
      const [year, month, day] = date.split('-').map(Number)
      const dateObj = new Date(year, month - 1, day)
      const dayOfYear = Math.floor((dateObj.getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24))
      timeSeriesCache.set(date, generateTimeSeriesForDate(date, dayOfYear))
    } else {
      timeSeriesCache.set(date, [])
    }
  }
  return timeSeriesCache.get(date) || []
}

export function getTimeSeriesData(startISO: string, endISO: string, intervalMinutes = 15): TimeSeriesDataPoint[] {
  const dateRange = getDataForRange(startISO, endISO)
  
  // Helper function to round time to the nearest interval
  const roundToInterval = (timeStr: string, intervalMins: number): string => {
    const [hour, minute] = timeStr.split(':').map(Number)
    const totalMinutes = hour * 60 + minute
    const roundedMinutes = Math.floor(totalMinutes / intervalMins) * intervalMins
    const newHour = Math.floor(roundedMinutes / 60)
    const newMinute = roundedMinutes % 60
    return `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`
  }
  
  // Aggregate by time slot across all dates
  const aggregated = new Map<string, { items: number; revenue: number; orders: number; count: number }>()
  
  dateRange.forEach(dayData => {
    const timeSeries = getTimeSeriesForDate(dayData.date)
    timeSeries.forEach(interval => {
      // Round the time to the selected interval
      const roundedTime = roundToInterval(interval.time, intervalMinutes)
      
      const existing = aggregated.get(roundedTime) || { items: 0, revenue: 0, orders: 0, count: 0 }
      const itemsCount = interval.items.reduce((sum, item) => sum + item.qty, 0)
      aggregated.set(roundedTime, {
        items: existing.items + itemsCount,
        revenue: existing.revenue + interval.revenue,
        orders: existing.orders + interval.orders,
        count: existing.count + 1
      })
    })
  })
  
  // Convert to array and calculate averages
  const result: TimeSeriesDataPoint[] = []
  aggregated.forEach((data, time) => {
    result.push({
      time,
      items: Math.round(data.items / data.count),
      revenue: Math.round((data.revenue / data.count) * 100) / 100,
      avgOrderAmount: data.orders > 0 ? Math.round((data.revenue / data.orders) * 100) / 100 : 0
    })
  })
  
  // Sort by time
  result.sort((a, b) => a.time.localeCompare(b.time))
  
  return result
}

export function getCategoryBreakdown(
  startISO: string,
  endISO: string,
  metric: "items" | "revenue",
  category: "dish" | "drink"
): { name: string; category: "dish" | "drink"; items: number; revenue: number }[] {
  const data = getDataForRange(startISO, endISO)
  const itemTotals: { [key: string]: { name: string; category: "dish" | "drink"; items: number; revenue: number } } = {}
  
  // Get all menu items for the category
  const menuItems = category === 'dish' ? MENU_ITEMS.dishes : MENU_ITEMS.drinks
  
  // Initialize all items with zero values
  menuItems.forEach(item => {
    itemTotals[item.name] = {
      name: item.name,
      category: category,
      items: 0,
      revenue: 0
    }
  })
  
  // Aggregate data from all days in the range
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  data.forEach((dayData, dayIndex) => {
    const dayOfYear = new Date(dayData.date).getTime() / (1000 * 60 * 60 * 24)
    
    // Generate items sold for this day based on orders
    const itemsPerOrder = category === 'dish' ? 2.2 : 1.1 // Average items per order
    const totalItemsThisDay = Math.round(dayData.orders * itemsPerOrder)
    
    // Distribute items across menu items with some randomness
    for (let i = 0; i < totalItemsThisDay; i++) {
      const itemIndex = Math.floor((dayOfYear + i) * 7.3) % menuItems.length
      const selectedItem = menuItems[itemIndex]
      
      // Add small random bias (±5%) for period differences
      const bias = 0.95 + (Math.sin(dayOfYear + i) * 0.1)
      const quantity = Math.max(1, Math.round(bias))
      
      itemTotals[selectedItem.name].items += quantity
      itemTotals[selectedItem.name].revenue += selectedItem.price * quantity
    }
  })
  
  // Filter out items with zero values and return
  return Object.values(itemTotals).filter(item => item.items > 0 || item.revenue > 0)
}

export function getItemsSoldByTime(
  startDate: string,
  endDate: string,
  timeStart: string,
  timeEnd: string
): ItemSoldData[] {
  const itemMap = new Map<string, ItemSoldData>()
  
  // Get all days in the range
  const data = getDataForRange(startDate, endDate)
  
  data.forEach(dayData => {
    const timeSeries = generateTimeSeriesForDate(dayData.date, new Date(dayData.date).getTime() / (1000 * 60 * 60 * 24))
    timeSeries.forEach(interval => {
      if (interval.time >= timeStart && interval.time <= timeEnd) {
        interval.items.forEach(item => {
          const key = `${item.name}-${item.category}`
          const existing = itemMap.get(key)
          if (existing) {
            existing.qty += item.qty
            existing.totalRevenue += item.price * item.qty
          } else {
            itemMap.set(key, {
              name: item.name,
              category: item.category,
              qty: item.qty,
              totalRevenue: Math.round(item.price * item.qty * 100) / 100
            })
          }
        })
      }
    })
  })
  
  // Convert to array and sort by quantity
  const result = Array.from(itemMap.values())
  result.sort((a, b) => b.qty - a.qty)
  
  return result
}

// Timezone-agnostic weekday calculation using Sakamoto's algorithm
// Returns 0..6 where Monday=0, ..., Sunday=6
const weekdayIndexMondayFirstFromISO = (iso: string): number => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const t = [0,3,2,5,0,3,5,1,4,6,2,4];
  const Y = m < 3 ? y - 1 : y;
  const w = (Y + Math.floor(Y/4) - Math.floor(Y/100) + Math.floor(Y/400) + t[m - 1] + d) % 7;
  return w === 0 ? 6 : w - 1;
};

export function getItemsSoldByWeekday(
  startDate: string,
  endDate: string,
  weekdayIndex: number
): ItemSoldData[] {
  const itemMap = new Map<string, ItemSoldData>()
  
  // Get all days in the range
  const data = getDataForRange(startDate, endDate)
  
  // Filter for specific weekday
  const weekdayData = data.filter(dayData => {
    const dayIndex = weekdayIndexMondayFirstFromISO(dayData.date)
    return dayIndex === weekdayIndex
  })
  
  weekdayData.forEach(dayData => {
    const timeSeries = generateTimeSeriesForDate(dayData.date, new Date(dayData.date).getTime() / (1000 * 60 * 60 * 24))
    timeSeries.forEach(interval => {
      interval.items.forEach(item => {
        const key = `${item.name}-${item.category}`
        const existing = itemMap.get(key)
        if (existing) {
          existing.qty += item.qty
          existing.totalRevenue += item.price * item.qty
        } else {
          itemMap.set(key, {
            name: item.name,
            category: item.category,
            qty: item.qty,
            totalRevenue: Math.round(item.price * item.qty * 100) / 100
          })
        }
      })
    })
  })
  
  // Convert to array and sort by quantity
  const result = Array.from(itemMap.values())
  result.sort((a, b) => b.qty - a.qty)
  
  return result
}

