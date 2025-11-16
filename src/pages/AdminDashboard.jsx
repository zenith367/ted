import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../services/firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

const TEAL = "#4fd1c5";
const BG = "#06060a";

// Globe background component
const GlobeBG = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <svg
      viewBox="0 0 900 900"
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vmin] opacity-30"
      style={{ filter: "blur(20px)" }}
    >
      <defs>
        <radialGradient id="rb" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#04111a" />
          <stop offset="100%" stopColor="#001012" />
        </radialGradient>
        <linearGradient id="lg" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#07282b" />
          <stop offset="100%" stopColor={TEAL} />
        </linearGradient>
      </defs>

      <g
        style={{
          transformOrigin: "50% 50%",
          animation: "globe-rotate 45s linear infinite",
        }}
      >
        <circle
          cx="450"
          cy="450"
          r="330"
          fill="url(#rb)"
          stroke="rgba(79,209,197,0.04)"
          strokeWidth="1"
        />
        {[...Array(10)].map((_, i) => (
          <ellipse
            key={i}
            cx="450"
            cy="450"
            rx={300 - i * 28}
            ry={(300 - i * 28) * (0.34 + (i % 2) * 0.02)}
            fill="none"
            stroke="rgba(79,209,197,0.03)"
            strokeWidth="1"
          />
        ))}
        {[...Array(20)].map((_, i) => {
          const ang = (i / 20) * Math.PI * 2;
          const x = 450 + Math.cos(ang) * 260;
          const y = 450 + Math.sin(ang) * 110;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3}
              fill={i % 2 ? TEAL : "#00b5d8"}
              opacity={0.9}
            />
          );
        })}
        <circle
          cx="450"
          cy="450"
          r="340"
          fill="none"
          stroke="url(#lg)"
          strokeWidth="2"
          opacity="0.05"
        />
      </g>
    </svg>

    <style>{`
      @keyframes globe-rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Sidebar component
const Sidebar = ({ active, setActive, logout }) => {
  const nav = [
    { key: "Overview", label: "Dashboard" },
    { key: "Institutions", label: "Institutions" },
    { key: "Faculties", label: "Faculties" },
    { key: "Courses", label: "Courses" },
    { key: "Companies", label: "Companies" },
    { key: "Students", label: "Students" },
    { key: "Admissions", label: "Admissions" },
    { key: "Reports", label: "Reports" },
  ];

  return (
    <aside className="w-72 min-h-screen px-6 pt-8 pb-6 bg-[rgba(0,0,0,0.3)] border-r border-[rgba(255,255,255,0.02)] fixed left-0 top-0">
      <div className="mb-8">
        <div className="text-white text-2xl font-bold">Admin Console</div>
        <div className="text-gray-400 text-sm">Faculty of ICT</div>
      </div>

      <nav className="space-y-2">
        {nav.map((n) => (
          <button
            key={n.key}
            onClick={() => setActive(n.key)}
            className={`w-full px-3 py-2 rounded-lg text-left ${
              active === n.key ? "bg-[rgba(79,209,197,0.06)]" : "hover:bg-[rgba(255,255,255,0.03)]"
            }`}
          >
            <span className="text-sm text-white">{n.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-10 text-gray-300 text-sm">
        <div>Logged in as</div>
        <div className="text-white font-semibold">Admin</div>

        <Button
          onClick={logout}
          variant="destructive"
          className="mt-3"
        >
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default function AdminDashboard() {
  const [active, setActive] = useState("Overview");
  const [institutions, setInstitutions] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [overview, setOverview] = useState({
    totalInstitutions: 0,
    totalStudents: 0,
    totalCompanies: 0,
    totalAdmissions: 0,
  });
  const [chartData, setChartData] = useState([]);

  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const inst = await getDocs(collection(db, "institutions"));
    const fac = await getDocs(collection(db, "faculties"));
    const cou = await getDocs(collection(db, "courses"));
    const com = await getDocs(collection(db, "companies"));
    const stu = await getDocs(collection(db, "students"));
    const adm = await getDocs(collection(db, "admissions"));
    const reg = await getDocs(collection(db, "registrations"));

    setInstitutions(inst.docs.map((d) => ({ id: d.id, ...d.data() })));
    setFaculties(fac.docs.map((d) => ({ id: d.id, ...d.data() })));
    setCourses(cou.docs.map((d) => ({ id: d.id, ...d.data() })));
    setCompanies(com.docs.map((d) => ({ id: d.id, ...d.data() })));
    setStudents(stu.docs.map((d) => ({ id: d.id, ...d.data() })));
    setAdmissions(adm.docs.map((d) => ({ id: d.id, ...d.data() })));
    setRegistrations(reg.docs.map((d) => ({ id: d.id, ...d.data() })));

    setOverview({
      totalInstitutions: inst.size,
      totalStudents: stu.size,
      totalCompanies: com.size,
      totalAdmissions: adm.size,
    });

    setChartData([
      { name: "Institutions", value: inst.size },
      { name: "Students", value: stu.size },
      { name: "Companies", value: com.size },
      { name: "Admissions", value: adm.size },
    ]);
  };

  // -----------------------------
  // ✅ APPROVE FUNCTION (Backend for email + Firebase for status)
  // -----------------------------
  const handleApprove = async (collectionName, item) => {
    try {
      const role = collectionName === "institutions" ? "institution" : "company";

      const res = await fetch(
        "https://landing-x99b.onrender.com/api/admin/approve-registration",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          email: item.email,
          name: item.name,
          role
        }),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert(`${item.name} approved! Email sent with generated password.`);
        loadAll(); // refresh dashboard
      } else {
        alert("Approval failed: " + data.message);
      }
    } catch (error) {
      console.error("Error approving:", error);
      alert("Failed to approve");
    }
  };
  const handleSuspend = async (collectionName, id) => {
    try {
      const itemRef = doc(db, collectionName, id);
      await updateDoc(itemRef, { status: "suspended" });
      loadAll();
    } catch (error) {
      console.error("Error suspending:", error);
      alert("Failed to suspend");
    }
  };

  // -----------------------------
  // ✅ PUBLISH ADMISSIONS
  // -----------------------------
  const handlePublishAdmissions = async (id) => {
    try {
      const itemRef = doc(db, "institutions", id);
      await updateDoc(itemRef, { published: true });
      loadAll();
    } catch (error) {
      console.error("Error publishing:", error);
      alert("Failed to publish admissions");
    }
  };

  // -----------------------------
  // ✅ UPDATE FUNCTION
  // -----------------------------
  const handleUpdate = async (collectionName, id, currentName) => {
    const newName = prompt(`Update ${collectionName.slice(0, -1)} name:`, currentName);
    if (!newName || newName === currentName) return;

    try {
      const itemRef = doc(db, collectionName, id);
      await updateDoc(itemRef, { name: newName });
      loadAll();
    } catch (error) {
      console.error("Error updating:", error);
      alert("Failed to update");
    }
  };

  // -----------------------------
  // ✅ DELETE FUNCTION (Firestore only)
  // -----------------------------
  const handleDelete = async (collectionName, id) => {
    try {
      const itemRef = doc(db, collectionName, id);
      await deleteDoc(itemRef);
      loadAll();
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete");
    }
  };

  // -----------------------------
  // ADD ITEM (Optional)
  // -----------------------------
  const handleAdd = async (collectionName) => {
    const name = prompt(`Enter ${collectionName.slice(0, -1)} name:`);
    if (!name) return;

    let extra = {};
    if (collectionName === "faculties" || collectionName === "courses") {
      const instId = prompt("Enter Institution ID:");
      if (!instId) return;
      extra.institutionId = instId;
    }

    try {
      const collRef = collection(db, collectionName);
      await addDoc(collRef, { name, status: "pending", createdAt: serverTimestamp(), ...extra });
      loadAll();
    } catch (error) {
      console.error("Error adding:", error);
      alert("Failed to add");
    }
  };

  const renderList = (items, collectionName, showApprove = false, showSuspend = false, showPublish = false, showUpdate = true) => (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.id} className="p-4 bg-[rgba(255,255,255,0.05)] rounded flex justify-between items-center">
          <div>
            <div className="text-white font-semibold">{i.name}</div>
            {i.email && <div className="text-gray-400">{i.email}</div>}
            {i.status && <div className="text-gray-400 text-sm">Status: {i.status}</div>}
            {i.institutionId && <div className="text-gray-400 text-sm">Institution ID: {i.institutionId}</div>}
          </div>

          <div className="flex gap-2">
            {showApprove && i.status !== "approved" && (
              <Button
                onClick={() => handleApprove(collectionName, i)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Approve
              </Button>
            )}
            {showSuspend && i.status !== "suspended" && (
              <Button
                onClick={() => handleSuspend(collectionName, i.id)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Suspend
              </Button>
            )}
            {showPublish && !i.published && (
              <Button
                onClick={() => handlePublishAdmissions(i.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                Publish
              </Button>
            )}
            {showUpdate && (
              <Button
                onClick={() => handleUpdate(collectionName, i.id, i.name)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update
              </Button>
            )}
            <Button
              onClick={() => handleDelete(collectionName, i.id)}
              variant="destructive"
            >
              Delete
            </Button>
          </div>
        </div>
      ))}

      <Button
        onClick={() => handleAdd(collectionName)}
        className="mt-4 bg-blue-600 hover:bg-blue-700"
      >
        Add {collectionName.slice(0, -1)}
      </Button>
    </div>
  );

  const renderStudents = () => (
    <div className="space-y-3">
      {students.map((s) => {
        const regs = registrations.filter(r => r.studentId === s.id);
        return (
          <div key={s.id} className="p-4 bg-[rgba(255,255,255,0.05)] rounded">
            <div className="text-white font-semibold">{s.name || s.email}</div>
            <div className="text-gray-400">Registrations: {regs.length}</div>
            {regs.map(r => (
              <div key={r.id} className="text-gray-400 text-sm">- {r.type}: {r.courseName || r.jobTitle} ({r.status})</div>
            ))}
          </div>
        );
      })}
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="text-white text-xl">System Reports</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[rgba(255,255,255,0.05)] rounded">
          <h3 className="text-white font-semibold">Course Applications</h3>
          <div className="text-2xl">{registrations.filter(r => r.type === "course").length}</div>
        </div>
        <div className="p-4 bg-[rgba(255,255,255,0.05)] rounded">
          <h3 className="text-white font-semibold">Job Applications</h3>
          <div className="text-2xl">{registrations.filter(r => r.type === "job").length}</div>
        </div>
        <div className="p-4 bg-[rgba(255,255,255,0.05)] rounded">
          <h3 className="text-white font-semibold">Admitted Students</h3>
          <div className="text-2xl">{registrations.filter(r => r.status === "admitted").length}</div>
        </div>
        <div className="p-4 bg-[rgba(255,255,255,0.05)] rounded">
          <h3 className="text-white font-semibold">Pending Approvals</h3>
          <div className="text-2xl">{companies.filter(c => c.status === "pending").length + institutions.filter(i => i.status === "pending").length}</div>
        </div>
      </div>
    </div>
  );

  const OverviewPanel = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {[
        { label: "Institutions", value: overview.totalInstitutions },
        { label: "Students", value: overview.totalStudents },
        { label: "Companies", value: overview.totalCompanies },
        { label: "Admissions", value: overview.totalAdmissions },
      ].map((item, i) => (
        <Card key={i} className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.05)]">
          <CardContent className="p-5">
            <div className="text-gray-300 text-sm">{item.label}</div>
            <div className="text-2xl font-semibold text-white mt-2">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const ChartPanel = () => (
    <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(79,209,197,0.03)]">
      <CardHeader>
        <CardTitle className="text-white">System Activity Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: "Value",
              color: TEAL,
            },
          }}
          className="h-[260px]"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={TEAL} stopOpacity={0.4} />
                <stop offset="95%" stopColor={TEAL} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="white" tick={{ fill: 'white' }} />
            <YAxis stroke="white" tick={{ fill: 'white' }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="value" stroke={TEAL} fill="url(#g)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (active) {
      case "Institutions":
        return renderList(institutions, "institutions", true, false, true, true);
      case "Faculties":
        return renderList(faculties, "faculties", false, false, false, true);
      case "Courses":
        return renderList(courses, "courses", false, false, false, true);
      case "Companies":
        return renderList(companies, "companies", true, true, false, true);
      case "Students":
        return renderStudents();
      case "Admissions":
        return renderList(admissions, "admissions", false, false, false, true);
      case "Reports":
        return renderReports();
      default:
        return (
          <>
            <OverviewPanel />
            <ChartPanel />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0a1a] via-[#0a0a2a] to-black">
      <GlobeBG />
      <Sidebar active={active} setActive={setActive} logout={logout} />

      <main className="ml-72 p-6 pt-10">
        <AnimatePresence>
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
