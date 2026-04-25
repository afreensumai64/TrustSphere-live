import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, FileEdit, MessageSquare, Activity, RefreshCw, Shield, Flag, Upload, Fingerprint } from "lucide-react";
import type { AuditLogEntry } from "@/context/KYCContext";

const iconMap: Record<string, typeof CheckCircle2> = {
  kyc_submitted: Shield,
  kyc_approved: CheckCircle2,
  kyc_rejected: XCircle,
  kyc_rekyc: RefreshCw,
  update_requested: FileEdit,
  update_approved: CheckCircle2,
  update_rejected: XCircle,
  risk_adjusted: Activity,
  comment_added: MessageSquare,
  fraud_flag: Flag,
  monitoring_alert: Activity,
  document_uploaded: Upload,
  liveness_completed: Fingerprint,
};

const colorMap: Record<string, string> = {
  kyc_approved: "text-success bg-success/10",
  update_approved: "text-success bg-success/10",
  kyc_rejected: "text-destructive bg-destructive/10",
  update_rejected: "text-destructive bg-destructive/10",
  kyc_rekyc: "text-secondary bg-secondary/10",
  risk_adjusted: "text-warning bg-warning/10",
  kyc_submitted: "text-primary bg-primary/10",
  update_requested: "text-warning bg-warning/10",
  comment_added: "text-muted-foreground bg-muted",
  fraud_flag: "text-destructive bg-destructive/10",
  monitoring_alert: "text-destructive bg-destructive/10",
  document_uploaded: "text-secondary bg-secondary/10",
  liveness_completed: "text-success bg-success/10",
};

const labelMap: Record<string, string> = {
  kyc_submitted: "KYC Submitted",
  kyc_approved: "KYC Approved",
  kyc_rejected: "KYC Rejected",
  kyc_rekyc: "Re KYC Required",
  update_requested: "Update Requested",
  update_approved: "Update Approved",
  update_rejected: "Update Rejected",
  risk_adjusted: "Risk Adjusted",
  comment_added: "Comment Added",
  fraud_flag: "Fraud Flag",
  monitoring_alert: "Monitoring Alert",
  document_uploaded: "Document Uploaded",
  liveness_completed: "Liveness Completed",
};

const AuditTimeline = ({ logs }: { logs: AuditLogEntry[] }) => {
  const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">No activity logs found.</p>;
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
      <div className="space-y-4">
        {sorted.map((log, i) => {
          const Icon = iconMap[log.actionType] || Shield;
          const color = colorMap[log.actionType] || "text-muted-foreground bg-muted";
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative pl-12"
            >
              <div className={`absolute left-2.5 w-5 h-5 rounded-full flex items-center justify-center ${color}`}>
                <Icon className="w-3 h-3" />
              </div>
              <div className="bg-card border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{labelMap[log.actionType] || log.actionType}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(log.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {log.details && <p className="text-xs text-muted-foreground">{log.details}</p>}
                {log.officerComment && (
                  <div className="mt-1.5 px-2.5 py-1.5 bg-muted rounded text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Officer: </span>{log.officerComment}
                  </div>
                )}
                {log.decisionResult && (
                  <span className="inline-block mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-foreground">
                    Decision: {log.decisionResult}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AuditTimeline;
