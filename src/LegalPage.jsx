
import "./PrivacyPolicy.css";

function PrivacyPolicy({ onBack }) {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <button className="privacy-back" onClick={onBack}>
          ← Back to FreeKit
        </button>

        <div className="privacy-card">
          <div className="privacy-header">
            <span className="privacy-label">LEGAL INFORMATION</span>
            <h1>Privacy <span>Policy</span></h1>
            <p>Last updated: November 3, 2026</p>
          </div>

          <div className="privacy-content">
            <p>
              Welcome to FreeKit. Your privacy matters to us.
              This Privacy Policy explains how information may
              be handled when you use our free online tools.
            </p>

            <h2>1. About FreeKit</h2>
            <p>
              FreeKit provides free online tools for PDF files,
              images, text processing, calculations, and data
              conversion.
            </p>

            <h2>2. Files and Data Processing</h2>
            <p>
              Some FreeKit tools process files and text directly
              in your browser. Processing methods may vary
              depending on the tool and the services it uses.
            </p>
            <p>
              We recommend avoiding sensitive or confidential
              information unless you understand how the
              selected tool processes your data.
            </p>

            <h2>3. Personal Information</h2>
            <p>
              You can use our tools without creating a FreeKit
              account. If you contact us by email, we may
              receive your email address and the information
              included in your message to respond to your
              request.
            </p>

            <h2>4. Cookies and Advertising</h2>
            <p>
              FreeKit may display advertisements through
              Google AdSense in the future.
            </p>
            <p>
              If advertising services are enabled, this policy
              will be updated to describe the cookies and
              related technologies they use, along with any
              applicable privacy and consent options.
            </p>

            <h2>5. Third-Party Services</h2>
            <p>
              FreeKit may use third-party services for website
              hosting, analytics, or advertising. This policy
              will be updated to identify relevant services
              when they are introduced.
            </p>

            <h2>6. Data Security</h2>
            <p>
              We aim to maintain a secure and reliable website.
              However, no website or online service can
              guarantee complete security.
            </p>

            <h2>7. Children's Privacy</h2>
            <p>
              FreeKit is designed as a general-purpose
              online toolkit and is not specifically directed
              at children.
            </p>

            <h2>8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy to reflect
              changes to our tools, services, or legal
              requirements.
            </p>

            <h2>9. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy,
              you can contact us at:
            </p>

            <a
              className="privacy-email"
              href="mailto:sbexxbohuaili@gmail.com"
            >
              ✉ sbexxbohuaili@gmail.com
            </a>
          </div>
        </div>

        <footer className="privacy-footer">
          © {new Date().getFullYear()} FreeKit.
          All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
