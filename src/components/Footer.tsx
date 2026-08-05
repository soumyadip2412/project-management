import { Link } from 'react-router-dom'
import GithubIcon from './icons/github-icon'


const FOOTER_COLS = {
  Product: ['Features', 'Architecture', 'Security', 'Pricing', 'Changelog'],
  Company: ['About', 'Blog', 'Careers', 'Contact'],
  Legal: ['Privacy', 'Terms', 'Cookies', 'Security'],
}

export default function Footer() {
  return (
    <footer style={{
      background: '#0a0a0a',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '64px 48px 36px',
      width: '100%',
      fontFamily: 'inherit'
    }}>
      <div style={{ width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 56 }}
          className="footer-grid">

          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
              <div style={{ width: 30, height: 30, borderRadius: 6, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="black"><polygon points="13,2 4,14 12,14 11,22 20,10 12,10" /></svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>Project Camp</span>
            </Link>
            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, maxWidth: 280, marginBottom: 24 }}>
              Project management built for high-performing teams. Plan, collaborate, and ship.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="https://github.com/soumyadip2412/project-management/" target="_blank" rel="noreferrer"
                style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
              >
                <GithubIcon size={25} />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_COLS).map(([col, links]) => (
            <div key={col}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
                {col}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {links.map(link => (
                  <a key={link} href="#"
                    style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontSize: 13, color: '#6b7280' }}>
            © {new Date().getFullYear()} Project Camp, Inc. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            All systems operational
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  )
}
