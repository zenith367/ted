import React, { useState } from "react";
import { db } from "../services/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const CompanyInstitutionRegistration = () => {
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("company");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const hardcodedValidNumbers = [
    "COMP-001",
    "COMP-002",
    "INST-001",
    "INST-002",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !businessName.trim() ||
      !businessEmail.trim() ||
      !registrationNumber.trim() ||
      !description.trim()
    ) {
      setError("All fields are required.");
      return;
    }

    if (!hardcodedValidNumbers.includes(registrationNumber)) {
      setError("Invalid registration number. Please contact admin.");
      return;
    }

    try {
      // ✅ Save to correct Firestore collection (no auth required)
      const data = {
        name: businessName,
        email: businessEmail,
        registrationNumber,
        description,
        role,
        status: "pending", // awaiting admin approval
        createdAt: new Date(),
      };

      const targetCollection =
        role === "institution" ? "institutions" : "companies";

      await addDoc(collection(db, targetCollection), data);

      setSuccess(
        "Registration submitted! Wait for admin approval. You’ll receive an email if approved."
      );

      // reset form
      setBusinessName("");
      setBusinessEmail("");
      setRegistrationNumber("");
      setDescription("");
      setRole("company");

      // optional redirect
      setTimeout(() => navigate("/"), 5000);
    } catch (err) {
      console.error("Firestore error:", err);
      setError("Error submitting registration. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b0b1b] via-[#0c0c1f] to-black text-white p-6">
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Company/Institution Registration
        </h1>

        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
        {success && <p className="text-green-400 mb-4 text-center">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Business Email</label>
            <input
              type="email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Registration Number</label>
            <input
              type="text"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              placeholder="e.g., COMP-001"
            />
            <small className="text-gray-400">
              Must match a valid company/institution ID.
            </small>
          </div>

          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              rows={3}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            >
              <option value="company">Company</option>
              <option value="institution">Institution</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
          >
            Submit Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanyInstitutionRegistration;
