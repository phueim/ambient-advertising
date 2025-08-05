import { Button } from "@/components/ui/button";
import { ArrowLeft, Music, List, Shuffle, Clock, Mic, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function OnlineGuidePage() {
  const [, setLocation] = useLocation();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const guideCards = [
    {
      title: "Customize Playlist",
      description: "Handpick tracks for your brand",
      icon: Music,
      bgImage: `data:image/svg+xml,${encodeURIComponent(`
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="music-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/>
              <path d="M15 10 L25 10 M15 15 L25 15 M15 20 L25 20" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            </pattern>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#ee5a52;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad1)"/>
          <rect width="100%" height="100%" fill="url(#music-pattern)"/>
        </svg>
      `)}`,
      accentColor: "bg-red-600"
    },
    {
      title: "Single Playlist", 
      description: "Change the playlist in your outlet",
      icon: List,
      bgImage: `data:image/svg+xml,${encodeURIComponent(`
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lines-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <line x1="0" y1="15" x2="30" y2="15" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
              <line x1="15" y1="0" x2="15" y2="30" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
            </pattern>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#ff7675;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#d63031;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad2)"/>
          <rect width="100%" height="100%" fill="url(#lines-pattern)"/>
        </svg>
      `)}`,
      accentColor: "bg-rose-600"
    },
    {
      title: "System Mix",
      description: "Utilize two or more system playlists for variety", 
      icon: Shuffle,
      bgImage: `data:image/svg+xml,${encodeURIComponent(`
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="waves-pattern" x="0" y="0" width="60" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 Q15 10 30 20 T60 20" stroke="rgba(255,255,255,0.1)" stroke-width="2" fill="none"/>
              <path d="M0 30 Q15 20 30 30 T60 30" stroke="rgba(255,255,255,0.05)" stroke-width="1" fill="none"/>
            </pattern>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#e84393;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#a29bfe;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad3)"/>
          <rect width="100%" height="100%" fill="url(#waves-pattern)"/>
        </svg>
      `)}`,
      accentColor: "bg-red-700"
    },
    {
      title: "Timeslot",
      description: "Set different playlists for various parts of the day",
      icon: Clock,
      bgImage: `data:image/svg+xml,${encodeURIComponent(`
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="clock-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="15" stroke="rgba(255,255,255,0.1)" stroke-width="1" fill="none"/>
              <line x1="25" y1="15" x2="25" y2="25" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
              <line x1="25" y1="25" x2="32" y2="25" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
            </pattern>
            <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#636e72;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#2d3436;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad4)"/>
          <rect width="100%" height="100%" fill="url(#clock-pattern)"/>
        </svg>
      `)}`,
      accentColor: "bg-slate-600"
    },
    {
      title: "Voiceover", 
      description: "Customize settings for your voiceovers",
      icon: Mic,
      bgImage: `data:image/svg+xml,${encodeURIComponent(`
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="sound-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="5" stroke="rgba(255,255,255,0.1)" stroke-width="1" fill="none"/>
              <circle cx="20" cy="20" r="10" stroke="rgba(255,255,255,0.05)" stroke-width="1" fill="none"/>
              <circle cx="20" cy="20" r="15" stroke="rgba(255,255,255,0.03)" stroke-width="1" fill="none"/>
            </pattern>
            <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#fd79a8;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#e84393;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad5)"/>
          <rect width="100%" height="100%" fill="url(#sound-pattern)"/>
        </svg>
      `)}`,
      accentColor: "bg-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Clean Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/help")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Online Guide</h1>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {guideCards.map((card, index) => {
            const IconComponent = card.icon;
            const isHovered = hoveredCard === index;
            
            return (
              <div
                key={index}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Card Container */}
                <div className={`
                  relative overflow-hidden rounded-2xl shadow-lg 
                  transform transition-all duration-500 ease-out
                  ${isHovered ? 'scale-105 shadow-2xl -translate-y-2' : 'scale-100 shadow-lg'}
                  h-56 sm:h-60
                `}>
                  
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${card.bgImage}")` }}
                  >
                    {/* Animated Pattern Overlay */}
                    <div className="absolute inset-0 opacity-20">
                      <div className={`
                        absolute inset-0 bg-gradient-to-br from-white/20 to-transparent
                        transition-transform duration-700 ease-out
                        ${isHovered ? 'scale-110 rotate-3' : 'scale-100 rotate-0'}
                      `}></div>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="relative h-full flex flex-col justify-between p-6 text-white">
                    
                    {/* Top Section - Icon */}
                    <div className="flex justify-between items-start">
                      <div className={`
                        p-3 rounded-xl backdrop-blur-sm border border-white/20
                        transition-all duration-300 ease-out
                        ${isHovered ? 'scale-110 bg-white/20' : 'scale-100 bg-white/10'}
                      `}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      
                      {/* Arrow Icon */}
                      <div className={`
                        p-2 rounded-full backdrop-blur-sm
                        transition-all duration-300 ease-out
                        ${isHovered ? 'translate-x-1 bg-white/20' : 'translate-x-0 bg-white/10'}
                      `}>
                        <ChevronRight className="h-4 w-4 text-white" />
                      </div>
                    </div>

                    {/* Bottom Section - Text */}
                    <div className="space-y-3">
                      <h3 className={`
                        font-bold leading-tight text-white
                        transition-all duration-300 ease-out
                        ${isHovered ? 'text-xl' : 'text-lg'}
                      `}>
                        {card.title}
                      </h3>
                      <p className={`
                        text-white/90 leading-relaxed
                        transition-all duration-300 ease-out
                        ${isHovered ? 'text-sm opacity-100' : 'text-sm opacity-80'}
                      `}>
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Gradient Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
                  
                  {/* Subtle Border Glow on Hover */}
                  <div className={`
                    absolute inset-0 rounded-2xl border-2 border-white/20
                    transition-opacity duration-300 ease-out
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                  `}></div>
                </div>

                {/* Floating Action Indicator */}
                <div className={`
                  absolute -bottom-2 left-1/2 transform -translate-x-1/2
                  px-4 py-2 rounded-full text-xs font-medium
                  transition-all duration-300 ease-out
                  ${card.accentColor} text-white shadow-lg
                  ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                `}>
                  Learn More
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}