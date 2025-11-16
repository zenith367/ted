// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check for admin login first
    if (localStorage.getItem("adminLoggedIn") === "true" && allowedRoles.includes("admin")) {
      setUserData({ role: "admin" });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [allowedRoles]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  // Allow admin if logged in via localStorage
  if (localStorage.getItem("adminLoggedIn") === "true" && allowedRoles.includes("admin")) {
    return children;
  }

  if (!user) return <Navigate to="/login" />;
  if (!user.emailVerified) return <Navigate to="/verify-email" />;

  if (
    (userData.role === "company" || userData.role === "institution") &&
    !userData.approved
  ) {
    return <Navigate to="/pending-approval" />;
  }

  if (!allowedRoles.includes(userData.role)) return <Navigate to="/unauthorized" />;

  return children;
};

export default ProtectedRoute;
