import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import TrustStrip from '../components/TrustStrip'
import FeatureGrid from '../components/FeatureGrid'
import SecuritySection from '../components/SecuritySection'
import CTASection from '../components/CTASection'
import Footer from '../components/Footer'

/**
 * LandingPage — public marketing homepage for ProjectCamp.
 * Route: /
 *
 * Structure:
 *  1. Navbar     — sticky, transparent→solid on scroll
 *  2. Hero       — headline + CTAs + Kanban board mock
 *  3. TrustStrip — social proof / stats / tech stack
 *  4. FeatureGrid — interactive two-column feature explorer
 *  5. Security   — layered security architecture diagram
 *  6. CTASection — bottom conversion band
 *  7. Footer     — links + copyright
 */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <FeatureGrid />
        <SecuritySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
