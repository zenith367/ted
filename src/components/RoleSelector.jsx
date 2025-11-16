// src/components/RoleSelector.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function RoleSelector({ role, setRole }) {
  const navigate = useNavigate();

  const handleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);

    // Redirect to special registration forms for company or institution
    if (selectedRole === "institution") {
      navigate("/register/institution");
    } else if (selectedRole === "company") {
      navigate("/register/company");
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 text-gray-300">Select Role</label>
      <select
        className="w-full px-4 py-2 rounded-md bg-[#181832] text-gray-200 outline-none"
        value={role}
        onChange={handleChange}
      >
        <option value="">Select Role</option>
        <option value="student">Student</option>
        <option value="institution">Institution</option>
        <option value="company">Company</option>
      </select>
    </div>
  );
}

export default RoleSelector;
