"use client"

import { useState, useEffect } from "react"
import { useSettings } from "../../context/SettingsContext"
import { api } from "../../utils/api"
import Button from "../../components/ui/Button"
import LoadingSpinner from "../../components/ui/LoadingSpinner"

const SiteSettings = () => {
  const { settings, updateSettings } = useSettings()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    siteName: "",
    siteDescription: "",
    logo: "",
    favicon: "",
    primaryColor: "#1c1917",
    secondaryColor: "#78716c",
    contactEmail: "",
    contactPhone: "",
    address: "",
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: "",
    },
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || "",
        siteDescription: settings.siteDescription || "",
        logo: settings.logo || "",
        favicon: settings.favicon || "",
        primaryColor: settings.primaryColor || "#1c1917",
        secondaryColor: settings.secondaryColor || "#78716c",
        contactEmail: settings.contactEmail || "",
        contactPhone: settings.contactPhone || "",
        address: settings.address || "",
        socialMedia: {
          facebook: settings.socialMedia?.facebook || "",
          twitter: settings.socialMedia?.twitter || "",
          instagram: settings.socialMedia?.instagram || "",
          linkedin: settings.socialMedia?.linkedin || "",
        },
        seo: {
          metaTitle: settings.seo?.metaTitle || "",
          metaDescription: settings.seo?.metaDescription || "",
          keywords: settings.seo?.keywords || "",
        },
      })
    }
  }, [settings])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.put("/admin/settings", formData)
      updateSettings(response.data)
      alert("Settings updated successfully!")
    } catch (error) {
      console.error("Error updating settings:", error)
      alert("Error updating settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Site Settings</h1>
          <p className="text-stone-600">Manage your website configuration and branding</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Site Name</label>
                <input
                  type="text"
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="Your Store Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="contact@yourstore.com"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-stone-700 mb-2">Site Description</label>
              <textarea
                name="siteDescription"
                value={formData.siteDescription}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                placeholder="Brief description of your store"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Contact Phone</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="Your business address"
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-6">Branding</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Logo URL</label>
                <input
                  type="url"
                  name="logo"
                  value={formData.logo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Favicon URL</label>
                <input
                  type="url"
                  name="favicon"
                  value={formData.favicon}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Primary Color</label>
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleInputChange}
                  className="w-full h-12 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Secondary Color</label>
                <input
                  type="color"
                  name="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={handleInputChange}
                  className="w-full h-12 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-6">Social Media</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Facebook</label>
                <input
                  type="url"
                  name="socialMedia.facebook"
                  value={formData.socialMedia.facebook}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="https://facebook.com/yourstore"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Twitter</label>
                <input
                  type="url"
                  name="socialMedia.twitter"
                  value={formData.socialMedia.twitter}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="https://twitter.com/yourstore"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Instagram</label>
                <input
                  type="url"
                  name="socialMedia.instagram"
                  value={formData.socialMedia.instagram}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="https://instagram.com/yourstore"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">LinkedIn</label>
                <input
                  type="url"
                  name="socialMedia.linkedin"
                  value={formData.socialMedia.linkedin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="https://linkedin.com/company/yourstore"
                />
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-6">SEO Settings</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  name="seo.metaTitle"
                  value={formData.seo.metaTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="Your Store - Best Products Online"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Meta Description</label>
                <textarea
                  name="seo.metaDescription"
                  value={formData.seo.metaDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="Description for search engines"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Keywords</label>
                <input
                  type="text"
                  name="seo.keywords"
                  value={formData.seo.keywords}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="ecommerce, online store, products"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="bg-stone-900 hover:bg-stone-800 px-8">
              {loading ? <LoadingSpinner size="sm" /> : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SiteSettings
