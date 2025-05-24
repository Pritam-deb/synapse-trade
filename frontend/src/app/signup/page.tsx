"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signup } from "../utils/httpClients";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const res = await signup(email, password, username);
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      router.push("/");
    } else {
      alert(data.error || "Failed to create account");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 dark:bg-backpack-dark-bg p-4 sm:p-6 lg:p-8">
      <div className="bg-gray-800 dark:bg-backpack-dark-card p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-center text-gray-100 dark:text-backpack-dark-text-primary mb-8">
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block text-gray-300 dark:text-backpack-dark-text-secondary text-sm font-semibold mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="John123"
              required
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-gray-300 dark:text-backpack-dark-text-secondary text-sm font-semibold mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-300 dark:text-backpack-dark-text-secondary text-sm font-semibold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-300 dark:text-backpack-dark-text-secondary text-sm font-semibold mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition duration-200"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{" "}
          <a
            href="/signin"
            className="text-blue-600 hover:underline font-semibold"
          >
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
