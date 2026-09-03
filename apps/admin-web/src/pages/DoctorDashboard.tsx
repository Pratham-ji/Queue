import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { ArrowLeft, User, Activity, Clock, FileText, CheckCircle } from "lucide-react";

const API_BASE = "http://13.201.230.245:5001";

interface Patient {
  id: string;
  name: string;
  token: number;
  status: string;
  arrivalTime: string;
}

export default function DoctorDashboard() {
  const { clinicId } = useParams<{ clinicId: string }>();
  const navigate = useNavigate();

  const [queue, setQueue] = useState<Patient[]>([]);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  
  // Prescription Form
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", duration: "" }]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchQueue();

    const socket = io(API_BASE, { transports: ["websocket", "polling"] });
    socket.on("connect", () => {
      socket.emit("join_clinic", clinicId);
    });

    socket.on("queue_update", (updatedQueue: Patient[]) => setQueue(updatedQueue));
    socket.on("current_patient", (patient: Patient) => setCurrentPatient(patient));

    return () => { socket.disconnect(); };
  }, [clinicId]);

  const fetchQueue = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/api/queue/${clinicId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setQueue(res.data.data);
        setCurrentPatient(res.data.current);
      }
    } catch (error) {
      console.error("Failed to fetch queue");
    }
  };

  const callNextPatient = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE}/api/queue/${clinicId}/next`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setCurrentPatient(res.data.served);
      } else {
        setCurrentPatient(null);
      }
    } catch (error) {
      console.error("Failed to call next");
    }
  };

  const addMedicineRow = () => setMedicines([...medicines, { name: "", dosage: "", duration: "" }]);

  const completeSession = async () => {
    if (!currentPatient) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      // Create Prescription if medicines exist
      const validMeds = medicines.filter(m => m.name.trim() !== "");
      if (validMeds.length > 0) {
        await axios.post(`${API_BASE}/api/prescription/create`, {
          medicines: validMeds,
          notes,
          patientId: currentPatient.id,
          clinicId: clinicId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Automatically Call Next Patient
      await callNextPatient();
      
      // Reset form
      setMedicines([{ name: "", dosage: "", duration: "" }]);
      setNotes("");
    } catch (error) {
      console.error("Failed to complete session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/dashboard")}
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-blue-400 flex items-center gap-2">
              <Activity size={28} />
              Doctor Desk
            </h1>
            <p className="text-slate-500 text-sm mt-1">Live Queue & Digital Prescription Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-blue-400 text-sm font-bold tracking-wide">LIVE SYNC</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Queue & Next Patient */}
        <div className="lg:col-span-1 space-y-6">
          {/* CURRENT PATIENT CARD */}
          <div className="bg-slate-900 rounded-2xl border border-blue-500/30 p-6 shadow-xl shadow-blue-500/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">Now Serving</h2>
            
            {currentPatient ? (
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-3xl font-black text-white">{currentPatient.name}</h3>
                  <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded font-mono text-xl font-bold">
                    #{currentPatient.token}
                  </span>
                </div>
                <p className="text-slate-500 flex items-center gap-1 mb-6">
                  <Clock size={14} /> Waiting since {new Date(currentPatient.arrivalTime).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl mb-6">
                No patient being served
              </div>
            )}

            {!currentPatient && queue.length > 0 && (
              <button 
                onClick={callNextPatient}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
              >
                Call Next Patient (Token #{queue[0]?.token})
              </button>
            )}
          </div>

          {/* WAITING QUEUE LIST */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 h-[50vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Waiting Queue</h2>
              <span className="bg-slate-800 text-slate-400 font-bold px-3 py-1 rounded-full text-sm">
                {queue.length} left
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {queue.length === 0 ? (
                <div className="text-center py-10 text-slate-600">Queue is empty!</div>
              ) : (
                queue.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-300">
                        {p.token}
                      </div>
                      <div>
                        <p className="font-bold text-white">{p.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <User size={12} /> Walk-in
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Prescription Builder */}
        <div className="lg:col-span-2">
          <div className={`bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-full transition-all ${!currentPatient ? 'opacity-50 pointer-events-none' : ''}`}>
            
            <div className="p-6 border-b border-slate-800 bg-slate-800/20">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="text-emerald-400" /> Digital Prescription
              </h2>
              <p className="text-slate-500 text-sm mt-1">Prescription will be automatically pushed to Patient's app & Pharmacy Desk.</p>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
              
              {/* MEDICINES LIST */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Medicines</h3>
                <div className="space-y-4">
                  {medicines.map((med, index) => (
                    <div key={index} className="flex gap-4">
                      <input 
                        className="flex-[2] bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="Medicine Name (e.g. Paracetamol)"
                        value={med.name}
                        onChange={(e) => {
                          const newMeds = [...medicines];
                          newMeds[index].name = e.target.value;
                          setMedicines(newMeds);
                        }}
                      />
                      <input 
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="Dosage (e.g. 500mg)"
                        value={med.dosage}
                        onChange={(e) => {
                          const newMeds = [...medicines];
                          newMeds[index].dosage = e.target.value;
                          setMedicines(newMeds);
                        }}
                      />
                      <input 
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="Duration (e.g. 5 Days)"
                        value={med.duration}
                        onChange={(e) => {
                          const newMeds = [...medicines];
                          newMeds[index].duration = e.target.value;
                          setMedicines(newMeds);
                        }}
                      />
                    </div>
                  ))}
                  
                  <button 
                    onClick={addMedicineRow}
                    className="text-emerald-400 hover:text-emerald-300 font-bold text-sm flex items-center gap-1 py-2"
                  >
                    + Add Another Medicine
                  </button>
                </div>
              </div>

              {/* CLINICAL NOTES */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Clinical Notes / Advice</h3>
                <textarea 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none transition-colors min-h-[120px]"
                  placeholder="Drink plenty of water, avoid cold items..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

            </div>

            {/* ACTION FOOTER */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
              <button 
                onClick={completeSession}
                disabled={isSubmitting || !currentPatient}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                {isSubmitting ? "Processing..." : (
                  <>
                    <CheckCircle size={20} /> Complete & Call Next
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
