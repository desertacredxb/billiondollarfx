"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import ProfileImage from "./ProfileImage";

const DOC_TYPES = [
  "Passport",
  "National ID Card",
  "Driving License",
  "Voter ID",
  "Other",
];

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_FORMATS_LABEL = "JPG, JPEG, PNG, or PDF";
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const FILE_INPUT_ACCEPT = ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf";

// Checked before the file ever reaches the server, so the user finds out
// right away what to fix instead of waiting on a submit round-trip.
const validateFile = (file: File): string => {
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return `Please upload a ${ACCEPTED_FORMATS_LABEL} file — that file type isn't supported.`;
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `That file is over ${MAX_FILE_SIZE_MB}MB. Please upload a smaller ${ACCEPTED_FORMATS_LABEL} file (max ${MAX_FILE_SIZE_MB}MB).`;
  }
  return "";
};

interface IdProof {
  docType?: string;
  docNumber?: string;
  image?: string;
}

interface ProofFormState {
  docType: string;
  docNumber: string;
  image?: File;
}

const emptyProof: ProofFormState = { docType: "", docNumber: "", image: undefined };

export default function KycVerification() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [hasSubmittedDocuments, setHasSubmittedDocuments] = useState(false);
  const [isKycVerified, setIsKycVerified] = useState(false);
  const [submittedIdProof1, setSubmittedIdProof1] = useState<IdProof>({});
  const [submittedIdProof2, setSubmittedIdProof2] = useState<IdProof>({});

  const [idProof1, setIdProof1] = useState<ProofFormState>(emptyProof);
  const [idProof2, setIdProof2] = useState<ProofFormState>(emptyProof);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const storedEmail = JSON.parse(localStorage.getItem("user") || "{}").email;
      if (!storedEmail) {
        alert("User email not found.");
        setFetching(false);
        return;
      }
      setEmail(storedEmail);

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/user/${storedEmail}`
        );
        setCountry(response.data.country || response.data.nationality || "");
        setHasSubmittedDocuments(response.data.hasSubmittedDocuments || false);
        setIsKycVerified(response.data.isKycVerified || false);
        setSubmittedIdProof1(response.data.idProof1 || {});
        setSubmittedIdProof2(response.data.idProof2 || {});
      } catch (err) {
        console.error("Failed to fetch user data", err);
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, []);

  const handleProofChange = (
    proof: "idProof1" | "idProof2",
    field: keyof ProofFormState,
    value: string | File
  ) => {
    const setter = proof === "idProof1" ? setIdProof1 : setIdProof2;
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (
    proof: "idProof1" | "idProof2",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileError = validateFile(file);
    if (fileError) {
      setError(fileError);
      e.target.value = ""; // let them pick again with the same filename
      return;
    }

    setError("");
    handleProofChange(proof, "image", file);
  };

  const validate = () => {
    if (!idProof1.docType || !idProof1.docNumber || !idProof1.image) {
      return "ID Proof 1 is required — please select a document type, enter the document number, and upload an image.";
    }

    const proof2Fields = [idProof2.docType, idProof2.docNumber, idProof2.image];
    const proof2Started = proof2Fields.some(Boolean);
    if (proof2Started && !proof2Fields.every(Boolean)) {
      return "ID Proof 2 is optional, but if you start it, document type, number, and image are all required.";
    }

    return "";
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    const formData = new FormData();
    formData.append("idProof1DocType", idProof1.docType);
    formData.append("idProof1DocNumber", idProof1.docNumber);
    if (idProof1.image) formData.append("idProof1Image", idProof1.image);

    if (idProof2.docType || idProof2.docNumber || idProof2.image) {
      formData.append("idProof2DocType", idProof2.docType);
      formData.append("idProof2DocNumber", idProof2.docNumber);
      if (idProof2.image) formData.append("idProof2Image", idProof2.image);
    }

    setLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/documents/${email}`,
        formData
      );
      alert("Documents submitted successfully!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      const fallback = `Please make sure each file is a ${ACCEPTED_FORMATS_LABEL} under ${MAX_FILE_SIZE_MB}MB, then try again.`;
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || fallback
        : fallback;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const filePreview = (file?: File) => {
    if (!file) return null;
    const url = URL.createObjectURL(file);
    return <img src={url} alt="preview" className="h-20 mt-2 rounded" />;
  };

  if (fetching) {
    return (
      <div className="space-y-6">
        <ProfileImage />
        <div className="bg-[#121a2a] p-6 rounded-xl shadow-lg text-center text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  if (hasSubmittedDocuments) {
    return (
      <div className="space-y-6">
        <ProfileImage />

        <div
          className={`bg-[#121a2a] p-6 rounded-xl shadow-lg text-center border ${isKycVerified ? "border-transparent" : "border-yellow-600/40"
            }`}
        >
          <div className="flex flex-col items-center space-y-3">
            <div
              className={`p-4 rounded-full ${isKycVerified ? "bg-green-600/20" : "bg-yellow-600/20"
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-10 w-10 ${isKycVerified
                  ? "text-green-500"
                  : "text-yellow-400 animate-pulse"
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {isKycVerified ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                  />
                )}
              </svg>
            </div>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${isKycVerified
                ? "bg-green-600/20 text-green-400"
                : "bg-yellow-600/20 text-yellow-400"
                }`}
            >
              {isKycVerified ? "Verified" : "Pending Review"}
            </span>
          </div>

          <h2 className="text-xl font-semibold mt-4 text-white">
            {isKycVerified ? "KYC Verified" : "KYC Under Review"}
          </h2>
          <p className="text-gray-400 mt-2">
            {isKycVerified
              ? "Your documents have been successfully verified. You can now continue using all available services without restrictions."
              : "You have already submitted your documents. Our team is reviewing them, and you'll be notified once they are approved."}
          </p>

          <div className="mt-6 text-left grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div className="bg-[#0f172a] p-4 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">Country</p>
              <p className="text-white mt-1">{country || "Not set"}</p>
            </div> */}
            <div className="bg-[#0f172a] p-4 rounded-lg">
              <p className="text-xs text-gray-500 uppercase">ID Proof 1</p>
              <div className="space-y-1 text-sm">
                <p className="text-gray-300">
                  <span className="text-gray-400 font-medium">Doc Type:</span>{" "}
                  <span className="text-white capitalize">{submittedIdProof1?.docType || "—"}</span>
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-400 font-medium">Doc No:</span>{" "}
                  <span className="text-white font-mono">{submittedIdProof1?.docNumber || "—"}</span>
                </p>
              </div>
            </div>
            {submittedIdProof2?.docType && (
              <div className="bg-[#0f172a] p-4 rounded-lg">
                              <p className="text-xs text-gray-500 uppercase">ID Proof 2</p>

                <div className="space-y-1 text-sm">
                <p className="text-gray-300">
                  <span className="text-gray-400 font-medium">Doc Type:</span>{" "}
                  <span className="text-white capitalize">{submittedIdProof2?.docType || "—"}</span>
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-400 font-medium">Doc No:</span>{" "}
                  <span className="text-white font-mono">{submittedIdProof2?.docNumber || "—"}</span>
                </p>
              </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileImage />

      <div className="bg-[#121a2a] border border-gray-800 p-6 rounded-xl shadow-lg space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">
            KYC Verification
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Country is taken from your profile and can't be changed here. Update
            it under Profile Info if it's wrong.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Accepted formats: {ACCEPTED_FORMATS_LABEL}. Max size: {MAX_FILE_SIZE_MB}MB per file.
          </p>
        </div>

        {/* Country */}
        <div>
          <label className="text-sm font-medium text-white">Country</label>
          <input
            type="text"
            value={country}
            disabled
            className="mt-1 w-full bg-[#0f172a] text-gray-400 border border-gray-700 rounded-md px-3 py-2 cursor-not-allowed"
          />
        </div>

        {/* ID Proof 1 - required */}
        <div className="border border-gray-800 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white">
            ID Proof 1 <span className="text-red-400">(Required)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <div>
              <label className="text-sm text-gray-300">Document Type</label>
              <input
                type="text"
                value={idProof1.docType}
                onChange={(e) =>
                  handleProofChange("idProof1", "docType", e.target.value)
                }
                placeholder="Document Name"
                className="mt-1 w-full bg-[#0f172a] text-white border border-gray-700 rounded-md px-3 py-2"
              />
              {/* <select
              value={idProof1.docType}
              onChange={(e) =>
                handleProofChange("idProof1", "docType", e.target.value)
              }
              className="mt-1 w-full bg-[#0f172a] text-white border border-gray-700 rounded-md px-3 py-2"
            >
              <option value="">Select document type</option>
              {DOC_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select> */}
            </div>
            <div>
              <label className="text-sm text-gray-300">Document Number</label>
              <input
                type="text"
                value={idProof1.docNumber}
                onChange={(e) =>
                  handleProofChange("idProof1", "docNumber", e.target.value)
                }
                className="mt-1 w-full bg-[#0f172a] text-white border border-gray-700 rounded-md px-3 py-2"
                placeholder="Document number"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-300">Document Image</label>
            <input
              type="file"
              accept={FILE_INPUT_ACCEPT}
              onChange={(e) => handleFileSelect("idProof1", e)}
              className="mt-1 file:bg-white file:text-black file:px-3 file:py-1 file:rounded file:border-0 file:font-medium text-sm text-white w-full cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              {ACCEPTED_FORMATS_LABEL} · up to {MAX_FILE_SIZE_MB}MB
            </p>
            {filePreview(idProof1.image)}
          </div>
        </div>

        {/* ID Proof 2 - optional */}
        <div className="border border-gray-800 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white">
            ID Proof 2 <span className="text-gray-500">(Optional)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <div>
              <label className="text-sm text-gray-300">Document Type</label>
              <input
                type="text"
                value={idProof2.docType}
                placeholder="Document Name"

                onChange={(e) =>
                  handleProofChange("idProof2", "docType", e.target.value)
                }
                className="mt-1 w-full bg-[#0f172a] text-white border border-gray-700 rounded-md px-3 py-2"
              />
              {/* <select
              value={idProof2.docType}
              onChange={(e) =>
                handleProofChange("idProof2", "docType", e.target.value)
              }
              className="mt-1 w-full bg-[#0f172a] text-white border border-gray-700 rounded-md px-3 py-2"
            >
              <option value="">Select document type</option>
              {DOC_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select> */}
            </div>
            <div>
              <label className="text-sm text-gray-300">Document Number</label>
              <input
                type="text"
                value={idProof2.docNumber}
                onChange={(e) =>
                  handleProofChange("idProof2", "docNumber", e.target.value)
                }
                className="mt-1 w-full bg-[#0f172a] text-white border border-gray-700 rounded-md px-3 py-2"
                placeholder="Document number"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-300">Document Image</label>
            <input
              type="file"
              accept={FILE_INPUT_ACCEPT}
              onChange={(e) => handleFileSelect("idProof2", e)}
              className="mt-1 file:bg-white file:text-black file:px-3 file:py-1 file:rounded file:border-0 file:font-medium text-sm text-white w-full cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              {ACCEPTED_FORMATS_LABEL} · up to {MAX_FILE_SIZE_MB}MB
            </p>
            {filePreview(idProof2.image)}
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white cursor-pointer ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-[var(--primary)]"
              }`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
