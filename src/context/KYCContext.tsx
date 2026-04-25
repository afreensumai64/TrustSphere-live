import React, { createContext, useContext, useState, useCallback } from "react";

export type KYCStatus = "pending" | "verified" | "rejected" | "rekyc_required" | "manual_review" | "high_risk";
export type UpdateRequestStatus = "pending_review" | "approved" | "rejected";
export type AuditActionType = "kyc_submitted" | "kyc_approved" | "kyc_rejected" | "kyc_rekyc" | "update_requested" | "update_approved" | "update_rejected" | "risk_adjusted" | "comment_added" | "fraud_flag" | "monitoring_alert" | "document_uploaded" | "liveness_completed";

export interface FraudFlag {
  id: string;
  userId: string;
  type: "duplicate_id" | "format_invalid" | "tamper_detected" | "mismatch" | "suspicious_activity" | "rapid_updates" | "device_change";
  description: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
  resolved: boolean;
}

export interface MonitoringData {
  userId: string;
  loginCount: number;
  lastLogin: string;
  profileUpdateCount: number;
  deviceChanges: number;
  lastDevice: string;
  rapidUpdateAttempts: number;
  sessionAlerts: string[];
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  actionType: AuditActionType;
  timestamp: string;
  officerComment?: string;
  decisionResult?: string;
  details?: string;
}

export interface UpdateRequest {
  id: string;
  userId: string;
  field: "address" | "phone" | "email";
  oldValue: string;
  newValue: string;
  documentName: string;
  status: UpdateRequestStatus;
  submittedAt: string;
  reviewedAt?: string;
  officerComment?: string;
}

export interface KYCUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  kycStatus: KYCStatus;
  riskScore: number;
  lastUpdated: string;
  verifiedAt?: string;
  updateRequestCount: number;
  detailChangeCount: number;
  lastRekycDate?: string;
  rekycDueDate?: string;
}

const now = () => new Date().toISOString();

const initialUsers: KYCUser[] = [
  { id: "USR-4821", name: "Aisha Patel", email: "aisha@example.com", phone: "+1-555-0101", address: "123 Main St, NY", kycStatus: "verified", riskScore: 18, lastUpdated: "2026-02-20T10:00:00Z", verifiedAt: "2026-02-18T14:30:00Z", updateRequestCount: 0, detailChangeCount: 0, rekycDueDate: "2027-02-18T00:00:00Z" },
  { id: "USR-4820", name: "Marcus Chen", email: "marcus@example.com", phone: "+1-555-0102", address: "456 Oak Ave, SF", kycStatus: "pending", riskScore: 54, lastUpdated: "2026-02-21T09:00:00Z", updateRequestCount: 2, detailChangeCount: 3 },
  { id: "USR-4819", name: "Elena Volkov", email: "elena@example.com", phone: "+44-20-7946-0958", address: "78 Baker St, London", kycStatus: "verified", riskScore: 12, lastUpdated: "2026-02-19T16:00:00Z", verifiedAt: "2026-02-17T11:00:00Z", updateRequestCount: 0, detailChangeCount: 0, rekycDueDate: "2027-02-17T00:00:00Z" },
  { id: "USR-4818", name: "James Okafor", email: "james@example.com", phone: "+234-801-234-5678", address: "12 Lagos Rd, NG", kycStatus: "rejected", riskScore: 87, lastUpdated: "2026-02-20T14:00:00Z", updateRequestCount: 4, detailChangeCount: 5 },
  { id: "USR-4817", name: "Sophie Moreau", email: "sophie@example.com", phone: "+33-1-42-68-53-00", address: "15 Rue de Rivoli, Paris", kycStatus: "verified", riskScore: 8, lastUpdated: "2026-02-18T08:00:00Z", verifiedAt: "2026-02-16T10:00:00Z", updateRequestCount: 0, detailChangeCount: 0, rekycDueDate: "2027-02-16T00:00:00Z" },
  { id: "USR-4816", name: "Raj Gupta", email: "raj@example.com", phone: "+91-98765-43210", address: "42 MG Road, Mumbai", kycStatus: "rekyc_required", riskScore: 62, lastUpdated: "2026-02-21T11:00:00Z", updateRequestCount: 3, detailChangeCount: 4, lastRekycDate: "2026-01-10T00:00:00Z" },
  { id: "USR-4815", name: "Carlos Rivera", email: "carlos@example.com", phone: "+52-555-123-4567", address: "88 Reforma Ave, Mexico City", kycStatus: "high_risk", riskScore: 78, lastUpdated: "2026-02-22T08:00:00Z", updateRequestCount: 5, detailChangeCount: 6 },
];

const initialAuditLogs: AuditLogEntry[] = [
  { id: "LOG-001", userId: "USR-4821", actionType: "kyc_submitted", timestamp: "2026-02-18T14:00:00Z", details: "KYC application submitted" },
  { id: "LOG-002", userId: "USR-4821", actionType: "kyc_approved", timestamp: "2026-02-18T14:30:00Z", officerComment: "All documents verified successfully.", decisionResult: "Approved" },
  { id: "LOG-003", userId: "USR-4818", actionType: "kyc_submitted", timestamp: "2026-02-20T12:00:00Z", details: "KYC application submitted" },
  { id: "LOG-004", userId: "USR-4818", actionType: "kyc_rejected", timestamp: "2026-02-20T14:00:00Z", officerComment: "Document appears tampered. Face match below threshold.", decisionResult: "Rejected" },
  { id: "LOG-005", userId: "USR-4820", actionType: "kyc_submitted", timestamp: "2026-02-21T09:00:00Z", details: "KYC application submitted" },
  { id: "LOG-006", userId: "USR-4816", actionType: "kyc_rekyc", timestamp: "2026-02-21T11:00:00Z", officerComment: "Re KYC required due to frequent detail changes.", decisionResult: "Re KYC Required" },
  { id: "LOG-007", userId: "USR-4818", actionType: "fraud_flag", timestamp: "2026-02-20T13:30:00Z", details: "Possible document tampering detected on ID submission" },
  { id: "LOG-008", userId: "USR-4815", actionType: "monitoring_alert", timestamp: "2026-02-22T08:00:00Z", details: "Multiple device changes and rapid profile updates detected" },
];

const initialUpdateRequests: UpdateRequest[] = [
  { id: "REQ-001", userId: "USR-4820", field: "address", oldValue: "456 Oak Ave, SF", newValue: "789 Pine St, SF", documentName: "utility_bill.pdf", status: "pending_review", submittedAt: "2026-02-21T10:00:00Z" },
  { id: "REQ-002", userId: "USR-4816", field: "phone", oldValue: "+91-98765-43210", newValue: "+91-98765-99999", documentName: "phone_verification.pdf", status: "pending_review", submittedAt: "2026-02-21T12:00:00Z" },
];

const initialFraudFlags: FraudFlag[] = [
  { id: "FF-001", userId: "USR-4818", type: "tamper_detected", description: "ID document shows signs of digital manipulation", severity: "high", timestamp: "2026-02-20T13:30:00Z", resolved: false },
  { id: "FF-002", userId: "USR-4815", type: "rapid_updates", description: "5 profile updates in 24 hours", severity: "medium", timestamp: "2026-02-22T07:00:00Z", resolved: false },
  { id: "FF-003", userId: "USR-4815", type: "device_change", description: "3 different devices used in 48 hours", severity: "high", timestamp: "2026-02-22T08:00:00Z", resolved: false },
];

const initialMonitoring: MonitoringData[] = [
  { userId: "USR-4821", loginCount: 12, lastLogin: "2026-02-22T09:00:00Z", profileUpdateCount: 0, deviceChanges: 0, lastDevice: "Chrome / macOS", rapidUpdateAttempts: 0, sessionAlerts: [] },
  { userId: "USR-4820", loginCount: 8, lastLogin: "2026-02-21T15:00:00Z", profileUpdateCount: 2, deviceChanges: 1, lastDevice: "Safari / iOS", rapidUpdateAttempts: 1, sessionAlerts: ["Multiple address changes"] },
  { userId: "USR-4819", loginCount: 15, lastLogin: "2026-02-22T08:30:00Z", profileUpdateCount: 0, deviceChanges: 0, lastDevice: "Firefox / Windows", rapidUpdateAttempts: 0, sessionAlerts: [] },
  { userId: "USR-4818", loginCount: 3, lastLogin: "2026-02-20T14:00:00Z", profileUpdateCount: 4, deviceChanges: 2, lastDevice: "Chrome / Android", rapidUpdateAttempts: 3, sessionAlerts: ["Suspicious login pattern", "Document tampering detected"] },
  { userId: "USR-4817", loginCount: 20, lastLogin: "2026-02-22T07:00:00Z", profileUpdateCount: 0, deviceChanges: 0, lastDevice: "Chrome / macOS", rapidUpdateAttempts: 0, sessionAlerts: [] },
  { userId: "USR-4816", loginCount: 6, lastLogin: "2026-02-21T18:00:00Z", profileUpdateCount: 3, deviceChanges: 1, lastDevice: "Edge / Windows", rapidUpdateAttempts: 2, sessionAlerts: ["Frequent detail changes"] },
  { userId: "USR-4815", loginCount: 4, lastLogin: "2026-02-22T08:00:00Z", profileUpdateCount: 5, deviceChanges: 3, lastDevice: "Unknown / Linux", rapidUpdateAttempts: 4, sessionAlerts: ["Multiple device changes", "Rapid profile updates", "High risk flag triggered"] },
];

interface KYCContextType {
  users: KYCUser[];
  auditLogs: AuditLogEntry[];
  updateRequests: UpdateRequest[];
  fraudFlags: FraudFlag[];
  monitoringData: MonitoringData[];
  approveKYC: (userId: string, comment: string) => void;
  rejectKYC: (userId: string, comment: string) => void;
  requestReKYC: (userId: string, comment: string) => void;
  submitUpdateRequest: (userId: string, field: "address" | "phone" | "email", oldValue: string, newValue: string, documentName: string) => void;
  approveUpdateRequest: (requestId: string, comment: string) => void;
  rejectUpdateRequest: (requestId: string, comment: string) => void;
  getUserLogs: (userId: string) => AuditLogEntry[];
  getUserRequests: (userId: string) => UpdateRequest[];
  getUserFraudFlags: (userId: string) => FraudFlag[];
  getUserMonitoring: (userId: string) => MonitoringData | undefined;
  calculateAdjustedRisk: (user: KYCUser) => number;
  addFraudFlag: (flag: Omit<FraudFlag, "id" | "timestamp" | "resolved">) => void;
  simulateMonitoringAlert: (userId: string, alert: string) => void;
}

const KYCContext = createContext<KYCContextType | null>(null);

export const useKYC = () => {
  const ctx = useContext(KYCContext);
  if (!ctx) throw new Error("useKYC must be used within KYCProvider");
  return ctx;
};

let logCounter = 9;
let reqCounter = 3;
let flagCounter = 4;

export const KYCProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<KYCUser[]>(initialUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [updateRequests, setUpdateRequests] = useState<UpdateRequest[]>(initialUpdateRequests);
  const [fraudFlags, setFraudFlags] = useState<FraudFlag[]>(initialFraudFlags);
  const [monitoringData, setMonitoringData] = useState<MonitoringData[]>(initialMonitoring);

  const addLog = useCallback((entry: Omit<AuditLogEntry, "id" | "timestamp">) => {
    const newLog: AuditLogEntry = { ...entry, id: `LOG-${String(logCounter++).padStart(3, "0")}`, timestamp: now() };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, []);

  const calculateAdjustedRisk = useCallback((user: KYCUser): number => {
    let risk = user.riskScore;
    if (user.updateRequestCount >= 3) risk += 10;
    if (user.detailChangeCount >= 4) risk += 10;
    if (user.lastRekycDate) {
      const daysSince = (Date.now() - new Date(user.lastRekycDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > 30) risk += 15;
    }
    // Factor in monitoring data
    const monitoring = monitoringData.find(m => m.userId === user.id);
    if (monitoring) {
      if (monitoring.rapidUpdateAttempts >= 3) risk += 15;
      if (monitoring.deviceChanges >= 2) risk += 10;
      if (monitoring.sessionAlerts.length >= 2) risk += 5;
    }
    // Factor in fraud flags
    const userFlags = fraudFlags.filter(f => f.userId === user.id && !f.resolved);
    userFlags.forEach(f => {
      if (f.severity === "high") risk += 15;
      else if (f.severity === "medium") risk += 8;
      else risk += 3;
    });
    return Math.min(100, risk);
  }, [monitoringData, fraudFlags]);

  const approveKYC = useCallback((userId: string, comment: string) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, kycStatus: "verified" as KYCStatus, lastUpdated: now(), verifiedAt: now(), rekycDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() } : u));
    addLog({ userId, actionType: "kyc_approved", officerComment: comment, decisionResult: "Approved" });
  }, [addLog]);

  const rejectKYC = useCallback((userId: string, comment: string) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, kycStatus: "rejected" as KYCStatus, lastUpdated: now() } : u));
    addLog({ userId, actionType: "kyc_rejected", officerComment: comment, decisionResult: "Rejected" });
  }, [addLog]);

  const requestReKYC = useCallback((userId: string, comment: string) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, kycStatus: "rekyc_required" as KYCStatus, lastUpdated: now(), lastRekycDate: now() } : u));
    addLog({ userId, actionType: "kyc_rekyc", officerComment: comment, decisionResult: "Re KYC Required" });
  }, [addLog]);

  const submitUpdateRequest = useCallback((userId: string, field: "address" | "phone" | "email", oldValue: string, newValue: string, documentName: string) => {
    const newReq: UpdateRequest = {
      id: `REQ-${String(reqCounter++).padStart(3, "0")}`,
      userId, field, oldValue, newValue, documentName, status: "pending_review", submittedAt: now(),
    };
    setUpdateRequests((prev) => [newReq, ...prev]);
    setUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      const updated = { ...u, updateRequestCount: u.updateRequestCount + 1, lastUpdated: now() };
      // Temporarily set to pending review on profile update
      if (u.kycStatus === "verified") updated.kycStatus = "pending" as KYCStatus;
      return updated;
    }));
    addLog({ userId, actionType: "update_requested", details: `Requested ${field} change: "${oldValue}" → "${newValue}"` });

    // Check for rapid updates - monitoring
    setMonitoringData(prev => prev.map(m => {
      if (m.userId !== userId) return m;
      const newCount = m.profileUpdateCount + 1;
      const newAlerts = [...m.sessionAlerts];
      if (newCount >= 3 && !newAlerts.includes("Frequent profile updates")) {
        newAlerts.push("Frequent profile updates");
      }
      return { ...m, profileUpdateCount: newCount, rapidUpdateAttempts: m.rapidUpdateAttempts + 1, sessionAlerts: newAlerts };
    }));
  }, [addLog]);

  const approveUpdateRequest = useCallback((requestId: string, comment: string) => {
    setUpdateRequests((prev) => prev.map((r) => {
      if (r.id !== requestId) return r;
      const updated = { ...r, status: "approved" as UpdateRequestStatus, reviewedAt: now(), officerComment: comment };
      setUsers((users) => users.map((u) => {
        if (u.id !== r.userId) return u;
        const changes: Partial<KYCUser> = { detailChangeCount: u.detailChangeCount + 1, lastUpdated: now() };
        if (r.field === "address") changes.address = r.newValue;
        if (r.field === "phone") changes.phone = r.newValue;
        if (r.field === "email") changes.email = r.newValue;
        return { ...u, ...changes };
      }));
      addLog({ userId: r.userId, actionType: "update_approved", officerComment: comment, decisionResult: `${r.field} update approved` });
      return updated;
    }));
  }, [addLog]);

  const rejectUpdateRequest = useCallback((requestId: string, comment: string) => {
    setUpdateRequests((prev) => prev.map((r) => {
      if (r.id !== requestId) return r;
      addLog({ userId: r.userId, actionType: "update_rejected", officerComment: comment, decisionResult: `${r.field} update rejected` });
      return { ...r, status: "rejected" as UpdateRequestStatus, reviewedAt: now(), officerComment: comment };
    }));
  }, [addLog]);

  const addFraudFlag = useCallback((flag: Omit<FraudFlag, "id" | "timestamp" | "resolved">) => {
    const newFlag: FraudFlag = { ...flag, id: `FF-${String(flagCounter++).padStart(3, "0")}`, timestamp: now(), resolved: false };
    setFraudFlags(prev => [newFlag, ...prev]);
    addLog({ userId: flag.userId, actionType: "fraud_flag", details: flag.description });
    // Increase risk score
    setUsers(prev => prev.map(u => {
      if (u.id !== flag.userId) return u;
      const riskIncrease = flag.severity === "high" ? 15 : flag.severity === "medium" ? 8 : 3;
      const newRisk = Math.min(100, u.riskScore + riskIncrease);
      const newStatus = newRisk > 70 ? "manual_review" as KYCStatus : u.kycStatus;
      return { ...u, riskScore: newRisk, kycStatus: newStatus, lastUpdated: now() };
    }));
  }, [addLog]);

  const simulateMonitoringAlert = useCallback((userId: string, alert: string) => {
    setMonitoringData(prev => prev.map(m => {
      if (m.userId !== userId) return m;
      return { ...m, sessionAlerts: [...m.sessionAlerts, alert] };
    }));
    addLog({ userId, actionType: "monitoring_alert", details: alert });
  }, [addLog]);

  const getUserLogs = useCallback((userId: string) => auditLogs.filter((l) => l.userId === userId), [auditLogs]);
  const getUserRequests = useCallback((userId: string) => updateRequests.filter((r) => r.userId === userId), [updateRequests]);
  const getUserFraudFlags = useCallback((userId: string) => fraudFlags.filter((f) => f.userId === userId), [fraudFlags]);
  const getUserMonitoring = useCallback((userId: string) => monitoringData.find((m) => m.userId === userId), [monitoringData]);

  return (
    <KYCContext.Provider value={{ users, auditLogs, updateRequests, fraudFlags, monitoringData, approveKYC, rejectKYC, requestReKYC, submitUpdateRequest, approveUpdateRequest, rejectUpdateRequest, getUserLogs, getUserRequests, getUserFraudFlags, getUserMonitoring, calculateAdjustedRisk, addFraudFlag, simulateMonitoringAlert }}>
      {children}
    </KYCContext.Provider>
  );
};
