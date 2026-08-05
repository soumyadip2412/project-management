import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  const navigate = useNavigate()

  return (
    <section style={{ background: '#111111', padding: '80px 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: 680, margin: '0 auto', textAlign: 'center',
          padding: '56px 40px',
          background: '#161616',
          border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: 20,
          boxShadow: '0 0 60px rgba(245,158,11,0.06)',
        }}
      >
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 14 }}>
          Ready to get <span style={{ color: '#f59e0b' }}>started?</span>
        </h2>
        <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 32px' }}>
          Join hundreds of teams already using Project Camp. Free plan includes 3 projects, 5 members, unlimited tasks.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#f59e0b', color: '#000',
              border: 'none', borderRadius: 8, padding: '12px 24px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fbbf24')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f59e0b')}
          >
            Sign up free <ArrowRight size={14} />
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'rgba(255,255,255,0.05)', color: '#9ca3af',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '12px 24px',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            Sign in
          </button>
        </div>
      </motion.div>
    </section>
  )
}
