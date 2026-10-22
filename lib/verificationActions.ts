interface VerificationActionStatus {
  enabled: boolean;
  approved: boolean;
  status: string;
  managedByVeriff?: boolean;
  canEditDetails?: boolean;
  canRetry?: boolean;
  resubmissionRequired?: boolean;
}

// Keep the owner-approved correction flow independent of status-copy changes.
export function verificationActions(status: VerificationActionStatus | null, forIb = false) {
  const identityApproved = !!status?.approved && (!forIb || !!status.managedByVeriff);
  const needsIbVerification = forIb && !!status?.approved && !status.managedByVeriff;
  const supportOnly = !!status && (["review", "test_approved", "manual_rejected"].includes(status.status) ||
    status.status === "declined" && !status.canRetry);
  return {
    identityApproved,
    needsIbVerification,
    canEditName: !!status?.enabled && !!status.canEditDetails && !identityApproved,
    canStart: !!status?.enabled && !identityApproved && !supportOnly,
    startLabel: status?.resubmissionRequired || status?.canRetry || status?.status === "resubmission_requested"
      ? "Resubmit verification" : "Continue to Verify",
  };
}
