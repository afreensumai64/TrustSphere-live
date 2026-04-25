import type { KYCStatus } from "@/context/KYCContext";

const config: Record<KYCStatus, { cls: string; label: string }> = {
  pending: { cls: "bg-warning/10 text-warning border-warning/20", label: "Pending" },
  verified: { cls: "bg-success/10 text-success border-success/20", label: "Verified" },
  rejected: { cls: "bg-destructive/10 text-destructive border-destructive/20", label: "Rejected" },
  rekyc_required: { cls: "bg-secondary/10 text-secondary border-secondary/20", label: "Re KYC Required" },
  manual_review: { cls: "bg-warning/10 text-warning border-warning/20", label: "Manual Review" },
  high_risk: { cls: "bg-destructive/10 text-destructive border-destructive/20", label: "High Risk" },
};

const KYCStatusBadge = ({ status }: { status: KYCStatus }) => {
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "verified" ? "bg-success" : status === "rejected" || status === "high_risk" ? "bg-destructive" : status === "rekyc_required" ? "bg-secondary" : "bg-warning"}`} />
      {c.label}
    </span>
  );
};

export default KYCStatusBadge;
