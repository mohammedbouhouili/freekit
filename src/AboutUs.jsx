
import "./AboutUs.css";

const features = [
  {
    icon: "📄",
    title: "PDF Tools",
    description:
      "Merge, split, and compress PDF documents with simple online tools.",
  },
  {
    icon: "🖼️",
    title: "Image Tools",
    description:
      "Compress, resize, and convert images for your everyday needs.",
  },
  {
    icon: "📝",
    title: "Text Tools",
    description:
      "Count words and characters or change text formatting in seconds.",
  },
  {
    icon: "⚡",
    title: "Utilities",
    description:
      "Generate QR codes and calculate percentages without complicated steps.",
  },
  {
    icon: "💻",
    title: "Developer Tools",
    description:
      "Format JSON and convert CSV data to JSON using convenient tools.",
  },
];

function AboutUs({ onBack }) {
  return (
    <div className="about-page">
      <div className="about-container">
        <button className="about-back" onClick={onBack}>
          ← Back to FreeKit
        </button>

        <main>
          <section className="about-hero">
            <span className="about-eyebrow">GET TO KNOW US</span>

            <h1>
              Making everyday tasks
              <br />
              <span>simpler for everyone.</span>
            </h1>

            <p>
              FreeKit brings useful online tools together in one
              convenient place. Our goal is to make common digital
              tasks easier, faster, and accessible to everyone.
            </p>

            <button className="about-primary-button" onClick={onBack}>
              Explore Our Tools ↗
            </button>
          </section>

          <section className="about-mission">
            <div className="about-mission-icon">✨</div>

            <span className="about-eyebrow">OUR MISSION</span>

            <h2>Useful tools. Less complexity.</h2>

            <p>
              Working with documents, images, and data should not
              require complicated software or unnecessary steps.
              FreeKit was created around a simple idea: bring
              practical tools together in an easy-to-use website.
            </p>

            <p>
              Whether you're a student, professional, developer,
              or someone who needs to complete a quick task,
              FreeKit is designed to help you get things done.
            </p>
          </section>

          <section className="about-features">
            <div className="about-section-heading">
              <span className="about-eyebrow">WHAT WE OFFER</span>
              <h2>One place. Many possibilities.</h2>
              <p>
                Explore tools designed to make everyday
                digital work more convenient.
              </p>
            </div>

            <div className="about-features-grid">
              {features.map((feature) => (
                <article className="about-feature-card" key={feature.title}>
                  <div className="about-feature-icon">
                    {feature.icon}
                  </div>

                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="about-values">
            <div className="about-section-heading">
              <span className="about-eyebrow">WHAT MATTERS TO US</span>
              <h2>Built around simplicity.</h2>
            </div>

            <div className="about-values-grid">
              <div className="about-value">
                <span>01</span>
                <h3>Easy to Use</h3>
                <p>
                  Straightforward interfaces that help you
                  complete tasks without confusion.
                </p>
              </div>

              <div className="about-value">
                <span>02</span>
                <h3>Accessible</h3>
                <p>
                  Free tools available directly in your
                  browser without a required subscription.
                </p>
              </div>

              <div className="about-value">
                <span>03</span>
                <h3>Continuous Improvement</h3>
                <p>
                  We're focused on improving existing tools
                  and making FreeKit more useful over time.
                </p>
              </div>
            </div>
          </section>

          <section className="about-cta">
            <span className="about-eyebrow">START EXPLORING</span>
            <h2>Your next task just got easier.</h2>
            <p>
              Discover practical online tools for your
              documents, images, text, and more.
            </p>

            <button onClick={onBack}>
              Explore FreeKit ↗
            </button>
          </section>
        </main>

        <footer className="about-footer">
          © {new Date().getFullYear()} FreeKit.
          All rights reserved.
        </footer>
      </div>
    </div>
  );
}

export default AboutUs;
