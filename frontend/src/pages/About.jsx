import { useSettings } from "../context/SettingsContext"

const About = () => {
  const { settings } = useSettings()

  return (
    <div className="min-h-screen bg-stone-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6 text-balance">
            About {settings?.siteName || "eKart"}
          </h1>
          <p className="text-xl text-stone-600 text-balance">
            {settings?.siteDescription || "Your trusted online shopping destination"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <img
              src="/modern-office-team.png"
              alt="Our team"
              className="w-full h-80 object-cover rounded-2xl shadow-lg"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-6">Our Story</h2>
            <p className="text-stone-600 mb-6 leading-relaxed">
              Founded with a passion for quality and customer satisfaction, {settings?.siteName || "eKart"} has been
              serving customers with premium products and exceptional service. We believe in creating meaningful
              connections through commerce.
            </p>
            <p className="text-stone-600 leading-relaxed">
              Our carefully curated selection ensures that every product meets our high standards for quality,
              sustainability, and value. We're committed to making your shopping experience seamless and enjoyable.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">Quality Assured</h3>
            <p className="text-stone-600">
              Every product is carefully selected and tested to meet our high quality standards.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">Fast Delivery</h3>
            <p className="text-stone-600">Quick and reliable shipping to get your orders to you as fast as possible.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">Customer Care</h3>
            <p className="text-stone-600">Dedicated support team ready to help you with any questions or concerns.</p>
          </div>
        </div>

        {settings?.contactInfo?.address && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center">
            <h3 className="text-2xl font-bold text-stone-900 mb-4">Visit Our Store</h3>
            <p className="text-stone-600 mb-2">{settings.contactInfo.address}</p>
            {settings.contactInfo.phone && <p className="text-stone-600 mb-2">Phone: {settings.contactInfo.phone}</p>}
            {settings.contactInfo.email && <p className="text-stone-600">Email: {settings.contactInfo.email}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default About
