import { ConstantsUrl } from "@/services/service";

const KEY = "affiliateReferral";
const PRODUCT_KEY = "affiliateProductReferrals";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

const normalize = (value) => String(value || "").trim().toUpperCase().replace(/\s+/g, "");

export const getReferralCode = () => {
  if (typeof window === "undefined") return "";
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved?.code && Date.now() - saved.at < TTL_MS) return saved.code;
    localStorage.removeItem(KEY);
  } catch (e) {
    localStorage.removeItem(KEY);
  }
  return "";
};

export const clearReferralCode = () => {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
};

const readProductReferrals = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(PRODUCT_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch (e) {
    return {};
  }
};

// Referral code of the product link the shopper opened this product from, if any.
export const getProductReferralCode = (slug) => {
  if (typeof window === "undefined" || !slug) return "";
  const saved = readProductReferrals()[slug];
  return saved?.code && Date.now() - saved.at < TTL_MS ? saved.code : "";
};

const saveProductReferral = (slug, code) => {
  const now = Date.now();
  const referrals = Object.fromEntries(
    Object.entries(readProductReferrals()).filter(([, value]) => now - value?.at < TTL_MS)
  );
  referrals[slug] = { code, at: now };
  localStorage.setItem(PRODUCT_KEY, JSON.stringify(referrals));
};

// Saves ?ref= and, on a product page, counts one click per browser session.
export const saveReferralFromRoute = (router) => {
  const code = normalize(Array.isArray(router.query.ref) ? router.query.ref[0] : router.query.ref);
  if (!code) return;

  const slug = router.pathname === "/product-details/[id]" ? router.query.id : "";
  if (!slug) {
    localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }));
    return;
  }
  saveProductReferral(slug, code);

  const clickKey = `affiliateClick:${code}:${slug}`;
  if (sessionStorage.getItem(clickKey)) return;
  sessionStorage.setItem(clickKey, "1");
  fetch(`${ConstantsUrl}affiliation/link-click`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ref: code, slug }),
  }).catch(() => {});
};
