
import "./TermsOfService.css";

function TermsOfService({ onBack }) {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <button className="terms-back" onClick={onBack}>
          ← Back to FreeKit
        </button>

        <main className="terms-card">
          <header className="terms-header">
            <span className="terms-label">LEGAL INFORMATION</span>
            <h1>Terms of <span>Service</span></h1>
            <p>Last updated: November 4, 2026</p>
          </header>

          <div className="terms-content">
            <p>
              Welcome to FreeKit. These Terms of Service explain
              the conditions for using our website and free
              online tools. By accessing or using FreeKit,
              you agree to these terms.
            </p>

            <h2>1. About FreeKit</h2>
            <p>
              FreeKit provides online tools for working with
              PDF documents, images, text, calculations,
              QR codes, and structured data.
            </p>

            <h2>2. Permitted Use</h2>
            <p>
              You may use FreeKit for lawful personal or
              professional purposes. You agree not to use
              the website to violate applicable laws,
              infringe intellectual property rights,
              or interfere with its operation.
            </p>

            <h2>3. Your Files and Content</h2>
            <p>
              You are responsible for ensuring that you have
              the necessary rights and permissions to process
              any files, images, text, or other content
              using FreeKit.
            </p>
            <p>
              You remain responsible for your content and
              for reviewing any files or results produced
              by our tools.
            </p>

            <h2>4. Accuracy of Results</h2>
            <p>
              We aim to provide useful and reliable tools,
              but conversion, compression, extraction,
              and calculation results may contain errors.
              Please verify important results before use.
            </p>

            <h2>5. Service Availability</h2>
            <p>
              FreeKit may update, modify, suspend, or
              discontinue tools or features as the
              website develops. Continuous availability
              is not guaranteed.
            </p>

            <h2>6. No Warranties</h2>
            <p>
              To the extent permitted by applicable law,
              FreeKit is provided on an "as is" and
              "as available" basis, without warranties
              of uninterrupted service or error-free results.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              To the extent permitted by applicable law,
              FreeKit is not responsible for losses arising
              from reliance on inaccurate outputs,
              service interruptions, or misuse of its tools.
              Nothing in these terms excludes liability
              that cannot legally be excluded.
            </p>

            <h2>8. Third-Party Services</h2>
            <p>
              FreeKit may use third-party services for
              hosting, analytics, or advertising.
              Those services may have their own
              terms and privacy policies.
            </p>

            <h2>9. Changes to These Terms</h2>
            <p>
              We may update these Terms of Service.
              Changes will be reflected on this page
              with an updated revision date.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about these terms,
              please contact:
            </p>

            <a
              className="terms-email"
              href="mailto:sbexxbohuaili@gmail.com"
            >
              ✉ sbexxbohuaili@gmail.com
            </a>
          </div>
        </main>

        <footer className="terms-footer">
          © {new Date().getFullYear()} FreeKit.
          All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default TermsOfService;
