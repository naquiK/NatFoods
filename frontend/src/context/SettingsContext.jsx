"use client"
import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const SettingsContext = createContext()

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    siteName: "NatFoods",
    siteDescription: "Your premium online shopping destination",
    logo: null,
    contactInfo: {},
    socialMedia: {},
    theme: {
      primaryColor: "#000000",
      secondaryColor: "#f5f5f0",
      accentColor: "#8b7355",
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/settings`)
      setSettings(response.data)
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/settings`, newSettings)
      setSettings(response.data.settings)
      return { success: true }
    } catch (error) {
      console.error("Error updating settings:", error)
      return { success: false, message: error.response?.data?.message || "Update failed" }
    }
  }

  const value = {
    settings,
    loading,
    updateSettings,
    fetchSettings,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
