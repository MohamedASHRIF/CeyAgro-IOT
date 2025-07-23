// "use client";

// import { PlusIcon } from "lucide-react";
// import { SectionCards } from "./(components)/SectionCarrds";
// import SnsSubscriptionPopup from "../(components)/SnsSubscriptionPopup";

// export default function DashboardPage() {
//   return (
//     <div className="relative min-h-screen w-full text-black px-6 py-12 bg-white overflow-hidden">

//       {/*  SVG Wave Background */}
//       <div className="absolute top-0 left-0 w-full h-[650px] z-0 pointer-events-none">
//         <svg
//           viewBox="0 0 1440 400"
//           preserveAspectRatio="none"
//           className="w-full h-full opacity-100"
//         >
//           <path
//             fill="#000000ff"
//             fillOpacity="0.4"
//             d="M0,200L48,220C96,240,192,260,288,280C384,300,480,320,576,300C672,280,768,200,864,200C960,200,1056,280,1152,320C1248,360,1344,390,1392,390L1440,390L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
//           ></path>
//         </svg>
//       </div>

//       {/* Hero Section */}
//       <div className="relative z-10 space-y-4 max-w-6xl mx-auto text-center">
//         <h1 className="text-5xl md:text-6xl font-bold drop-shadow-lg">
//           Your dashboard is waiting!
//         </h1>
//         <p className="text-xl md:text-5xl font-bold leading-relaxed mx-auto">
//           Add your devices now to unlock{" "}
//           <span className="text-white">real-time visibility</span> and get{" "}
//           <span className="text-white">instant alerts</span> when it matters most.
//         </p>
//       </div>

//       {/* 📊 Section Cards */}
//       <div className="relative z-10">
//         <SectionCards />
//       </div>

//       {/* ➕ Add Device Text Link */}
//       <div className="relative z-10 flex justify-center">
//         <span className="text-xl text-black font-bold">
//           Here we go, now add your device{" "}
//           <a
//             href="/devices/#add-new-device-tab"
//             className="text-teal-400 underline hover:text-teal-500 font-bold cursor-pointer"
//           >
//             here
//           </a>
//         </span>
//       </div>

//       <SnsSubscriptionPopup />
//     </div>
//   );
// }
"use client"

import { SectionCards } from "./(components)/SectionCarrds"
import SnsSubscriptionPopup from "../(components)/SnsSubscriptionPopup"

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen w-full text-black px-6 py-12 overflow-hidden">
      {/* Modern Gradient Background */}

      {/* Circuit Board Pattern 
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
      </div> */}

  
      {/* Hero Section */}
      <div className="relative z-10 space-y-4 max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold drop-shadow-xl bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 bg-clip-text text-transparent">
          Power up your dashboard!
        </h1>
        <p className="text-xl md:text-5xl font-bold leading-relaxed mx-auto">
          Add your devices now to unlock{" "}
          <span className="text-transparent bg-gradient-to-r from-gray-600 via-teal-500 to-gray-500 bg-clip-text">
            real-time visibility
          </span>{" "}
          and get{" "}
          <span className="text-transparent bg-gradient-to-r from-teal-500 via-gray-500 to-teal-400 bg-clip-text">
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
