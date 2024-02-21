"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { authOptions } from "@/lib/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    // Validate the user against database
    // and establish a session or send back a JWT or some authentication token.
  }

  async function handleGithubLogin() {
    await signIn("github", authOptions);
  }

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center h-screen -mt-14">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <form className="w-64" onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </button>

          <button
            type="button"
            onClick={handleGithubLogin}
            className="w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-900 mt-4"
          >
            Login with Github
          </button>
        </form>
        <Link href="/register" className="mt-4 block text-blue-500">
          Register
        </Link>
        <Link href="/" className="mt-4 text-blue-500">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
