import { Link } from 'react-router-dom'
import {
  MapPin,
  Search,
  ClipboardList,
  Users,
  ArrowRight,
  ShieldCheck,
  Navigation,
  HeartHandshake,
} from 'lucide-react'

import '../styles/Landing.css'

export default function Landing() {
  return (
    <div className="landing-page">

      {/* NAVBAR */}
      <nav className="landing-navbar">
        <Link to="/" className="landing-brand">
          <div className="landing-brand-icon">
            <MapPin size={23} />
          </div>
          <span>TraceBack</span>
        </Link>

        <div className="landing-nav-links">
          <a href="#home">Home</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
        </div>

        <div className="landing-nav-actions">
          <Link to="/login" className="landing-signin">
            Sign In
          </Link>

          <Link to="/login" className="landing-register">
            Register <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="landing-hero" id="home">

        <div className="landing-hero-content">

          <div className="landing-eyebrow">
            <span className="landing-status-dot" />
            A smarter way to reconnect
          </div>

          <h1>
            Lost something?
            <br />
            <span>Let's bring it back.</span>
          </h1>

          <p>
            A simple platform to report lost belongings,
            discover found items and reconnect people
            with the things that matter.
          </p>

          <div className="landing-hero-actions">
            <Link to="/login" className="landing-primary-btn">
              Get Started <ArrowRight size={17} />
            </Link>

            <a href="#how-it-works" className="landing-secondary-btn">
              Learn More
            </a>
          </div>

          <div className="landing-trust-note">
            <ShieldCheck size={16} />
            Simple. Community-driven. Accessible.
          </div>

        </div>

        {/* HERO VISUAL */}
        <div className="landing-hero-visual">

          <div className="landing-visual-card">

            <div className="landing-visual-header">
              <div>
                <span>TRACEBACK MAP</span>
                <h3>Find what matters.</h3>
              </div>

              <div className="landing-map-icon">
                <Navigation size={19} />
              </div>
            </div>

            <div className="landing-map-illustration">
              <div className="map-grid" />

              <div className="map-road road-one" />
              <div className="map-road road-two" />
              <div className="map-road road-three" />

              <div className="map-pin pin-one">
                <MapPin size={22} />
              </div>

              <div className="map-pin pin-two">
                <MapPin size={22} />
              </div>

              <div className="map-pin pin-three">
                <MapPin size={22} />
              </div>

              <div className="map-location-label">
                <span />
                Reported location
              </div>
            </div>

            <div className="landing-visual-footer">
              <div className="landing-footer-icon">
                <Search size={19} />
              </div>
              <div>
                <strong>Search. Discover. Reconnect.</strong>
                <span>Everything starts with a report.</span>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="landing-section" id="how-it-works">

        <div className="landing-section-heading">
          <span className="landing-section-label">HOW IT WORKS</span>
          <h2>Three steps to reconnect.</h2>
          <p>
            We've made the lost-and-found process
            simple and straightforward.
          </p>
        </div>

        <div className="landing-steps">

          <div className="landing-step-card">
            <div className="landing-step-number">01</div>
            <div className="landing-step-icon">
              <ClipboardList size={23} />
            </div>
            <h3>Report an Item</h3>
            <p>
              Submit details about an item you've lost
              or found, including its location.
            </p>
          </div>

          <div className="landing-step-card">
            <div className="landing-step-number">02</div>
            <div className="landing-step-icon">
              <Search size={23} />
            </div>
            <h3>Discover Items</h3>
            <p>
              Explore lost and found listings and
              find items reported by your community.
            </p>
          </div>

          <div className="landing-step-card">
            <div className="landing-step-number">03</div>
            <div className="landing-step-icon">
              <HeartHandshake size={23} />
            </div>
            <h3>Reconnect</h3>
            <p>
              View the reporter's contact information
              and get in touch to recover the item.
            </p>
          </div>

        </div>

      </section>

      {/* FEATURES */}
      <section className="landing-features" id="features">

        <div className="landing-section-heading">
          <span className="landing-section-label">WHY TRACEBACK</span>
          <h2>Built to bring people together.</h2>
          <p>
            Everything you need to make finding lost
            belongings easier.
          </p>
        </div>

        <div className="landing-feature-grid">

          <div className="landing-feature">
            <MapPin size={21} />
            <div>
              <h3>Location-based discovery</h3>
              <p>Pinpoint where items were lost or found.</p>
            </div>
          </div>

          <div className="landing-feature">
            <Navigation size={21} />
            <div>
              <h3>Interactive map</h3>
              <p>Explore reports through an interactive map.</p>
            </div>
          </div>

          <div className="landing-feature">
            <Search size={21} />
            <div>
              <h3>Easy item discovery</h3>
              <p>Browse and filter lost and found listings.</p>
            </div>
          </div>

          <div className="landing-feature">
            <Users size={21} />
            <div>
              <h3>Community-driven</h3>
              <p>Help people reconnect with their belongings.</p>
            </div>
          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="landing-cta">

        <div>
          <span>BE PART OF THE COMMUNITY</span>
          <h2>Every lost item deserves a chance to be found.</h2>
          <p>Join TraceBack and help make a difference.</p>
        </div>

        <Link to="/login" className="landing-primary-btn">
          Get Started <ArrowRight size={17} />
        </Link>

      </section>

      {/* FOOTER */}
      <footer className="landing-footer">

        <Link to="/" className="landing-brand">
          <div className="landing-brand-icon">
            <MapPin size={21} />
          </div>
          <span>TraceBack</span>
        </Link>

        <p>
          Helping people reconnect with what matters.
        </p>

        <span className="landing-copyright">
          © {new Date().getFullYear()} TraceBack. All rights reserved.
        </span>

      </footer>

    </div>
  )
}