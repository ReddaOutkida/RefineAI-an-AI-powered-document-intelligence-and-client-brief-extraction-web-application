import Link from "next/link"
import "./about.css"

export default function AboutPage() {
  return (
    <main className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="about-badge">✨ About RefineAI</div>
          <h1 className="about-title">
            Smart Document Analysis <span className="about-title-gradient">Made Simple</span>
          </h1>
          <p className="about-description">
            RefineAI is a smart document analysis tool built to simplify how professionals interact with complex or
            unstructured client files.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="about-content">
        <div className="about-container">
          {/* What is RefineAI */}
          <div className="about-section">
            <div className="about-section-header">
              <div className="about-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10,9 9,9 8,9" />
                </svg>
              </div>
              <h2>What is RefineAI?</h2>
            </div>
            <p>
              Whether it's a project brief, a scanned document, or a technical request, RefineAI helps you turn raw
              inputs into clear, actionable insights fast.
            </p>
            <p>At its core, RefineAI allows users to upload documents and generate structured insights such as:</p>
            <ul className="about-features">
              <li>
                <span className="feature-icon">📄</span>
                <span>Summaries and cleaned content</span>
              </li>
              <li>
                <span className="feature-icon">🎯</span>
                <span>Key points and classification</span>
              </li>
              <li>
                <span className="feature-icon">💡</span>
                <span>Actionable suggestions and tech recommendations</span>
              </li>
              <li>
                <span className="feature-icon">🌐</span>
                <span>Language detection and intelligent tagging</span>
              </li>
            </ul>
            <p>
              Once processed, users can view and save their refined documents directly in the MyDocs section for future
              access.
            </p>
          </div>

          {/* Why RefineAI */}
          <div className="about-section">
            <div className="about-section-header">
              <div className="about-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4" />
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
                  <path d="M13 12h3a2 2 0 0 1 2 2v1" />
                  <path d="M11 12H8a2 2 0 0 0-2 2v1" />
                </svg>
              </div>
              <h2>Why RefineAI?</h2>
            </div>
            <p>
              The idea behind RefineAI is simple: client documents are often messy, unclear, or time-consuming to
              analyze. RefineAI removes that friction by using AI to automate understanding so you can focus on
              building, planning, or decision-making.
            </p>
            <p>
              It's designed with developers, agencies, and project managers in mind—basically anyone who works with
              input documents and needs fast clarity.
            </p>
          </div>

          {/* Built at Acrative */}
          <div className="about-section acrative-section">
            <div className="about-section-header">
              <div className="about-icon acrative-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                  <path d="M2 17L12 22L22 17" />
                  <path d="M2 12L12 17L22 12" />
                </svg>
              </div>
              <h2>Built at Acrative</h2>
            </div>
            <p>
              This project was developed by <strong>Redda Outkida</strong> during an internship at{" "}
              <strong>Acrative</strong>, a company that embodies innovation, flexibility, and craftsmanship in the
              digital space.
            </p>
            <blockquote className="acrative-quote">
              "Crafting Digital Futures" isn't just a motto; it reflects how Acrative works. From day one, I was
              encouraged to turn a rough idea into a real tool that solves real problems. RefineAI is the result of that
              opportunity.
            </blockquote>
            <p>
              Acrative specializes in creating modern applications, from AI-powered tools to full-scale platforms. Their
              collaborative and impact-driven culture made building RefineAI a hands-on, empowering learning experience.
            </p>
          </div>

          {/* Contact Section */}
          <div className="about-section contact-section">
            <div className="about-section-header">
              <div className="about-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2>Want to Get in Touch?</h2>
            </div>
            <p>
              If you have feedback, ideas, or need support, feel free to reach out to me at{" "}
              <a href="mailto:reddaoutkidaa@gmail.com" className="contact-email">
                reddaoutkidaa@gmail.com
              </a>
            </p>
            <p className="thank-you">Thank you for using RefineAI.</p>
          </div>

          {/* CTA Section */}
          <div className="about-cta">
            <h3>Ready to refine your documents?</h3>
            <p>Start analyzing your documents with AI-powered insights today.</p>
            <Link href="/" className="cta-button">
              <span>Try RefineAI Now</span>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
} 