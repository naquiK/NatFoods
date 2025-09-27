"use client"
import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext(null)

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("system")

  useEffect(() => {
    const stored = localStorage.getItem("theme") || "system"
    setTheme(stored)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const isSystemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldDark = theme === "dark" || (theme === "system" && isSystemDark)
    root.classList.toggle("dark", shouldDark)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark"
      localStorage.setItem("theme", next)
      return next
    })
  }

  const setSystem = () => {
    localStorage.setItem("theme", "system")
    setTheme("system")
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme, setSystem }}>{children}</ThemeContext.Provider>
}
