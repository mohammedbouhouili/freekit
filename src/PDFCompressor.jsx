
import { useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { PDFDocument } from "pdf-lib";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function PDFCompressor({ onBack }) {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(65);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError("");
    setProgress(0);
  };

  const compressPDF = async () => {
    if (!file || loading) return;

    setLoading(true);
    setError("");
    setResult(null);
    setProgress(0);

    try {
      const buffer = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
      }).promise;

      const outputPDF = await PDFDocument.create();
      const totalPages = pdf.numPages;

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not create canvas.");
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({
          canvas,
          canvasContext: context,
          viewport,
          background: "rgb(255,255,255)",
        }).promise;

        const imageBlob = await new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Image conversion failed."));
            },
            "image/jpeg",
            quality / 100
          );
        });

        const imageBytes = await imageBlob.arrayBuffer();
        const jpgImage = await outputPDF.embedJpg(imageBytes);

        const pdfPage = outputPDF.addPage([
          viewport.width,
          viewport.height,
        ]);

        pdfPage.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });

        canvas.width = 0;
        canvas.height = 0;

        setProgress(Math.round((pageNumber / totalPages) * 100));
      }

      const compressedBytes = await outputPDF.save({
        useObjectStreams: true,
      });

      const compressedBlob = new Blob([compressedBytes], {
        type: "application/pdf",
      });

      setResult({
        blob: compressedBlob,
        originalSize: file.size,
        compressedSize: compressedBlob.size,
        pages: totalPages,
      });
    } catch (err) {
      console.error("PDF compression error:", err);
      setError(
        "We couldn't compress this PDF. It may be damaged, encrypted, or too large."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!result) return;

    const url = URL.createObjectURL(result.blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "freekit-compressed.pdf";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const savings = result
    ? Math.round(
        (1 - result.compressedSize / result.originalSize) * 100
      )
    : 0;

  const resetTool = () => {
    setFile(null);
    setResult(null);
    setError("");
    setProgress(0);
    setQuality(65);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="pdf-compressor-page">
      <div className="pdf-compressor-container">

        <button className="pdf-back-button" onClick={onBack}>
          <span>←</span> Back to all tools
        </button>

        <header className="pdf-tool-header">
          <div className="pdf-tool-icon">📦</div>

          <span className="pdf-tool-eyebrow">
            FREE PDF TOOL
          </span>

          <h1>Compress PDF</h1>

          <p>
            Reduce your PDF file size and make documents easier
            to store, share and upload.
          </p>

          <div className="pdf-tool-trust">
            <span>✓ Free to use</span>
            <span>✓ No registration</span>
            <span>✓ Files stay on your device</span>
          </div>
        </header>

        <main className="pdf-compressor-card">

          {!file && (
            <div
              className={`pdf-upload-zone ${dragging ? "dragging" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  inputRef.current?.click();
                }
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                hidden
                onChange={(e) => {
                  handleFile(e.target.files[0]);
                  e.target.value = "";
                }}
              />

              <div className="pdf-upload-icon">
                <span>↑</span>
              </div>

              <h2>Drop your PDF here</h2>

              <p>
                Drag and drop your file or click the button below
                to browse your device.
              </p>

              <button
                type="button"
                className="pdf-primary-button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                <span>＋</span> Choose PDF file
              </button>

              <span className="pdf-upload-hint">
                PDF files only
              </span>
            </div>
          )}

          {file && (
            <div className="pdf-selected-file">
              <div className="pdf-file-left">
                <div className="pdf-file-icon">PDF</div>

                <div className="pdf-file-info">
                  <strong>{file.name}</strong>
                  <span>{formatSize(file.size)}</span>
                </div>
              </div>

              <button
                className="pdf-remove-button"
                onClick={resetTool}
                disabled={loading}
              >
                Remove
              </button>
            </div>
          )}

          {file && !result && (
            <section className="pdf-quality-section">
              <div className="pdf-section-title">
                <div>
                  <h2>Compression settings</h2>
                  <p>Choose the balance between file size and image quality.</p>
                </div>

                <span className="pdf-settings-icon">⚙</span>
              </div>

              <div className="pdf-quality-box">
                <div className="pdf-quality-labels">
                  <div>
                    <span className="pdf-quality-title">
                      Image quality
                    </span>
                    <span className="pdf-quality-description">
                      Lower quality usually creates a smaller file.
                    </span>
                  </div>

                  <strong>{quality}%</strong>
                </div>

                <input
                  className="pdf-quality-slider"
                  type="range"
                  min="25"
                  max="90"
                  step="5"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  disabled={loading}
                />

                <div className="pdf-slider-labels">
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>

                <div className="pdf-quality-presets">
                  <button
                    className={quality === 40 ? "selected" : ""}
                    onClick={() => setQuality(40)}
                    disabled={loading}
                  >
                    Small size
                  </button>

                  <button
                    className={quality === 65 ? "selected" : ""}
                    onClick={() => setQuality(65)}
                    disabled={loading}
                  >
                    Recommended
                  </button>

                  <button
                    className={quality === 85 ? "selected" : ""}
                    onClick={() => setQuality(85)}
                    disabled={loading}
                  >
                    High quality
                  </button>
                </div>
              </div>

              {loading && (
                <div className="pdf-progress-section">
                  <div className="pdf-progress-heading">
                    <span>Compressing your PDF...</span>
                    <strong>{progress}%</strong>
                  </div>

                  <div className="pdf-progress-track">
                    <div
                      className="pdf-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p>Please keep this page open until processing finishes.</p>
                </div>
              )}

              <button
                className="pdf-primary-button pdf-compress-button"
                onClick={compressPDF}
                disabled={loading}
              >
                {loading ? (
                  <>Processing PDF... {progress}%</>
                ) : (
                  <> <span>✦</span> Compress PDF </>
                )}
              </button>
            </section>
          )}

          {error && (
            <div className="pdf-error-message">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <section className="pdf-result-section">
              <div className="pdf-success-icon">✓</div>

              <span className="pdf-tool-eyebrow">
                PROCESSING COMPLETE
              </span>

              <h2>Your PDF is ready!</h2>

              <p className="pdf-result-description">
                Your document has been processed successfully.
              </p>

              <div className="pdf-stats-grid">
                <div className="pdf-stat-card">
                  <span>Original size</span>
                  <strong>{formatSize(result.originalSize)}</strong>
                </div>

                <div className="pdf-stat-card">
                  <span>New file size</span>
                  <strong>{formatSize(result.compressedSize)}</strong>
                </div>

                <div className="pdf-stat-card pdf-saving-stat">
                  <span>Size change</span>
                  <strong>
                    {savings > 0 ? `${savings}% smaller` : `${Math.abs(savings)}% larger`}
                  </strong>
                </div>
              </div>

              <div className="pdf-result-details">
                <span>✓</span>
                {result.pages} pages processed
              </div>

              <button
                className="pdf-primary-button pdf-download-button"
                onClick={downloadPDF}
              >
                <span>↓</span> Download compressed PDF
              </button>

              <button
                className="pdf-secondary-button"
                onClick={resetTool}
              >
                Compress another PDF
              </button>
            </section>
          )}
        </main>

        <div className="pdf-privacy-note">
          <span>🔒</span>
          <p>
            <strong>Your privacy matters.</strong>
            Your PDF is processed locally in your browser.
            It is not uploaded to our servers.
          </p>
        </div>

        <footer className="pdf-tool-footer">
          FreeKit <span>·</span> Simple tools for everyday work.
        </footer>

      </div>
    </div>
  );
}
