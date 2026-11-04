
import { useEffect, useMemo, useState } from "react";
import "./index.css";

import PDFMerger from "./PDFMerger";
import PDFSplitter from "./PDFSplitter";
import PDFCompressor from "./PDFCompressor";
import ImageCompressor from "./ImageCompressor";
import ImageResizer from "./ImageResizer";
import ImageConverter from "./ImageConverter";
import WordCounter from "./WordCounter";
import CaseConverter from "./CaseConverter";
import QRCodeGenerator from "./QRCodeGenerator";
import PercentageCalculator from "./PercentageCalculator";
import JSONFormatter from "./JSONFormatter";
import CSVToJSON from "./CSVToJSON";

import LegalPage from "./LegalPage";
import TermsOfService from "./TermsOfService";
import ContactUs from "./ContactUs";
import AboutUs from "./AboutUs";

const tools = [
  { name: "Merge PDF", description: "Combine multiple PDF files into one document.", category: "PDF", icon: "📑", color: "green", popular: true },
  { name: "Split PDF", description: "Separate PDF pages into individual files.", category: "PDF", icon: "✂️", color: "orange" },
  { name: "Compress PDF", description: "Reduce PDF file size while keeping quality.", category: "PDF", icon: "📦", color: "purple", popular: true },
  { name: "Image Compressor", description: "Make your images smaller without losing quality.", category: "Images", icon: "🖼️", color: "blue", popular: true },
  { name: "Image Resizer", description: "Resize images to your preferred dimensions.", category: "Images", icon: "📐", color: "pink" },
  { name: "Image Converter", description: "Convert JPG, PNG and WebP images easily.", category: "Images", icon: "🔄", color: "green" },
  { name: "Word Counter", description: "Count words, characters and sentences instantly.", category: "Text", icon: "📝", color: "orange", popular: true },
  { name: "Case Converter", description: "Change text to uppercase or lowercase.", category: "Text", icon: "🔠", color: "purple" },
  { name: "QR Code Generator", description: "Create QR codes for links, text and Wi-Fi.", category: "Utilities", icon: "▦", color: "blue", popular: true },
  { name: "Percentage Calculator", description: "Calculate percentages quickly and easily.", category: "Utilities", icon: "％", color: "pink" },
  { name: "JSON Formatter", description: "Format and validate your JSON data.", category: "Developer", icon: "{ }", color: "green" },
  { name: "CSV to JSON", description: "Convert CSV data into JSON format.", category: "Developer", icon: "📊", color: "orange" },
];

const categories = [
  "All Tools", "PDF", "Images", "Text", "Utilities", "Developer"
];

const toolComponents = {
  "Merge PDF": PDFMerger,
  "Split PDF": PDFSplitter,
  "Compress PDF": PDFCompressor,
  "Image Compressor": ImageCompressor,
  "Image Resizer": ImageResizer,
  "Image Converter": ImageConverter,
  "Word Counter": WordCounter,
  "Case Converter": CaseConverter,
  "QR Code Generator": QRCodeGenerator,
  "Percentage Calculator": PercentageCalculator,
  "JSON Formatter": JSONFormatter,
  "CSV to JSON": CSVToJSON,
};

const pageMeta = {
  "/": {
    title: "FreeKit - Free Online PDF, Image & Text Tools",
    description: "Free online PDF, image, text and developer tools. Merge PDFs, resize images, count words, generate QR codes and more.",
  },
  "/about": {
    title: "About Us | FreeKit",
    description: "Learn about FreeKit and our mission to make everyday digital tasks simpler with free online tools.",
  },
  "/contact": {
    title: "Contact Us | FreeKit",
    description: "Contact FreeKit with questions, suggestions, feedback or problems with our free online tools.",
  },
  "/privacy": {
    title: "Privacy Policy | FreeKit",
    description: "Read the FreeKit Privacy Policy and learn about privacy and data handling.",
  },
  "/terms": {
    title: "Terms of Service | FreeKit",
    description: "Read the terms and conditions for using FreeKit's free online tools.",
  },
};

function App() {
  const [path, setPath] = useState(window.location.pathname);
  const [activeTool, setActiveTool] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Tools");

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
      setActiveTool(null);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const meta = pageMeta[path] || pageMeta["/"];

    document.title = meta.title;

    let description = document.querySelector(
      'meta[name="description"]'
    );

    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }

    description.content = meta.description;
  }, [path]);

  const navigate = (newPath) => {
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, "", newPath);
    }

    setPath(newPath);
    setActiveTool(null);
    window.scrollTo(0, 0);
  };

  const goHome = () => navigate("/");

  const openTool = (name) => {
    if (path !== "/") {
      window.history.pushState({}, "", "/");
      setPath("/");
    }

    setActiveTool(name);
    window.scrollTo(0, 0);
  };

  const filteredTools = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesCategory =
        category === "All Tools" || tool.category === category;

      const matchesSearch =
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const scrollToTools = () => {
    document.getElementById("tools")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (path === "/about") {
    return <AboutUs onBack={goHome} />;
  }

  if (path === "/contact") {
    return <ContactUs onBack={goHome} />;
  }

  if (path === "/privacy") {
    return <LegalPage onBack={goHome} />;
  }

  if (path === "/terms") {
    return <TermsOfService onBack={goHome} />;
  }

  if (activeTool && toolComponents[activeTool]) {
    const ToolComponent = toolComponents[activeTool];
    return <ToolComponent onBack={goHome} />;
  }

  return (
    <div className="app">
      <header className="navbar">
        <a
          href="/"
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            goHome();
          }}
        >
          <span className="logo-icon">F</span>
          <span>
            FreeKit<span className="logo-dot">.</span>
          </span>
        </a>

        <nav className="nav-links">
          <a href="#tools">All Tools</a>
          <a href="#popular">Popular</a>
          <a
            href="/about"
            onClick={(e) => {
              e.preventDefault();
              navigate("/about");
            }}
          >
            About
          </a>
        </nav>

        <a href="#tools" className="nav-button">
          Explore Tools <span>↗</span>
        </a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-badge">
            <span className="live-dot"></span>
            YOUR EVERYDAY TOOLKIT
          </div>

          <h1>
            Everything you need.
            <br />
            <span>Nothing you don't.</span>
          </h1>

          <p className="hero-description">
            Powerful, simple and free online tools to make
            your everyday tasks easier. No downloads.
            No complicated setup.
          </p>

          <div className="search-box">
            <span className="search-icon">⌕</span>

            <input
              type="text"
              placeholder="What do you want to do today?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") scrollToTools();
              }}
            />

            <button onClick={scrollToTools}>
              Search
            </button>
          </div>

          <div className="hero-trust">
            <span>✓ Free to use</span>
            <span>✓ No registration</span>
            <span>✓ Simple & fast</span>
          </div>

          <div className="hero-decoration decoration-one"></div>
          <div className="hero-decoration decoration-two"></div>
        </section>

        <section className="tools-section" id="tools">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                EXPLORE OUR TOOLKIT
              </span>

              <h2>Find the right tool for the job.</h2>

              <p>
                Everything in one place, ready when you need it.
              </p>
            </div>

            <span className="tool-count">
              {filteredTools.length} tools
            </span>
          </div>

          <div className="category-list">
            {categories.map((item) => (
              <button
                key={item}
                className={`category-button ${
                  category === item ? "active" : ""
                }`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="tools-grid">
            {filteredTools.map((tool) => (
              <article
                className="tool-card"
                key={tool.name}
                role="button"
                tabIndex={0}
                onClick={() => openTool(tool.name)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" ||
                    e.key === " "
                  ) {
                    e.preventDefault();
                    openTool(tool.name);
                  }
                }}
              >
                <div className={`tool-icon ${tool.color}`}>
                  {tool.icon}
                </div>

                {tool.popular && (
                  <span className="popular-tag">
                    POPULAR
                  </span>
                )}

                <h3>{tool.name}</h3>
                <p>{tool.description}</p>

                <div className="tool-card-footer">
                  <span>{tool.category}</span>
                  <span className="card-arrow">↗</span>
                </div>
              </article>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="empty-state">
              <span>🔎</span>
              <h3>No tools found</h3>
              <p>
                Try another search or choose a different category.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All Tools");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        <section className="benefits-section" id="about">
          <div className="benefits-heading">
            <span className="eyebrow">
              WHY FREEKIT?
            </span>

            <h2>Less hassle. More done.</h2>

            <p>
              Useful tools designed around your everyday needs.
            </p>
          </div>

          <div className="benefits-grid">
            <div className="benefit">
              <span>⚡</span>
              <h3>Fast & Simple</h3>
              <p>
                Get things done without unnecessary steps.
              </p>
            </div>

            <div className="benefit">
              <span>🔓</span>
              <h3>Free to Use</h3>
              <p>
                Access useful tools without a subscription.
              </p>
            </div>

            <div className="benefit">
              <span>📱</span>
              <h3>Works Everywhere</h3>
              <p>
                Enjoy a smooth experience on any device.
              </p>
            </div>
          </div>
        </section>

        <section className="bottom-cta">
          <div>
            <span className="eyebrow">
              YOUR PRODUCTIVITY STARTS HERE
            </span>

            <h2>Ready to get things done?</h2>

            <p>
              Find your tool and make your next task easier.
            </p>
          </div>

          <a href="#tools">
            Explore all tools ↗
          </a>
        </section>
      </main>

      <footer className="footer">
        <a
          href="/"
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            goHome();
          }}
        >
          <span className="logo-icon">F</span>
          <span>
            FreeKit<span className="logo-dot">.</span>
          </span>
        </a>

        <p>Simple tools for everyday work.</p>

        <div className="footer-links">
          <a href="#tools">Tools</a>

          <a
            href="/about"
            onClick={(e) => {
              e.preventDefault();
              navigate("/about");
            }}
          >
            About Us
          </a>

          <a
            href="/privacy"
            onClick={(e) => {
              e.preventDefault();
              navigate("/privacy");
            }}
          >
            Privacy Policy
          </a>

          <a
            href="/terms"
            onClick={(e) => {
              e.preventDefault();
              navigate("/terms");
            }}
          >
            Terms of Service
          </a>

          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              navigate("/contact");
            }}
          >
            Contact Us
          </a>
        </div>

        <span className="copyright">
          © {new Date().getFullYear()} FreeKit.
          All rights reserved.
        </span>
      </footer>
    </div>
  );
}

export default App;
