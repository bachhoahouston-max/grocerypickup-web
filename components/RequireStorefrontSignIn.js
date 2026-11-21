import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function RequireStorefrontSignIn({ children }) {
  const router = useRouter();
  const { isReady, asPath } = router;
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    const hasToken = Boolean(localStorage.getItem("token"));
    setHasSession(hasToken);

    if (!hasToken) {
      router.replace(`/signIn?redirect=${encodeURIComponent(asPath)}`);
    }
  }, [isReady, asPath, router]);

  return hasSession ? children : null;
}
