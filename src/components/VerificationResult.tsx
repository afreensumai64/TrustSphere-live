import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Shield, Fingerprint, ScanFace, FileCheck } from "lucide-react";
import RiskGauge from "./RiskGauge";

interface VerificationData {
  documentStatus: "verified" | "review" | "rejected";
  faceMatchScore: number;
  livenessConfidence: number;
  riskScore: number;
  riskBreakdown: { label: string; score: number; weight: number }[];
}

const StatusBadge = ({ status }: { status: "verified" | "review" | "rejected" }) => {
  const config = {
    verified: { icon: CheckCircle2, label: "Document Verified", cls: "bg-success/10 text-success border-success/20" },
    review: { icon: AlertTriangle, label: "Needs Review", cls: "bg-warning/10 text-warning border-warning/20" },
    rejected: { icon: XCircle, label: "Rejected", cls: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  const c = config[status];
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${c.cls}`}>
      <c.icon className="w-4 h-4" />
      {c.label}
    </div>
  );
};

const VerificationResult = ({ data }: { data: VerificationData }) => {
  const cards = [
    { icon: FileCheck, label: "Document", value: <StatusBadge status={data.documentStatus} /> },
    {
      icon: ScanFace,
      label: "Face Match",
      value: (
        <span className={`text-2xl font-bold ${data.faceMatchScore >= 70 ? "text-success" : "text-destructive"}`}>
          {data.faceMatchScore}%
        </span>
      ),
    },
    {
      icon: Fingerprint,
      label: "Liveness",
      value: (
        <span className={`text-2xl font-bold ${data.livenessConfidence >= 66 ? "text-success" : "text-warning"}`}>
          {data.livenessConfidence}%
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Main gauge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center"
      >
        <RiskGauge score={data.riskScore} size={240} />
      </motion.div>

      {/* Score cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="bg-card rounded-xl border border-border p-5 shadow-card flex flex-col items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <card.icon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{card.label}</p>
            {card.value}
          </motion.div>
        ))}
      </div>

      {/* Risk Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card rounded-xl border border-border p-6 shadow-card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Risk Breakdown</h3>
        </div>
        <div className="space-y-3">
          {data.riskBreakdown.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-40 shrink-0">{item.label}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor:
                      item.score <= 30
                        ? "hsl(152, 69%, 38%)"
                        : item.score <= 60
                        ? "hsl(38, 92%, 50%)"
                        : "hsl(0, 84%, 60%)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
              </div>
              <span className="text-sm font-mono font-medium text-foreground w-10 text-right">
                {item.score}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default VerificationResult;
