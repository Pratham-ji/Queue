import { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  MapPin,
  Building2,
  LogOut,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  addressProofUrl?: string; // Verification requirement
  users: {
    name: string;
    email: string;
    phone: string | null;
    aadhaarVerified: boolean; // DigiLocker sync
  }[];
  doctors: {
    name: string;
    licenseNumber: string | null;
    licenseCertUrl?: string; // Document verification
  }[];
}

export default function Dashboard() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  // FIX: This ensures 'fetchPending' is actually used
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
    } catch {
      // FIX: Use a single underscore '_' to tell ESLint this catch variable is ignored
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const approveClinic = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://13.127.107.44:5001/api/admin/approve/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setClinics((prev) => prev.filter((c) => c.id !== id));
      alert("Clinic Approved! 🦄");
    } catch {
      alert("Action failed. Verify admin permissions.");
    }
  };
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="flex justify-between items-center mb-10 border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">Provider Vault</h1>
          <p className="text-slate-400">
            Manual verification of hospital credentials.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg hover:bg-red-900/20 transition-all"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-slate-500">
          Querying AWS RDS...
        </div>
      ) : clinics.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold">No Pending Requests</h3>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clinics.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all"
            >
              <div className="flex justify-between mb-4">
                <Building2 className="text-blue-400" size={28} />
                <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-2 py-1 rounded border border-amber-500/20">
                  PENDING DOCS
                </span>
              </div>

              <h3 className="text-xl font-bold mb-1">{clinic.name}</h3>
              <p className="text-sm text-slate-400 mb-4 flex items-center gap-1">
                <MapPin size={14} /> {clinic.city}
              </p>

              {/* COMPLIANCE DOCS SECTION */}
              <div className="bg-slate-900/50 p-4 rounded-xl mb-4 border border-slate-700">
                <p className="text-slate-500 uppercase text-[10px] font-bold mb-3 tracking-widest">
                  Verification Files
                </p>
                <div className="space-y-2">
                  <button
                    disabled={!clinic.addressProofUrl}
                    onClick={() =>
                      window.open(clinic.addressProofUrl, "_blank")
                    }
                    className="w-full flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700 text-xs hover:text-blue-400 disabled:opacity-30"
                  >
                    Address Proof <ExternalLink size={12} />
                  </button>
                  <button
                    disabled={!clinic.doctors[0]?.licenseCertUrl}
                    onClick={() =>
                      window.open(clinic.doctors[0]?.licenseCertUrl, "_blank")
                    }
                    className="w-full flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700 text-xs hover:text-blue-400 disabled:opacity-30"
                  >
                    Medical License <ExternalLink size={12} />
                  </button>
                </div>
              </div>

              {/* APPLICANT INFO */}
              <div className="flex justify-between items-center mb-6 px-1">
                <div className="text-xs">
                  <p className="text-white font-bold">
                    {clinic.users[0]?.name}
                  </p>
                  <p className="text-slate-500">{clinic.users[0]?.email}</p>
                </div>
                {clinic.users[0]?.aadhaarVerified ? (
                  <ShieldCheck size={20} className="text-green-400" />
                ) : (
                  <XCircle size={20} className="text-red-500" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  className="bg-slate-700 py-2 rounded-lg text-xs font-bold hover:bg-slate-600 transition"
                  onClick={() => alert("Rejection flow...")}
                >
                  Reject
                </button>
                <button
                  className="bg-green-600 py-2 rounded-lg text-xs font-bold hover:bg-green-500 transition"
                  onClick={() => approveClinic(clinic.id)}
                >
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
