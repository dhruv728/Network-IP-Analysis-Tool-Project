import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Network,
  GitCompare,
  Users,
} from "lucide-react";

const tools = [
  { id: "validate", label: "Validate IP", icon: CheckCircle },
  { id: "cidr", label: "CIDR Tool", icon: Network },
  { id: "compare", label: "Compare", icon: GitCompare },
  { id: "hostcalc", label: "Host Calc", icon: Users },
];

function App() {
  const [mode, setMode] = useState("validate");
  const [ip, setIp] = useState("");
  const [ip2, setIp2] = useState("");
  const [hosts, setHosts] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const relationshipLabels = {
    equal: "Both networks are identical",
    network_1_contains_network_2: "Network 1 contains Network 2",
    network_2_contains_network_1: "Network 2 contains Network 1",
    overlapping: "Networks overlap",
    no_overlap: "No overlap between networks",
  };

  const handleSubmit = async () => {
    setLoading(true);

    let endpoint = "";
    let body = {};

    if (mode === "validate") {
      endpoint = "/validate";
      body = { ip };
    } else if (mode === "cidr") {
      endpoint = "/cidr";
      body = { ip };
    } else if (mode === "compare") {
      endpoint = "/compare";
      body = { ip1: ip, ip2: ip2 };
    } else if (mode === "hostcalc") {
      endpoint = "/hostcalc";
      body = { hosts };
    }

    try {
      const res = await fetch("http://127.0.0.1:5000" + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Server not reachable" });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#020617] border-r border-slate-800 p-6 space-y-4">
        <h2 className="text-xl font-bold mb-6">IP Toolkit</h2>

        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => {
                setMode(tool.id);
                setResult(null);
                setIp("");
                setIp2("");
                setHosts("");
              }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition
                ${mode === tool.id
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-slate-800 text-slate-300"
                }`}
            >
              <Icon size={20} />
              {tool.label}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl bg-[#020617] rounded-2xl p-8 shadow-xl border border-slate-800"
          >
            <h1 className="text-2xl font-bold mb-6 capitalize">
              {mode} Tool
            </h1>

            <div className="space-y-4">
              {(mode === "validate" || mode === "cidr") && (
                <input
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Enter IP/CIDR"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                />
              )}

              {mode === "compare" && (
                <>
                  <input
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700"
                    placeholder="CIDR 1"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                  />
                  <input
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700"
                    placeholder="CIDR 2"
                    value={ip2}
                    onChange={(e) => setIp2(e.target.value)}
                  />
                </>
              )}

              {mode === "hostcalc" && (
                <input
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700"
                  placeholder="Required hosts"
                  value={hosts}
                  onChange={(e) => setHosts(e.target.value)}
                />
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
              >
                {loading ? "Calculating..." : "Calculate"}
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className="mt-6 space-y-4">
                {!result.error && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mode === "compare" ? (
                      <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 text-center">
                        <p className="text-sm text-slate-400 mb-2">
                          Comparison Result
                        </p>
                        <p className="text-xl font-semibold text-indigo-400">
                          {relationshipLabels[result.relationship] ||
                            result.relationship}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(result).map(([key, value]) => (
                          <div
                            key={key}
                            className="bg-slate-900 rounded-xl p-4 border border-slate-700"
                          >
                            <p className="text-xs uppercase tracking-wide text-slate-400">
                              {key.replace(/_/g, " ")}
                            </p>
                            <p className="mt-1 text-lg font-semibold">
                              {String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}

                {result?.error && (
                  <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-xl">
                    {result.error}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
