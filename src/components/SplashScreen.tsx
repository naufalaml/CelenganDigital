import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinished: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Keep splash visible for 2.8 seconds, then trigger fade out
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2800);

    // Call onFinished callback after the fade-out transition is complete
    const finishTimer = setTimeout(() => {
      onFinished();
    }, 3300); // 2800ms visible + 500ms fade transition

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div 
      className="splash-container" 
      style={{ 
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(1.05)',
        pointerEvents: isVisible ? 'all' : 'none'
      }}
    >
      <div className="splash-vault-glow" />
      
      <div className="splash-logo-wrap">
        <svg 
          className="splash-logo-svg" 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Glowing background behind vault */}
          <circle cx="50" cy="65" r="22" fill="rgba(99, 102, 241, 0.08)" />

          {/* Golden Coin falling from the top */}
          <g className="vault-coin">
            <circle cx="50" cy="18" r="7" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
            <circle cx="50" cy="18" r="4" fill="#fbbf24" />
            {/* Dollar sign on coin */}
            <path d="M50 15v6M48.5 16.5h3a1 1 0 010 2h-3a1 1 0 000 2h3" stroke="#b45309" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
          
          {/* Vault main body */}
          <g className="vault-body">
            {/* Outer case */}
            <rect x="24" y="38" width="52" height="52" rx="12" fill="url(#vaultGrad)" stroke="var(--primary)" strokeWidth="3" />
            
            {/* Inner frame bezel */}
            <rect x="29" y="43" width="42" height="42" rx="8" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            
            {/* Status indicators */}
            <circle cx="37" cy="50" r="2.5" fill="#10b981" /> {/* Safe light (Green) */}
            <circle cx="44" cy="50" r="2.2" fill="#ef4444" opacity="0.4" /> {/* Alarm light (Red) */}
            <rect x="58" y="47" width="10" height="5" rx="1" fill="#1e293b" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" /> {/* Keypad panel */}
            
            {/* Dial mechanism base */}
            <circle cx="50" cy="67" r="16" fill="#0f172a" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            <circle cx="50" cy="67" r="12" fill="#1e293b" />
            
            {/* Rotating Wheel handle */}
            <g style={{ transformOrigin: '50px 67px', animation: 'dialRotate 2.5s infinite ease-in-out' }}>
              <circle cx="50" cy="67" r="8" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
              <line x1="50" y1="56" x2="50" y2="78" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="39" y1="67" x2="61" y2="67" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="50" cy="67" r="3.5" fill="var(--primary)" stroke="#ffffff" strokeWidth="1" />
            </g>
          </g>
          
          <defs>
            <linearGradient id="vaultGrad" x1="24" y1="38" x2="76" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1e1b4b" />
              <stop offset="0.5" stopColor="#111827" />
              <stop offset="1" stopColor="#030712" />
            </linearGradient>
          </defs>
        </svg>

        {/* Embedded Dial Rotation Keyframe style */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes dialRotate {
            0% { transform: rotate(0deg); }
            20% { transform: rotate(0deg); }
            40% { transform: rotate(120deg); }
            65% { transform: rotate(90deg); }
            85% { transform: rotate(360deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>

      <h1 className="splash-title">CelenganDigital</h1>
      <span className="splash-subtitle">Aplikasi Catatan Tabungan</span>

      {/* Loading Animation */}
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};
