import { createContext, useContext, useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Api } from "@/services/service";

const StoreBookmarksContext = createContext(null);

export function StoreBookmarksProvider({ accountId, children }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [bookmarks, setBookmarks] = useState(null);
  const [pending, setPending] = useState(new Set());
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const isSignedIn = Boolean(accountId);
  const signInHref = `/signIn?redirect=${encodeURIComponent(router.asPath)}`;

  useEffect(() => {
    if (!accountId || !localStorage.getItem("token")) return;
    let active = true;
    Api("get", "storeBookmarks", null, router)
      .then((response) => {
        if (!response?.status || !Array.isArray(response.data)) throw new Error();
        if (active) setBookmarks(new Set(response.data));
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });
    return () => {
      active = false;
    };
  }, [accountId, loadAttempt]);

  const retry = () => {
    setLoadFailed(false);
    setLoadAttempt((attempt) => attempt + 1);
  };

  const toggleBookmark = async (storeId) => {
    if (!isSignedIn) {
      router.push(signInHref);
      return;
    }
    if (!bookmarks || pending.has(storeId)) return;
    const bookmarked = !bookmarks.has(storeId);
    setPending((current) => new Set(current).add(storeId));
    try {
      const response = await Api("put", `storeBookmarks/${storeId}`, { bookmarked }, router);
      if (!response?.status || response.data?.bookmarked !== bookmarked) throw new Error();
      setBookmarks((current) => {
        const next = new Set(current);
        if (bookmarked) next.add(storeId);
        else next.delete(storeId);
        return next;
      });
    } catch {
      toast.error(t("Unable to update store bookmark"));
    } finally {
      setPending((current) => {
        const next = new Set(current);
        next.delete(storeId);
        return next;
      });
    }
  };

  return (
    <StoreBookmarksContext.Provider value={{
      bookmarks, pending, toggleBookmark, loadFailed, retry, showBookmarks, setShowBookmarks, isSignedIn, signInHref,
    }}>
      {children}
    </StoreBookmarksContext.Provider>
  );
}

export function useStoreBookmarks() {
  return useContext(StoreBookmarksContext);
}

export function StoreBookmarkButton({ storeId, storeName, showLabel = false, className = "" }) {
  const { t } = useTranslation();
  const { bookmarks, pending, toggleBookmark, isSignedIn } = useStoreBookmarks();
  const bookmarked = bookmarks?.has(storeId) ?? false;
  const label = t(isSignedIn ? "Bookmark {{store}}" : "Sign in to bookmark {{store}}", { store: storeName });

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isSignedIn ? bookmarked : undefined}
      disabled={isSignedIn && (!bookmarks || pending.has(storeId))}
      onClick={() => toggleBookmark(storeId)}
      className={`inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[#206B3A]/20 bg-white text-[#206B3A] shadow-sm transition hover:bg-[#edf6ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#206B3A] aria-pressed:bg-[#edf6ef] disabled:opacity-60 ${className}`}
    >
      <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} aria-hidden="true" />
      {showLabel && <span>{t(isSignedIn ? "Bookmark" : "Sign in to bookmark")}</span>}
    </button>
  );
}

export function StoreBookmarksError() {
  const { t } = useTranslation();
  const { loadFailed, retry } = useStoreBookmarks();
  if (!loadFailed) return null;

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-700">
      <p role="alert">{t("Unable to load store bookmarks")}</p>
      <button type="button" onClick={retry} className="font-semibold text-[#206B3A] underline">
        {t("Retry")}
      </button>
    </div>
  );
}
