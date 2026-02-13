import { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  MapPin,
  Building2,
  LogOut,
  ShieldCheck,
  FileBadge,
} from "lucide-react";

// Define the Clinic interface with updated verification fields
interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  users: {
    name: string;
    email: string;
    phone: string | null;
    aadhaarVerified: boolean; // Tracking DigiLocker/Aadhaar status
  }[];
  doctors: {
    name: string;
    licenseNumber: string | null; // For Medical License verification
  }[];
}

export default function Dashboard() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Pending Clinics on Component Mount
  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://13.127.107.44:5001/api/admin/pending",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setClinics(res.data.data);
    } catch (err) {
      // Logic for handling fetching errors silently or via toast
      console.error("Error fetching clinics:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. The "Golden Stamp" Action - Approves a clinic to go live
  const approveClinic = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://13.127.107.44:5001/api/admin/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Instantly update UI by removing the approved clinic
      setClinics((prev) => prev.filter((c) => c.id !== id));
      alert("Clinic Approved and Live! 🦄");
    } catch (err) {
      // Explicitly ignoring unused 'err' to satisfy ESLint
      alert("Failed to approve. Please check server logs.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      {/* --- HEADER SECTION --- */}
      <div className="flex justify-between items-center mb-10 border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-400 tracking-tight">
            Provider Vault
          </h1>
          <p className="text-slate-400">
            Internal Command Center for Verification & Compliance.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-slate-800 hover:bg-red-900/40 hover:text-red-400 border border-slate-700 px-4 py-2 rounded-lg transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      {loading ? (
        <div className="text-center py-20 animate-pulse text-slate-500">
          Scanning Secure Database...
        </div>
      ) : clinics.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold">Queue is Empty</h3>
          <p className="text-slate-400">
            All providers are currently verified.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clinics.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all shadow-xl"
            >
              {/* Card Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-500/10 p-3 rounded-xl text-blue-400">
                  <Building2 size={24} />
                </div>
                <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter border border-amber-500/20">
                  Compliance Check
                </span>
              </div>

              <h3 className="text-xl font-bold mb-2 tracking-tight">
                {clinic.name}
              </h3>

              {/* Location & Address */}
              <div className="text-sm text-slate-400 mb-6 flex items-center gap-2">
                <MapPin size={16} className="text-slate-500" />
                {clinic.address}, {clinic.city}
              </div>

              {/* APPLICANT & AADHAAR STATUS */}
              <div className="bg-slate-900/50 p-4 rounded-xl mb-4 border border-slate-700/50">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                    Admin Applicant
                  </p>
                  {clinic.users[0]?.aadhaarVerified ? (
                    <span className="flex items-center gap-1 text-green-400 text-[10px] font-bold">
                      <ShieldCheck size={12} /> Aadhaar Verified
                    </span>
                  ) : (
                    <span className="text-red-400 text-[10px] font-bold">
                      Aadhaar Pending
                    </span>
                  )}
                </div>
                <p className="text-white font-medium">
                  {clinic.users[0]?.name || "Unknown"}
                </p>
                <p className="text-slate-400 text-xs">
                  {clinic.users[0]?.email}
                </p>
              </div>

              {/* MEDICAL LICENSE INFO */}
              <div className="mb-6">
                <p className="text-slate-500 uppercase text-[10px] font-bold tracking-widest mb-2">
                  Medical License
                </p>
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-700">
                  <FileBadge size={16} className="text-blue-400" />
                  <span className="text-sm font-mono text-blue-100">
                    {clinic.doctors[0]?.licenseNumber || "N/A - CHECK DOCS"}
                  </span>
                </div>
              </div>

              {/* DECISION BUTTONS */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  className="flex justify-center items-center gap-2 bg-slate-700 hover:bg-slate-600 py-2.5 rounded-lg transition text-xs font-bold"
                  onClick={() =>
                    alert("Redirecting to detailed rejection flow...")
                  }
                >
                  <XCircle size={16} />
                  Reject
                </button>
                <button
                  onClick={() => approveClinic(clinic.id)}
                  className="flex justify-center items-center gap-2 bg-green-600 hover:bg-green-500 py-2.5 rounded-lg transition text-xs font-bold shadow-lg shadow-green-900/20"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
