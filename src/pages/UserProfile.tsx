import { useState } from "react";
import { motion } from "framer-motion";
import { User, MapPin, Phone, Mail, FileUp, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useKYC } from "@/context/KYCContext";
import KYCStatusBadge from "@/components/KYCStatusBadge";
import AuditTimeline from "@/components/AuditTimeline";
import RiskGauge from "@/components/RiskGauge";
import { toast } from "@/hooks/use-toast";

const CURRENT_USER_ID = "USR-4821";

const UserProfile = () => {
  const { users, getUserLogs, getUserRequests, submitUpdateRequest, calculateAdjustedRisk } = useKYC();
  const user = users.find((u) => u.id === CURRENT_USER_ID);
  const [updateField, setUpdateField] = useState<"address" | "phone" | "email" | "">("");
  const [newValue, setNewValue] = useState("");
  const [docName, setDocName] = useState("");

  if (!user) return <div className="container py-8 text-center text-muted-foreground">User not found.</div>;

  const logs = getUserLogs(user.id);
  const requests = getUserRequests(user.id);
  const adjustedRisk = calculateAdjustedRisk(user);

  const handleSubmitUpdate = () => {
    if (!updateField || !newValue.trim() || !docName.trim()) {
      toast({ title: "Missing fields", description: "Please fill all fields and upload a document.", variant: "destructive" });
      return;
    }
    const oldValue = updateField === "address" ? user.address : updateField === "phone" ? user.phone : user.email;
    submitUpdateRequest(user.id, updateField, oldValue, newValue.trim(), docName.trim());
    toast({ title: "Request Submitted", description: "Your update request is pending review." });
    setUpdateField("");
    setNewValue("");
    setDocName("");
  };

  return (
    <div className="container py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
                <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <KYCStatusBadge status={user.kycStatus} />
              <span className="text-[11px] text-muted-foreground">
                Last updated: {new Date(user.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>

          {adjustedRisk > 70 && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              High Risk – Manual Review Required
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{user.email}</span></div>
            <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{user.phone}</span></div>
            <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-muted-foreground" /><span className="text-foreground">{user.address}</span></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Risk + Update Form */}
          <div className="lg:col-span-1 space-y-6">
            {/* Risk Score */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Risk Score</h3>
              <RiskGauge score={adjustedRisk} size={140} />
            </div>

            {/* Profile Update Request */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Request Profile Update</h3>
              <div className="space-y-3">
                <div>
                  <Label>Field to Update</Label>
                  <Select value={updateField} onValueChange={(v) => setUpdateField(v as any)}>
                    <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="address">Address</SelectItem>
                      <SelectItem value="phone">Phone Number</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>New Value</Label>
                  <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Enter new value" />
                </div>
                <div>
                  <Label>Supporting Document</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-input rounded-md bg-background text-sm text-muted-foreground cursor-pointer hover:bg-muted/50" onClick={() => setDocName("supporting_document.pdf")}>
                      <FileUp className="w-4 h-4" />
                      {docName || "Click to upload (simulated)"}
                    </div>
                  </div>
                </div>
                <Button onClick={handleSubmitUpdate} className="w-full gap-2">
                  <Send className="w-4 h-4" /> Submit Request
                </Button>
              </div>
            </div>

            {/* Pending Requests */}
            {requests.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6 shadow-card">
                <h3 className="font-semibold text-foreground mb-3">Update Requests</h3>
                <div className="space-y-2">
                  {requests.map((r) => (
                    <div key={r.id} className="p-2.5 border border-border rounded-lg text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground capitalize">{r.field}</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${r.status === "approved" ? "bg-success/10 text-success" : r.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                          {r.status === "pending_review" ? "Pending" : r.status === "approved" ? "Approved" : "Rejected"}
                        </span>
                      </div>
                      <p className="text-muted-foreground">"{r.oldValue}" → "{r.newValue}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Audit Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">Activity Timeline</h3>
              <AuditTimeline logs={logs} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;
