import { Suspense } from "react";
import SignUpForm from "./SignupForm"; // your client component

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
