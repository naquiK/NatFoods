"use client"
import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"

const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

export default function TopBarProgress() {
  const location = useLocation()
  const [active, setActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef(null)
  const finishRef = useRef(null)

  // start a new progress cycle
  const start = () => {
    clearInterval(timerRef.current)
    clearTimeout(finishRef.current)
    setActive(true)
    setProgress(0)

    // Quick perception: jump to ~60% fast, then crawl
    let p = 0
    timerRef.current = setInterval(() => {
      // accelerate then slow down
      const increment = p < 60 ? 8 : p < 85 ? 2 : 0.5
      p = clamp(p + increment, 0, 95)
      setProgress(p)
    }, 120)

    // safety finish if nothing else completes within a short time
    finishRef.current = setTimeout(() => finish(), 1200)
  }

  const finish = () => {
    clearInterval(timerRef.current)
    setProgress(100)
    // brief hold then fade out
    finishRef.current = setTimeout(() => {
      setActive(false)
      setProgress(0)
    }, 220)
  }

  useEffect(() => {
    // On every location change, trigger the progress sequence
    start()
    // Complete shortly after route update (perceived done)
    const done = setTimeout(() => finish(), 450)
    return () => {
      clearTimeout(done)
      clearInterval(timerRef.current)
      clearTimeout(finishRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname + location.search + location.hash])

  if (!active && progress === 0) return null

  return (
    <>
      {/* Top thin progress bar */}
      <div className="fixed left-0 right-0 top-0 z-[65] pointer-events-none" aria-hidden="true">
        <div className="h-[3px] w-full bg-transparent">
          <div
            className="h-full topbar-gradient transition-[width,opacity] duration-160 will-change-transform"
            style={{ width: `${progress}%`, opacity: active ? 1 : 0 }}
          />
        </div>
      </div>

      {/* Kinetic cart near header brand (non-interactive overlay) */}
      <div className="fixed top-4 left-4 z-[65] pointer-events-none select-none" aria-hidden="true">
        <div className={`kinetic-cart ${active ? "cart-active" : ""}`}>
          <span className="cart-body" />
        </div>
      </div>
    </>
  )
}
