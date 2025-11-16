import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import CompanyInstitutionRegistration from "./pages/CompanyInstitutionRegistration";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load dashboard components
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const InstitutionDashboard = lazy(() => import("./pages/InstitutionDashboard"));
const CompanyDashboard = lazy(() => import("./pages/CompanyDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a1a] via-[#0a0a2a] to-black">
    <div className="text-white text-xl">Loading...</div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0b0b1b] via-[#0c0c1f] to-black text-white">
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Company / Institution Registration */}
            <Route
              path="/register/institution"
              element={<CompanyInstitutionRegistration />}
            />
            <Route
              path="/register/company"
              element={<CompanyInstitutionRegistration />}
            />

            {/* Protected Routes */}
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <StudentDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/institution-dashboard"
              element={
                <ProtectedRoute allowedRoles={["institution"]}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <InstitutionDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/company-dashboard"
              element={
                <ProtectedRoute allowedRoles={["company"]}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <CompanyDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <AdminDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
