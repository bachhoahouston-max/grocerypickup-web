import React, { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Upload, ImagePlus, X, ChevronRight } from "lucide-react";
import moment from "moment";
import Compressor from "compressorjs";
import { cartContext, userContext, languageContext } from "./_app";
import { Api, ApiFormData } from "@/services/service";
import {
  buildRewardCartItem,
  cartQtyForProduct,
  getAvailableStock,
  rewardCartId,
  rewardLimitError,
} from "@/services/rewardCart";
import TierBadge, { tierColor } from "@/components/TierBadge";
import TierCrown from "@/components/TierCrown";

const TABS = [
  { key: "redeem", label: "Redeem" },
  { key: "status", label: "My Status" },
  { key: "upload", label: "Upload" },
];

const BRAND_BLUE = "#0B4F8A";
// Four-point sparkle used to decorate the points header.
const Sparkle = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M12 0 Q13.2 10.8 24 12 Q13.2 13.2 12 24 Q10.8 13.2 0 12 Q10.8 10.8 12 0Z" fill="#F5B82E" />
  </svg>
);

const Leaf = ({ className = "" }) => (
  <svg viewBox="0 0 100 160" className={className} aria-hidden="true">
    <path d="M50 0 C95 40 95 120 50 160 C5 120 5 40 50 0Z" fill="#2E7D32" />
    <path d="M50 10 V150" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />
  </svg>
);

function Rewards(props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [user] = useContext(userContext);
  const [cartData, setCartData] = useContext(cartContext);
  const { lang } = useContext(languageContext);
  const isLoggedIn = !!(user?._id && user?.token);

  const [tab, setTab] = useState("redeem");
  const [summary, setSummary] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [banner, setBanner] = useState({ image: null, link: null });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query.tab;
    if (TABS.some((x) => x.key === q)) setTab(q);
  }, [router.isReady, router.query.tab]);

  const changeTab = (key) => {
    setTab(key);
    router.replace({ pathname: "/rewards", query: key === "redeem" ? {} : { tab: key } }, undefined, { shallow: true });
  };

  const loadSummary = () => {
    if (!isLoggedIn) return;
    Api("get", "rewards/summary", "", router).then(
      (res) => setSummary(res?.data || null),
      (err) => props.toaster?.({ type: "error", message: err?.message }),
    );
  };

  useEffect(() => {
    Api("get", "rewards/catalog", "", router)
      .then((res) => setCatalog(Array.isArray(res?.data) ? res.data : []))
      .catch((err) => props.toaster?.({ type: "error", message: err?.message }))
      .finally(() => setCatalogLoaded(true));
    // Banner is optional (admin-set); keep the default store photo on any failure
    Api("get", "rewards/banner", "", router)
      .then((res) => setBanner({ image: res?.data?.image || null, link: res?.data?.link || null }))
      .catch(() => { });
  }, []);

  useEffect(() => {
    loadSummary();
  }, [isLoggedIn]);

  const pointsInCart = useMemo(
    () =>
      cartData
        .filter((item) => item?.productSource === "REWARD")
        .reduce((sum, item) => sum + Number(item.points || 0) * Number(item.qty || 1), 0),
    [cartData],
  );
  const spendable = Math.max((summary?.available || 0) - pointsInCart, 0);

  const rewardState = (reward) => {
    const inCart = cartData.some((c) => c.id === rewardCartId(reward._id));
    const used = summary?.usageByPoint?.[reward._id] || 0;
    if (inCart) return { disabled: true, label: t("In your cart") };
    if (!reward.inStock) return { disabled: true, label: t("Out of stock") };
    if (reward.remainingTotal === 0) return { disabled: true, label: t("Fully redeemed") };
    if (reward.perUserLimit && used >= reward.perUserLimit) return { disabled: true, label: t("Limit reached") };
    if (isLoggedIn && summary && reward.points > spendable) {
      return { disabled: true, label: `${t("Need")} ${(reward.points - spendable).toLocaleString()} ${t("more pts")}` };
    }
    return { disabled: false, label: t("Redeem award") };
  };

  const groups = useMemo(() => {
    const map = new Map();
    catalog.forEach((reward) => {
      const lower = Math.floor(reward.points / 100) * 100;
      if (!map.has(lower)) map.set(lower, []);
      map.get(lower).push(reward);
    });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [catalog]);

  const onRedeemClick = (reward) => {
    if (!isLoggedIn) {
      props.toaster?.({ type: "error", message: t("Please sign in to redeem rewards.") });
      router.push("/signIn");
      return;
    }
    setSelected(reward);
  };

  const addRewardToCart = async () => {
    if (!selected) return;
    if (rewardState(selected).disabled) {
      setSelected(null);
      return;
    }

    // Same stock check as normal items, counting units of this product already in the cart
    try {
      props.loader?.(true);
      const stock = await getAvailableStock(selected.product._id, router);
      if (cartQtyForProduct(cartData, selected.product._id) + 1 > stock) {
        props.toaster?.({
          type: "error",
          message: stock > 0
            ? t("Item is not available in this quantity in stock. Please choose a different item.")
            : t("This item is currently out of stock. Please choose a different item."),
        });
        setSelected(null);
        return;
      }
      const limitError = rewardLimitError({ ...selected, qtyInCart: 0 }, summary, cartData, t);
      if (limitError) {
        props.toaster?.({ type: "error", message: limitError });
        setSelected(null);
        return;
      }
    } catch (err) {
      props.toaster?.({ type: "error", message: err?.message });
      return;
    } finally {
      props.loader?.(false);
    }

    const next = [...cartData, buildRewardCartItem(selected)];
    setCartData(next);
    localStorage.setItem("addCartDetail", JSON.stringify(next));
    setSelected(null);
    props.toaster?.({ type: "success", message: t("Reward added to cart") });
  };

  const rewardName = (reward) =>
    lang === "en" ? reward?.product?.name : reward?.product?.vietnamiesName || reward?.product?.name;

  return (
    <div className="bg-[#F4F8FC] w-full min-h-screen pb-32 md:pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Tabs */}
        <div className="grid grid-cols-3 pt-14 md:pt-8">
          {TABS.map((x) => (
            <button
              key={x.key}
              type="button"
              onClick={() => changeTab(x.key)}
              className="flex flex-col items-center cursor-pointer"
            >
              <span
                className={`text-base md:text-lg font-semibold ${tab === x.key ? "text-[#0B4F8A]" : "text-[#3b6ea5]"}`}
              >
                {t(x.label)}
              </span>
              <span
                className={`mt-2 h-1 w-24 md:w-32 rounded-full ${tab === x.key ? "bg-[#0B4F8A]" : "bg-transparent"}`}
              />
            </button>
          ))}
        </div>

        {/* Points header */}
        <div className="relative overflow-hidden rounded-3xl mt-6 p-6 text-center bg-gradient-to-b from-[#E6F3E8] to-[#F4F8FC]">
          <Leaf className="pointer-events-none absolute -left-6 top-6 w-20 md:w-28 opacity-[0.08] -rotate-[30deg]" />
          <Leaf className="pointer-events-none absolute -left-2 bottom-0 w-14 md:w-20 opacity-[0.06] rotate-[20deg]" />
          <Leaf className="pointer-events-none absolute -right-6 top-2 w-20 md:w-28 opacity-[0.08] rotate-[35deg]" />
          <Leaf className="pointer-events-none absolute -right-2 bottom-2 w-16 md:w-24 opacity-[0.06] -rotate-[15deg]" />
          <div className="relative flex flex-col items-center">
            <TierCrown tier={summary?.tier} size={72} className="drop-shadow-md" />
            <div className="relative px-8">
              <Sparkle size={18} className="absolute -right-2 -top-2" />
              <Sparkle size={12} className="absolute -left-1 top-5" />
              <p className="text-[#0B2F5E] tracking-[0.25em] text-sm md:text-base font-semibold">
                {summary?.tier ? t(`${summary.tier.name.toUpperCase()} MEMBER`) : t("REWARDS MEMBER")}
              </p>
            </div>
            {isLoggedIn ? (
              <>
                <p className="text-[#0B2F5E] font-extrabold text-6xl md:text-7xl leading-tight tabular-nums">
                  {summary ? summary.available.toLocaleString() : "—"}
                </p>
                <p className="text-[#0B4F8A] text-base md:text-lg font-medium">{t("Available Points")}</p>
                {(summary?.pending > 0 || pointsInCart > 0) && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {pointsInCart > 0 && (
                      <span className="rounded-full bg-white/80 text-gray-600 text-xs md:text-sm px-3 py-1">
                        {pointsInCart.toLocaleString()} {t("pts in your cart")}
                      </span>
                    )}
                    {summary?.pending > 0 && (
                      <span className="rounded-full bg-white/80 text-gray-600 text-xs md:text-sm px-3 py-1">
                        {summary.pending.toLocaleString()} {t("pts on hold for an unpaid checkout")}
                      </span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="mt-4 flex flex-col items-center gap-3">
                <p className="text-gray-600 text-sm md:text-base max-w-sm">
                  {t("Earn 10 points for every $1 you spend. Sign in to see your points.")}
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/signIn")}
                  className="bg-custom-green text-white font-semibold rounded-full px-8 py-2.5 cursor-pointer"
                >
                  {t("Sign in")}
                </button>
              </div>
            )}
          </div>
        </div>

        {tab === "redeem" && (
          <RedeemTab
            t={t}
            router={router}
            groups={groups}
            banner={banner}
            catalogLoaded={catalogLoaded}
            rewardName={rewardName}
            rewardState={rewardState}
            onRedeemClick={onRedeemClick}
          />
        )}
        {tab === "status" && <StatusTab t={t} lang={lang} router={router} isLoggedIn={isLoggedIn} summary={summary} toaster={props.toaster} />}
        {tab === "upload" && (
          <UploadTab
            t={t}
            router={router}
            isLoggedIn={isLoggedIn}
            loader={props.loader}
            toaster={props.toaster}
            onUploaded={loadSummary}
          />
        )}
      </div>

      {/* Redeem bottom sheet */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] bg-black/30 flex items-end justify-center md:items-center"
          onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-xl px-5 pt-3 pb-8 md:pb-6 mx-0 md:mx-4">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300 mb-4 md:hidden" />
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image src={productImage(selected.product)} alt={rewardName(selected) || ""} fill className="object-contain" sizes="80px" />
              </div>
              <div className="min-w-0">
                <p className="text-[#0B4F8A] font-semibold text-lg md:text-xl">{rewardName(selected)}</p>
                <p className="text-gray-500">
                  {selected.points.toLocaleString()} {t("points")}
                </p>
                {selected.perUserLimit && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t("Limit")} {selected.perUserLimit} {t("per customer")}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              {t("Rewards are free with any purchase. Points are used when you place your order.")}
            </p>
            <button
              type="button"
              onClick={addRewardToCart}
              className="mt-4 w-full bg-[#E3062A] hover:bg-[#c40524] text-white font-semibold text-lg rounded-2xl py-3 cursor-pointer"
            >
              {t("Add to cart")}
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-3 w-full bg-[#E9EEF5] hover:bg-[#dde4ee] text-[#0B4F8A] font-semibold text-lg rounded-2xl py-3 cursor-pointer"
            >
              {t("Cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RedeemTab({ t, router, groups, banner, catalogLoaded, rewardName, rewardState, onRedeemClick }) {
  const shopNow = () => {
    const link = banner?.link || "/";
    if (/^https?:\/\//.test(link)) window.location.href = link;
    else router.push(link);
  };

  return (
    <>
      {/* Store banner — the whole banner is the admin-set image and links to the admin-set page */}
      <button
        type="button"
        onClick={shopNow}
        className="mt-6 block w-full rounded-2xl overflow-hidden shadow-md bg-white cursor-pointer"
      >
        {banner?.image ? (
          // Admin-uploaded banner (Admin → Points → Banner); plain img so any asset host works
          <img src={banner.image} alt="Bách Hoá Houston" className="block w-full h-auto" />
        ) : (
          <div className="relative w-full aspect-[3/1]">
            <Image src="/Store.png" alt="Bách Hoá Houston store" fill className="object-cover" sizes="(max-width: 768px) 100vw, 1000px" />
          </div>
        )}
      </button>

      {catalogLoaded && groups.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600 font-medium">{t("No rewards available right now.")}</p>
          <p className="text-gray-400 text-sm mt-1">{t("Keep shopping to earn points — new rewards are coming soon.")}</p>
        </div>
      )}

      {groups.map(([lower, rewards]) => (
        <section key={lower} className="mt-6">
          {/* <h2 className="text-[#0B4F8A] font-bold text-xl md:text-2xl mb-3">
            {lower.toLocaleString()} - {(lower + 99).toLocaleString()} {t("Points")}
          </h2> */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {rewards.map((reward) => {
              const state = rewardState(reward);
              return (
                <div key={reward._id} className="bg-white rounded-2xl border border-gray-200 p-3 flex flex-col items-center text-center">
                  <div className="relative w-full h-24 md:h-28">
                    <Image src={productImage(reward.product)} alt={rewardName(reward) || ""} fill className="object-contain" sizes="(max-width: 768px) 45vw, 220px" />
                  </div>
                  <p className="text-[#0B4F8A] font-semibold mt-2 text-sm md:text-base line-clamp-2 min-h-[2.5rem]">
                    {rewardName(reward)}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {reward.points.toLocaleString()} {t("points")}
                  </p>
                  <button
                    type="button"
                    disabled={state.disabled}
                    onClick={() => onRedeemClick(reward)}
                    className={`mt-2 w-full rounded-full py-2 text-sm md:text-base font-medium ${state.disabled
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[#1E9E4A] hover:bg-[#188a40] text-white cursor-pointer"
                      }`}
                  >
                    {state.label}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}

function StatusTab({ t, lang, router, isLoggedIn, summary, toaster }) {
  const [history, setHistory] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    Api("get", "rewards/history", "", router)
      .then((res) => setHistory(Array.isArray(res?.data) ? res.data : []))
      .catch((err) => toaster?.({ type: "error", message: err?.message }))
      .finally(() => setLoaded(true));
  }, [isLoggedIn]);

  if (!isLoggedIn) return <SignInPrompt t={t} router={router} />;

  const stats = [
    { label: t("Total earned"), value: summary?.earned },
    { label: t("Redeemed"), value: summary?.redeemed },
    { label: t("Total spent"), value: summary ? `$${summary.lifetimeSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : undefined },
  ];

  const entryTitle = (h) => {
    if (h.type === "earn") return `${t("Order")} ${h.orderId}`;
    if (h.type === "redeem") {
      const name = lang === "en" ? h.product?.name : h.product?.vietnamiesName || h.product?.name;
      return `${t("Redeemed")} ${name || t("reward")}${h.qty > 1 ? ` ×${h.qty}` : ""}`;
    }
    return t("Receipt upload");
  };

  const entrySubtitle = (h) => {
    const date = moment(h.date).format("MMM D, YYYY");
    if (h.type === "earn") {
      return `${date} · $${Number(h.amount).toFixed(2)} ${t("spent")}${h.tier ? ` · ${t(h.tier)} ×${h.pointsPerDollar}` : ""}`;
    }
    if (h.type === "redeem") return `${date} · ${t("Order")} ${h.orderId}${h.pending ? ` · ${t("awaiting payment")}` : ""}`;
    const statusText = { pending: t("Under review"), approved: t("Approved"), rejected: t("Rejected") }[h.status];
    return `${date} · ${statusText}${h.adminNote ? ` · ${h.adminNote}` : ""}`;
  };

  const tier = summary?.tier;
  const nextMin = tier?.nextTier?.minPoints;
  const currentMin = summary?.tiers?.find((x) => x.key === tier?.key)?.minPoints || 0;
  const progress = nextMin
    ? Math.max(Math.min(((tier.qualifyingPoints - currentMin) / (nextMin - currentMin)) * 100, 100), 0)
    : 100;
  const tierStyle = tierColor(tier) || { base: "#2E7D32", dark: "#1B5E20" };
  const nextTiers = (summary?.tiers || []).filter((x) => x.minPoints > currentMin);

  return (
    <div className="mt-6 space-y-6">
      {tier && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-gray-500 text-sm">{t("Your membership")}</p>
              <p className="text-[#0B2F5E] font-extrabold text-3xl leading-tight">{t(tier.name)}</p>
            </div>
            <span
              className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-full px-4 py-1.5"
              style={{ backgroundColor: `${tierStyle.base}22`, color: tierStyle.dark }}
            >
              <TierCrown tier={tier} size={16} className="flex-shrink-0" />
              {t(tier.name)}
            </span>
          </div>

          <div className="border-t border-gray-100 mt-4 pt-4">
            <div className="flex justify-between gap-2 text-xs md:text-sm text-gray-600 mb-2">
              <span>
                {tier.year} {t("tier points")}: <span className="font-semibold text-gray-900">{tier.qualifyingPoints.toLocaleString()}</span>
              </span>
              {tier.nextTier && <span>{nextMin.toLocaleString()} {t("points to")} {t(tier.nextTier.name)}</span>}
            </div>
            <div className="h-2.5 rounded-full bg-[#E9EEF5] overflow-hidden">
              <div className="h-full rounded-full bg-[#2E7D32] min-w-[8%]" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm md:text-base text-gray-800 mt-3">
              {tier.nextTier ? (
                <>
                  <span className="font-bold">{tier.pointsToNextTier.toLocaleString()}</span> {t("points to reach")} {t(tier.nextTier.name)}
                </>
              ) : (
                t("You've reached our highest tier!")
              )}
            </p>
            {tier.source === "carried" && tier.pointsToKeepTier > 0 && (
              <p className="text-xs md:text-sm text-[#0B4F8A] mt-1">
                {`${t("You earned")} ${t(tier.name)} ${t("in")} ${tier.carriedFromYear}. ${t("Earn")} ${tier.pointsToKeepTier.toLocaleString()} ${t("more tier points in")} ${tier.year} ${t("to keep it through")} ${tier.year + 1}.`}
              </p>
            )}
          </div>
        </div>
      )}

      {nextTiers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
          <p className="text-gray-600 text-sm md:text-base mb-3">{t("Next tier benefits")}</p>
          <ul className="space-y-2">
            {nextTiers.map((x) => (
              <li key={x.key} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-[#FAFBFC] px-4 py-3">
                <TierBadge tier={x} size={40} className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[#0B2F5E] font-bold text-lg leading-tight">{t(x.name)}</p>
                  <p className="text-sm text-gray-500">
                    {x.minPoints.toLocaleString()} {t("points")} · $1 = {x.pointsPerDollar} {t("points")}
                  </p>
                </div>
                <ChevronRight className="text-gray-400 flex-shrink-0" size={20} aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <p className="text-[#0B4F8A] font-bold text-2xl tabular-nums">
              {s.value === undefined ? "—" : typeof s.value === "number" ? s.value.toLocaleString() : s.value}
            </p>
            <p className="text-gray-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 text-sm text-gray-600">
        <p className="font-semibold text-[#0B4F8A] mb-1">{t("How it works")}</p>
        <p>{t("Earn points on completed or delivered orders and approved in-store receipts. For every $1 you spend, you earn points based on your membership tier: Loyal earns 10 points, Silver earns 11 points, Gold earns 12 points, and Diamond earns 13 points.")}</p>
        <p className="mt-2">{t("Reward points never expire. Tier points reset on January 1 each year. Once you reach a tier, you keep it through the end of the following year.")} {t("Refunded amounts and canceled orders do not earn points.")}</p>
        <p className="mt-2">{t("Bách Hoá Houston reserves the right to modify, suspend, or cancel the Rewards Program at any time, with or without notice.")}</p>
      </div>

      {/* <div className="bg-white rounded-2xl border border-gray-200">
        <p className="font-semibold text-[#0B4F8A] px-4 pt-4 pb-2">{t("Points history")}</p>
        {loaded && history.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-10">{t("No points activity yet.")}</p>
        )}
        <ul className="divide-y divide-gray-100">
          {history.map((h, idx) => (
            <li key={idx} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-gray-800 font-medium text-sm md:text-base truncate">{entryTitle(h)}</p>
                <p className="text-gray-400 text-xs md:text-sm truncate">{entrySubtitle(h)}</p>
              </div>
              <p
                className={`font-bold tabular-nums flex-shrink-0 ${h.points > 0 ? "text-[#1E9E4A]" : h.points < 0 ? "text-[#E3062A]" : "text-gray-400"}`}
              >
                {h.points > 0 ? "+" : ""}
                {h.points.toLocaleString()} {t("pts")}
              </p>
            </li>
          ))}
        </ul>
      </div> */}
    </div>
  );
}

function UploadTab({ t, router, isLoggedIn, loader, toaster, onUploaded }) {
  const [form, setForm] = useState({ image: "", amount: "", purchaseDate: "", note: "" });
  const [receipts, setReceipts] = useState([]);

  const loadReceipts = () => {
    Api("get", "rewards/my-receipts", "", router).then(
      (res) => setReceipts(Array.isArray(res?.data) ? res.data : []),
      () => { },
    );
  };

  useEffect(() => {
    if (isLoggedIn) loadReceipts();
  }, [isLoggedIn]);

  if (!isLoggedIn) return <SignInPrompt t={t} router={router} />;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toaster?.({ type: "error", message: t("Please choose an image file.") });
      return;
    }
    try {
      loader?.(true);
      const compressed = await new Promise((resolve, reject) => {
        new Compressor(file, { quality: 0.7, maxWidth: 1600, maxHeight: 1600, success: resolve, error: reject });
      });
      const data = new FormData();
      data.append("file", compressed, file.name);
      const res = await ApiFormData("post", "user/fileupload", data, router);
      if (res?.status && res?.data?.file) setForm((f) => ({ ...f, image: res.data.file }));
    } catch (err) {
      toaster?.({ type: "error", message: err?.message || t("Upload failed") });
    } finally {
      loader?.(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.image) {
      toaster?.({ type: "error", message: t("Please upload a receipt image.") });
      return;
    }
    loader?.(true);
    Api("post", "rewards/receipt", form, router).then(
      (res) => {
        loader?.(false);
        toaster?.({ type: "success", message: res?.data?.message || t("Receipt uploaded") });
        setForm({ image: "", amount: "", purchaseDate: "", note: "" });
        loadReceipts();
        onUploaded?.();
      },
      (err) => {
        loader?.(false);
        toaster?.({ type: "error", message: err?.message });
      },
    );
  };

  const statusBadge = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
  };
  const statusText = { pending: t("Under review"), approved: t("Approved"), rejected: t("Rejected") };
  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black outline-none focus:border-[#0B4F8A]";

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 space-y-4">
        <div>
          <p className="font-semibold text-[#0B4F8A]">{t("Upload an in-store receipt")}</p>
          <p className="text-sm text-gray-500 mt-1">
            {t("Shopped in store? Upload your receipt and we'll add points at your tier rate once it's reviewed.")}
          </p>
        </div>

        {form.image ? (
          <div className="relative w-full max-w-xs">
            <img src={form.image} alt="Receipt" className="w-full max-h-72 object-contain rounded-xl border border-gray-200 bg-gray-50" />
            <button
              type="button"
              onClick={() => setForm({ ...form, image: "" })}
              aria-label={t("Remove image")}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow cursor-pointer"
            >
              <X size={16} className="text-gray-700" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-2xl py-10 cursor-pointer hover:border-[#0B4F8A] transition">
            <ImagePlus className="text-[#0B4F8A]" size={36} />
            <span className="text-sm text-gray-600 font-medium">{t("Tap to choose a receipt photo")}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-700 font-medium">{t("Receipt total ($)")}</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => /^\d{0,5}(\.\d{0,2})?$/.test(e.target.value) && setForm({ ...form, amount: e.target.value })}
              className={`${inputClass} mt-1`}
            />
          </div>
          <div>
            <label className="text-sm text-gray-700 font-medium">{t("Purchase date")}</label>
            <input
              type="date"
              value={form.purchaseDate}
              max={moment().format("YYYY-MM-DD")}
              onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
              className={`${inputClass} mt-1`}
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-700 font-medium">{t("Note (optional)")}</label>
          <input
            type="text"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className={`${inputClass} mt-1`}
          />
        </div>

        <button
          type="submit"
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#0B4F8A] hover:bg-[#093f6e] text-white font-semibold rounded-2xl px-8 py-3 cursor-pointer"
        >
          <Upload size={18} />
          {t("Submit receipt")}
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-200">
        <p className="font-semibold text-[#0B4F8A] px-4 pt-4 pb-2">{t("My receipts")}</p>
        {receipts.length === 0 && <p className="text-gray-400 text-sm text-center py-8">{t("No receipts uploaded yet.")}</p>}
        <ul className="divide-y divide-gray-100">
          {receipts.map((r) => (
            <li key={r._id} className="flex items-center gap-3 px-4 py-3">
              <a href={r.image} target="_blank" rel="noreferrer" className="flex-shrink-0">
                <img src={r.image} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
              </a>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 font-medium">
                  {moment(r.createdAt).format("MMM D, YYYY")}
                  {r.amount !== undefined && r.amount !== null && ` · $${Number(r.amount).toFixed(2)}`}
                </p>
                {r.adminNote && <p className="text-xs text-gray-400 truncate">{r.adminNote}</p>}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${statusBadge[r.status]}`}>
                  {statusText[r.status]}
                </span>
                {r.status === "approved" && (
                  <span className="text-xs font-bold text-[#1E9E4A]">+{r.approvedPoints} {t("pts")}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SignInPrompt({ t, router }) {
  return (
    <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-8 text-center">
      <p className="text-gray-600">{t("Sign in to see your points activity and upload receipts.")}</p>
      <button
        type="button"
        onClick={() => router.push("/signIn")}
        className="mt-4 bg-custom-green text-white font-semibold rounded-full px-8 py-2.5 cursor-pointer"
      >
        {t("Sign in")}
      </button>
    </div>
  );
}

export default Rewards;
