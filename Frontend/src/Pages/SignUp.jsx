import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "../api/apiError";
import { UserContext } from "../UserContext";

function SignUp() {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { register } = useContext(UserContext);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await register(user);
      navigate("/");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Something went wrong. Please try again."));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign Up</h2>

        {errorMessage && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 rounded-lg transition duration-300"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <span
            className="text-yellow-500 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
