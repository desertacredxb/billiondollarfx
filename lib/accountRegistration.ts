import { countriesData } from "../src/data/IsoCode";
import type { UserProfile } from "./userStore";

type RegistrationProfile = Partial<Pick<UserProfile, "fullName" | "email" | "phone" | "nationality">>;

export function getAccountRegistrationDetails(profile: RegistrationProfile | null) {
  const fullName = typeof profile?.fullName === "string" ? profile.fullName.trim() : "";
  const [Fname = "", ...lastNames] = fullName ? fullName.split(/\s+/) : [];
  const country = countriesData.find(item => item.country === profile?.nationality);
  const rawPhone = typeof profile?.phone === "string" ? profile.phone.trim() : "";
  const digits = rawPhone.replace(/\D/g, "");
  const dialCode = country?.code.split(",")[0].replace(/\D/g, "") || "";
  // Veriff registrations already store an international number. Older profiles
  // can contain a national number, which still needs its country calling code.
  const mobile = !digits ? "" : rawPhone.startsWith("+") ? digits
    : rawPhone.startsWith("00") ? digits.slice(2) : `${dialCode}${digits}`;

  return {
    Fname,
    Lname: lastNames.join(" "),
    email: typeof profile?.email === "string" ? profile.email : "",
    mobile,
    countryIso: country?.iso.toLowerCase() || "us",
  };
}
