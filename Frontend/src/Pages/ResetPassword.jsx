import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiAlertCircle, FiArrowRight, FiCheckCircle, FiLock } from "react-icons/fi";

import { getApiErrorMessage } from "../api/apiError";
import { resetPassword } from "../api/userApi";

function ResetPassword() {
  const navigate = useNavigate();
  const { uid = "", token = "" } = useParams();
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputStyle =
    "w-full bg-[#110804] text-[#e4d4c8] placeholder-[#a89688]/50 border border-[#2a170e] rounded-sm py-4 px-5 text-sm focus:outline-none focus:border-[#c49b76] transition-colors duration-300";

  const hasValidToken = useMemo(() => Boolean(uid && token), [token, uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!hasValidToken) {
      setErrorMessage("This reset link is invalid.");
      return;
    }

    if (!form.newPassword || !form.confirmPassword) {
      setErrorMessage("Please fill in both password fields.");
      return;
    }

    if (form.newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await resetPassword({
        uid,
        token,
        new_password: form.newPassword,
      });
      setSuccessMessage(response.data?.message || "Password reset successful.");
      setForm({ newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        navigate("/login");
      }, 1800);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "Unable to reset password right now. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center bg-[#110804] font-sans px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c49b76] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="bg-[#130905] border border-[#2a170e] rounded-sm p-8 sm:p-12 w-full max-w-md relative z-10 shadow-2xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif text-[#f4ece4] mb-2">
            Reset <span className="italic text-[#d9c3b0]">Password</span>
          </h2>
          <p className="text-[#a89688] text-[10px] uppercase tracking-[0.2em]">
            Choose a new secure password
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 text-sm text-[#e86a4d] bg-[#8c3c2a]/10 border border-[#8c3c2a]/30 p-4 rounded-sm">
            <FiAlertCircle className="mt-0.5 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-start gap-3 text-sm text-[#c49b76] bg-[#c49b76]/10 border border-[#c49b76]/30 p-4 rounded-sm">
            <FiCheckCircle className="mt-0.5 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#e4d4c8] text-[10px] uppercase tracking-widest mb-2">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={inputStyle}
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-[#e4d4c8] text-[10px] uppercase tracking-widest mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={inputStyle}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !hasValidToken}
            className="w-full mt-4 bg-[#c49b76] text-[#110804] py-4 rounded-full text-[11px] font-medium uppercase tracking-[0.2em] hover:bg-[#b58c66] transition-colors duration-300 flex justify-center items-center gap-2"
          >
            <FiLock size={14} />
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-[#2a170e] text-center">
          <Link
            to="/login"
            className="text-[#c49b76] font-medium hover:text-[#e4d4c8] transition-colors duration-300 inline-flex items-center gap-2"
          >
            Back to Login <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
