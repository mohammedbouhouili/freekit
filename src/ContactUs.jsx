
import "./ContactUs.css";

const CONTACT_EMAIL = "sbexxbohuaili@gmail.com";

function ContactUs({ onBack }) {
  const handleEmail = (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const subject = String(data.get("subject") || "").trim();
    const message = String(data.get("message") || "").trim();

    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      message,
    ].join("\n");

    const url =
      `mailto:${CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent(`[FreeKit] ${subject}`)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = url;
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <button className="contact-back" onClick={onBack}>
          ← Back to FreeKit
        </button>

        <header className="contact-header">
          <span className="contact-eyebrow">GET IN TOUCH</span>
          <h1>
            Contact <span>Us.</span>
          </h1>
          <p>
            Have a question, suggestion, or found an issue
            with one of our tools? We'd love to hear from you.
          </p>
        </header>

        <main className="contact-layout">
          <section className="contact-card">
            <span className="contact-label">SEND A MESSAGE</span>
            <h2>How can we help?</h2>
            <p className="contact-muted">
              Fill in the form below to prepare an email
              using your email application.
            </p>

            <form onSubmit={handleEmail}>
              <div className="contact-fields">
                <div className="contact-field">
                  <label htmlFor="contact-name">Your name</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-email">Email address</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    maxLength={254}
                    required
                  />
                </div>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-subject">Subject</label>
                <select
                  id="contact-subject"
                  name="subject"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Select a subject
                  </option>
                  <option value="General question">
                    General question
                  </option>
                  <option value="Report a problem">
                    Report a problem
                  </option>
                  <option value="Feature suggestion">
                    Feature suggestion
                  </option>
                  <option value="Privacy request">
                    Privacy request
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">Your message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={7}
                  maxLength={5000}
                  placeholder="Tell us how we can help..."
                  required
                />
              </div>

              <button className="contact-submit" type="submit">
                Open Email App ↗
              </button>

              <p className="contact-form-note">
                This form does not send messages automatically.
                It opens your email application so you can
                review and send your message.
              </p>
            </form>
          </section>

          <aside className="contact-sidebar">
            <div className="contact-info-card">
              <div className="contact-info-icon">✉</div>
              <h2>Email us directly</h2>
              <p>
                Prefer email? You can reach us directly
                using the address below.
              </p>
              <a href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">💡</div>
              <h2>Feedback & suggestions</h2>
              <p>
                Your feedback helps us improve FreeKit.
                Tell us which tools you find useful and
                what you'd like to see next.
              </p>
            </div>

            <div className="contact-help">
              <span>ABOUT FREEKIT</span>
              <h3>Simple tools. Better productivity.</h3>
              <p>
                FreeKit brings useful PDF, image, text,
                and developer tools together in one place.
              </p>
            </div>
          </aside>
        </main>

        <footer className="contact-footer">
          © {new Date().getFullYear()} FreeKit.
          All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default ContactUs;
