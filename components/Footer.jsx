import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contact">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <div className="footer-brand-title">Faith Haven House</div>
            <p className="footer-brand-desc">
              A transitional living sanctuary meeting physical and spiritual needs,
              guiding unhoused men to self-sufficiency and independent homeownership.
            </p>
            <div className="footer-contact-info">
              <p><strong>Phone:</strong> 636-577-5876</p>
              <p><strong>Email:</strong> faith.haven.house@gmail.com</p>
              <p><strong>Address:</strong> 7338 Mexico Road, Saint Peters, MO 63376</p>
            </div>
          </div>

          {/* Navigation Column 1: Our Ministry & Support */}
          <div className="footer-links-col">
            <h4>Our Ministry &amp; Support</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/about/dareth-jeffers">In Loving Memory of Founder</Link></li>
              <li><Link href="/about/faq">Frequently Asked Questions (FAQ)</Link></li>
              <li><Link href="/roadmap">Rebuilding Roadmap</Link></li>
              <li><Link href="/resources">Resource Library</Link></li>
              <li><Link href="/stories">Success Stories</Link></li>
              <li><Link href="/one-away">One Away Campaign</Link></li>
            </ul>
          </div>

          {/* Navigation Column 2: Get Involved & Legal */}
          <div className="footer-links-col">
            <h4>Get Involved &amp; Connect</h4>
            <ul>
              <li><Link href="/get-help">Get Help / Pre-Screen</Link></li>
              <li><Link href="/volunteer">Volunteer Opportunities</Link></li>
              <li><Link href="/partners">Community Partners</Link></li>
              <li><Link href="/blog">Blog &amp; Journal</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/terms">Terms &amp; Conditions</Link></li>
              <li>
                <a
                  href="https://www.facebook.com/faithhavenhouse"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook Page &rarr;
                </a>
              </li>
              <li>
                <a
                  href="https://www.mealtrain.com/trains/yq254l"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Meal Train Signup &rarr;
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">
            <p>
              © 2026 Faith Haven House. All rights reserved. 501(c)(3) Non-Profit Organization.
            </p>
            <div className="footer-bottom-links">
              <Link href="/terms">Terms &amp; Conditions</Link>
              <span className="footer-link-divider">•</span>
              <Link href="/about/faq">FAQ</Link>
              <span className="footer-link-divider">•</span>
              <span className="footer-scripture">James 1:12 &quot;Blessed is the one who perseveres under trial...&quot;</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
