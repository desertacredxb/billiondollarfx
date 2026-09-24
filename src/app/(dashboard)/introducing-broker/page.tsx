"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import IBRequest from "../../../../components/IBRequest";
import IBPage from "../../../../components/IBPage";

// 👤 User type used in this page
interface User {
  email: string;
  ibRequestPending?: boolean;
  isApprovedIB?: boolean;
}

function IntroducingBroker() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");
    if (!token || !userString) return;

    const parsedUser: User = JSON.parse(userString);
    const email = parsedUser.email;

    try {
      const res = await api.get<User>(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/user/${email}`
      );
      setUser(res.data);
      // console.log("IB approved:", res.data.isApprovedIB);
    } catch (err) {
      console.error("❌ Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) return <p className="text-white">Loading...</p>;

  return (
    <div>
      {!user?.isApprovedIB ? (
        <IBRequest user={user!} refreshUser={fetchUser} setUser={setUser} />
      ) : (
        // ✅ Pass user safely to IBPage
        <IBPage user={{ email: user.email, isApprovedIB: user.isApprovedIB }} />
      )}
    </div>
  );
}

export default IntroducingBroker;
