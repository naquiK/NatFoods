"use client"

import { useState, useEffect } from "react"
import { useSettings } from "../../context/SettingsContext"
import { settingsAPI } from "../../utils/api"
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
    theme: {
      primaryColor: "#0b3d2e",
      secondaryColor: "#f5f5f0",
      accentColor: "#8b7355",
    },
    contactInfo: {
      email: "",
      phone: "",
      address: "",
    },
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
    homepageTaglines: [],
    homepageAbout: "",
    homepageCategories: [],
    privacyPolicy: "",
    shippingPolicy: "",
    termsAndConditions: "",
    returnsPolicy: "",
    aboutPage: "",
    contactPageIntro: "",
  })

  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({
        ...prev,
        siteName: settings.siteName || "",
        siteDescription: settings.siteDescription || "",
        logo: settings.logo?.url || "",
        favicon: settings.favicon?.url || "",
        theme: {
          primaryColor: settings.theme?.primaryColor || "#0b3d2e",
          secondaryColor: settings.theme?.secondaryColor || "#f5f5f0",
          accentColor: settings.theme?.accentColor || "#8b7355",
        },
        contactInfo: {
          email: settings.contactInfo?.email || "",
          phone: settings.contactInfo?.phone || "",
          address: settings.contactInfo?.address || "",
        },
        socialMedia: {
          facebook: settings.socialMedia?.facebook || "",
          twitter: settings.socialMedia?.twitter || "",
          instagram: settings.socialMedia?.instagram || "",
          linkedin: settings.socialMedia?.linkedin || "",
        },
        seo: {
          metaTitle: settings.seo?.metaTitle || "",
          metaDescription: settings.seo?.metaDescription || "",
          keywords: (settings.seo?.keywords || []).join(", "),
        },
        homepageTaglines: settings.homepageTaglines || [],
        homepageAbout: settings.homepageAbout || "",
        homepageCategories: settings.homepageCategories || [],
        privacyPolicy: settings.privacyPolicy || "",
        shippingPolicy: settings.shippingPolicy || "",
        termsAndConditions: settings.termsAndConditions || "",
        returnsPolicy: settings.returnsPolicy || "",
        aboutPage: settings.aboutPage || "",
        contactPageIntro: settings.contactPageIntro || "",
      }))
    }
  }, [settings])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        siteName: formData.siteName,
        siteDescription: formData.siteDescription,
        // accept urls for logo/favicon; backend will merge
        logo: formData.logo ? { url: formData.logo } : settings.logo,
        favicon: formData.favicon ? { url: formData.favicon } : settings.favicon,
        theme: formData.theme,
        contactInfo: formData.contactInfo,
        socialMedia: formData.socialMedia,
        seo: {
          metaTitle: formData.seo.metaTitle,
          metaDescription: formData.seo.metaDescription,
          keywords: formData.seo.keywords
            ? formData.seo.keywords
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean)
            : [],
        },
        homepageTaglines: formData.homepageTaglines,
        homepageAbout: formData.homepageAbout,
        homepageCategories: formData.homepageCategories,
        privacyPolicy: formData.privacyPolicy,
        shippingPolicy: formData.shippingPolicy,
        termsAndConditions: formData.termsAndConditions,
        returnsPolicy: formData.returnsPolicy,
        aboutPage: formData.aboutPage,
        contactPageIntro: formData.contactPageIntro,
      }
      const res = await settingsAPI.update(payload)
      updateSettings(res.data.settings)
      alert("Settings updated successfully!")
    } catch (error) {
      console.error("Error updating settings:", error)
      alert(error.response?.data?.message || "Error updating settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    // dot-notation updates for nested objects
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
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleCommaList = (name, value) => {
    const arr = value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
    setFormData((prev) => ({ ...prev, [name]: arr }))
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
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="Your Store Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  name="contactInfo.email"
                  value={formData.contactInfo.email}
                  onChange={handleChange}
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
                onChange={handleChange}
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
                  name="contactInfo.phone"
                  value={formData.contactInfo.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Address</label>
                <input
                  type="text"
                  name="contactInfo.address"
                  value={formData.contactInfo.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="Your business address"
                />
              </div>
            </div>
          </div>

          {/* Homepage Content */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-6">Homepage Content</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Taglines (comma separated)</label>
                <input
                  type="text"
                  value={(formData.homepageTaglines || []).join(", ")}
                  onChange={(e) => handleCommaList("homepageTaglines", e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="Nature's Best..., Simple, Organic..., Prepared On-Demand."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">About Us (homepage)</label>
                <textarea
                  name="homepageAbout"
                  value={formData.homepageAbout}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="Write a brief about section for the homepage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Categories (comma separated)</label>
                <input
                  type="text"
                  value={(formData.homepageCategories || []).join(", ")}
                  onChange={(e) => handleCommaList("homepageCategories", e.target.value)}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="Flour, Pulses, Edible Oil"
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Primary Color</label>
                <input
                  type="color"
                  name="theme.primaryColor"
                  value={formData.theme.primaryColor}
                  onChange={handleChange}
                  className="w-full h-12 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Secondary Color</label>
                <input
                  type="color"
                  name="theme.secondaryColor"
                  value={formData.theme.secondaryColor}
                  onChange={handleChange}
                  className="w-full h-12 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Accent Color</label>
                <input
                  type="color"
                  name="theme.accentColor"
                  value={formData.theme.accentColor}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="Your Store - Best Products Online"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Meta Description</label>
                <textarea
                  name="seo.metaDescription"
                  value={formData.seo.metaDescription}
                  onChange={handleChange}
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
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="ecommerce, online store, products"
                />
              </div>
            </div>
          </div>

          {/* Policies & Pages */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-6">Policies & Pages</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Privacy Policy</label>
                <textarea
                  name="privacyPolicy"
                  value={formData.privacyPolicy}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="Your Privacy Policy content..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Shipping Policy</label>
                <textarea
                  name="shippingPolicy"
                  value={formData.shippingPolicy}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="Your Shipping Policy content..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Terms & Conditions</label>
                <textarea
                  name="termsAndConditions"
                  value={formData.termsAndConditions}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="Your Terms & Conditions..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Returns Policy</label>
                <textarea
                  name="returnsPolicy"
                  value={formData.returnsPolicy}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="Your Returns Policy content..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">About Page Text</label>
                <textarea
                  name="aboutPage"
                  value={formData.aboutPage}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="About page content..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Contact Page Intro</label>
                <textarea
                  name="contactPageIntro"
                  value={formData.contactPageIntro}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  placeholder="Contact page short intro..."
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
