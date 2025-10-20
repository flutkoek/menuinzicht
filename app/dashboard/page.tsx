"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DateRangeSelector, DateRangeExport } from "@/components/DateRangeSelector"
import AnimatedGeomatrix from "@/components/AnimatedGeomatrix"
import { StatsCards } from "@/components/StatsCards"
import { RevenueCharts } from "@/components/RevenueCharts"
import { DynamicAggregatedChart } from "@/components/DynamicAggregatedChart"
import WeekdayAggregatedChart from "@/components/WeekdayAggregatedChart"
import { TopItems } from "@/components/TopItems"
import TimeAnalysisChart from "@/components/TimeAnalysisChart"
import CategoryPieCharts from "@/components/CategoryPieCharts"
import { getDataForRange } from "@/lib/staticData"
import { useToast } from "@/hooks/use-toast"
import AppLayout from "@/components/AppLayout"
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Calendar,
  CalendarRange,
  Clock,
  PieChart,
  ListOrdered,
  MessageSquare,
  Send,
  Loader2
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function DashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState('kpis')
  
  // Dashboard state
  const [dateRange, setDateRange] = useState<DateRangeExport>({
    periodType: 'day',
    periodA: null,
    periodB: null,
    compareEnabled: false
  })
  
  // Feedback state
  const [feedback, setFeedback] = useState('')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [honeypot, setHoneypot] = useState('') // Spam prevention


  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Intersection Observer for active section highlighting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' }
    )

    const sections = document.querySelectorAll('section[id]')
    sections.forEach((section) => observer.observe(section))

    // Scroll reveal animations
    const scrollRevealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
          } else {
            entry.target.classList.remove('in-view')
          }
        })
      },
      { threshold: 0.1, rootMargin: '-50px' }
    )

    const scrollRevealElements = document.querySelectorAll('.reveal-on-scroll')
    scrollRevealElements.forEach((el) => scrollRevealObserver.observe(el))

    return () => {
      observer.disconnect()
      scrollRevealObserver.disconnect()
    }
  }, [mounted])

  const handleDateRangeChange = (newRange: DateRangeExport) => {
    setDateRange(newRange)
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!feedback.trim()) {
      toast({
        title: "Error",
        description: "Please enter your feedback before submitting.",
        variant: "destructive",
      })
      return
    }

    setFeedbackSubmitting(true)

    try {
      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: feedback.trim(),
          userName: user?.name || '',
          userEmail: user?.email || '',
          honeypot: honeypot, // Should be empty for real users
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Feedback sent!",
          description: "Thank you for your feedback. We'll review it shortly.",
        })
        setFeedback('')
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send feedback. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  // Client-side state for periods and metrics to avoid hydration mismatch
  const [periodA, setPeriodA] = useState<{ start: string; end: string } | null>(null)
  const [periodB, setPeriodB] = useState<{ start: string; end: string } | null>(null)
  const [metricsA, setMetricsA] = useState<any>(null)
  const [metricsB, setMetricsB] = useState<any>(null)

  // Calculate metrics only on client side after mount
  useEffect(() => {
    if (!mounted) return

    // Remove any Chrome extension injected elements
    const crxRoot = document.getElementById("crx-root")
    if (crxRoot) crxRoot.remove()

    const newPeriodA = dateRange.periodA ? {
      start: dateRange.periodA,
      end: dateRange.periodAEnd ?? dateRange.periodA,
    } : null

    const newPeriodB = (dateRange.compareEnabled && dateRange.periodB) ? {
      start: dateRange.periodB,
      end: dateRange.periodBEnd ?? dateRange.periodB,
    } : null

    setPeriodA(newPeriodA)
    setPeriodB(newPeriodB)

    const calculateMetrics = (start: string, end: string) => {
      const data = getDataForRange(start, end)
      if (data.length === 0) return null
      
      const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
      const totalOrders = data.reduce((sum, item) => sum + item.orders, 0)
      const avgOrderSize = data.reduce((sum, item) => sum + item.avgOrderSize, 0) / data.length
      const avgOrderAmount = totalOrders > 0 ? totalRevenue / totalOrders : 0
      
      return {
        date: start,
        revenue: totalRevenue,
        orders: totalOrders,
        avgOrderSize,
        avgOrderAmount
      }
    }

    setMetricsA(newPeriodA ? calculateMetrics(newPeriodA.start, newPeriodA.end) : null)
    setMetricsB(newPeriodB ? calculateMetrics(newPeriodB.start, newPeriodB.end) : null)
  }, [mounted, dateRange])

  // Component state for dynamic chart
  const [chartMode, setChartMode] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders' | 'avgOrderAmount'>('revenue')
  const [weekdayMetric, setWeekdayMetric] = useState<'revenue' | 'orders'>('revenue')
  const [pieMetric, setPieMetric] = useState<'revenue' | 'orders'>('revenue')

  // Show nothing during SSR and initial mount to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className="relative min-h-screen isolate overflow-x-hidden bg-transparent" suppressHydrationWarning>
      {/* Animated Geomatrix Background */}
      <AnimatedGeomatrix />

      {/* Main Content */}
      <main className="relative pt-8 pb-24 space-y-32 scroll-smooth transition-all duration-700 px-6 md:px-12 xl:px-24">
        {/* Welcome Section */}
        <div className="rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg shadow-lg p-8 ring-1 ring-black/5 dark:ring-white/10 reveal-on-scroll">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white drop-shadow-sm">
            Restaurant Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Track your restaurant's performance with real-time insights and comparisons.
          </p>
        </div>

        {/* Date Range Selector */}
        <section id="date-selector" className="reveal-on-scroll rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg shadow-lg p-8 ring-1 ring-black/5 dark:ring-white/10">
          <DateRangeSelector 
            onRangeChange={handleDateRangeChange}
            initialRange={dateRange}
          />
        </section>

        {/* KPIs */}
        <section id="kpis" className="reveal-on-scroll space-y-6 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg shadow-lg p-8 ring-1 ring-black/5 dark:ring-white/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Key Performance Indicators
          </h3>
          <StatsCards 
            metricsA={metricsA}
            metricsB={metricsB}
            isComparing={dateRange.compareEnabled && !!metricsB}
          />
        </section>

        {/* Performance Trends */}
        <section id="performance-trends" className="reveal-on-scroll space-y-6 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg shadow-lg p-8 ring-1 ring-black/5 dark:ring-white/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Trends
          </h3>
          <RevenueCharts
            periodA={periodA}
            periodB={periodB}
            metricsA={metricsA}
            metricsB={metricsB}
          />
        </section>

        {/* Dynamic Aggregated Analysis */}
        <section id="dynamic-aggregated" className="reveal-on-scroll space-y-6 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg shadow-lg p-8 ring-1 ring-black/5 dark:ring-white/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Dynamic Aggregated Analysis
          </h3>
          
          {/* Chart Controls */}
          <Card className="mb-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center flex-wrap">
                {/* Mode Toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  {(['day', 'week', 'month', 'year'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setChartMode(mode)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors capitalize ${
                        chartMode === mode
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {/* Metric Selector */}
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  {([
                    { key: 'revenue', label: 'Revenue' },
                    { key: 'orders', label: 'Orders' },
                    { key: 'avgOrderAmount', label: 'Avg Order Amount' }
                  ] as const).map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setChartMetric(m.key)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        chartMetric === m.key
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <DynamicAggregatedChart
            periodA={periodA}
            periodB={periodB}
            mode={chartMode}
            metric={chartMetric}
          />
        </section>

        {/* Weekday Aggregated Analysis */}
        <section id="weekday-analysis" className="reveal-on-scroll space-y-6 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg shadow-lg p-8 ring-1 ring-black/5 dark:ring-white/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekday Aggregated Analysis
          </h3>
          
          {/* Weekday Metric Toggle */}
          <Card className="mb-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center flex-wrap">
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setWeekdayMetric('revenue')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      weekdayMetric === 'revenue'
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Total Revenue
                  </button>
                  <button
                    onClick={() => setWeekdayMetric('orders')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      weekdayMetric === 'orders'
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Total Items Ordered
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <WeekdayAggregatedChart
            periodA={periodA}
            periodB={periodB}
            metric={weekdayMetric}
          />
        </section>

        {/* Time Analysis */}
        <section id="time-analysis" className="reveal-on-scroll space-y-6 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg shadow-lg p-8 ring-1 ring-black/5 dark:ring-white/10">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Time Analysis (15-minute intervals)
          </h3>
          <TimeAnalysisChart
            periodA={periodA}
            periodB={periodB}
          />
        </section>

        {/* Top Items */}
        <section id="top-items" className="reveal-on-scroll space-y-6 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg shadow-lg p-8 ring-1 ring-black/5 dark:ring-white/10">
          <TopItems 
            isComparing={dateRange.compareEnabled && !!metricsB}
            periodA={dateRange.periodA && dateRange.periodAEnd ? { start: dateRange.periodA, end: dateRange.periodAEnd } : null}
            periodB={dateRange.periodB && dateRange.periodBEnd ? { start: dateRange.periodB, end: dateRange.periodBEnd } : null}
          />
        </section>

        {/* Category Pie Charts */}
        <section id="category-pie" className="reveal-on-scroll space-y-6 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg shadow-lg p-8 ring-1 ring-black/5 dark:ring-white/10">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Category Contribution
          </h3>
          
          {/* Pie Chart Metric Toggle */}
          <Card className="mb-4 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center flex-wrap">
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setPieMetric('revenue')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      pieMetric === 'revenue'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Revenue
                  </button>
                  <button
                    onClick={() => setPieMetric('orders')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      pieMetric === 'orders'
                        ? 'bg-blue-500 text-white shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Items Ordered
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <CategoryPieCharts
            periodA={periodA}
            periodB={periodB}
            metric={pieMetric}
          />
        </section>

        {/* Feedback Section */}
        <section id="feedback" className="reveal-on-scroll mt-8 rounded-2xl bg-gradient-to-br from-white/70 to-gray-50/70 dark:from-gray-900/70 dark:to-gray-800/70 backdrop-blur-lg shadow-lg p-8 ring-1 ring-black/5 dark:ring-white/10 border border-gray-200/50 dark:border-gray-700/50">
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-none shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-500" />
                Feedback or Request
              </CardTitle>
              <CardDescription>
                Have suggestions, found a bug, or need a feature? Let us know!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                {/* Honeypot field - hidden from users, catches bots */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />
                
                <div className="space-y-2">
                  <Textarea
                    placeholder="Share your thoughts, suggestions, or report issues here..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={feedbackSubmitting}
                    rows={6}
                    maxLength={5000}
                    className="resize-none bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500"
                  />
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Your feedback helps us improve the dashboard</span>
                    <span>{feedback.length}/5000</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={feedbackSubmitting || !feedback.trim()}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {feedbackSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Feedback
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>

      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  )
}
