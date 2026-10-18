"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

function renderValue(val: any) {
  if (val == null) return null;
  if (typeof val === "object") return <pre style={{margin: 0}}>{JSON.stringify(val, null, 2)}</pre>;
  return String(val);
}

function scrollToResultCard(ref: React.RefObject<HTMLDivElement>, headerOffset = 80) {
  if (ref.current) {
    const elementPosition = ref.current.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }
}

export default function Home() {
  const uploadRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  const handleScrollToUpload = () => {
    uploadRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setFilePath(null);
    setFileName(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const token = localStorage.getItem('authToken');
      const res = await fetch("http://localhost:8000/docs/upload-doc", {
        method: "POST",
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.outputs);
        setFilePath(data.file_path);
        setFileName(data.filename);
        setTimeout(() => {
          scrollToResultCard(resultCardRef, 80); // Adjust 80 to your header height if needed
        }, 100);
      } else {
        setError(data.detail || data.msg || "Error processing document.");
      }
    } catch (err: any) {
      setError("Failed to upload or process document.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToMyDocs = async () => {
    if (!result || !filePath || !fileName) return;
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch("http://localhost:8000/docs/save-doc", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          filename: fileName,
          file_path: filePath,
          outputs: result,
          extracted_text: result.cleaned_text || ""
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.msg || "Document saved to MyDocs!");
      } else {
        alert(data.detail || data.msg || "Failed to save document.");
      }
    } catch (err) {
      alert("Failed to save document.");
    }
  };

  return (
    <main className="main">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-decoration"></div>
        <div className="hero-bg-circle hero-bg-circle-1"></div>
        <div className="hero-bg-circle hero-bg-circle-2"></div>

        {/* Left: Text */}
        <div className="hero-content">
          <div className="hero-badge">✨ AI-Powered Document Analysis</div>
          <h1 className="hero-title">
            Refine Your <span className="hero-title-gradient">Documents</span> With AI
          </h1>
          <p className="hero-description">
            Upload files, get smart summaries, and unlock insights in seconds. Transform your document workflow with
            cutting-edge AI technology.
          </p>
          <div className="hero-buttons">
            <button onClick={handleScrollToUpload} className="btn-primary">
              <span>Try Now</span>
            </button>
            <Link href="/about" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Learn More
            </Link>
          </div>
        </div>

        {/* Right: Illustration/Image */}
        <div className="hero-image-container">
          <div className="hero-image-wrapper">
            <Image
              src="/doc4.png?height=400&width=400"
              alt="AI Document Illustration"
              width={400}
              height={400}
              className="hero-image"
              priority
            />
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section ref={uploadRef} className="upload-section">
        <div className="upload-bg"></div>
        <div className="upload-content">
          <div className="upload-header">
            <h2 className="upload-title">Upload Your Document</h2>
            <p className="upload-subtitle">Drag and drop your file or click to browse</p>
          </div>

          <div className="upload-form">
            <div className="file-upload-area">
              <input type="file" className="file-input" onChange={handleFileChange} />
              <div className="file-upload-content">
                <svg className="upload-icon" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p>{selectedFile ? selectedFile.name : "Click to upload or drag and drop"}</p>
              </div>
            </div>

            <button className="btn-generate" onClick={handleGenerate} disabled={!selectedFile || loading}>
              <span className="btn-generate-content">
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {loading ? "Generating..." : "Generate Analysis"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Result Section */}
      {error && (
        <section className="upload-section" style={{ marginTop: 0 }}>
          <div className="upload-bg"></div>
          <div className="upload-content">
            <div className="result-box error">{error}</div>
          </div>
        </section>
      )}
      {result && (
        <>
          <section className="upload-section" style={{ marginTop: 0 }}>
            <div className="upload-bg"></div>
            <div className="upload-content">
              <div className="result-card" ref={resultCardRef}>
                <div className="result-title">{result.title ? result.title : "AI Document Analysis"}</div>
                {result.summary && (
                  <div className="result-section">
                    <span className="result-label">Summary</span>
                    <div className="result-text">{renderValue(result.summary)}</div>
                  </div>
                )}
                {result.cleaned_text && (
                  <div className="result-section cleaned-text-section">
                    <span className="result-label">Cleaned Text</span>
                    <pre className="result-pre">{renderValue(result.cleaned_text)}</pre>
                  </div>
                )}
                {result.classification && (
                  <div className="result-section">
                    <span className="result-label">Classification</span>
                    <div className="result-text">{renderValue(result.classification)}</div>
                  </div>
                )}
                {result.tags && (
                  <div className="result-section">
                    <span className="result-label">Tags</span>
                    <div>
                      {Array.isArray(result.tags)
                        ? result.tags.map((tag: string, i: number) => (
                            <span className="result-chip" key={i}>{renderValue(tag)}</span>
                          ))
                        : <span className="result-chip">{renderValue(result.tags)}</span>}
                    </div>
                  </div>
                )}
                {result.language && (
                  <div className="result-section">
                    <span className="result-label">Language</span>
                    <div className="result-text">{renderValue(result.language)}</div>
                  </div>
                )}
                {result.key_points && (
                  <div className="result-section">
                    <span className="result-label">Key Points</span>
                    <ul className="result-list">
                      {Array.isArray(result.key_points)
                        ? result.key_points.map((pt: any, i: number) => <li key={i}>{renderValue(pt)}</li>)
                        : <li>{renderValue(result.key_points)}</li>}
                    </ul>
                  </div>
                )}
                {result.insights && (
                  <div className="result-section">
                    <span className="result-label">Actionable Insights</span>
                    <div className="result-text">{renderValue(result.insights)}</div>
                  </div>
                )}
                {result.client_goals && (
                  <div className="result-section">
                    <span className="result-label">Client Goals</span>
                    <div className="result-text">{renderValue(result.client_goals)}</div>
                  </div>
                )}
                {result.suggested_tech && (
                  <div className="result-section">
                    <span className="result-label">Suggested Tech</span>
                    <div className="result-text">{renderValue(result.suggested_tech)}</div>
                  </div>
                )}
                {result.time_estimate && (
                  <div className="result-section">
                    <span className="result-label">Time Estimate</span>
                    <div className="result-text">{renderValue(result.time_estimate)}</div>
                  </div>
                )}
                {result.structured_brief && (
                  <div className="result-section">
                    <span className="result-label">Structured Project Brief</span>
                    <pre className="result-pre">{renderValue(result.structured_brief)}</pre>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                  <button className="btn-generate" style={{ width: 'auto', minWidth: 160 }} onClick={handleSaveToMyDocs}>
                    Save to MyDocs
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
