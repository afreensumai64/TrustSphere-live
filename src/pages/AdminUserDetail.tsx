import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, CheckCircle2, XCircle, RefreshCw, FileText, Flag, Activity, Monitor, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useKYC } from "@/context/KYCContext";
import KYCStatusBadge from "@/components/KYCStatusBadge";
import AuditTimeline from "@/components/AuditTimeline";
import RiskGauge from "@/components/RiskGauge";
import { toast } from "@/hooks/use-toast";

const AdminUserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const { users, getUserLogs, getUserRequests, getUserFraudFlags, getUserMonitoring, approveKYC, rejectKYC, requestReKYC, approveUpdateRequest, rejectUpdateRequest, calculateAdjustedRisk } = useKYC();
  const [comment, setComment] = useState("");
  const [reqComments, setReqComments] = useState<Record<string, string>>({});

  const user = users.find((u) => u.id === userId);
  if (!user) return <div className="container py-8 text-center text-muted-foreground">User not found.</div>;

  const logs = getUserLogs(user.id);
  const requests = getUserRequests(user.id);
  const adjustedRisk = calculateAdjustedRisk(user);
  const pendingRequests = requests.filter((r) => r.status === "pending_review");
  const userFlags = getUserFraudFlags(user.id);
  const monitoring = getUserMonitoring(user.id);

  const handleKYCAction = (action: "approve" | "reject" | "rekyc") => {
    if (!comment.trim()) {
      toast({ title: "Comment required", description: "Please provide an officer comment.", variant: "destructive" });
      return;
    }
    if (action === "approve") approveKYC(user.id, comment);
    else if (action === "reject") rejectKYC(user.id, comment);
    else requestReKYC(user.id, comment);
    toast({ title: `KYC ${action === "approve" ? "Approved" : action === "reject" ? "Rejected" : "Re KYC Requested"}`, description: `Decision recorded for ${user.name}.` });
    setComment("");
  };

  const handleUpdateAction = (reqId: string, action: "approve" | "reject") => {
    const c = reqComments[reqId] || "";
    if (!c.trim()) {
      toast({ title: "Comment required", description: "Please provide an officer comment.", variant: "destructive" });
      return;
    }
    if (action === "approve") approveUpdateRequest(reqId, c);
    else rejectUpdateRequest(reqId, c);
    toast({ title: `Update ${action === "approve" ? "Approved" : "Rejected"}` });
    setReqComments((prev) => ({ ...prev, [reqId]: "" }));
  };

  return (
    <div className="container py-8 max-w-5xl">
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* User Header */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
                <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{user.email}</span>·<span>{user.phone}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <KYCStatusBadge status={user.kycStatus} />
              <span className="text-[11px] text-muted-foreground">Risk: {adjustedRisk}</span>
              {user.rekycDueDate && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Re KYC Due: {new Date(user.rekycDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Risk */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-3">Adjusted Risk</h3>
              <RiskGauge score={adjustedRisk} size={140} />
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Update requests</span><span className="font-mono">{user.updateRequestCount}</span></div>
                <div className="flex justify-between"><span>Detail changes</span><span className="font-mono">{user.detailChangeCount}</span></div>
                <div className="flex justify-between"><span>Base risk</span><span className="font-mono">{user.riskScore}</span></div>
              </div>
            </div>

            {/* Continuous Monitoring */}
            {monitoring && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-secondary" /> Monitoring
                </h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Login count</span><span className="font-mono">{monitoring.loginCount}</span></div>
                  <div className="flex justify-between"><span>Last login</span><span>{new Date(monitoring.lastLogin).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></div>
                  <div className="flex justify-between"><span>Profile updates</span><span className="font-mono">{monitoring.profileUpdateCount}</span></div>
                  <div className="flex justify-between"><span>Device changes</span><span className="font-mono">{monitoring.deviceChanges}</span></div>
                  <div className="flex justify-between"><span>Last device</span><span className="truncate max-w-[120px]">{monitoring.lastDevice}</span></div>
                  <div className="flex justify-between"><span>Rapid attempts</span><span className="font-mono">{monitoring.rapidUpdateAttempts}</span></div>
                </div>
                {monitoring.sessionAlerts.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs font-medium text-foreground">Session Alerts</p>
                    {monitoring.sessionAlerts.map((alert, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/5 px-2.5 py-1.5 rounded">
                        <Activity className="w-3 h-3 shrink-0" /> {alert}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fraud Flags */}
            {userFlags.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-destructive" /> Fraud Flags ({userFlags.length})
                </h3>
                <div className="space-y-2">
                  {userFlags.map(flag => (
                    <div key={flag.id} className={`p-3 rounded-lg border text-xs ${flag.resolved ? "border-border bg-muted/50" : "border-destructive/20 bg-destructive/5"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground">{flag.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          flag.severity === "high" ? "bg-destructive/10 text-destructive" : flag.severity === "medium" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                        }`}>{flag.severity}</span>
                      </div>
                      <p className="text-muted-foreground">{flag.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KYC Decision */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-3">KYC Decision</h3>
              <Textarea placeholder="Officer comment..." value={comment} onChange={(e) => setComment(e.target.value)} className="mb-3 text-sm" rows={3} />
              <div className="flex flex-col gap-2">
                <Button onClick={() => handleKYCAction("approve")} className="gap-2 bg-success text-success-foreground hover:bg-success/90">
                  <CheckCircle2 className="w-4 h-4" /> Approve KYC
                </Button>
                <Button onClick={() => handleKYCAction("reject")} variant="destructive" className="gap-2">
                  <XCircle className="w-4 h-4" /> Reject KYC
                </Button>
                <Button onClick={() => handleKYCAction("rekyc")} variant="outline" className="gap-2 text-secondary border-secondary/30 hover:bg-secondary/10">
                  <RefreshCw className="w-4 h-4" /> Request Re KYC
                </Button>
              </div>
            </div>

            {/* Pending Update Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                <h3 className="font-semibold text-foreground mb-3">Pending Update Requests</h3>
                <div className="space-y-4">
                  {pendingRequests.map((r) => (
                    <div key={r.id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground capitalize">{r.field}</span>
                        <span className="text-[11px] text-muted-foreground">{r.id}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">"{r.oldValue}" → "{r.newValue}"</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        <FileText className="w-3 h-3" /> {r.documentName}
                      </div>
                      <Textarea
                        placeholder="Comment..."
                        value={reqComments[r.id] || ""}
                        onChange={(e) => setReqComments((p) => ({ ...p, [r.id]: e.target.value }))}
                        className="mb-2 text-xs"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUpdateAction(r.id, "approve")} className="flex-1 gap-1 bg-success text-success-foreground hover:bg-success/90 text-xs h-8">
                          <CheckCircle2 className="w-3 h-3" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleUpdateAction(r.id, "reject")} className="flex-1 gap-1 text-xs h-8">
                          <XCircle className="w-3 h-3" /> Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Full Activity Log */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Full Activity Log</h3>
              <AuditTimeline logs={logs} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminUserDetail;
