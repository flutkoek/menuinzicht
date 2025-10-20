"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

export default function FeedbackSection() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [feedback, setFeedback] = useState('')
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [honeypot, setHoneypot] = useState('') // Spam prevention

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
          userName: user?.name || 'Anonymous',
          userEmail: user?.email || 'no-email@provided.com',
          honeypot: honeypot,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send feedback')
      }

      toast({
        title: "Feedback sent!",
        description: "Thank you for your feedback. We appreciate your input!",
      })

      setFeedback('')
    } catch (error) {
      console.error('Feedback submission error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  return (
    <section className="mt-12 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg shadow-lg p-6 ring-1 ring-black/5 dark:ring-white/10 border border-gray-200/50 dark:border-gray-700/50">
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
                <span>Your feedback helps us improve the platform</span>
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
  )
}
