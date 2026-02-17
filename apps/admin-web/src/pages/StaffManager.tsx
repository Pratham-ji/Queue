import { useState } from "react";
import axios from "axios";
import { UserPlus, Shield, Stethoscope, Pill, Briefcase } from "lucide-react";

export default function StaffManager() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("DOCTOR");
  const [clinicId, setClinicId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5001/api/admin/assign-role",
        { email, role, clinicId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert(`Success! ${email} is now a ${role} 🦄`);
      setEmail("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Now TypeScript knows 'response' exists
        alert(error.response?.data?.error || "Assignment failed");
      } else {
        alert("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-lg shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600/20 p-3 rounded-full text-blue-400">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Staff Command Center</h1>
            <p className="text-slate-400 text-sm">
              Assign roles for Queue Pro App access.
            </p>
          </div>
        </div>

        <form onSubmit={handleAssign} className="space-y-6">
          {/* EMAIL INPUT */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
              User Email
            </label>
            <input
              type="email"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 outline-none transition-colors"
              placeholder="doctor@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* CLINIC ID INPUT */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
              Clinic ID
            </label>
            <input
              type="text"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:border-blue-500 outline-none"
              placeholder="Enter approved clinic ID"
              value={clinicId}
              onChange={(e) => setClinicId(e.target.value)}
            />
          </div>

          {/* ROLE SELECTOR */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "DOCTOR", icon: Stethoscope, label: "Doctor" },
                { id: "PHARMACIST", icon: Pill, label: "Pharmacist" },
                { id: "STAFF", icon: Briefcase, label: "Staff / Peon" },
                { id: "HOSPITAL_ADMIN", icon: Shield, label: "Admin" },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                    role === r.id
                      ? "bg-blue-600 border-blue-400 text-white"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <r.icon size={24} className="mb-2" />
                  <span className="text-xs font-bold">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              "Assigning..."
            ) : (
              <>
                <UserPlus size={20} /> Grant Access
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
