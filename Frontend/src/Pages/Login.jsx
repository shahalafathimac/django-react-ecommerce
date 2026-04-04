import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiAlertCircle, FiLogIn, FiLoader } from "react-icons/fi";
import { GoogleLogin } from '@react-oauth/google';
import { getApiErrorMessage } from "../api/apiError";
import axiosInstance from "../api/axiosInstance";
import { storeAuthData } from "../api/userApi";
import { UserContext } from "../UserContext";

function Login() {
  const [email, setEmail] = useState("");
  const[password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const[errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { login, refreshSession } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const user = await login({
        email: email.trim(),
        password,
      });

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, "Unable to sign in right now. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;

    if (!token) {
      setErrorMsg("Google login failed. Try again.");
      return;
    }

    setErrorMsg("");

    try {
      const response = await axiosInstance.post("/google-login/", { token });
      storeAuthData(response.data);
      await refreshSession();
      navigate("/");
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, "Google login failed. Try again."));
    }
  };


  // Reusable input style
  const inputStyle = "w-full bg-[#110804] text-[#e4d4c8] placeholder-[#a89688]/50 border border-[#2a170e] rounded-sm py-4 px-5 text-sm focus:outline-none focus:border-[#c49b76] transition-colors duration-300";

  return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center bg-[#110804] font-sans px-6 relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c49b76] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="bg-[#130905] border border-[#2a170e] rounded-sm p-8 sm:p-12 w-full max-w-md relative z-10 shadow-2xl">
        
        {/* Brand/Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif text-[#f4ece4] mb-2">
            Welcome <span className="italic text-[#d9c3b0]">Back</span>
          </h2>
          <p className="text-[#a89688] text-[10px] uppercase tracking-[0.2em]">
            Sign in to your account
          </p>
        </div>

        {errorMsg && (
          <div className="mb-8 flex items-start gap-3 text-sm text-[#e86a4d] bg-[#8c3c2a]/10 border border-[#8c3c2a]/30 p-4 rounded-sm">
            <FiAlertCircle className="mt-0.5 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[#e4d4c8] text-[10px] uppercase tracking-widest mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className={inputStyle}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[#e4d4c8] text-[10px] uppercase tracking-widest">
                Password
              </label>
              {/* Optional: Placeholder for Forgot Password */}
              <Link
                to="/forgot-password"
                className="text-[#a89688] text-[9px] uppercase tracking-wider cursor-pointer hover:text-[#c49b76] transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputStyle}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 flex justify-center items-center gap-2 py-4 rounded-full text-[11px] font-medium uppercase tracking-[0.2em] transition-all duration-300
              ${loading 
                ? "bg-[#2a170e] text-[#a89688] cursor-not-allowed" 
                : "bg-[#c49b76] text-[#110804] hover:bg-[#b58c66]"
              }`}
          >
            {loading ? (
              <><FiLoader className="animate-spin" size={14} /> Authenticating...</>
            ) : (
              <><FiLogIn size={14} /> Secure Login</>
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[#2a170e]"></div>
            <span className="mx-4 text-[10px] uppercase tracking-[0.2em] text-[#a89688]">
              Or continue with
            </span>
            <div className="flex-grow border-t border-[#2a170e]"></div>
          </div>
          <div className="mt-4 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setErrorMsg("Google login failed. Try again.")}
              theme="outline"
              shape="pill"
              size="large"
              text="continue_with"
            />
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#2a170e] text-center">
          <p className="text-[#a89688] text-sm font-light">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#c49b76] font-medium hover:text-[#e4d4c8] transition-colors duration-300">
              Create One
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
