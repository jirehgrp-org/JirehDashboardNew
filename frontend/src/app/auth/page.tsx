// @/app/auth/page.tsx

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Auth = () => {
  const router = useRouter(); 
  
  useEffect(() => {
    router.push("/auth/login");
  }, [router]);

  return null;
};

export default Auth;