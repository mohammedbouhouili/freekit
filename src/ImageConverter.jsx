
import { useEffect, useRef, useState } from "react";
import "./ImageConverter.css";

const formats = [
  {
    value: "image/jpeg",
    name: "JPG",
    extension: "jpg",
    description: "Best compatibility",
  },
  {
    value: "image/png",
    name: "PNG",
    extension: "png",
    description: "Supports transparency",
  },
  {
    value: "image/webp",
    name: "WebP",
    extension: "webp",
    description: "Optimized for web",
  },
];

const formatBytes = (bytes) => {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

function ImageConverter({ onBack }) {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [outputSize, setOutputSize] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [format, setFormat] = useState("image/png");
  const [quality, setQuality] = useState(90);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setSourceUrl("");
      return;
    }

    const url = URL.createObjectURL(file);
    setSourceUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!sourceUrl) return;

    let cancelled = false;
    const image = new Image();

    image.onload = () => {
      if (cancelled) return;
      setDimensions({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      if (!cancelled) setError("Could not read this image.");
    };

    image.src = sourceUrl;

    return () => {
      cancelled = true;
    };
  }, [sourceUrl]);

  useEffect(() => {
    if (!sourceUrl || !dimensions.width || !dimensions.height) {
      setOutputUrl("");
      setOutputSize(0);
      return;
    }

    let cancelled = false;
    let generatedUrl = "";

    const image = new Image();
    setProcessing(true);
    setOutputUrl("");

    image.onload = () => {
      if (cancelled) return;

      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setProcessing(false);
        setError("Canvas is not available.");
        return;
      }

      if (format === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(image, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (cancelled) return;

          setProcessing(false);

          if (!blob) {
            setError("Could not convert this image.");
            return;
          }

          if (blob.type !== format) {
            setError("This format is not supported by your browser.");
            return;
          }

          generatedUrl = URL.createObjectURL(blob);
          setOutputUrl(generatedUrl);
          setOutputSize(blob.size);
          setError("");
        },
        format,
        quality / 100
      );
    };

    image.onerror = () => {
      if (!cancelled) {
        setProcessing(false);
        setError("Image conversion failed.");
      }
    };

    image.src = sourceUrl;

    return () => {
      cancelled = true;
      if (generatedUrl) URL.revokeObjectURL(generatedUrl);
    };
  }, [sourceUrl, dimensions.width, dimensions.height, format, quality]);

  const handleFile = (selected) => {
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    setFile(selected);
    setDimensions({ width: 0, height: 0 });
    setOutputUrl("");
    setOutputSize(0);
    setError("");

    const initialFormat =
      selected.type === "image/png"
        ? "image/webp"
        : selected.type === "image/webp"
          ? "image/jpeg"
          : "image/png";

    setFormat(initialFormat);
  };

  const resetTool = () => {
    setFile(null);
    setSourceUrl("");
    setOutputUrl("");
    setOutputSize(0);
    setDimensions({ width: 0, height: 0 });
    setFormat("image/png");
    setQuality(90);
    setError("");
    setProcessing(false);

    if (inputRef.current) inputRef.current.value = "";
  };

  const download = () => {
    if (!outputUrl || processing) return;

    const extension = formats.find((f) => f.value === format)?.extension || "png";
    const name = file.name.replace(/\.[^.]+$/, "");

    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = `${name}-converted.${extension}`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const difference = file && outputSize
    ? Math.round((1 - outputSize / file.size) * 100)
    : 0;

  return (
    <main className="ic-page">
      <div className="ic-container">
        <button className="ic-back" onClick={() => onBack?.()}>
          <span>←</span> Back to all tools
        </button>

        <header className="ic-header">
          <div className="ic-header-icon">⇄</div>
          <div className="ic-eyebrow">FREE IMAGE TOOL</div>
          <h1>Image <span>Converter</span></h1>
          <p>
            Convert images between JPG, PNG and WebP in seconds.
            Fast, simple and completely free.
          </p>

          <div className="ic-trust">
            <span>✓ No registration</span>
            <span>✓ Instant conversion</span>
            <span>✓ Private & secure</span>
          </div>
        </header>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {!file ? (
          <section
            className={`ic-upload ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
          >
            <div className="ic-upload-icon">↑</div>
            <h2>Upload your image</h2>
            <p>Drag and drop an image here, or browse from your device.</p>

            <button
              className="ic-primary"
              onClick={() => inputRef.current?.click()}
            >
              Choose Image <span>→</span>
            </button>

            <small>JPG, PNG and WebP supported</small>
          </section>
        ) : (
          <div className="ic-workspace">
            <div className="ic-file-bar">
              <div className="ic-file-details">
                <div className="ic-file-icon">▧</div>
                <div>
                  <strong title={file.name}>{file.name}</strong>
                  <small>
                    {formatBytes(file.size)} · {dimensions.width} × {dimensions.height} px
                  </small>
                </div>
              </div>

              <button className="ic-change" onClick={resetTool}>
                Change image ↗
              </button>
            </div>

            <div className="ic-grid">
              <section className="ic-card">
                <div className="ic-step">01 / CONVERSION</div>
                <h2>Convert your image</h2>
                <p className="ic-muted">Choose your preferred output format.</p>

                <div className="ic-section-title">OUTPUT FORMAT</div>

                <div className="ic-formats">
                  {formats.map((item) => (
                    <button
                      key={item.value}
                      className={`ic-format ${format === item.value ? "active" : ""}`}
                      onClick={() => setFormat(item.value)}
                    >
                      <div className="ic-format-top">
                        <span className="ic-format-symbol">
                          {item.name === "JPG" ? "◩" : item.name === "PNG" ? "▧" : "◇"}
                        </span>
                        <span className="ic-radio" />
                      </div>
                      <strong>{item.name}</strong>
                      <small>{item.description}</small>
                    </button>
                  ))}
                </div>

                <div className="ic-format-note">
                  <span>ⓘ</span>
                  {format === "image/jpeg"
                    ? "JPG uses a white background for transparent images."
                    : format === "image/png"
                      ? "PNG preserves transparency and uses lossless encoding."
                      : "WebP usually offers smaller files with good visual quality."}
                </div>

                {format !== "image/png" && (
                  <div className="ic-quality">
                    <div className="ic-quality-header">
                      <div>
                        <strong>Image quality</strong>
                        <small>Choose the balance between quality and size.</small>
                      </div>
                      <span>{quality}%</span>
                    </div>

                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      style={{
                        "--ic-progress": `${((quality - 10) / 90) * 100}%`,
                      }}
                    />

                    <div className="ic-quality-labels">
                      <span>Smaller file</span>
                      <span>Best quality</span>
                    </div>
                  </div>
                )}

                <div className="ic-feature-list">
                  <div><span>✓</span> Original dimensions preserved</div>
                  <div><span>✓</span> No watermark added</div>
                  <div><span>✓</span> Browser-based processing</div>
                </div>
              </section>

              <aside className="ic-card ic-preview-card">
                <div className="ic-preview-heading">
                  <div>
                    <div className="ic-step">02 / PREVIEW</div>
                    <h2>Conversion preview</h2>
                    <p className="ic-muted">Your image is ready to preview.</p>
                  </div>
                  <span className="ic-live">● LIVE</span>
                </div>

                <div className="ic-preview">
                  {outputUrl ? (
                    <img src={outputUrl} alt="Converted preview" />
                  ) : (
                    <span>{processing ? "Converting image..." : "Preparing preview..."}</span>
                  )}
                </div>

                <div className="ic-image-dimensions">
                  <span>IMAGE DIMENSIONS</span>
                  <strong>{dimensions.width} × {dimensions.height} px</strong>
                </div>

                <div className="ic-stats">
                  <div>
                    <small>Original size</small>
                    <strong>{formatBytes(file.size)}</strong>
                  </div>
                  <div>
                    <small>Converted size</small>
                    <strong>{outputUrl ? formatBytes(outputSize) : "—"}</strong>
                  </div>
                </div>

                {outputUrl && (
                  <div className="ic-difference">
                    <span>File size change</span>
                    <strong>
                      {difference > 0
                        ? `${difference}% smaller`
                        : difference < 0
                          ? `${Math.abs(difference)}% larger`
                          : "Same size"}
                    </strong>
                  </div>
                )}

                {error && <div className="ic-error">{error}</div>}

                <button
                  className="ic-download"
                  disabled={!outputUrl || processing}
                  onClick={download}
                >
                  ↓ {processing ? "Converting..." : "Download Converted Image"}
                </button>

                <button className="ic-another" onClick={resetTool}>
                  Convert another image
                </button>

                <div className="ic-privacy">
                  ♧ Your images never leave your browser.
                </div>
              </aside>
            </div>
          </div>
        )}

        {error && !file && <div className="ic-error">{error}</div>}

        <footer className="ic-footer">
          Made with ♥ by FreeKit · Free online tools
        </footer>
      </div>
    </main>
  );
}

export default ImageConverter;
