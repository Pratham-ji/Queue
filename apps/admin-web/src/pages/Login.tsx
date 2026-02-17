import { useState } from "react";
import axios from "axios";
import { Lock, Mail, ChevronRight, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("admin@queue.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 👇 FIX: Pointing to Localhost instead of remote IP
      const res = await axios.post("http://localhost:5001/api/auth/login", {
        email,
        password,
      });

      // Save token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect to Dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.response?.data?.error || "Login failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Queue Admin</h1>
          <p className="text-slate-400">
            Enter your credentials to access the vault.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className="relative">
              <Mail
                className="absolute left-4 top-3.5 text-slate-500"
                size={20}
              />
              <input
                type="email"
                className="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="admin@queue.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock
                className="absolute left-4 top-3.5 text-slate-500"
                size={20}
              />
              <input
                type="password"
                className="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Accessing Vault..." : "Access Vault"}{" "}
            <ChevronRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
