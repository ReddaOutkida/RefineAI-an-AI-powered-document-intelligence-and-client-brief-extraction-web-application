"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../signup/Signup.module.css";

function validateEmail(email: string) {
  // Simple email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailError, setEmailError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "email") {
      setEmailError(validateEmail(e.target.value) ? "" : "Please enter a valid email address.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateEmail(form.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      localStorage.setItem('authToken', data.access_token || '1');
      window.dispatchEvent(new Event('authChanged'));
      router.push("/");
      // TODO: Store JWT and redirect to dashboard or home
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.title}>Log in to your account</h1>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className={styles.input}
          />
          {emailError && <div className={styles.error}>{emailError}</div>}
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className={styles.input}
          />
          <button
            type="submit"
            disabled={loading}
            className={styles.button}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        <div className={styles.footerText}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className={styles.loginLink}>Sign up</Link>
        </div>
      </div>
    </main>
  );
} 