
import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function PDFMerger({ onBack }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  const addFiles = (selectedFiles) => {
    const pdfs = Array.from(selectedFiles).filter(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
    );

    if (pdfs.length !== selectedFiles.length) {
      setError("Only PDF files are accepted.");
    } else {
      setError("");
    }

    setFiles((previous) => [...previous, ...pdfs]);
    setSuccess(false);
  };

  const removeFile = (index) => {
    setFiles((previous) => previous.filter((_, i) => i !== index));
    setSuccess(false);
    setError("");
  };

  const moveFile = (index, direction) => {
    const next = [...files];
    const target = index + direction;

    if (target < 0 || target >= next.length) return;

    [next[index], next[target]] = [next[target], next[index]];
    setFiles(next);
    setSuccess(false);
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      setError("Please add at least 2 PDF files to merge.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);

        const pages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );

        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();

      const blob = new Blob([mergedBytes], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "freekit-merged.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setSuccess(true);
    } catch (err) {
      console.error("PDF Merge Error:", err);
      setError(
        "Unable to merge these PDFs. One of the files may be damaged or password-protected."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="pm-page">
      <style>{`
        .pm-page {
          min-height: 100vh;
          padding: 0 22px 70px;
          background: #f6f8f5;
          color: #18251e;
          font-family: 'DM Sans', sans-serif;
        }
        .pm-topbar {
          max-width: 1120px;
          height: 82px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e6ebe5;
        }
        .pm-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #18251e;
          text-decoration: none;
          font-size: 21px;
          font-weight: 800;
        }
        .pm-brand-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          color: white;
          background: #218653;
        }
        .pm-brand-dot { color: #218653; }
        .pm-back {
          border: 1px solid #e0e7df;
          background: white;
          color: #46564b;
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .pm-container { max-width: 850px; margin: auto; }
        .pm-heading { text-align: center; padding: 55px 0 32px; }
        .pm-badge {
          display: inline-block;
          padding: 7px 13px;
          border-radius: 30px;
          background: #e7f4eb;
          color: #218653;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .pm-heading h1 {
          margin: 18px 0 12px;
          font-size: clamp(30px, 5vw, 44px);
          letter-spacing: -2px;
          font-weight: 800;
        }
        .pm-heading h1 span { color: #218653; }
        .pm-heading p {
          margin: 0;
          color: #78847b;
          font-size: 15px;
          line-height: 1.7;
        }
        .pm-card {
          padding: 27px;
          background: white;
          border: 1px solid #e8eee7;
          border-radius: 20px;
          box-shadow: 0 12px 40px rgba(26,55,34,.045);
        }
        .pm-dropzone {
          min-height: 210px;
          padding: 25px;
          border: 2px dashed #cbdccc;
          border-radius: 15px;
          background: #f8fbf7;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          transition: .2s;
        }
        .pm-dropzone:hover,
        .pm-dropzone.dragging {
          background: #eff8f0;
          border-color: #218653;
        }
        .pm-upload-icon {
          width: 55px;
          height: 55px;
          border-radius: 17px;
          display: grid;
          place-items: center;
          background: #e3f3e7;
          color: #218653;
          font-size: 27px;
          margin-bottom: 14px;
        }
        .pm-dropzone strong { font-size: 17px; }
        .pm-dropzone p {
          margin: 8px 0 12px;
          font-size: 13px;
          color: #7e8980;
        }
        .pm-browse {
          color: #218653;
          font-size: 13px;
          font-weight: 800;
        }
        .pm-hint {
          font-size: 11px;
          color: #a0aaa1;
          margin-top: 13px;
        }
        .pm-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 26px 0 13px;
          gap: 10px;
        }
        .pm-list-header h2 { font-size: 16px; margin: 0; }
        .pm-count {
          color: #218653;
          background: #e7f4eb;
          border-radius: 30px;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 800;
        }
        .pm-file {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px;
          margin-bottom: 9px;
          border: 1px solid #e9eee8;
          border-radius: 12px;
          background: #fafcf9;
        }
        .pm-pdf-icon {
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #fff0ed;
          color: #d75c4c;
          font-size: 11px;
          font-weight: 900;
        }
        .pm-file-info { flex: 1; min-width: 0; }
        .pm-file-info strong {
          display: block;
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .pm-file-info span {
          display: block;
          margin-top: 5px;
          font-size: 11px;
          color: #89948c;
        }
        .pm-actions { display: flex; gap: 5px; }
        .pm-actions button {
          width: 31px;
          height: 31px;
          border: 1px solid #e5ebe4;
          border-radius: 8px;
          background: white;
          color: #506056;
          cursor: pointer;
          font-size: 14px;
        }
        .pm-actions button:hover {
          border-color: #218653;
          color: #218653;
        }
        .pm-actions button:disabled {
          opacity: .35;
          cursor: not-allowed;
        }
        .pm-actions .pm-remove:hover {
          color: #d44d43;
          border-color: #d44d43;
        }
        .pm-add-more {
          width: 100%;
          padding: 12px;
          margin-top: 5px;
          border: 1px dashed #cbdccc;
          border-radius: 10px;
          background: white;
          color: #218653;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }
        .pm-merge {
          width: 100%;
          height: 52px;
          margin-top: 23px;
          border: 0;
          border-radius: 11px;
          background: #218653;
          color: white;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: .2s;
        }
        .pm-merge:hover {
          background: #176d41;
          transform: translateY(-1px);
        }
        .pm-merge:disabled {
          opacity: .5;
          cursor: not-allowed;
          transform: none;
        }
        .pm-error, .pm-success {
          margin-top: 15px;
          padding: 12px;
          border-radius: 9px;
          font-size: 13px;
        }
        .pm-error { background: #fff0ef; color: #bd443d; }
        .pm-success { background: #e7f5e9; color: #218653; }
        .pm-note {
          margin-top: 22px;
          text-align: center;
          color: #8a968d;
          font-size: 12px;
        }
        .pm-note span { color: #218653; }
        @media(max-width: 600px) {
          .pm-page { padding: 0 13px 45px; }
          .pm-topbar { height: 68px; }
          .pm-card { padding: 16px; }
          .pm-heading { padding: 40px 0 28px; }
          .pm-file { gap: 8px; padding: 10px; }
          .pm-actions button { width: 28px; height: 28px; }
        }
      `}</style>

      <header className="pm-topbar">
        <a
          href="#"
          className="pm-brand"
          onClick={(e) => {
            e.preventDefault();
            onBack?.();
          }}
        >
          <span className="pm-brand-icon">F</span>
          <span>
            FreeKit<span className="pm-brand-dot">.</span>
          </span>
        </a>

        <button className="pm-back" onClick={onBack}>
          ← Back to tools
        </button>
      </header>

      <main className="pm-container">
        <section className="pm-heading">
          <span className="pm-badge">✦ FREE ONLINE TOOL</span>
          <h1>
            Merge <span>PDF files</span>
          </h1>
          <p>
            Combine multiple PDF documents into one file.
            <br />
            Arrange your files, merge them and download instantly.
          </p>
        </section>

        <section className="pm-card">
          <label
            className={`pm-dropzone ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              hidden
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />

            <span className="pm-upload-icon">↑</span>
            <strong>Drop your PDF files here</strong>
            <p>
              Drag and drop your documents or browse from your device
            </p>
            <span className="pm-browse">Browse PDF files</span>
            <span className="pm-hint">
              PDF files only · Select at least 2 documents
            </span>
          </label>

          {files.length > 0 && (
            <>
              <div className="pm-list-header">
                <h2>Files to merge</h2>
                <span className="pm-count">{files.length} files</span>
              </div>

              {files.map((file, index) => (
                <div
                  className="pm-file"
                  key={`${file.name}-${index}-${file.size}`}
                >
                  <div className="pm-pdf-icon">PDF</div>

                  <div className="pm-file-info">
                    <strong>{file.name}</strong>
                    <span>
                      {formatSize(file.size)} · Position {index + 1}
                    </span>
                  </div>

                  <div className="pm-actions">
                    <button
                      title="Move up"
                      disabled={index === 0}
                      onClick={() => moveFile(index, -1)}
                    >
                      ↑
                    </button>

                    <button
                      title="Move down"
                      disabled={index === files.length - 1}
                      onClick={() => moveFile(index, 1)}
                    >
                      ↓
                    </button>

                    <button
                      className="pm-remove"
                      title="Remove file"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}

              <button
                className="pm-add-more"
                onClick={() => inputRef.current?.click()}
              >
                + Add more PDF files
              </button>

              <button
                className="pm-merge"
                onClick={mergePDFs}
                disabled={loading || files.length < 2}
              >
                {loading
                  ? "⏳ Merging your PDFs..."
                  : "✦ Merge PDF files"}
              </button>
            </>
          )}

          {error && <div className="pm-error">{error}</div>}

          {success && (
            <div className="pm-success">
              ✓ Your PDF files have been merged and downloaded successfully!
            </div>
          )}
        </section>

        <p className="pm-note">
          <span>🔒 Your privacy matters.</span> Your PDF files are processed
          locally in your browser.
        </p>
      </main>
    </div>
  );
}
