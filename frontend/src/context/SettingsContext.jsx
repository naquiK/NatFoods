"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { settingsAPI } from "../utils/api"
import logo from "../assets/logo.jpg"

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
    siteName: "Nat-Organics",
    siteDescription: "Your premium online shopping destination",
    logo: null,
    contactInfo: { email: "", phone: "", address: "" },
    socialMedia: {},
    theme: {
      primaryColor: "#0b3d2e",
      secondaryColor: "#f5f5f0",
      accentColor: "#8b7355",
    },
    homepageTaglines: [
      "Nature's Best, Delivered to Your Doorstep.",
      "Simple, Organic Goodness. No Chemicals.",
      "Prepared On-Demand.",
    ],
    homepageAbout:
      "Nat-Organics, as the name suggests, stands for Natural and Organic foods. We are a team of passionate people who have worked with naturalists and organic harvesters to discover methods, foods, and ingredients that boost energy, health, and nutrition. We're dedicated to helping you and your family achieve a healthy mind and body. We assure you that every order will enrich your nourishment and improve your well-being.",
    homepageCategories: ["Flour", "Pulses", "Edible Oil"],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get()
      setSettings(response.data)
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings) => {
    try {
      const response = await settingsAPI.update(newSettings)
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
