"use client"

import { useState } from "react"
import { useSettings } from "../context/SettingsContext"
import Button from "../components/ui/Button"

const Contact = () => {
  const { settings } = useSettings()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate form submission
    setTimeout(() => {
      alert("Thank you for your message! We'll get back to you soon.")
      setFormData({ name: "", email: "", subject: "", message: "" })
      setLoading(false)
    }, 1000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen pt-20 bg-stone-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-white mb-6 text-balance">
            Get in Touch
          </h1>
          <p className="text-xl text-stone-600 dark:text-zinc-400 text-balance">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-stone-200 dark:border-zinc-800 p-8">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-stone-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 focus:ring-2 focus:ring-stone-500 dark:focus:ring-zinc-400 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-stone-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 focus:ring-2 focus:ring-stone-500 dark:focus:ring-zinc-400 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-stone-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 focus:ring-2 focus:ring-stone-500 dark:focus:ring-zinc-400 focus:border-transparent"
                  placeholder="What's this about?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-stone-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 focus:ring-2 focus:ring-stone-500 dark:focus:ring-zinc-400 focus:border-transparent"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-stone-900 hover:bg-stone-800">
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-stone-200 dark:border-zinc-800 p-8">
              <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-6">Contact Information</h3>
              <div className="space-y-4">
                {settings?.contactInfo?.email && (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-stone-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mr-4">
                      <svg
                        className="w-5 h-5 text-stone-600 dark:text-zinc-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-stone-900 dark:text-white">Email</p>
                      <p className="text-stone-600 dark:text-zinc-400">{settings.contactInfo.email}</p>
                    </div>
                  </div>
                )}
                {settings?.contactInfo?.phone && (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-stone-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mr-4">
                      <svg
                        className="w-5 h-5 text-stone-600 dark:text-zinc-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-stone-900 dark:text-white">Phone</p>
                      <p className="text-stone-600 dark:text-zinc-400">{settings.contactInfo.phone}</p>
                    </div>
                  </div>
                )}
                {settings?.contactInfo?.address && (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-stone-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mr-4">
                      <svg
                        className="w-5 h-5 text-stone-600 dark:text-zinc-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-stone-900 dark:text-white">Address</p>
                      <p className="text-stone-600 dark:text-zinc-400">{settings.contactInfo.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media Links */}
            {(settings?.socialMedia?.facebook ||
              settings?.socialMedia?.twitter ||
              settings?.socialMedia?.instagram) && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
                <h3 className="text-xl font-bold text-stone-900 mb-6">Follow Us</h3>
                <div className="flex space-x-4">
                  {settings.socialMedia.facebook && (
                    <a
                      href={settings.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center hover:bg-stone-200 transition-colors"
                    >
                      <svg className="w-5 h-5 text-stone-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                  )}
                  {settings.socialMedia.twitter && (
                    <a
                      href={settings.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center hover:bg-stone-200 transition-colors"
                    >
                      <svg className="w-5 h-5 text-stone-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                    </a>
                  )}
                  {settings.socialMedia.instagram && (
                    <a
                      href={settings.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center hover:bg-stone-200 transition-colors"
                    >
                      <svg className="w-5 h-5 text-stone-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323C6.001 8.198 7.152 7.708 8.449 7.708s2.448.49 3.323 1.416c.875.875 1.365 2.026 1.365 3.323s-.49 2.448-1.365 3.323c-.875.875-2.026 1.365-3.323 1.365s-2.448-.49-3.323-1.365c-.875-.875-1.365-2.026-1.365-3.323s.49-2.448 1.365-3.323z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
