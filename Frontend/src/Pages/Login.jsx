import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUsers } from "../api/userApi.js";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      // Fetch users from json-server
      const res = await getUsers();
      const users = res.data || [];

      // Find user
      const validUser = users.find(
        (u) => u.email === email.trim() && u.password === password
      );

      console.log(validUser);

      if (validUser) {

        //  ADDED ACTIVE CHECK HERE 
        if (validUser.active === false) {
          setLoading(false);
          setErrorMsg("Your account is inactive. Please contact admin.");
          return;
        }
        //  END OF ACTIVE CHECK 

        // Save to localStorage
        // always store fresh user from DB
      const freshUser = {
        ...validUser,
        role: validUser.role || "user"
      };

      localStorage.setItem("loggedInUser", JSON.stringify(freshUser));

        setLoading(false);

        // Check admin condition
        if (validUser.role === "admin") {
          console.log(validUser.role)
          navigate("/admin/dashboard"); // Go to admin dashboard
        } else {
          navigate("/"); // Normal user goes home
        }

      } else {
        setLoading(false);
        setErrorMsg("Invalid email or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      setErrorMsg("Unable to contact server. Try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

        {errorMsg && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? "bg-yellow-300 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-500"
            } text-white font-semibold py-2 rounded-lg transition duration-300`}
          >
            {loading ? "Checking..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-yellow-500 font-semibold cursor-pointer">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
