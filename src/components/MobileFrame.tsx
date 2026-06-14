import React, { useEffect } from 'react';
import { Sun, Moon, Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  bottomNav?: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children, theme, setTheme, bottomNav }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Sync theme with HTML attribute
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Get current time for simulator status bar
  const [time, setTime] = React.useState('');
  
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      let hours = date.getHours().toString().padStart(2, '0');
      let minutes = date.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="simulator-container">
      {/* Visual background glows */}
      <div className="simulator-bg-glow"></div>
      <div className="simulator-bg-glow-left"></div>

      <div className="mobile-mockup">
        <div className="mobile-screen">
          {/* Animated Background Grids, Glows & Streaks */}
          <div className="app-bg-grid" />
          <div className="app-bg-streaks" />
          <div className="app-bg-glow-1" />
          <div className="app-bg-glow-2" />

          {/* Floating Particle Bubbles */}
          <div className="floating-bubble" style={{ width: '12px', height: '12px', left: '15%', animationDelay: '0s', animationDuration: '14s' }} />
          <div className="floating-bubble" style={{ width: '8px', height: '8px', left: '45%', animationDelay: '3s', animationDuration: '18s', '--bubble-color': 'rgba(16, 185, 129, 0.12)' } as React.CSSProperties} />
          <div className="floating-bubble" style={{ width: '16px', height: '16px', left: '75%', animationDelay: '6s', animationDuration: '16s' }} />
          <div className="floating-bubble" style={{ width: '10px', height: '10px', left: '30%', animationDelay: '9s', animationDuration: '20s', '--bubble-color': 'rgba(16, 185, 129, 0.12)' } as React.CSSProperties} />

          {/* Simulated Smartphone Notch */}
          <div className="mobile-notch">
            <div className="notch-speaker"></div>
            <div className="notch-camera"></div>
          </div>

          {/* Status Bar */}
          <div 
            className="flex items-center justify-between" 
            style={{ 
              padding: '12px 24px 4px 24px', 
              fontSize: '11px', 
              fontWeight: 600, 
              color: 'var(--text-secondary)',
              letterSpacing: '0.5px',
              userSelect: 'none',
              zIndex: 10,
              marginTop: '4px'
            }}
          >
            <span>{time || '09:41'}</span>
            <div className="flex items-center gap-2">
              <Signal size={12} />
              <Wifi size={12} />
              <Battery size={14} style={{ transform: 'rotate(0deg)' }} />
            </div>
          </div>

          {/* Navigation/Action Header */}
          <div 
            className="flex items-center justify-between" 
            style={{ 
              padding: '8px 20px 12px 20px', 
              borderBottom: '1px solid var(--border-glass)',
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(10px)',
              zIndex: 10
            }}
          >
            <div className="flex items-center gap-2">
              <span 
                style={{ 
                  width: '10px', 
                  height: '10px', 
                  backgroundColor: 'var(--primary)', 
                  borderRadius: '50%',
                  boxShadow: 'var(--glow-shadow)'
                }}
              ></span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.5px' }}>
                Celengan<span style={{ color: 'var(--primary)' }}>Digital</span>
              </h2>
            </div>
            
            <button 
              className="theme-switch-btn" 
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>

          {/* Screen Content Wrapper */}
          <div 
            className="app-scrollable" 
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '16px 20px 96px 20px', // padding bottom fits BottomNav (76px) + extra
              position: 'relative',
              zIndex: 2
            }}
          >
            {children}
          </div>

          {/* Render Fixed Bottom Nav outside scrollable content */}
          {bottomNav}
        </div>
      </div>
    </div>
  );
};
