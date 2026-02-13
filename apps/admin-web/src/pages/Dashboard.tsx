import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, MapPin, Building2, LogOut } from "lucide-react";

// Define what a Clinic looks like
interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  users: {
    name: string;
    email: string;
    phone: string | null;
  }[];
}

export default function Dashboard() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Pending Clinics on Load
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
    } catch (error) {
      console.error("Error fetching clinics:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. The "Golden Stamp" Action
  const approveClinic = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://13.127.107.44:5001/api/admin/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Remove the approved clinic from the list instantly
      setClinics(clinics.filter((c) => c.id !== id));
      alert("Clinic Approved and Live! 🦄");
    } catch (error) {
      alert("Failed to approve.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-400">Provider Vault</h1>
          <p className="text-slate-400">
            Review and approve new hospital applications.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 animate-pulse text-slate-500">
          Scanning Database...
        </div>
      ) : clinics.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/50 rounded-xl border border-dashed border-slate-700">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold">All Caught Up!</h3>
          <p className="text-slate-400">No pending applications.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clinics.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400">
                  <Building2 size={24} />
                </div>
                <span className="bg-yellow-500/10 text-yellow-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                  Pending
                </span>
              </div>

              <h3 className="text-xl font-bold mb-2">{clinic.name}</h3>

              <div className="space-y-2 text-sm text-slate-400 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  {clinic.address}, {clinic.city}
                </div>
                <div className="border-t border-slate-700 pt-2 mt-2">
                  <p className="text-slate-500 uppercase text-xs font-bold mb-1">
                    Applicant
                  </p>
                  <p className="text-white">
                    {clinic.users[0]?.name || "Unknown"}
                  </p>
                  <p>{clinic.users[0]?.email}</p>
                  <p>{clinic.users[0]?.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  className="flex justify-center items-center gap-2 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg transition text-sm font-semibold"
                  onClick={() => alert("Rejection logic coming soon!")}
                >
                  <XCircle size={16} />
                  Reject
                </button>
                <button
                  onClick={() => approveClinic(clinic.id)}
                  className="flex justify-center items-center gap-2 bg-green-600 hover:bg-green-500 py-2 rounded-lg transition text-sm font-semibold shadow-lg shadow-green-900/20"
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
