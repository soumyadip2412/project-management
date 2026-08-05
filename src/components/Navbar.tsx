import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MoonIcon from './icons/moon-icon'

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

const NAV_LINKS = ['Features', 'Architecture', 'Security', 'Documentation']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          background: scrolled ? 'rgba(17,17,17,0.96)' : '#111111',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
        }}
      >
        <div style={{ width: '100%', padding: '0 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', height: 68, width: '100%' }}>

            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 48 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#f59e0b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(245,158,11,0.4)'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="black" stroke="none">
                  <polygon points="13,2 4,14 12,14 11,22 20,10 12,10" />
                </svg>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Project Camp
              </span>
            </Link>

            {/* Desktop nav links - nicely centered across width */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 40, flex: 1, justifyContent: 'center' }} className="hidden md:flex">
              {NAV_LINKS.map(link => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  style={{
                    fontSize: 14, color: '#9ca3af', textDecoration: 'none',
                    fontWeight: 500, transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                >
                  {link}
                </a>
              ))}
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* Moon icon */}
              <button
                aria-label="Toggle theme"
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center' }}
              >
                <MoonIcon size={19} />
              </button>

              {/* GitHub link */}
              <a
                href="https://github.com/soumyadip2412/project-management/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: '#d1d5db', textDecoration: 'none', fontSize: 14, fontWeight: 500,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#d1d5db')}
                className="hidden md:flex"
              >
                <GithubIcon />
                GitHub
              </a>

              {/* Get Started button */}
              <button
                onClick={() => navigate('/register')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#f59e0b', color: '#000000',
                  border: 'none', borderRadius: 8,
                  padding: '9px 20px', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', transition: 'background 0.15s, transform 0.1s',
                  boxShadow: '0 2px 14px rgba(245,158,11,0.3)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fbbf24')}
                onMouseLeave={e => (e.currentTarget.style.background = '#f59e0b')}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Get Started <ArrowRight size={15} />
              </button>

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 6 }}
                className="md:hidden"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              position: 'fixed', top: 68, left: 0, right: 0, zIndex: 40,
              background: 'rgba(17,17,17,0.98)', borderBottom: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(16px)', overflow: 'hidden',
            }}
          >
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {NAV_LINKS.map(link => (
                <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setMobileOpen(false)}
                  style={{ color: '#d1d5db', textDecoration: 'none', fontSize: 16, fontWeight: 500 }}>
                  {link}
                </a>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button onClick={() => { navigate('/login'); setMobileOpen(false) }}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '12px 0', color: '#d1d5db', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
                  Sign in
                </button>
                <button onClick={() => { navigate('/register'); setMobileOpen(false) }}
                  style={{ background: '#f59e0b', border: 'none', borderRadius: 8, padding: '12px 0', color: '#000', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
