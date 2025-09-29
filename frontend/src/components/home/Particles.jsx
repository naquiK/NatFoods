"use client"
import { useState, useRef, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"

const Particles = ({
  className = "",
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
}) => {
  const canvasRef = useRef(null)
  const canvasContainerRef = useRef(null)
  const context = useRef(null)
  const circles = useRef([])
  const mousePosition = useRef({ x: 0, y: 0 })
  const mouse = useRef({ x: 0, y: 0, isDown: false })
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d")
    }
    initCanvas()
    animate()
    window.addEventListener("resize", initCanvas)

    return () => {
      window.removeEventListener("resize", initCanvas)
    }
  }, [className, quantity, staticity, ease, size, refresh, color, vx, vy])

  useEffect(() => {
    onMouseMove({ clientX: 100, clientY: 100 })
  }, [])

  const initCanvas = () => {
    resizeCanvas()
    drawParticles()
  }

  const onMouseMove = (event) => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const { clientX, clientY } = event
      mousePosition.current.x = clientX - rect.left
      mousePosition.current.y = clientY - rect.top
    }
  }

  const resizeCanvas = () => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current.length = 0
      const width = canvasContainerRef.current.offsetWidth
      const height = canvasContainerRef.current.offsetHeight
      canvasRef.current.width = width * dpr
      canvasRef.current.height = height * dpr
      canvasRef.current.style.width = `${width}px`
      canvasRef.current.style.height = `${height}px`
      context.current.scale(dpr, dpr)
    }
  }

  const circleParams = () => {
    const x = Math.floor(Math.random() * canvasRef.current.width)
    const y = Math.floor(Math.random() * canvasRef.current.height)
    const translateX = 0
    const translateY = 0
    const pSize = Math.floor(Math.random() * 2) + size
    const alpha = 0
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1))
    const dx = (Math.random() - 0.5) * 0.1
    const dy = (Math.random() - 0.5) * 0.1
    const magnetism = 0.1 + Math.random() * 4
    return { x, y, translateX, translateY, size: pSize, alpha, targetAlpha, dx, dy, magnetism }
  }

  const drawCircle = (circle, update = false) => {
    if (context.current) {
      const { x, y, translateX, translateY, size, alpha } = circle
      context.current.translate(translateX, translateY)
      context.current.beginPath()
      context.current.arc(x, y, size, 0, 2 * Math.PI)
      context.current.fillStyle = `rgba(${color}, ${alpha})`
      context.current.fill()
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
  }

  const clearContext = () => {
    if (context.current) {
      context.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const drawParticles = () => {
    clearContext()
    const particleCount = quantity
    for (let i = 0; i < particleCount; i++) {
      const circle = circleParams()
      drawCircle(circle)
      circles.current.push(circle)
    }
  }

  const remapValue = (value, start1, end1, start2, end2) => {
    const remapped = ((value - start1) * (end2 - start2)) / (end1 - start1) + start2
    return remapped > 0 ? remapped : 0
  }

  const animate = () => {
    clearContext()
    circles.current.forEach((circle, i) => {
      const edge = [
        circle.x + circle.translateX > canvasRef.current.width,
        circle.x + circle.translateX < 0,
        circle.y + circle.translateY > canvasRef.current.height,
        circle.y + circle.translateY < 0,
      ]
      if (edge[0] || edge[1] || edge[2] || edge[3]) {
        circles.current.splice(i, 1)
        circles.current.push(circleParams())
      }

      const distance = Math.sqrt(
        (mousePosition.current.x - circle.x) ** 2 + (mousePosition.current.y - circle.y) ** 2
      )

      if (distance < 200) {
        circle.alpha = Math.min(circle.alpha + 0.05, circle.targetAlpha)
      } else {
        circle.alpha = Math.max(circle.alpha - 0.01, 0)
      }

      circle.x += circle.dx
      circle.y += circle.dy
      circle.translateX += (mousePosition.current.x - circle.x) / (staticity / circle.magnetism)
      circle.translateY += (mousePosition.current.y - circle.y) / (staticity / circle.magnetism)

      drawCircle(circle, true)
    })
    window.requestAnimationFrame(animate)
  }

  return (
    <div className={className} ref={canvasContainerRef} aria-hidden="true">
      <canvas ref={canvasRef} onMouseMove={onMouseMove} className="h-full w-full" />
    </div>
  )
}

export default Particles
