import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Tag,
} from "lucide-react";
import { Api } from "@/services/service";
import { userContext } from "@/pages/_app";
import { getStoreOpenStatus, formatTime } from "@/services/storeHours";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function StoreDetails({ loader, toaster }) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [user] = useContext(userContext);
  const [store, setStore] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const viewRecordedRef = useRef("");

  const isVietnamese = i18n.language?.toLowerCase().startsWith("vi");
  const getText = (englishKey, vietnameseKey) =>
    isVietnamese
      ? store?.[vietnameseKey] || store?.[englishKey]
      : store?.[englishKey] || store?.[vietnameseKey];
  const category = useMemo(
    () => (typeof store?.category === "object" ? store.category : null),
    [store]
  );
  const categoryName = isVietnamese
    ? category?.v_name || category?.name
    : category?.name || category?.v_name;
  const title = getText("title", "title_v") || t("Store details");
  const isLoggedIn = Boolean(user?._id || user?.id || user?.token);
  const openStatus = getStoreOpenStatus(store);
  const hasHours = Array.isArray(store?.openingHours) && store.openingHours.length > 0;

  const loadComments = (storeId) => {
    setCommentsLoading(true);
    return Api("get", `getStoreComments/${storeId}`, null, router)
      .then((response) => {
        if (response?.status) setComments(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        toaster?.({ type: "error", message: error?.message || t("Unable to load live chat") });
      })
      .finally(() => setCommentsLoading(false));
  };

  useEffect(() => {
    if (!router.isReady || !router.query.id) return;

    let active = true;
    loader?.(true);
    Api("get", `getStoreById/${router.query.id}`, null, router)
      .then((response) => {
        if (!active) return;
        if (response?.status && response?.data) {
          setStore(response.data);
          loadComments(router.query.id);
          if (viewRecordedRef.current !== router.query.id) {
            viewRecordedRef.current = router.query.id;
            Api("post", `recordStoreView/${router.query.id}`, null, router)
              .then((viewResponse) => {
                if (active && viewResponse?.status && viewResponse?.data) {
                  setStore((current) => ({
                    ...current,
                    viewCount: viewResponse.data.viewCount,
                  }));
                }
              })
              .catch((error) => {
                if (active) {
                  toaster?.({
                    type: "error",
                    message: error?.message || t("Unable to record store view"),
                  });
                }
              });
          }
        } else {
          throw new Error(response?.message || t("Store not found"));
        }
      })
      .catch((error) => {
        if (active) {
          toaster?.({
            type: "error",
            message: error?.message || t("Unable to load store"),
          });
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          loader?.(false);
        }
      });

    return () => {
      active = false;
    };
  }, [router.isReady, router.query.id]);

  const submitComment = (event) => {
    event.preventDefault();
    const comment = commentText.trim();
    if (!isLoggedIn) {
      router.push(`/signIn?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }
    if (!comment) return;

    setCommentSubmitting(true);
    Api("post", `createStoreComment/${router.query.id}`, { comment }, router)
      .then((response) => {
        if (!response?.status) throw new Error(response?.message || t("Unable to send message"));
        setCommentText("");
        return loadComments(router.query.id);
      })
      .then(() => toaster?.({ type: "success", message: t("Message sent successfully") }))
      .catch((error) => toaster?.({ type: "error", message: error?.message || t("Unable to send message") }))
      .finally(() => setCommentSubmitting(false));
  };

  const details = [
    { label: t("Address"), value: store?.address, icon: MapPin },
    { label: t("Phone"), value: store?.phone, icon: Phone, href: `tel:${store?.phone}` },
    { label: t("Email"), value: store?.email, icon: Mail, href: `mailto:${store?.email}` },
    { label: t("Website"), value: store?.website, icon: Globe, href: store?.website },
    { label: t("City"), value: store?.city, icon: Building2 },
    { label: t("Company"), value: store?.companyName, icon: Building2 },
  ].filter((detail) => detail.value);

  return (
    <>
      <Head>
        <title>{title} | Bach Hoa Houston</title>
        <meta
          name="description"
          content={getText("shortDescription", "shortDescription_v") || title}
        />
      </Head>
      <main className="min-h-screen bg-[var(--theme-var)] px-4 py-8 md:px-10 md:py-12">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#206B3A] hover:underline"
          >
            <ArrowLeft size={18} />
            {t("Back to stores")}
          </button>

          {loading ? (
            <div className="rounded-2xl bg-white px-6 py-20 text-center shadow-sm">
              <p className="text-gray-600">{t("Loading...")}</p>
            </div>
          ) : store ? (
            <div>
              <article className="overflow-hidden rounded-3xl bg-white shadow-sm">
                <div className="relative h-64 bg-[#edf6ef] md:h-96">
                  {store.image ? (
                    <img src={store.image} alt={title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#206B3A]">
                      <Tag size={88} strokeWidth={1.2} />
                    </div>
                  )}
                  {categoryName && (
                    <span className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-[#206B3A] shadow-sm">
                      {categoryName}
                    </span>
                  )}
                </div>
                <div className="p-6 md:p-10">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{title}</h1>
                      {/* {store.verification && (
                      <p className="mt-3 inline-flex items-center gap-2 text-sm text-[#206B3A]">
                        <CheckCircle2 size={17} />
                        {store.verification}
                      </p>
                    )} */}
                    </div>
                  </div>
                  <p className="mt-6 max-w-3xl text-base leading-7 text-gray-600">
                    {getText("shortDescription", "shortDescription_v")}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <p className="inline-flex items-center gap-2 text-sm font-medium text-gray-600">
                      <Eye size={18} className="text-[#206B3A]" />
                      {store.viewCount || 0} {t("views")}
                    </p>
                    {openStatus && (
                      <p
                        className={`inline-flex items-center gap-2 text-sm font-semibold ${openStatus.isOpen ? "text-green-600" : "text-red-500"}`}
                      >
                        <Clock size={18} />
                        {openStatus.isOpen ? t("Open") : t("Closed")}
                      </p>
                    )}
                  </div>
                  {hasHours && (
                    <div className="mt-6 max-w-md rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <Clock size={16} className="text-[#206B3A]" />
                        {t("Opening hours")}
                      </p>
                      <ul className="space-y-1 text-sm">
                        {[1, 2, 3, 4, 5, 6, 0].map((day) => {
                          const entry = store.openingHours.find((item) => item.day === day);
                          const isToday = openStatus?.todayHours?.day === day;
                          return (
                            <li
                              key={day}
                              className={`flex justify-between gap-4 ${isToday ? "font-semibold text-gray-900" : "text-gray-600"}`}
                            >
                              <span>{t(DAY_LABELS[day])}</span>
                              <span>
                                {!entry || entry.isClosed
                                  ? t("Closed")
                                  : `${formatTime(entry.open)} - ${formatTime(entry.close)}`}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  {details.length > 0 && (
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      {details.map(({ label, value, icon: Icon, href }) => (
                        <div key={label} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            <Icon size={16} className="text-[#206B3A]" />
                            {label}
                          </p>
                          {href ? (
                            <a
                              href={href}
                              target={href.startsWith("http") ? "_blank" : undefined}
                              rel={href.startsWith("http") ? "noreferrer" : undefined}
                              className="mt-2 block break-words text-sm text-gray-800 hover:text-[#206B3A] hover:underline"
                            >
                              {value}
                            </a>
                          ) : (
                            <p className="mt-2 text-sm text-gray-800">{value}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
              <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm md:p-10">
                <div className="flex items-center gap-2">
                  {/* <MessageCircle size={21} className="text-[#206B3A]" /> */}
                  <h2 className="text-2xl font-bold text-gray-900">{t("Live chat")}</h2>
                  <span className="text-sm text-gray-500">({comments.length})</span>

                  <span className="text-[#206B3A] text-sm bg-green-200 px-3 py-0.5 rounded font-medium flex gap-1.5 items-center">
                    <span className="bg-[#206B3A] rounded-full w-1.5 h-1.5 animate-pulse"></span>
                    Live
                  </span>
                </div>
                <div>
                  <p className="text-base font-medium text-gray-500">{t("Join the Conversation")}</p>
                </div>
                <div className="mt-5 space-y-4">
                  {commentsLoading ? (
                    <p className="text-sm text-gray-500">{t("Loading live chat...")}</p>
                  ) : comments.length ? (
                    comments.map((item) => (
                      <div key={item._id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-custom-green rounded-full flex items-center justify-center">
                            <p className="text-white font-medium text-sm">
                              {user?.username?.charAt(0).toUpperCase() || "T"}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {[item.posted_by?.username, item.posted_by?.lastname].filter(Boolean).join(" ") ||
                              t("Customer")}
                          </p>
                          <span className="bg-gray-400 w-1 h-1 rounded-full"></span>
                          <p className="text-xs text-gray-500">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                          </p>
                        </div>
                        <p className="ml-10 whitespace-pre-wrap text-sm leading-6 text-gray-700">{item.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-xl border border-dashed border-gray-200 p-5 text-center text-sm text-gray-500">
                      {t("No messages yet")}
                    </p>
                  )}
                </div>
                <form onSubmit={submitComment} className="mt-6">
                  <textarea
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder={isLoggedIn ? t("Write a message") : t("Sign in to live chat")}
                    disabled={!isLoggedIn || commentSubmitting}
                    maxLength={2000}
                    rows={1}
                    className="w-full placeholder-gray-500 text-gray-500 rounded-md border border-gray-200 p-4 text-sm outline-none focus:border-[#206B3A] disabled:bg-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={commentSubmitting || (isLoggedIn && !commentText.trim())}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#206B3A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#18532d] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={16} />
                    {isLoggedIn ? t("Send live chat") : t("Sign in to live chat")}
                  </button>
                </form>
              </section>
            </div>
          ) : (
            <div className="rounded-2xl bg-white px-6 py-20 text-center shadow-sm">
              <h1 className="text-xl font-semibold text-gray-800">{t("Store not found")}</h1>
              <p className="mt-2 text-sm text-gray-500">{t("Please return to the store list")}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default StoreDetails;
