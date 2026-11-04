
import { useEffect, useRef, useState } from "react";

export default function ImageCompressor({ onBack }) {
  const [image, setImage] = useState(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("image/webp");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef(null);
  const resultUrlRef = useRef(null);
  const originalUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
    };
  }, []);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleImage = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setError("Image is too large. Maximum file size is 30 MB.");
      return;
    }

    if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);

    originalUrlRef.current = URL.createObjectURL(file);
    resultUrlRef.current = null;

    setImage({
      file,
      url: originalUrlRef.current,
      size: file.size,
    });

    setResult(null);
    setError("");
  };

  const compressImage = () => {
    if (!image || loading) return;

    setLoading(true);
    setError("");

    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setError("Your browser could not process this image.");
        setLoading(false);
        return;
      }

      if (format === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Compression failed. Please try another image.");
            setLoading(false);
            return;
          }

          if (resultUrlRef.current) {
            URL.revokeObjectURL(resultUrlRef.current);
          }

          const url = URL.createObjectURL(blob);
          resultUrlRef.current = url;

          setResult({
            blob,
            url,
            size: blob.size,
            width: img.naturalWidth,
            height: img.naturalHeight,
            type: blob.type,
          });

          setLoading(false);
        },
        format,
        quality / 100
      );
    };

    img.onerror = () => {
      setError("Unable to read this image. Please try another file.");
      setLoading(false);
    };

    img.src = image.url;
  };

  const downloadImage = () => {
    if (!result) return;

    const extension =
      result.type === "image/jpeg" ? "jpg" :
      result.type === "image/png" ? "png" : "webp";

    const link = document.createElement("a");
    link.href = result.url;
    link.download = `freekit-compressed.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const savings = result && image
    ? Math.round((1 - result.size / image.size) * 100)
    : 0;

  return (
    <div className="ic-page">
      <style>{`
        .ic-page {
          min-height: 100vh;
          background: #f6f8f5;
          color: #18251e;
          font-family: 'DM Sans', sans-serif;
          padding: 0 24px 70px;
        }
        .ic-topbar {
          max-width: 1120px;
          margin: auto;
          height: 82px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e6ebe5;
        }
        .ic-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #18251e;
          font-size: 21px;
          font-weight: 800;
          text-decoration: none;
        }
        .ic-brand-icon {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          color: white;
          background: #218653;
        }
        .ic-brand-dot { color: #218653; }
        .ic-back {
          border: 1px solid #e0e7df;
          background: white;
          color: #46564b;
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: .2s;
        }
        .ic-back:hover { border-color: #218653; color: #218653; }
        .ic-container { max-width: 1000px; margin: auto; }
        .ic-heading {
          text-align: center;
          padding: 55px 0 35px;
        }
        .ic-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 13px;
          border-radius: 30px;
          background: #e7f4eb;
          color: #218653;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .ic-heading h1 {
          font-size: clamp(30px, 5vw, 46px);
          letter-spacing: -2px;
          margin: 18px 0 12px;
          font-weight: 800;
        }
        .ic-heading h1 span { color: #218653; }
        .ic-heading p {
          color: #78847b;
          font-size: 15px;
          line-height: 1.7;
          margin: 0;
        }
        .ic-card {
          background: white;
          border: 1px solid #e8eee7;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 12px 40px rgba(26, 55, 34, .045);
        }
        .ic-upload {
          min-height: 225px;
          border: 2px dashed #cbdccc;
          background: #f8fbf7;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          cursor: pointer;
          transition: .2s;
          padding: 25px;
        }
        .ic-upload:hover, .ic-upload.dragging {
          background: #eff8f0;
          border-color: #218653;
        }
        .ic-upload-icon {
          width: 55px;
          height: 55px;
          border-radius: 17px;
          background: #e3f3e7;
          color: #218653;
          display: grid;
          place-items: center;
          font-size: 26px;
          margin-bottom: 15px;
        }
        .ic-upload strong { font-size: 17px; }
        .ic-upload p {
          color: #7e8980;
          font-size: 13px;
          margin: 8px 0 13px;
        }
        .ic-browse {
          color: #218653;
          font-weight: 800;
          font-size: 13px;
        }
        .ic-format-note {
          font-size: 11px;
          color: #a0aaa1;
          margin-top: 15px;
        }
        .ic-file-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 22px;
          padding: 14px;
          background: #f7faf6;
          border: 1px solid #e9eee8;
          border-radius: 13px;
        }
        .ic-file-row img {
          width: 55px;
          height: 55px;
          border-radius: 9px;
          object-fit: cover;
        }
        .ic-file-info { min-width: 0; flex: 1; }
        .ic-file-info strong {
          display: block;
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ic-file-info span {
          color: #829087;
          font-size: 12px;
          display: block;
          margin-top: 5px;
        }
        .ic-change {
          border: 0;
          background: transparent;
          color: #218653;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
        }
        .ic-settings {
          margin-top: 28px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }
        .ic-setting label {
          font-size: 13px;
          font-weight: 800;
          display: block;
          margin-bottom: 12px;
        }
        .ic-quality-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ic-quality-value {
          color: #218653;
          background: #e8f5eb;
          border-radius: 7px;
          padding: 5px 9px;
          font-size: 12px;
          font-weight: 800;
        }
        .ic-setting input[type="range"] {
          width: 100%;
          accent-color: #218653;
          cursor: pointer;
        }
        .ic-range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #9aa49c;
          margin-top: 4px;
        }
        .ic-select {
          width: 100%;
          height: 43px;
          padding: 0 12px;
          border: 1px solid #e1e9df;
          background: #fafcf9;
          border-radius: 9px;
          font-size: 13px;
          color: #26372b;
          outline: none;
        }
        .ic-select:focus { border-color: #218653; }
        .ic-compress {
          width: 100%;
          margin-top: 28px;
          height: 52px;
          border: 0;
          border-radius: 11px;
          background: #218653;
          color: white;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: .2s;
        }
        .ic-compress:hover { background: #176d41; transform: translateY(-1px); }
        .ic-compress:disabled { opacity: .6; cursor: wait; transform: none; }
        .ic-error {
          background: #fff0ef;
          color: #bd443d;
          border-radius: 9px;
          padding: 12px;
          font-size: 13px;
          margin-top: 15px;
        }
        .ic-results { margin-top: 35px; }
        .ic-results-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }
        .ic-results-heading h2 { font-size: 19px; margin: 0; }
        .ic-success {
          background: #e7f5e9;
          color: #218653;
          padding: 7px 11px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 800;
        }
        .ic-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .ic-stat {
          background: #f7faf6;
          border: 1px solid #e9eee8;
          border-radius: 12px;
          padding: 16px;
        }
        .ic-stat span {
          display: block;
          font-size: 11px;
          color: #829087;
          margin-bottom: 8px;
        }
        .ic-stat strong { font-size: 19px; }
        .ic-stat.highlight strong { color: #218653; }
        .ic-previews {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .ic-preview {
          border: 1px solid #e8eee7;
          border-radius: 13px;
          overflow: hidden;
          background: #fafcf9;
        }
        .ic-preview img {
          display: block;
          width: 100%;
          height: 230px;
          object-fit: contain;
          padding: 12px;
        }
        .ic-preview-footer {
          padding: 13px 15px;
          border-top: 1px solid #e8eee7;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 12px;
        }
        .ic-preview-footer strong { font-size: 12px; }
        .ic-preview-footer span { color: #829087; }
        .ic-download {
          width: 100%;
          height: 52px;
          margin-top: 20px;
          border: 0;
          border-radius: 11px;
          background: #182d20;
          color: white;
          font-weight: 800;
          font-size: 14px;
          cursor: pointer;
          transition: .2s;
        }
        .ic-download:hover { background: #218653; }
        .ic-note {
          text-align: center;
          color: #8a968d;
          font-size: 12px;
          margin-top: 22px;
        }
        .ic-note span { color: #218653; }
        @media(max-width: 650px) {
          .ic-page { padding: 0 14px 45px; }
          .ic-topbar { height: 68px; }
          .ic-heading { padding: 40px 0 28px; }
          .ic-card { padding: 17px; }
          .ic-settings { grid-template-columns: 1fr; gap: 20px; }
          .ic-stats { grid-template-columns: 1fr; }
          .ic-stat { padding: 12px; }
          .ic-stat strong { font-size: 17px; }
          .ic-previews { grid-template-columns: 1fr; }
          .ic-preview img { height: 210px; }
        }
      `}</style>

      <header className="ic-topbar">
        <a href="#" className="ic-brand" onClick={(e) => {
          e.preventDefault();
          onBack?.();
        }}>
          <span className="ic-brand-icon">F</span>
          <span>FreeKit<span className="ic-brand-dot">.</span></span>
        </a>
        <button className="ic-back" onClick={onBack}>← Back to tools</button>
      </header>

      <div className="ic-container">
        <section className="ic-heading">
          <span className="ic-badge">✦ FREE ONLINE TOOL</span>
          <h1>Image <span>Compressor</span></h1>
          <p>Reduce image file sizes without unnecessary complexity.<br />
            Fast, simple and secure — right in your browser.</p>
        </section>

        <section className="ic-card">
          <label
            className={`ic-upload ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleImage(e.dataTransfer.files[0]);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              hidden
              onChange={(e) => {
                handleImage(e.target.files[0]);
                e.target.value = "";
              }}
            />
            <span className="ic-upload-icon">↑</span>
            <strong>Drop your image here</strong>
            <p>Drag and drop your file or browse from your device</p>
            <span className="ic-browse">Browse image</span>
            <span className="ic-format-note">JPG, PNG, WebP or GIF · Maximum 30 MB</span>
          </label>

          {image && (
            <>
              <div className="ic-file-row">
                <img src={image.url} alt="Original" />
                <div className="ic-file-info">
                  <strong>{image.file.name}</strong>
                  <span>{formatSize(image.size)} · Original image</span>
                </div>
                <button className="ic-change" onClick={() => inputRef.current?.click()}>
                  Change
                </button>
              </div>

              <div className="ic-settings">
                <div className="ic-setting">
                  <div className="ic-quality-line">
                    <label>Compression quality</label>
                    <span className="ic-quality-value">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => {
                      setQuality(Number(e.target.value));
                      setResult(null);
                    }}
                  />
                  <div className="ic-range-labels">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                  </div>
                </div>

                <div className="ic-setting">
                  <label>Output format</label>
                  <select
                    className="ic-select"
                    value={format}
                    onChange={(e) => {
                      setFormat(e.target.value);
                      setResult(null);
                    }}
                  >
                    <option value="image/webp">WebP — Recommended</option>
                    <option value="image/jpeg">JPG — Compatible</option>
                  </select>
                </div>
              </div>

              <button className="ic-compress" onClick={compressImage} disabled={loading}>
                {loading ? "⏳ Compressing your image..." : "✦ Compress Image"}
              </button>
            </>
          )}

          {error && <div className="ic-error">{error}</div>}

          {result && (
            <section className="ic-results">
              <div className="ic-results-heading">
                <h2>Your compressed image</h2>
                <span className="ic-success">✓ Completed</span>
              </div>

              <div className="ic-stats">
                <div className="ic-stat">
                  <span>Original size</span>
                  <strong>{formatSize(image.size)}</strong>
                </div>
                <div className="ic-stat">
                  <span>New size</span>
                  <strong>{formatSize(result.size)}</strong>
                </div>
                <div className="ic-stat highlight">
                  <span>Space saved</span>
                  <strong>{savings > 0 ? `${savings}%` : savings < 0 ? `${Math.abs(savings)}% larger` : "0%"}</strong>
                </div>
              </div>

              <div className="ic-previews">
                <div className="ic-preview">
                  <img src={image.url} alt="Original preview" />
                  <div className="ic-preview-footer">
                    <strong>Original</strong>
                    <span>{formatSize(image.size)}</span>
                  </div>
                </div>
                <div className="ic-preview">
                  <img src={result.url} alt="Compressed preview" />
                  <div className="ic-preview-footer">
                    <strong>Compressed</strong>
                    <span>{formatSize(result.size)}</span>
                  </div>
                </div>
              </div>

              <button className="ic-download" onClick={downloadImage}>
                ↓ Download compressed image
              </button>
            </section>
          )}
        </section>

        <p className="ic-note">
          <span>🔒 Your privacy matters.</span> Images are processed locally in your browser.
        </p>
      </div>
    </div>
  );
}
