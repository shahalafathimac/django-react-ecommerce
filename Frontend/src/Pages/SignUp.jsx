import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiArrowRight } from "react-icons/fi";

import { getApiErrorMessage } from "../api/apiError";
import { UserContext } from "../UserContext";

function SignUp() {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register } = useContext(UserContext);

  const handleChange = (e) => {
    setUser({ ...user,[e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const payload = {
      name: user.name.trim(),
      email: user.email.trim().toLowerCase(),
      password: user.password,
    };

    if (!payload.name || !payload.email || !payload.password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (payload.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      await register(payload);
      navigate("/login");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Something went wrong. Please try again."));
    } finally {
      setIsSubmitting(false);
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
            Create an <span className="italic text-[#d9c3b0]">Account</span>
          </h2>
          <p className="text-[#a89688] text-[10px] uppercase tracking-[0.2em]">
            Join Orovia Ornaments
          </p>
        </div>

        {errorMessage && (
          <div className="mb-8 flex items-start gap-3 text-sm text-[#e86a4d] bg-[#8c3c2a]/10 border border-[#8c3c2a]/30 p-4 rounded-sm">
            <FiAlertCircle className="mt-0.5 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#e4d4c8] text-[10px] uppercase tracking-widest mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-[#e4d4c8] text-[10px] uppercase tracking-widest mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label className="block text-[#e4d4c8] text-[10px] uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={inputStyle}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 bg-[#c49b76] text-[#110804] py-4 rounded-full text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-[#b58c66] transition-colors duration-300 flex justify-center items-center gap-2"
          >
            {isSubmitting ? "Creating..." : "Create Account"}
            {!isSubmitting && <FiArrowRight size={14} />}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-[#2a170e] text-center">
          <p className="text-[#a89688] text-sm font-light">
            Already have an account?{" "}
            <span
              className="text-[#c49b76] font-medium cursor-pointer hover:text-[#e4d4c8] transition-colors duration-300"
              onClick={() => navigate("/login")}
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
