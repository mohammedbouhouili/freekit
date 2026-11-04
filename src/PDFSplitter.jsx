
import { useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function PDFSplitter({ onBack }) {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragging, setDragging] = useState(false);

  const inputRef = useRef(null);

  const loadPDF = async (selectedFile) => {
    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const bytes = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);

      setFile(selectedFile);
      setPageCount(pdf.getPageCount());
      setSelectedPages(
        Array.from({ length: pdf.getPageCount() }, (_, i) => i + 1)
      );
    } catch (err) {
      console.error(err);
      setError("Unable to open this PDF. It may be damaged or password-protected.");
    }
  };

  const togglePage = (page) => {
    setSelectedPages((previous) =>
      previous.includes(page)
        ? previous.filter((p) => p !== page)
        : [...previous, page].sort((a, b) => a - b)
    );
    setSuccess("");
  };

  const selectAll = () => {
    setSelectedPages(
      Array.from({ length: pageCount }, (_, i) => i + 1)
    );
    setSuccess("");
  };

  const clearSelection = () => {
    setSelectedPages([]);
    setSuccess("");
  };

  const splitPDF = async () => {
    if (!file || selectedPages.length === 0) {
      setError("Please select at least one page.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const bytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(bytes);

      for (const pageNumber of selectedPages) {
        const newPdf = await PDFDocument.create();

        const [copiedPage] = await newPdf.copyPages(
          sourcePdf,
          [pageNumber - 1]
        );

        newPdf.addPage(copiedPage);

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], {
          type: "application/pdf",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `freekit-page-${pageNumber}.pdf`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 2000);

        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      setSuccess(
        `${selectedPages.length} PDF file(s) created successfully!`
      );
    } catch (err) {
      console.error(err);
      setError("Unable to split this PDF. Please try another file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sp-page">
      <style>{`
        .sp-page {
          min-height: 100vh;
          padding: 0 22px 70px;
          background: #f6f8f5;
          color: #18251e;
          font-family: 'DM Sans', sans-serif;
        }
        .sp-topbar {
          max-width: 1120px;
          height: 82px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e6ebe5;
        }
        .sp-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #18251e;
          text-decoration: none;
          font-size: 21px;
          font-weight: 800;
        }
        .sp-brand-icon {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          color: white;
          background: #218653;
        }
        .sp-brand-dot { color: #218653; }
        .sp-back {
          border: 1px solid #e0e7df;
          background: white;
          color: #46564b;
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .sp-container { max-width: 850px; margin: auto; }
        .sp-heading { text-align: center; padding: 55px 0 32px; }
        .sp-badge {
          display: inline-block;
          padding: 7px 13px;
          border-radius: 30px;
          background: #e7f4eb;
          color: #218653;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .sp-heading h1 {
          margin: 18px 0 12px;
          font-size: clamp(30px, 5vw, 44px);
          letter-spacing: -2px;
          font-weight: 800;
        }
        .sp-heading h1 span { color: #218653; }
        .sp-heading p {
          margin: 0;
          color: #78847b;
          font-size: 15px;
          line-height: 1.7;
        }
        .sp-card {
          padding: 27px;
          background: white;
          border: 1px solid #e8eee7;
          border-radius: 20px;
          box-shadow: 0 12px 40px rgba(26,55,34,.045);
        }
        .sp-dropzone {
          min-height: 190px;
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
        .sp-dropzone:hover,
        .sp-dropzone.dragging {
          background: #eff8f0;
          border-color: #218653;
        }
        .sp-upload-icon {
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
        .sp-dropzone strong { font-size: 17px; }
        .sp-dropzone p {
          margin: 8px 0 12px;
          font-size: 13px;
          color: #7e8980;
        }
        .sp-browse {
          color: #218653;
          font-size: 13px;
          font-weight: 800;
        }
        .sp-file-info {
          margin-top: 18px;
          padding: 14px;
          border: 1px solid #e9eee8;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fafcf9;
        }
        .sp-pdf-icon {
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
        .sp-file-name {
          min-width: 0;
          flex: 1;
          font-size: 13px;
          font-weight: 800;
          overflow-wrap: anywhere;
        }
        .sp-file-name small {
          display: block;
          margin-top: 5px;
          color: #89948c;
          font-weight: 400;
        }
        .sp-change {
          border: 1px solid #e0e7df;
          background: white;
          color: #218653;
          border-radius: 8px;
          padding: 8px 11px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }
        .sp-pages-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin: 27px 0 15px;
        }
        .sp-pages-header h2 { margin: 0; font-size: 16px; }
        .sp-page-count {
          color: #218653;
          background: #e7f4eb;
          border-radius: 30px;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 800;
        }
        .sp-selection-actions {
          display: flex;
          gap: 9px;
          margin-bottom: 15px;
        }
        .sp-selection-actions button {
          border: 1px solid #e0e7df;
          background: white;
          color: #506056;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }
        .sp-selection-actions button:hover {
          color: #218653;
          border-color: #218653;
        }
        .sp-pages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(105px, 1fr));
          gap: 11px;
        }
        .sp-page-item {
          min-height: 105px;
          border: 1px solid #e3eae2;
          border-radius: 12px;
          background: #fafcf9;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 9px;
          cursor: pointer;
          transition: .2s;
        }
        .sp-page-item.selected {
          border: 2px solid #218653;
          background: #eff8f0;
        }
        .sp-page-icon {
          font-size: 27px;
          color: #d75c4c;
        }
        .sp-page-number {
          font-size: 12px;
          font-weight: 800;
          color: #46564b;
        }
        .sp-check {
          font-size: 10px;
          color: #218653;
          font-weight: 800;
        }
        .sp-merge {
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
        .sp-merge:hover {
          background: #176d41;
          transform: translateY(-1px);
        }
        .sp-merge:disabled {
          opacity: .5;
          cursor: not-allowed;
          transform: none;
        }
        .sp-error, .sp-success {
          margin-top: 15px;
          padding: 12px;
          border-radius: 9px;
          font-size: 13px;
        }
        .sp-error { background: #fff0ef; color: #bd443d; }
        .sp-success { background: #e7f5e9; color: #218653; }
        .sp-note {
          margin-top: 22px;
          text-align: center;
          color: #8a968d;
          font-size: 12px;
        }
        .sp-note span { color: #218653; }
        @media(max-width: 600px) {
          .sp-page { padding: 0 13px 45px; }
          .sp-topbar { height: 68px; }
          .sp-card { padding: 16px; }
          .sp-heading { padding: 40px 0 28px; }
          .sp-pages-grid {
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          }
        }
      `}</style>

      <header className="sp-topbar">
        <a
          href="#"
          className="sp-brand"
          onClick={(e) => {
            e.preventDefault();
            onBack?.();
          }}
        >
          <span className="sp-brand-icon">F</span>
          <span>FreeKit<span className="sp-brand-dot">.</span></span>
        </a>

        <button className="sp-back" onClick={onBack}>
          ← Back to tools
        </button>
      </header>

      <main className="sp-container">
        <section className="sp-heading">
          <span className="sp-badge">✦ FREE ONLINE TOOL</span>
          <h1>Split <span>PDF files</span></h1>
          <p>
            Extract individual pages from your PDF document.
            <br />
            Select the pages you need and download them separately.
          </p>
        </section>

        <section className="sp-card">
          <label
            className={`sp-dropzone ${dragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              loadPDF(e.dataTransfer.files[0]);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              hidden
              onChange={(e) => {
                loadPDF(e.target.files[0]);
                e.target.value = "";
              }}
            />
            <span className="sp-upload-icon">↑</span>
            <strong>Drop your PDF file here</strong>
            <p>Drag and drop your document or browse your device</p>
            <span className="sp-browse">Browse PDF file</span>
          </label>

          {file && (
            <>
              <div className="sp-file-info">
                <div className="sp-pdf-icon">PDF</div>
                <div className="sp-file-name">
                  {file.name}
                  <small>{pageCount} pages · Ready to split</small>
                </div>
                <button
                  className="sp-change"
                  onClick={() => inputRef.current?.click()}
                >
                  Change
                </button>
              </div>

              <div className="sp-pages-header">
                <h2>Select pages</h2>
                <span className="sp-page-count">
                  {selectedPages.length} / {pageCount} selected
                </span>
              </div>

              <div className="sp-selection-actions">
                <button onClick={selectAll}>Select all</button>
                <button onClick={clearSelection}>Clear selection</button>
              </div>

              <div className="sp-pages-grid">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                  (page) => {
                    const selected = selectedPages.includes(page);

                    return (
                      <button
                        type="button"
                        key={page}
                        className={`sp-page-item ${selected ? "selected" : ""}`}
                        onClick={() => togglePage(page)}
                      >
                        <span className="sp-page-icon">▤</span>
                        <span className="sp-page-number">
                          Page {page}
                        </span>
                        <span className="sp-check">
                          {selected ? "✓ Selected" : "Select"}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              <button
                className="sp-merge"
                onClick={splitPDF}
                disabled={loading || selectedPages.length === 0}
              >
                {loading
                  ? "⏳ Splitting PDF..."
                  : `✦ Split into ${selectedPages.length} PDF file(s)`}
              </button>
            </>
          )}

          {error && <div className="sp-error">{error}</div>}
          {success && <div className="sp-success">✓ {success}</div>}
        </section>

        <p className="sp-note">
          <span>🔒 Your privacy matters.</span> Your PDF files are processed locally in your browser.
        </p>
      </main>
    </div>
  );
}
