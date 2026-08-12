import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type NodeKey = 'user' | 'jwt' | 'rbac' | 'api' | 'core' | 'audit'

type Capability = {
  icon: string
  title: string
  copy: string
  node: NodeKey
}

const CAPABILITIES: Capability[] = [
  { icon: '🔐', title: 'Secure Authentication', copy: 'JWT access and refresh tokens.', node: 'jwt' },
  { icon: '🛡', title: 'Role-Based Access', copy: 'Permissions based on user roles.', node: 'rbac' },
  { icon: '🚦', title: 'API Protection', copy: 'Rate limiting for API requests.', node: 'api' },
  { icon: '🧾', title: 'Audit Trails', copy: 'Track important changes and actions.', node: 'audit' },
  { icon: '🔑', title: 'Credential Protection', copy: 'Bcrypt password hashing and expiring recovery tokens.', node: 'jwt' },
  { icon: '📎', title: 'File Handling', copy: 'Controlled backend upload handling.', node: 'api' },
]

const NODES: { key: NodeKey; label: string }[] = [
  { key: 'user', label: 'USER' },
  { key: 'jwt', label: 'JWT AUTH' },
  { key: 'rbac', label: 'RBAC ACCESS' },
  { key: 'api', label: 'API PROTECT' },
  { key: 'core', label: 'PROJECT CAMP' },
  { key: 'audit', label: 'AUDIT LOG' },
]

export default function SecuritySection() {
  const [litNode, setLitNode] = useState<NodeKey | null>(null)
  const [activeCap, setActiveCap] = useState<number | null>(null)
  const reduceMotion = useReducedMotion()
  const reveal = reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }

  return (
    <section id="security" className="pc-sec">
      <div className="pc-sec-wrap">
        <motion.div
          initial={reveal}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="pc-sec-intro">
            <p>Security</p>
            <h2>Security built into <span>every layer.</span></h2>
            <p>Protect your workspace with secure authentication, granular permissions, API protection, and transparent activity auditing.</p>
          </div>
        </motion.div>

        <div
          className="pc-sec-flow"
          role="group"
          aria-label="Request security pipeline: user, JWT authentication, role-based access, API protection, Project Camp core, audit log."
        >
          {NODES.map((node, i) => (
            <div key={node.key} className="pc-sec-row">
              <div className={`pc-sec-node${litNode === node.key ? ' is-lit' : ''}`}>
                <span className="pc-sec-node-label">{node.label}</span>
                <span className="pc-sec-node-status"><i /> SECURED</span>
              </div>
              {i < NODES.length - 1 && (
                <div
                  className={`pc-sec-link${litNode === node.key || litNode === NODES[i + 1].key ? ' is-lit' : ''}`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 40 36" preserveAspectRatio="none">
                    <path d="M20 0 V36" className="pc-sec-link-base" />
                    <path d="M20 0 V36" className="pc-sec-link-dash" />
                  </svg>
                  <span className="pc-sec-arrow">▾</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <motion.div
          className="pc-sec-grid"
          initial={reveal}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
        >
          {CAPABILITIES.map((cap, index) => (
            <button
              key={cap.title}
              type="button"
              className={`pc-sec-card${activeCap === index ? ' is-active' : ''}`}
              onMouseEnter={() => { setActiveCap(index); setLitNode(cap.node) }}
              onMouseLeave={() => { setActiveCap(null); setLitNode(null) }}
              onFocus={() => { setActiveCap(index); setLitNode(cap.node) }}
              onBlur={() => { setActiveCap(null); setLitNode(null) }}
            >
              <span className="pc-sec-card-icon" aria-hidden="true">{cap.icon}</span>
              <strong>{cap.title}</strong>
              <small>{cap.copy}</small>
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}