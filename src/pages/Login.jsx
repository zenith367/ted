import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email verified
      if (!user.emailVerified) {
        setError("Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      // Fetch role from Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        setError("User data not found. Contact admin.");
        setLoading(false);
        return;
      }
      const userData = docSnap.data();

      // Check approval for company/institution
      if ((userData.role === "company" || userData.role === "institution") && !userData.approved) {
        setError("Your account is pending admin approval.");
        setLoading(false);
        return;
      }

      // Redirect based on role
      switch (userData.role) {
        case "student":
          navigate("/student-dashboard");
          break;
        case "institution":
          navigate("/institution-dashboard");
          break;
        case "company":
          navigate("/company-dashboard");
          break;
        case "admin":
          // Check for hardcoded admin password
          if (password === "admin123") {
            navigate("/admin-dashboard");
          } else {
            setError("Invalid admin credentials.");
          }
          break;
        default:
          setError("Invalid role assigned.");
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-3xl font-semibold text-white mb-4">Login</h2>
      <form
        className="bg-[#121228] p-8 rounded-2xl shadow-md w-80"
        onSubmit={handleLogin}
      >
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 rounded-md bg-[#181832] text-gray-200 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 rounded-md bg-[#181832] text-gray-200 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
      <p className="mt-4 text-gray-400">
        Don’t have an account?{" "}
        <Link to="/register" className="text-indigo-500 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}

export default Login;
