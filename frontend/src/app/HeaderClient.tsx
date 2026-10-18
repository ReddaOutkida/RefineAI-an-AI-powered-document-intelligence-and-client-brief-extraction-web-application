"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function HeaderClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check auth state on mount, on storage/authChanged, and on route change
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem("authToken"));
      setLoading(false);
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("authChanged", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChanged", checkAuth);
    };
  }, [pathname]);

  if (loading) return null;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    router.push("/login");
  };

  const handleLogoClick = () => {
    if (pathname === "/") {
      window.location.reload();
    } else {
      router.push("/");
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" className="logo-svg">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="logo">RefineAI</div>
        </div>
        <nav className="nav">
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="nav-link">
                <span>Login</span>
              </Link>
              <Link href="/signup" className="nav-button">
                <span className="nav-button-text">Get Started</span>
                <svg className="nav-button-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/about" className="nav-link">
                <span>About</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/mydocs" className="nav-button">
                <span className="nav-button-text">MyDocs</span>
              </Link>
              <Link href="/about" className="nav-link">
                <span>About</span>
              </Link>
              <button onClick={handleLogout} className="nav-link" data-logout style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                <span>Logout</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
} 