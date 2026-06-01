import { useState, useEffect, useRef } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { useModelStore } from '../../../store/useModelStore';
import { supabase } from '../../../services/supabaseClient';
import { AuthDialog } from '../../ui/AuthDialog';

interface AuthButtonProps {
  isMobile?: boolean;
}

export const AuthButton = ({ isMobile = false }: AuthButtonProps = {}) => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const colorMode = useModelStore(state => state.colorMode);
  const user = useModelStore(state => state.user);
  const setUser = useModelStore(state => state.setUser);
  const setSession = useModelStore(state => state.setSession);
  const signOut = useModelStore(state => state.signOut);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const isDark = colorMode === 'dark';

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setUser]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showUserMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    // Use capture phase to ensure we catch the event before React Flow
    document.addEventListener('mousedown', handleClickOutside, true);
    return () => document.removeEventListener('mousedown', handleClickOutside, true);
  }, [showUserMenu]);

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthDialog(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '12px' : '6px',
            justifyContent: 'center',
            padding: isMobile ? '12px 14px' : '6px 12px',
            minHeight: isMobile ? '48px' : 'auto',
            height: isMobile ? '48px' : 'auto',
            boxSizing: 'border-box',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
            whiteSpace: 'nowrap',
            width: isMobile ? '100%' : 'auto',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
          }}
        >
          <LogIn size={isMobile ? 18 : 16} style={{ flexShrink: 0 }} />
          <span>Sign In</span>
        </button>
        <AuthDialog isOpen={showAuthDialog} onClose={() => setShowAuthDialog(false)} />
      </>
    );
  }

  // Mobile mode: render buttons directly in grid layout (no dropdown)
  if (isMobile) {
    return (
      <>
        <button
          type="button"
          disabled
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '12px 14px',
            minHeight: '48px',
            height: '48px',
            boxSizing: 'border-box',
            background: isDark ? '#21262d' : '#f3f4f6',
            border: `1px solid ${isDark ? '#30363d' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: isDark ? '#e6edf3' : '#1f2937',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'default',
            transition: 'all 0.15s ease',
            width: '100%',
            opacity: 0.8,
          }}
        >
          <span style={{ fontSize: '10px', color: '#22c55e' }}>●</span>
          <span>Auto-sync enabled</span>
        </button>

        <button
          onClick={async () => {
            await signOut();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '12px 14px',
            minHeight: '48px',
            height: '48px',
            boxSizing: 'border-box',
            background: isDark ? '#21262d' : '#f3f4f6',
            border: `1px solid ${isDark ? '#30363d' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            width: '100%',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? '#30363d' : '#fef2f2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDark ? '#21262d' : '#f3f4f6';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.background = isDark ? '#30363d' : '#fef2f2';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.background = isDark ? '#21262d' : '#f3f4f6';
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          <span>Sign Out</span>
        </button>

      </>
    );
  }

  // Desktop mode: render dropdown menu
  return (
    <div style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }} ref={menuRef}>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '12px' : '4px',
          padding: isMobile ? '12px 14px' : '4px',
          background: isMobile ? (isDark ? '#21262d' : '#f3f4f6') : 'transparent',
          border: isMobile ? `1px solid ${isDark ? '#30363d' : '#e5e7eb'}` : 'none',
          outline: 'none',
          borderRadius: isMobile ? '8px' : '0',
          color: isDark ? '#e6edf3' : '#1f2937',
          fontSize: '14px',
          fontWeight: isMobile ? 500 : 500,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          width: isMobile ? '100%' : 'auto',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => {
          if (isMobile) {
            e.currentTarget.style.background = isDark ? '#30363d' : '#e5e7eb';
          } else {
            e.currentTarget.style.opacity = '0.7';
          }
        }}
        onMouseLeave={(e) => {
          if (isMobile) {
            e.currentTarget.style.background = isDark ? '#21262d' : '#f3f4f6';
          } else {
            e.currentTarget.style.opacity = '1';
          }
        }}
        onMouseDown={(e) => {
          if (isMobile) {
            e.currentTarget.style.background = isDark ? '#30363d' : '#e5e7eb';
          }
        }}
        onMouseUp={(e) => {
          if (isMobile) {
            e.currentTarget.style.background = isDark ? '#21262d' : '#f3f4f6';
          }
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {user.email?.[0].toUpperCase() || 'U'}
        </div>
      </button>

      {/* User Dropdown Menu */}
      {showUserMenu && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            minWidth: '220px',
            background: isDark ? '#21262d' : '#ffffff',
            border: isDark ? '1px solid #30363d' : '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: isDark 
              ? '0 8px 24px rgba(0, 0, 0, 0.4)' 
              : '0 8px 24px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {/* User Info */}
          <div
            style={{
              padding: '12px',
              borderBottom: isDark ? '1px solid #30363d' : '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {user.email?.[0].toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isDark ? '#e6edf3' : '#1f2937',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.email}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: isDark ? '#8b949e' : '#6b7280',
                }}
              >
                Signed in
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div style={{ padding: '10px 12px' }}>
            <div
              style={{
                fontSize: '12px',
                color: isDark ? '#8b949e' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '10px', color: '#22c55e' }}>●</span>
              Projects auto-sync to cloud
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: isDark ? '#30363d' : '#e5e7eb', margin: '4px 0' }} />

          {/* Sign Out */}
          <div style={{ padding: '4px' }}>
            <button
              onClick={async () => {
                await signOut();
                setShowUserMenu(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background 0.15s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? '#30363d' : '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
