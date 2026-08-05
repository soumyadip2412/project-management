import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import TrustStrip from '../components/TrustStrip'
import FeatureGrid from '../components/FeatureGrid'
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
 *  4. FeatureGrid — 4-card feature highlights
 *  5. CTASection — bottom conversion band
 *  6. Footer     — links + copyright
 */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen" style={{ background: '#0a0a0f' }}>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <FeatureGrid />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
