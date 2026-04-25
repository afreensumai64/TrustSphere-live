import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileCheck, AlertTriangle, X, Image, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentUploadProps {
  onComplete: (documents: UploadedDocuments, fraudResults: FraudCheckResult[]) => void;
  onCancel: () => void;
  idNumber: string;
}

export interface UploadedDocuments {
  idFront: string | null;
  idBack: string | null;
  addressProof: string | null;
}

export interface FraudCheckResult {
  check: string;
  passed: boolean;
  detail: string;
  severity: "low" | "medium" | "high";
}

const SIMULATED_DUPLICATE_IDS = ["DUP123456", "ABC000000", "FAKE99999"];

const DocumentUpload = ({ onComplete, onCancel, idNumber }: DocumentUploadProps) => {
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);
  const [addressProof, setAddressProof] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [fraudResults, setFraudResults] = useState<FraudCheckResult[] | null>(null);

  const handleFileUpload = (setter: (v: string) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setter(reader.result as string);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const runFraudChecks = () => {
    setChecking(true);
    setTimeout(() => {
      const results: FraudCheckResult[] = [];

      // 1. Duplicate ID check
      const isDuplicate = SIMULATED_DUPLICATE_IDS.includes(idNumber.toUpperCase());
      results.push({
        check: "Duplicate ID Detection",
        passed: !isDuplicate,
        detail: isDuplicate ? `ID number "${idNumber}" found in existing records` : "No duplicate records found",
        severity: isDuplicate ? "high" : "low",
      });

      // 2. Format validation
      const formatValid = idNumber.length >= 6 && /^[A-Za-z0-9]+$/.test(idNumber);
      results.push({
        check: "Format Validation",
        passed: formatValid,
        detail: formatValid ? "ID format matches expected pattern" : "ID format does not match expected pattern",
        severity: formatValid ? "low" : "medium",
      });

      // 3. Tamper detection (simulated)
      const tamperDetected = Math.random() < 0.15;
      results.push({
        check: "Tamper Detection",
        passed: !tamperDetected,
        detail: tamperDetected ? "Possible digital manipulation detected in document" : "No signs of document tampering",
        severity: tamperDetected ? "high" : "low",
      });

      // 4. Mismatch detection
      const mismatch = Math.random() < 0.1;
      results.push({
        check: "Data Mismatch Check",
        passed: !mismatch,
        detail: mismatch ? "Information on document does not match provided details" : "Document information matches provided details",
        severity: mismatch ? "high" : "low",
      });

      setFraudResults(results);
      setChecking(false);
    }, 2000);
  };

  const allUploaded = idFront && addressProof;
  const hasHighSeverityFraud = fraudResults?.some(r => !r.passed && r.severity === "high");

  const handleContinue = () => {
    if (fraudResults) {
      onComplete({ idFront, idBack, addressProof }, fraudResults);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* ID Front */}
        <div
          onClick={() => handleFileUpload(setIdFront)}
          className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
            idFront ? "border-success/50 bg-success/5" : "border-border hover:border-secondary/50 hover:bg-secondary/5"
          }`}
        >
          {idFront ? (
            <>
              <img src={idFront} alt="ID Front" className="w-full h-32 object-cover rounded-lg" />
              <div className="flex items-center gap-1.5 text-success text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> ID Front Uploaded
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Image className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">ID Document (Front)</p>
                <p className="text-xs text-muted-foreground">Click to upload</p>
              </div>
            </>
          )}
        </div>

        {/* ID Back */}
        <div
          onClick={() => handleFileUpload(setIdBack)}
          className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
            idBack ? "border-success/50 bg-success/5" : "border-border hover:border-secondary/50 hover:bg-secondary/5"
          }`}
        >
          {idBack ? (
            <>
              <img src={idBack} alt="ID Back" className="w-full h-32 object-cover rounded-lg" />
              <div className="flex items-center gap-1.5 text-success text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" /> ID Back Uploaded
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Image className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">ID Document (Back)</p>
                <p className="text-xs text-muted-foreground">Optional — Click to upload</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Address Proof */}
      <div
        onClick={() => handleFileUpload(setAddressProof)}
        className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
          addressProof ? "border-success/50 bg-success/5" : "border-border hover:border-secondary/50 hover:bg-secondary/5"
        }`}
      >
        {addressProof ? (
          <>
            <img src={addressProof} alt="Address Proof" className="w-full h-32 object-contain rounded-lg" />
            <div className="flex items-center gap-1.5 text-success text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Address Proof Uploaded
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Address Proof</p>
              <p className="text-xs text-muted-foreground">Utility bill, bank statement, or official letter</p>
            </div>
          </>
        )}
      </div>

      {/* Fraud Check Results */}
      {fraudResults && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-5 shadow-card"
        >
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-primary" /> Document Fraud Check Results
          </h4>
          <div className="space-y-2.5">
            {fraudResults.map((result, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${
                result.passed ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5"
              }`}>
                {result.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{result.check}</p>
                  <p className="text-xs text-muted-foreground">{result.detail}</p>
                </div>
                {!result.passed && (
                  <span className={`ml-auto text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    result.severity === "high" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                  }`}>
                    {result.severity}
                  </span>
                )}
              </div>
            ))}
          </div>
          {hasHighSeverityFraud && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              High severity fraud indicators detected. Status will be set to Manual Review.
            </div>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel}>Back</Button>
        {!fraudResults ? (
          <Button
            onClick={runFraudChecks}
            disabled={!allUploaded || checking}
            className="flex-1 gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {checking ? (
              <>
                <div className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                Running Fraud Checks...
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" /> Run Document Fraud Check
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleContinue}
            className="flex-1 gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            Continue to Selfie
          </Button>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
