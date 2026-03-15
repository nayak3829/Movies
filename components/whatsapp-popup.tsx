'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function WhatsAppPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem('whatsappPopupSeen');
    
    if (!hasSeenPopup) {
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
        setTimeout(() => setIsAnimating(true), 50);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      localStorage.setItem('whatsappPopupSeen', 'true');
    }, 500);
  };

  const handleJoin = () => {
    // Replace with your actual WhatsApp channel link
    window.open('https://whatsapp.com/channel/YOUR_CHANNEL_ID', '_blank');
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4" style={{ perspective: '1200px' }}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      
      {/* Floating Particles - Hidden on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-[#25D366]/30 rounded-full transition-all duration-1000 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Modal with 3D Animation */}
      <div 
        className={`relative bg-gradient-to-br from-[#0f1729] via-[#131d33] to-[#0a1020] border border-gray-700/50 rounded-2xl p-6 sm:p-8 max-w-[calc(100vw-24px)] sm:max-w-sm w-full transition-all duration-700 ease-out ${
          isClosing ? 'scale-0 rotate-12 opacity-0' : ''
        }`}
        style={{
          transform: isAnimating 
            ? 'rotateX(0deg) rotateY(0deg) translateZ(0) scale(1)' 
            : 'rotateX(-15deg) rotateY(10deg) translateZ(-100px) scale(0.8)',
          opacity: isAnimating ? 1 : 0,
          boxShadow: isAnimating 
            ? '0 25px 80px -10px rgba(37, 211, 102, 0.3), 0 10px 40px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)' 
            : 'none',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Glow Effect */}
        <div 
          className={`absolute -inset-1 bg-gradient-to-r from-[#25D366]/20 via-transparent to-[#25D366]/20 rounded-2xl blur-xl transition-opacity duration-700 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: 'translateZ(-20px)' }}
        />
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-gray-600 text-gray-400 hover:text-white hover:border-[#25D366] hover:bg-[#25D366]/10 transition-all duration-300 hover:rotate-90 hover:scale-110"
          aria-label="Close popup"
          style={{ transform: 'translateZ(30px)' }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* WhatsApp Icon with 3D Bounce */}
        <div 
          className="flex justify-center mb-4 sm:mb-6"
          style={{ 
            transform: 'translateZ(50px)',
            animation: isAnimating ? 'icon-bounce 2s ease-in-out infinite' : 'none'
          }}
        >
          <div className="relative">
            {/* Pulse rings - hidden on mobile for performance */}
            <div className={`absolute inset-0 w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366] rounded-full transition-all duration-500 hidden sm:block ${isAnimating ? 'animate-ping opacity-20' : 'opacity-0'}`} />
            <div className={`absolute inset-0 w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366] rounded-full transition-all duration-700 delay-200 hidden sm:block ${isAnimating ? 'animate-ping opacity-10' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }} />
            
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/30">
              <svg 
                viewBox="0 0 24 24" 
                className="w-9 h-9 text-white fill-current drop-shadow-lg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Brand Name with Stagger Animation */}
        <h2 
          className="text-center text-2xl sm:text-3xl font-bold mb-3 sm:mb-4"
          style={{ transform: 'translateZ(40px)' }}
        >
          <span 
            className={`inline-block text-red-500 transition-all duration-500 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '200ms' }}
          >
            Tech
          </span>
          <span 
            className={`inline-block text-white transition-all duration-500 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '350ms' }}
          >
            Vyro
          </span>
        </h2>

        {/* Description */}
        <p 
          className={`text-gray-300 text-center mb-5 sm:mb-6 leading-relaxed text-sm sm:text-base transition-all duration-500 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transform: 'translateZ(30px)', transitionDelay: '400ms' }}
        >
          Join our official WhatsApp channel for the latest secret websites & tools.
        </p>

        {/* Join Button with 3D effect */}
        <button
          onClick={handleJoin}
          className={`w-full py-3 sm:py-3.5 px-6 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20bd5a] hover:to-[#0d7a6b] text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#25D366]/30 active:scale-95 text-sm sm:text-base ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ 
            transform: 'translateZ(60px)', 
            transitionDelay: '500ms',
            boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)'
          }}
        >
          Join Channel
        </button>
        
        {/* Decorative corner accents - hidden on small mobile */}
        <div className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 border-t-2 border-l-2 border-[#25D366]/30 rounded-tl-2xl hidden xs:block" style={{ transform: 'translateZ(20px)' }} />
        <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-16 sm:h-16 border-b-2 border-r-2 border-[#25D366]/30 rounded-br-2xl hidden xs:block" style={{ transform: 'translateZ(20px)' }} />
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-30px) translateX(10px) scale(1.2);
            opacity: 0.6;
          }
        }
        
        @keyframes icon-bounce {
          0%, 100% {
            transform: translateZ(50px) translateY(0);
          }
          50% {
            transform: translateZ(50px) translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}
