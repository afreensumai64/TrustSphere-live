import { motion } from "framer-motion";
import { Users, CheckCircle2, AlertTriangle, XCircle, Search, Shield, ExternalLink, Activity, Calendar, Flag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import RiskGauge from "@/components/RiskGauge";
import KYCStatusBadge from "@/components/KYCStatusBadge";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useKYC } from "@/context/KYCContext";

const weeklyData = [
  { day: "Mon", verified: 185, flagged: 32, rejected: 8 },
  { day: "Tue", verified: 210, flagged: 28, rejected: 12 },
  { day: "Wed", verified: 195, flagged: 41, rejected: 6 },
  { day: "Thu", verified: 230, flagged: 35, rejected: 10 },
  { day: "Fri", verified: 245, flagged: 22, rejected: 15 },
  { day: "Sat", verified: 120, flagged: 18, rejected: 4 },
  { day: "Sun", verified: 95, flagged: 12, rejected: 3 },
];

const riskDistribution = [
  { name: "Low Risk", value: 65, color: "hsl(152, 69%, 38%)" },
  { name: "Medium Risk", value: 25, color: "hsl(38, 92%, 50%)" },
  { name: "High Risk", value: 10, color: "hsl(0, 84%, 60%)" },
];

const Dashboard = () => {
  const { users, updateRequests, fraudFlags, monitoringData, calculateAdjustedRisk } = useKYC();
  const [search, setSearch] = useState("");

  const verified = users.filter((u) => u.kycStatus === "verified").length;
  const pending = users.filter((u) => u.kycStatus === "pending" || u.kycStatus === "manual_review").length;
  const rejected = users.filter((u) => u.kycStatus === "rejected").length;
  const rekyc = users.filter((u) => u.kycStatus === "rekyc_required").length;
  const highRisk = users.filter((u) => u.kycStatus === "high_risk").length;
  const pendingUpdates = updateRequests.filter((r) => r.status === "pending_review").length;
  const activeFlags = fraudFlags.filter(f => !f.resolved).length;
  const monitoringAlerts = monitoringData.reduce((sum, m) => sum + m.sessionAlerts.length, 0);

  const statCards = [
    { icon: Users, label: "Total Users", value: String(users.length), change: `${pendingUpdates} pending updates`, color: "text-primary" },
    { icon: CheckCircle2, label: "Verified", value: String(verified), change: `${((verified / users.length) * 100).toFixed(0)}%`, color: "text-success" },
    { icon: AlertTriangle, label: "Pending / Re KYC", value: String(pending + rekyc), change: `${pending} pending, ${rekyc} re kyc`, color: "text-warning" },
    { icon: XCircle, label: "Rejected / High Risk", value: String(rejected + highRisk), change: `${activeFlags} fraud flags`, color: "text-destructive" },
  ];

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">KYC verification overview and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          {monitoringAlerts > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
              <Activity className="w-3.5 h-3.5" />
              {monitoringAlerts} alerts
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            System Online
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <card.icon className={`w-5 h-5 ${card.color}`} />
              <span className="text-xs text-muted-foreground">{card.change}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Fraud Flags Summary */}
      {activeFlags > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Flag className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-foreground">Active Fraud Flags ({activeFlags})</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {fraudFlags.filter(f => !f.resolved).slice(0, 6).map(flag => (
              <div key={flag.id} className="flex items-start gap-2 p-3 bg-card rounded-lg border border-border">
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${flag.severity === "high" ? "text-destructive" : "text-warning"}`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{flag.description}</p>
                  <p className="text-[11px] text-muted-foreground">{flag.userId} · {flag.type.replace(/_/g, " ")}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-card">
          <h3 className="font-semibold text-foreground mb-4">Weekly Verification Activity</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="verified" fill="hsl(152, 69%, 38%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="flagged" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rejected" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card rounded-xl border border-border p-6 shadow-card flex flex-col items-center">
          <h3 className="font-semibold text-foreground mb-4 self-start">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                {riskDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {riskDistribution.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({d.value}%)
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card rounded-xl border border-border shadow-card">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">All Users</h3>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search user or ID..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left py-3 px-6 font-medium">User ID</th>
                <th className="text-left py-3 px-6 font-medium">Name</th>
                <th className="text-left py-3 px-6 font-medium">KYC Status</th>
                <th className="text-left py-3 px-6 font-medium">Risk Score</th>
                <th className="text-left py-3 px-6 font-medium">Last Updated</th>
                <th className="text-left py-3 px-6 font-medium">Re KYC Due</th>
                <th className="text-left py-3 px-6 font-medium">Flags</th>
                <th className="text-left py-3 px-6 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const adjustedRisk = calculateAdjustedRisk(user);
                const userFlags = fraudFlags.filter(f => f.userId === user.id && !f.resolved);
                return (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3.5 px-6 text-sm font-mono text-muted-foreground">{user.id}</td>
                    <td className="py-3.5 px-6 text-sm font-medium text-foreground">{user.name}</td>
                    <td className="py-3.5 px-6"><KYCStatusBadge status={user.kycStatus} /></td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${adjustedRisk}%`, backgroundColor: adjustedRisk <= 30 ? "hsl(152, 69%, 38%)" : adjustedRisk <= 70 ? "hsl(38, 92%, 50%)" : "hsl(0, 84%, 60%)" }} />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{adjustedRisk}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-muted-foreground">
                      {new Date(user.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-muted-foreground">
                      {user.rekycDueDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.rekycDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      {userFlags.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                          <Flag className="w-3 h-3" /> {userFlags.length}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      <Link to={`/admin/user/${user.id}`} className="inline-flex items-center gap-1 text-xs text-secondary hover:text-secondary/80 font-medium">
                        Review <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
