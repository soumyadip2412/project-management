import { motion } from 'framer-motion'
import { Layers, Users, MessageSquare, Bell, Shield, Upload } from 'lucide-react'

const FEATURES = [
  {
    icon: <Layers size={24} />,
    iconColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.12)',
    title: 'Kanban Boards & Sprints',
    desc: 'Drag-and-drop task management with sprint planning and burndown charts. Move work through your pipeline visually.',
    tag: 'Core',
  },
  {
    icon: <Users size={24} />,
    iconColor: '#6366f1', iconBg: 'rgba(99,102,241,0.12)',
    title: 'Team Workspaces',
    desc: 'Create multiple projects under one workspace. Assign roles — Admin, Project Admin, or Member.',
    tag: 'Teams',
  },
  {
    icon: <MessageSquare size={24} />,
    iconColor: '#22c55e', iconBg: 'rgba(34,197,94,0.12)',
    title: 'Threaded Comments & @Mentions',
    desc: 'Thread discussions directly on tasks, mention teammates, and resolve feedback fast.',
    tag: 'Collaboration',
  },
  {
    icon: <Bell size={24} />,
    iconColor: '#ec4899', iconBg: 'rgba(236,72,153,0.12)',
    title: 'Notifications & Activity Feed',
    desc: 'Instant notifications for task updates, mentions, and sprint events with a full activity timeline.',
    tag: 'Updates',
  },
  {
    icon: <Shield size={24} />,
    iconColor: '#8b5cf6', iconBg: 'rgba(139,92,246,0.12)',
    title: 'Role-Based Access Control',
    desc: 'Three-tier permission system with Admin, Project Admin, and Member roles for granular access control.',
    tag: 'Security',
  },
  {
    icon: <Upload size={24} />,
    iconColor: '#06b6d4', iconBg: 'rgba(6,182,212,0.12)',
    title: 'File Attachments',
    desc: 'Attach multiple files to tasks with metadata tracking. Secure upload handling with Multer middleware.',
    tag: 'Files',
  },
]

export default function FeatureGrid() {
  return (
    <section id="features" style={{ background: '#111111', padding: '100px 48px', width: '100%' }}>
      <div style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ fontSize: 12, letterSpacing: '0.12em', color: '#f59e0b', fontWeight: 700, marginBottom: 14, textTransform: 'uppercase' }}
          >
            Everything you need
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            style={{ fontSize: 'clamp(32px, 4.5vw, 48px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}
          >
            Built for teams that ship fast
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.14 }}
            style={{ fontSize: 16, color: '#9ca3af', maxWidth: 580, margin: '0 auto' }}
          >
            Everything your team needs to plan work, collaborate in real time, and deliver — in one focused product.
          </motion.p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              style={{
                padding: '32px 28px',
                background: '#161616',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                cursor: 'default',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
              whileHover={{ y: -4, borderColor: 'rgba(245,158,11,0.25)' } as any}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: f.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: f.iconColor, marginBottom: 20,
              }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: f.iconColor, marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{f.tag}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.65 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
