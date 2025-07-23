"use client"

import { SectionCards } from "./(components)/SectionCarrds"
import SnsSubscriptionPopup from "../(components)/SnsSubscriptionPopup"

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen w-full text-black px-6 py-12 overflow-hidden">
      {/* Modern Gradient Background */}

      {/* Circuit Board Pattern */}
      <div className="absolute inset-0 opacity-12">
        <svg className="w-full h-full" viewBox="0 0 2000 1000">
          <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M20,20 L80,20 L80,80 L20,80 Z" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="20" cy="20" r="2" fill="currentColor" />
              <circle cx="80" cy="20" r="2" fill="currentColor" />
              <circle cx="80" cy="80" r="2" fill="currentColor" />
              <circle cx="20" cy="80" r="2" fill="currentColor" />

              <path d="M50,0 L50,20 M50,80 L50,100 M0,50 L20,50 M80,50 L100,50" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

  
      {/* Hero Section */}
      <div className="relative z-10 space-y-4 max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold drop-shadow-lg bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
          Power up your dashboard!
        </h1>
        <p className="text-xl md:text-5xl font-bold leading-relaxed mx-auto">
          Add your devices now to unlock{" "}
          <span className="text-transparent bg-gradient-to-r from-gray-600 via-teal-400 to-black bg-clip-text">
            real-time visibility
          </span>{" "}
          and get{" "}
          <span className="text-transparent bg-gradient-to-r from-teal-300 via-gray-700 to-teal-400 bg-clip-text">
            instant alerts
          </span>{" "}
          when it matters most.
        </p>
      </div>

      {/* 📊 Section Cards */}
      <div className="relative z-10">
        <SectionCards />
      </div>

      {/* ➕ Add Device Text Link */}
      <div className="relative z-10 flex justify-center">
        <span className="text-xl text-black font-bold">
          Here we go, now add your device{" "}
          <a
            href="/devices/#add-new-device-tab"
            className="text-teal-600 underline hover:text-teal-700 font-bold cursor-pointer transition-colors duration-200"
          >
            here
          </a>
        </span>
      </div>

      <SnsSubscriptionPopup />
    </div>
  )
}
