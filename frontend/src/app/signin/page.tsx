"use client";

import React, { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signin } from "../utils/httpClients";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const res = await signin(email, password);
    if (res && res.token) {
      localStorage.setItem("token", res.token);
      const redirectTo = redirectPath ? decodeURIComponent(redirectPath) : "/";
      console.log("Redirecting to:", redirectTo);
      router.push(redirectTo); // Redirect the user
    } else {
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 dark:bg-backpack-dark-bg p-4 sm:p-6 lg:p-8">
      <div className="bg-gray-800 dark:bg-backpack-dark-card p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-700 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-center text-gray-100 dark:text-backpack-dark-text-primary mb-8">
          Sign In to Your Account
        </h2>

        <form onSubmit={handleSubmit}>
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
              className="w-full px-4 py-2 bg-gray-700 dark:bg-gray-900 text-gray-100 dark:text-backpack-dark-text-primary border border-gray-600 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-backpack-accent focus:border-transparent transition duration-200"
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
              className="w-full px-4 py-2 bg-gray-700 dark:bg-gray-900 text-gray-100 dark:text-backpack-dark-text-primary border border-gray-600 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-backpack-accent focus:border-transparent transition duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex justify-between items-center mb-6">
            <label className="flex items-center text-gray-300 dark:text-backpack-dark-text-secondary text-sm">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 dark:text-backpack-accent rounded"
              />
              <span className="ml-2">Remember me</span>
            </label>
            <a
              href="/forgot-password"
              className="text-blue-500 dark:text-backpack-accent hover:underline text-sm font-semibold"
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 dark:bg-backpack-accent text-white dark:text-gray-900 py-3 rounded-lg font-semibold hover:bg-red-700 dark:hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-backpack-accent focus:ring-opacity-50 transition duration-200"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-gray-400 dark:text-gray-400 text-sm mt-6">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-blue-500 dark:text-backpack-accent hover:underline font-semibold"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
