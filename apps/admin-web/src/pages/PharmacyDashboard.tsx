import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { ArrowLeft, Clock, CheckCircle2, Pill, Activity } from "lucide-react";

interface Medicine {
  name: string;
  dosage: string;
  duration: string;
}

interface Prescription {
  id: string;
  medicines: Medicine[];
  notes: string;
  createdAt: string;
  patient: {
    name: string;
    token: number;
  };
  doctor: {
    name: string;
  };
}

const API_BASE = "http://13.201.230.245:5001";

export default function PharmacyDashboard() {
  const { clinicId } = useParams();
  const navigate = useNavigate();
  const [pending, setPending] = useState<Prescription[]>([]);
  const [fulfilled, setFulfilled] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();

    // Setup Socket
    const socket = io(API_BASE, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Pharmacy connected to socket");
      socket.emit("join_clinic", clinicId);
    });

    socket.on("new_prescription", (prescription: Prescription) => {
      // Animate it into the pending list
      setPending((prev) => [prescription, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [clinicId]);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE}/api/prescription/clinic/${clinicId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const all = res.data.data;
      // Mock logic: assume all fetched ones are pending for now
      // In a real app, you'd check a 'status' field on the Prescription
      setPending(all);
    } catch (error) {
      console.error("Failed to fetch prescriptions", error);
    } finally {
      setLoading(false);
    }
  };

  const markFulfilled = (id: string) => {
    const item = pending.find((p) => p.id === id);
    if (item) {
      setPending(pending.filter((p) => p.id !== id));
      setFulfilled([item, ...fulfilled]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/dashboard")}
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
              <Activity size={28} />
              Pharmacy Desk
            </h1>
            <p className="text-slate-500 text-sm mt-1">Real-time prescription fulfillment feed</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-400 text-sm font-bold tracking-wide">LIVE SYNC</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 animate-pulse">
          Loading prescriptions...
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* PENDING COLUMN */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col h-[80vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="text-amber-400" /> 
                Pending
              </h2>
              <span className="bg-amber-400/20 text-amber-400 font-bold px-3 py-1 rounded-full text-sm">
                {pending.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {pending.length === 0 ? (
                <div className="text-center text-slate-600 py-10">No pending prescriptions</div>
              ) : (
                pending.map((p) => (
                  <div key={p.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-amber-500/50 transition-colors animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">{p.patient?.name || "Unknown Patient"}</h3>
                        <p className="text-xs text-slate-400">Dr. {p.doctor?.name || "Unknown"}</p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(p.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>

                    <div className="bg-slate-950 rounded-lg p-4 mb-4 border border-slate-800">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-bold">Medicines</div>
                      <ul className="space-y-2">
                        {p.medicines && Array.isArray(p.medicines) && p.medicines.map((m, i) => (
                          <li key={i} className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-blue-300">
                              <Pill size={14} /> {m.name}
                            </span>
                            <span className="text-slate-400">{m.dosage} • {m.duration}</span>
                          </li>
                        ))}
                      </ul>
                      {p.notes && (
                        <div className="mt-3 pt-3 border-t border-slate-800 text-sm text-slate-400">
                          <span className="font-semibold text-slate-300">Notes:</span> {p.notes}
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => markFulfilled(p.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} /> Mark Fulfilled
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* FULFILLED COLUMN */}
          <div className="bg-slate-900/30 rounded-2xl border border-slate-800 p-6 flex flex-col h-[80vh] opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" /> 
                Fulfilled
              </h2>
              <span className="bg-slate-800 text-slate-400 font-bold px-3 py-1 rounded-full text-sm">
                {fulfilled.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {fulfilled.length === 0 ? (
                <div className="text-center text-slate-600 py-10">No fulfilled items yet</div>
              ) : (
                fulfilled.map((p) => (
                  <div key={p.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 animate-in fade-in">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-slate-300 line-through decoration-slate-600">{p.patient?.name || "Unknown Patient"}</h3>
                        <p className="text-xs text-slate-500">{p.medicines?.length} items</p>
                      </div>
                      <CheckCircle2 size={24} className="text-emerald-500/50" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
