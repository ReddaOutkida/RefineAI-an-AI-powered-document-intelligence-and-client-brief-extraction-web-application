"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import "./mydocs.css"

function renderValue(val: any) {
  if (val == null) return null
  if (typeof val === "object") return <pre className="json-output">{JSON.stringify(val, null, 2)}</pre>
  return String(val)
}

interface Doc {
  _id: string
  filename: string
  gemini_outputs: any
  file_path: string
  upload_date: string
}

export default function MyDocsPage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("authToken")
        const res = await fetch("http://localhost:8000/docs/my-docs", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const data = await res.json()
        if (res.ok) {
          setDocs(data.docs)
        } else {
          setError(data.detail || "Failed to fetch documents.")
        }
      } catch (err: any) {
        setError("Failed to fetch documents.")
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  const handleDelete = async (docId: string) => {
    if (!window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) return
    setDeleteLoading(docId)
    const token = localStorage.getItem("authToken")
    try {
      const res = await fetch(`http://localhost:8000/docs/doc/${docId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        setDocs((prev) => prev.filter((doc) => doc._id !== docId))
      } else {
        const data = await res.json()
        alert(data.detail || data.msg || "Failed to delete document.")
      }
    } catch (err) {
      alert("Failed to delete document.")
    } finally {
      setDeleteLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <main className="mydocs-page">
      {/* Hero Section */}
      <section className="mydocs-hero">
        <div className="mydocs-hero-content">
          <div className="mydocs-badge">📚 My Documents</div>
          <h1 className="mydocs-title">
            Your <span className="mydocs-title-gradient">Refined</span> Documents
          </h1>
          <p className="mydocs-description">
            Access all your AI-processed documents with insights, summaries, and actionable recommendations.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="mydocs-content">
        <div className="mydocs-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading your documents...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h3>Error Loading Documents</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="retry-button">
                Try Again
              </button>
            </div>
          ) : docs.length === 0 ? (
            <div className="empty-container">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10,9 9,9 8,9" />
                </svg>
              </div>
              <h3>No Documents Yet</h3>
              <p>You haven't refined any documents yet. Upload your first document to get started!</p>
              <Link href="/" className="upload-button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Upload Document
              </Link>
            </div>
          ) : (
            <div className="documents-grid">
              {docs.map((doc) => {
                const outputs = doc.gemini_outputs || {}
                let title = outputs.title || "Untitled Document"
                if (title.length > 60) title = title.slice(0, 60) + "..."
                return (
                  <div key={doc._id} className="document-card">
                    <div className="document-header">
                      <div className="document-info">
                        <h3 className="document-title">{title}</h3>
                        <p className="document-date">{formatDate(doc.upload_date)}</p>
                      </div>
                      <div className="document-actions">
                        {doc.filename.toLowerCase().endsWith('.pdf') ? (
                          <a
                            href={`http://localhost:8000/uploads/${doc.filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-button view-button"
                            title="View original PDF"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14,2 14,8 20,8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10,9 9,9 8,9" />
                            </svg>
                          </a>
                        ) : (
                          <a
                            href={`http://localhost:8000/uploads/${doc.filename}`}
                            download={doc.filename}
                            className="action-button view-button"
                            title="Download original file"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14,2 14,8 20,8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10,9 9,9 8,9" />
                            </svg>
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="action-button delete-button"
                          title="Delete document"
                          disabled={deleteLoading === doc._id}
                        >
                          {deleteLoading === doc._id ? (
                            <div className="mini-spinner"></div>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3,6 5,6 21,6" />
                              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="document-content">
                      {outputs.summary && (
                        <div className="content-section">
                          <div className="section-header">
                            <div className="section-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14,2 14,8 20,8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                              </svg>
                            </div>
                            <h4>Summary</h4>
                          </div>
                          <div className="section-content">{renderValue(outputs.summary)}</div>
                        </div>
                      )}
                      {outputs.classification && (
                        <div className="content-section">
                          <div className="section-header">
                            <div className="section-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                              </svg>
                            </div>
                            <h4>Classification</h4>
                          </div>
                          <div className="section-content">{renderValue(outputs.classification)}</div>
                        </div>
                      )}
                      {outputs.tags && (
                        <div className="content-section">
                          <div className="section-header">
                            <div className="section-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                                <line x1="7" y1="7" x2="7.01" y2="7" />
                              </svg>
                            </div>
                            <h4>Tags</h4>
                          </div>
                          <div className="tags-container">
                            {Array.isArray(outputs.tags) ? (
                              outputs.tags.map((tag: string, i: number) => (
                                <span className="tag-chip" key={i}>
                                  {renderValue(tag)}
                                </span>
                              ))
                            ) : (
                              <span className="tag-chip">{renderValue(outputs.tags)}</span>
                            )}
                          </div>
                        </div>
                      )}
                      {outputs.language && (
                        <div className="content-section">
                          <div className="section-header">
                            <div className="section-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                              </svg>
                            </div>
                            <h4>Language</h4>
                          </div>
                          <div className="section-content">{renderValue(outputs.language)}</div>
                        </div>
                      )}
                      {outputs.key_points && (
                        <div className="content-section">
                          <div className="section-header">
                            <div className="section-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9,11 12,14 22,4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                              </svg>
                            </div>
                            <h4>Key Points</h4>
                          </div>
                          <ul className="points-list">
                            {Array.isArray(outputs.key_points) ? (
                              outputs.key_points.map((pt: any, i: number) => <li key={i}>{renderValue(pt)}</li>)
                            ) : (
                              <li>{renderValue(outputs.key_points)}</li>
                            )}
                          </ul>
                        </div>
                      )}
                      {outputs.insights && (
                        <div className="content-section">
                          <div className="section-header">
                            <div className="section-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                              </svg>
                            </div>
                            <h4>Actionable Insights</h4>
                          </div>
                          <div className="section-content">{renderValue(outputs.insights)}</div>
                        </div>
                      )}
                      {outputs.client_goals && (
                        <div className="content-section">
                          <div className="section-header">
                            <div className="section-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            </div>
                            <h4>Client Goals</h4>
                          </div>
                          <div className="section-content">{renderValue(outputs.client_goals)}</div>
                        </div>
                      )}
                      {outputs.suggested_tech && (
                        <div className="content-section">
                          <div className="section-header">
                            <div className="section-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                <line x1="8" y1="21" x2="16" y2="21" />
                                <line x1="12" y1="17" x2="12" y2="21" />
                              </svg>
                            </div>
                            <h4>Suggested Tech</h4>
                          </div>
                          <div className="section-content">{renderValue(outputs.suggested_tech)}</div>
                        </div>
                      )}
                      {outputs.time_estimate && (
                        <div className="content-section">
                          <div className="section-header">
                            <div className="section-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12,6 12,12 16,14" />
                              </svg>
                            </div>
                            <h4>Time Estimate</h4>
                          </div>
                          <div className="section-content">{renderValue(outputs.time_estimate)}</div>
                        </div>
                      )}
                      {outputs.structured_brief && (
                        <div className="content-section">
                          <div className="section-header">
                            <div className="section-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14,2 14,8 20,8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10,9 9,9 8,9" />
                              </svg>
                            </div>
                            <h4>Structured Project Brief</h4>
                          </div>
                          <div className="section-content">
                            <pre className="structured-brief">{renderValue(outputs.structured_brief)}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

