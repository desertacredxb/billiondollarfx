import axios from "axios";
import { useEffect } from "react";
import { create } from "zustand";

// Single source of truth for the logged-in user's profile on the client.
// Previously dashboard/page.tsx, live-accounts/page.tsx, withdrawals/page.tsx,
// every deposit gateway component, and Settings each called
// GET /api/auth/user/:email independently on mount to read the same handful
// of fields (accounts, isKycVerified, hasSubmittedDocuments, bank details...).
// This store fetches it once per email and caches it - every consumer reads
// from here instead of firing its own request.
export interface Account {
  _id: string;
  accountNo: number;
  currency: string;
  accountType?: string;
}

export interface IdProof {
  docType?: string;
  docNumber?: string;
  image?: string;
}

export interface UserProfile {
  fullName?: string;
  email: string;
  phone?: string;
  gender?: string;
  accountType?: string;
  address?: string;
  country?: string;
  nationality?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  profileImage?: string;
  isKycVerified: boolean;
  hasSubmittedDocuments: boolean;
  idProof1?: IdProof;
  idProof2?: IdProof;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  iban?: string;
  bankName?: string;
  bankAddress?: string;
  accounts: Account[];
  // The API returns a few more fields than we've typed above (referralCode,
  // commission, ...) - keep them accessible without having to extend this
  // type for every field a page happens to read.
  [key: string]: unknown;
}

export async function fetchUserProfile(
  email: string
): Promise<UserProfile | null> {
  const res = await axios.get<UserProfile>(
    `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/user/${email}`
  );
  return res.data ?? null;
}

function getStoredEmail(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return undefined;
    return JSON.parse(stored)?.email || undefined;
  } catch {
    return undefined;
  }
}

interface UserStoreState {
  profiles: Record<string, UserProfile | null>;
  fetchedAt: Record<string, number>;
  refreshProfile: (email: string) => Promise<void>;
}

const useUserStore = create<UserStoreState>((set) => ({
  profiles: {},
  fetchedAt: {},
  refreshProfile: async (email: string) => {
    try {
      const profile = await fetchUserProfile(email);

      set((state) => ({
        profiles: { ...state.profiles, [email]: profile },
        fetchedAt: { ...state.fetchedAt, [email]: Date.now() },
      }));
    } catch (error) {
      // Leave the last-known cached value in place on failure rather than
      // clearing it - a transient network hiccup shouldn't blank out a
      // profile that was showing correctly a moment ago.
      console.error("Error fetching user profile:", error);
    }
  },
}));

/**
 * The current logged-in user's profile (accounts, KYC status, bank details,
 * ...), fetched once and shared across every component that mounts this
 * hook. Fetches on first mount and whenever the cached email changes; call
 * `refresh()` after an action that changes the profile server-side (KYC
 * submission, account creation, bank details update, ...).
 */
export function useUserProfile() {
  const email = getStoredEmail();

  const profile = useUserStore((s) => (email ? s.profiles[email] ?? null : null));
  const refreshProfile = useUserStore((s) => s.refreshProfile);

  useEffect(() => {
    if (email) refreshProfile(email);
  }, [email, refreshProfile]);

  return {
    profile,
    accounts: profile?.accounts ?? [],
    isKycVerified: !!profile?.isKycVerified && !!profile?.hasSubmittedDocuments,
    hasSubmittedDocuments: !!profile?.hasSubmittedDocuments,
    refresh: () => {
      if (email) refreshProfile(email);
    },
  };
}
