"use client"

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

export default function AnimatedGeomatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let scrollY = 0
    let mouseX = 0
    let mouseY = 0
    let targetScrollY = 0
    let targetMouseX = 0
    let targetMouseY = 0

    const isDark = theme === 'dark'

    const draw = () => {
      // Smooth interpolation
      scrollY += (targetScrollY - scrollY) * 0.05
      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create fluid gradient blobs
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Blob positions influenced by mouse and scroll
      const blob1X = centerX + mouseX * 0.3 - scrollY * 0.1
      const blob1Y = centerY * 0.4 + mouseY * 0.2 + scrollY * 0.05

      const blob2X = centerX * 1.5 - mouseX * 0.2 + scrollY * 0.08
      const blob2Y = centerY * 1.3 - mouseY * 0.15 - scrollY * 0.03

      const blob3X = centerX * 0.5 + mouseX * 0.15 - scrollY * 0.05
      const blob3Y = centerY * 1.6 + mouseY * 0.25 + scrollY * 0.07

      if (isDark) {
        // Dark mode: Navy → Indigo → Violet
        // Blob 1: Navy/Blue
        const gradient1 = ctx.createRadialGradient(blob1X, blob1Y, 0, blob1X, blob1Y, canvas.width * 0.6)
        gradient1.addColorStop(0, 'rgba(30, 58, 138, 0.6)')
        gradient1.addColorStop(0.5, 'rgba(67, 56, 202, 0.4)')
        gradient1.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient1
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Blob 2: Indigo/Purple
        const gradient2 = ctx.createRadialGradient(blob2X, blob2Y, 0, blob2X, blob2Y, canvas.width * 0.5)
        gradient2.addColorStop(0, 'rgba(79, 70, 229, 0.5)')
        gradient2.addColorStop(0.5, 'rgba(109, 40, 217, 0.3)')
        gradient2.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient2
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Blob 3: Teal/Cyan
        const gradient3 = ctx.createRadialGradient(blob3X, blob3Y, 0, blob3X, blob3Y, canvas.width * 0.4)
        gradient3.addColorStop(0, 'rgba(13, 148, 136, 0.4)')
        gradient3.addColorStop(0.5, 'rgba(6, 182, 212, 0.25)')
        gradient3.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient3
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else {
        // Light mode: Soft Blue → Aqua → White
        // Blob 1: Soft Blue
        const gradient1 = ctx.createRadialGradient(blob1X, blob1Y, 0, blob1X, blob1Y, canvas.width * 0.6)
        gradient1.addColorStop(0, 'rgba(147, 197, 253, 0.5)')
        gradient1.addColorStop(0.5, 'rgba(186, 230, 253, 0.3)')
        gradient1.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient1
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Blob 2: Aqua/Teal
        const gradient2 = ctx.createRadialGradient(blob2X, blob2Y, 0, blob2X, blob2Y, canvas.width * 0.5)
        gradient2.addColorStop(0, 'rgba(94, 234, 212, 0.4)')
        gradient2.addColorStop(0.5, 'rgba(153, 246, 228, 0.25)')
        gradient2.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient2
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Blob 3: Cyan/Sky
        const gradient3 = ctx.createRadialGradient(blob3X, blob3Y, 0, blob3X, blob3Y, canvas.width * 0.4)
        gradient3.addColorStop(0, 'rgba(125, 211, 252, 0.35)')
        gradient3.addColorStop(0.5, 'rgba(186, 230, 253, 0.2)')
        gradient3.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient3
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      requestAnimationFrame(draw)
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleScroll = () => {
      targetScrollY = window.scrollY
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - canvas.width / 2) * 0.5
      targetMouseY = (e.clientY - canvas.height / 2) * 0.5
    }

    // Initialize canvas size
    resize()

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReducedMotion) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('mousemove', handleMouseMove, { passive: true })
      window.addEventListener('resize', resize)
      draw()
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', resize)
    }
  }, [theme])

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
      <div className="absolute inset-0 animated-gradient" />
      <canvas ref={canvasRef} id="geomatrix-bg" className="w-full h-full relative z-10" />
    </div>
  )
}
