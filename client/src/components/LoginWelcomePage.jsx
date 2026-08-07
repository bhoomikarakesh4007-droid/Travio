import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "../styles/LoginWelcomePage.css";

import travioLogo from "../assets/images/travio-logo.png";

function getAuthErrorMessage(err) {
  const code = err?.code;

  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "We couldn’t sign you in. Please check your email and password, or create a new account.";
    case "auth/email-already-in-use":
      return "An account already exists with this email address.";
    case "auth/weak-password":
      return "Please choose a stronger password with at least 6 characters.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled in Firebase Console. Please enable it for this project.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection and try again.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return err?.message || "Authentication failed";
  }
}

export default function LoginWelcomePage() {
  const navigate = useNavigate();
  const { login, signup, googleLogin } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const safeEmail = email.trim();
    const safePassword = password.trim();
    const safeName = name.trim();

    if (!safeEmail || !safePassword || (!isLogin && !safeName)) {
      setError(isLogin ? "Please enter your email and password." : "Please fill in your name, email, and password.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(safeEmail, safePassword);
      } else {
        await signup(safeEmail, safePassword, safeName);
      }
      navigate("/home");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);

    try {
      await googleLogin();
      navigate("/home");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="bg-circle circle1" />
      <div className="bg-circle circle2" />
      <div className="bg-circle circle3" />
      <div className="bg-circle circle4" />
      <div className="airplane">✈️</div>
      <div className="cloud cloud1" />
      <div className="cloud cloud2" />
      <div className="cloud cloud3" />

      <div className="login-card">
        <img className="login-logo" src={travioLogo} alt="Travio" />

        <span className="eyebrow">Your travel companion</span>
        <div className="brand-badge">✈️ Travel smarter</div>
        <h1>{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-subtitle">
          Discover destinations, plan journeys, and let Travio guide every step with elegance.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Carter"
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="continue-btn" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button className="google-btn" type="button" onClick={handleGoogle} disabled={loading}>
          <span className="google-icon">G</span>
          Continue with Google
        </button>

        <p className="toggle-auth">
          {isLogin ? "New to Travio?" : "Already have an account?"}{" "}
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Create account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}