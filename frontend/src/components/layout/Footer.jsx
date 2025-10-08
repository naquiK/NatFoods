"use client"
import { Link, NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { useSettings } from "../../context/SettingsContext"

const Footer = () => {
  const { settings } = useSettings()

  const footerLinks = {
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" },
    ],
    support: [
      { name: "Help Center", href: "#" },
      { name: "Shipping Info", href: "#" },
      { name: "Returns", href: "#" },
      { name: "Size Guide", href: "#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Accessibility", href: "#" },
    ],
  }

  const socialLinks = [
    {
      name: "Facebook",
      href: settings?.socialMedia?.facebook || "#",
      icon: Facebook,
    },
    {
      name: "Twitter",
      href: settings?.socialMedia?.twitter || "#",
      icon: Twitter,
    },
    {
      name: "Instagram",
      href: settings?.socialMedia?.instagram || "#",
      icon: Instagram,
    },
    {
      name: "LinkedIn",
      href: settings?.socialMedia?.linkedin || "#",
      icon: Linkedin,
    },
  ]

  return (
    <footer className="bg-neutral-900 text-neutral-100">
      <div className="section-padding py-16">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <Link to="/" className="inline-block mb-6">
                {settings?.logo?.url ? (
                  <img
                    src={settings.logo.url || "/placeholder.svg"}
                    alt={settings.siteName}
                    className="h-8 w-auto filter brightness-0 invert"
                  />
                ) : (
                  <div className="text-2xl font-serif font-bold text-white">{settings?.siteName || "eKart"}</div>
                )}
              </Link>

              <p className="text-neutral-400 mb-6 leading-relaxed">
                {settings?.siteDescription ||
                  "Your premium online shopping destination for quality products and exceptional service."}
              </p>

              {/* Contact Info */}
              {settings?.contactInfo && (
                <div className="space-y-3">
                  {settings.contactInfo.email && (
                    <div className="flex items-center space-x-3 text-sm text-neutral-400">
                      <Mail size={16} />
                      <span>{settings.contactInfo.email}</span>
                    </div>
                  )}
                  {settings.contactInfo.phone && (
                    <div className="flex items-center space-x-3 text-sm text-neutral-400">
                      <Phone size={16} />
                      <span>{settings.contactInfo.phone}</span>
                    </div>
                  )}
                  {settings.contactInfo.address && (
                    <div className="flex items-start space-x-3 text-sm text-neutral-400">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{settings.contactInfo.address}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Company</h3>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul><NavLink to={"/admin"}> a </NavLink></ul>
              <ul className="space-y-4">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Legal</h3>
              <ul className="space-y-4">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="border-t border-neutral-800 mt-12 pt-12">
            <div className="max-w-md">
              <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
              <p className="text-neutral-400 mb-6 text-sm">
                Subscribe to our newsletter for the latest updates and exclusive offers.
              </p>
              <form className="flex space-x-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                <button type="submit" className="btn-accent whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-neutral-400">
              © {new Date().getFullYear()} {settings?.siteName || "eKart"}. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-white transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={20} />
                  </motion.a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
