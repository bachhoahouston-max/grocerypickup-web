import React, { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
  Apple,
  Beef,
  CakeSlice,
  BookOpen,
  Building2,
  Camera,
  Car,
  ChevronDown,
  Clock,
  Coffee,
  Cookie,
  Carrot,
  Dumbbell,
  Eye,
  Egg,
  Fish,
  Flower2,
  Fuel,
  Hospital,
  Hotel,
  IceCreamBowl,
  Landmark,
  Leaf,
  MapPin,
  MessageCircle,
  Milk,
  Package,
  PawPrint,
  Pill,
  Pizza,
  Salad,
  Scissors,
  Shirt,
  ShoppingBag,
  Search,
  ShoppingBasket,
  Soup,
  Smartphone,
  Store,
  Utensils,
  UtensilsCrossed,
  Wheat,
  Wine,
  Wrench,
  Phone,
} from "lucide-react";
import { Api } from "@/services/service";
import { getStoreOpenStatus, formatTime } from "@/services/storeHours";
import { StoreCommunityIcon } from "@/components/ExploreHoustonBanner";

const ICON_MAP = {
  Store,
  ShoppingBag,
  Building2,
  Landmark,
  UtensilsCrossed,
  Coffee,
  Hotel,
  Hospital,
  Pill,
  Shirt,
  Smartphone,
  Wrench,
  Car,
  Fuel,
  Flower2,
  Scissors,
  PawPrint,
  BookOpen,
  Dumbbell,
  Camera,
  ShoppingBasket,
  Apple,
  Beef,
  CakeSlice,
  Carrot,
  Cookie,
  Egg,
  Fish,
  IceCreamBowl,
  Leaf,
  Milk,
  Package,
  Pizza,
  Salad,
  Soup,
  Utensils,
  Wheat,
  Wine,
};

const DEFAULT_ICON_BACKGROUND = "#edf6ef";

// Pastel icon tones cycled across category cards when a category has no custom color.
const CATEGORY_TONES = [
  { bg: "#fde8dc", fg: "#e0742f" },
  { bg: "#fbe3e3", fg: "#d64545" },
  { bg: "#ece3f8", fg: "#7e4fc4" },
  { bg: "#dfeaf8", fg: "#3a73c4" },
  { bg: "#e1f0e3", fg: "#3f8f55" },
  { bg: "#fdf0d5", fg: "#d9a31f" },
  { bg: "#d9f0f3", fg: "#2a97a8" },
];

const normalizeSearchText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();

function ExploreHouston({ loader, toaster }) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [stores, setStores] = useState([]);
  const [storeCategories, setStoreCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const chipRowRef = useRef(null);
  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  // Mouse wheel scrolls the chip row sideways (needs a non-passive listener to stop page scroll).
  useEffect(() => {
    const row = chipRowRef.current;
    if (!row) return undefined;
    const onWheel = (event) => {
      const canScroll = row.scrollWidth > row.clientWidth;
      if (!canScroll || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const atStart = row.scrollLeft <= 0 && event.deltaY < 0;
      const atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 1 && event.deltaY > 0;
      if (atStart || atEnd) return;
      event.preventDefault();
      row.scrollLeft += event.deltaY;
    };
    row.addEventListener("wheel", onWheel, { passive: false });
    return () => row.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    let active = true;
    loader?.(true);
    Api("get", "getStore", null, router)
      .then((response) => {
        if (!active) return;
        setStores(Array.isArray(response?.data) ? response.data : []);
      })
      .catch((error) => {
        if (active) {
          toaster?.({
            type: "error",
            message: error?.message || t("Unable to load stores"),
          });
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          loader?.(false);
        }
      });

    Api("get", "getStoreCategories", null, router)
      .then((response) => {
        if (active && Array.isArray(response?.data)) {
          setStoreCategories(response.data);
        }
      })
      .catch(() => {
        // Categories are optional; stores remain usable without them.
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    return [...storeCategories].sort((first, second) =>
      (first.name || "").localeCompare(second.name || "")
    );
  }, [storeCategories]);

  const categoryById = useMemo(
    () => new Map(storeCategories.map((item) => [item._id, item])),
    [storeCategories]
  );
  const getStoreCategory = (store) =>
    typeof store?.category === "object"
      ? store.category
      : categoryById.get(store?.category);

  const filteredStores = useMemo(() => {
    const query = normalizeSearchText(search.trim());
    const matchingStores = stores.filter((store) => {
      const storeCategory = getStoreCategory(store);
      const matchesCategory = !category || storeCategory?._id === category;
      const searchableText = [
        store?.title,
        store?.title_v,
        store?.shortDescription,
        store?.shortDescription_v,
        store?.address,
        storeCategory?.name,
        storeCategory?.v_name,
      ]
        .map(normalizeSearchText)
        .join(" ");
      return matchesCategory && (!query || searchableText.includes(query));
    });

    return [...matchingStores].sort((first, second) => {
      if (sortBy === "oldest") {
        return new Date(first.createdAt || 0) - new Date(second.createdAt || 0);
      }
      if (sortBy === "mostViewed") {
        return (second.viewCount || 0) - (first.viewCount || 0);
      }
      if (sortBy === "name") {
        return (first.title || "").localeCompare(second.title || "");
      }
      return new Date(second.createdAt || 0) - new Date(first.createdAt || 0);
    });
  }, [category, search, sortBy, stores, categoryById]);

  const isVietnamese = i18n.language?.toLowerCase().startsWith("vi");
  const getText = (store, englishKey, vietnameseKey) =>
    isVietnamese
      ? store?.[vietnameseKey] || store?.[englishKey]
      : store?.[englishKey] || store?.[vietnameseKey];
  const getCategoryName = (storeCategory) =>
    isVietnamese
      ? storeCategory?.v_name || storeCategory?.name
      : storeCategory?.name || storeCategory?.v_name;

  return (
    <>
      <Head>
        <title>{t("Explore Houston")} | Bach Hoa Houston</title>
        <meta
          name="description"
          content={t("Local businesses and places recommended by the community")}
        />
      </Head>
      <main className="min-h-screen bg-white px-4 py-8 md:px-10 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 rounded-2xl border border-[#cfe8cf] bg-[#e8f6e6] px-3 py-3 shadow-sm md:mb-8 md:gap-6 md:px-8 md:py-5">
            <StoreCommunityIcon className="h-14 w-14 shrink-0 md:h-20 md:w-20" />
            <div className="h-14 w-px bg-[#bcdcbc] md:h-16" />
            <div className="min-w-0 flex-1">
              <h1 className="text-[22px] font-bold leading-tight text-[#1f3d1f] md:text-4xl">
                {t("Explore Houston")}
              </h1>
              <p className="mt-1 text-xs leading-snug text-gray-600 md:text-base">
                {t("Local businesses and places recommended by the community")}
              </p>
            </div>
          </div>

          <div className="mb-3 grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-[1fr_260px]">
            <label className="relative block">
              <span className="sr-only">{t("Search stores")}</span>
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("Search stores")}
                className="h-12 w-full placeholder-gray-500 text-gray-500 rounded-lg border border-gray-200 pl-10 pr-4 text-sm outline-none transition focus:border-[#206B3A] focus:ring-1 focus:ring-[#206B3A]"
              />
            </label>

          </div>

          <div className="relative mb-3 flex items-center gap-1 py-1">
            <div
              ref={chipRowRef}
              onPointerDown={(event) => {
                if (event.pointerType !== "mouse" || event.button !== 0) return;
                const row = chipRowRef.current;
                dragRef.current = { startX: event.clientX, startLeft: row.scrollLeft, moved: false };
              }}
              onPointerMove={(event) => {
                const drag = dragRef.current;
                if (!drag) return;
                const delta = event.clientX - drag.startX;
                if (!drag.moved && Math.abs(delta) > 5) {
                  drag.moved = true;
                  setIsDragging(true);
                }
                if (drag.moved) chipRowRef.current.scrollLeft = drag.startLeft - delta;
              }}
              onPointerUp={() => {
                suppressClickRef.current = !!dragRef.current?.moved;
                dragRef.current = null;
                setIsDragging(false);
              }}
              onPointerLeave={() => {
                dragRef.current = null;
                setIsDragging(false);
              }}
              onClickCapture={(event) => {
                if (suppressClickRef.current) {
                  event.preventDefault();
                  event.stopPropagation();
                  suppressClickRef.current = false;
                }
              }}
              className={`flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
            >
              <button
                type="button"
                onClick={() => setCategory("")}
                aria-pressed={!category}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition md:text-sm ${!category
                  ? "border-[#206B3A] bg-[#206B3A] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {t("All")}
              </button>
              {categories.map((item) => {
                const Icon = ICON_MAP[item.icon] || Store;
                const active = category === item._id;
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => setCategory(item._id)}
                    aria-pressed={active}
                    className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition md:text-sm ${active
                      ? "border-[#206B3A] bg-[#206B3A] text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {item.image ? (
                      <img src={item.image} alt="" className="h-4 w-4 rounded-full object-cover" />
                    ) : (
                      <Icon size={15} className={active ? "text-white" : "text-[#206B3A]"} />
                    )}
                    {getCategoryName(item)}
                  </button>
                );
              })}
            </div>
          </div>

          {!category && categories.length > 0 && (
            <div className="mb-2 grid grid-cols-3 gap-1 md:grid-cols-4 md:gap-3 lg:grid-cols-6">
              {categories.map((item, index) => {
                const Icon = ICON_MAP[item.icon] || Store;
                const tone = CATEGORY_TONES[index % CATEGORY_TONES.length];
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => setCategory(item._id)}
                    className="flex min-w-0 items-center gap-2 py-0.5 rounded-lg border border-[#ebe9e2] bg-white px-2 text-left shadow-sm transition hover:bg-[#efeee8] hover:shadow-md md:gap-3 md:px-3 md:py-3"
                  >
                    {item.image ? (
                      <img src={item.image} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover md:h-11 md:w-11" />
                    ) : (
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full md:h-11 md:w-11"
                        style={{
                          backgroundColor: item.iconBackground || tone.bg,
                          color: item.iconBackground ? "#206B3A" : tone.fg,
                        }}
                      >
                        <Icon size={18} />
                      </span>
                    )}
                    <span className="min-w-0 break-words text-[10px] font-normal leading-tight text-black md:text-sm">
                      {getCategoryName(item)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {loading ? null : filteredStores.length > 0 ? (
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-3">
              {filteredStores.map((store) => {
                const storeCategory = getStoreCategory(store);
                const Icon = ICON_MAP[storeCategory?.icon] || Store;
                const storeTitle = getText(store, "title", "title_v");
                const openStatus = getStoreOpenStatus(store);
                return (
                  <article
                    key={store._id}
                    role="link"
                    tabIndex={0}
                    aria-label={`${t("View details for")} ${storeTitle}`}
                    onClick={() => router.push(`/explore-houston/${store._id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/explore-houston/${store._id}`);
                      }
                    }}
                    className="group cursor-pointer w-full relative flex items-center overflow-hidden rounded-2xl border border-gray-100 bg-white p-1 shadow-sm hover:shadow-md sm:p-1"
                  >
                    <div className="relative h-[170px] w-[42%] min-w-[130px] shrink-0 overflow-hidden rounded-xl bg-[#edf6ef] sm:h-[210px] sm:w-[320px] lg:w-[230px]">
                      {store.image ? (
                        <img
                          src={store.image}
                          alt={storeTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-full items-center justify-center text-[#206B3A]"
                          style={{ backgroundColor: storeCategory?.iconBackground || DEFAULT_ICON_BACKGROUND }}
                        >
                          <Icon size={64} strokeWidth={1.3} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 px-3 pb-2 sm:px-5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h2 className="min-w-0 max-w-full truncate text-base font-bold text-gray-900 sm:text-xl">
                          {storeTitle}
                        </h2>
                        {storeCategory && (
                          <span className="shrink-0 rounded-full bg-[#fff3e8] px-2.5 py-0.5 text-[11px] font-semibold text-[#c87831]">
                            {getCategoryName(storeCategory)}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-gray-500 sm:text-sm">
                        <span className="inline-flex items-center gap-1">
                          <Eye size={15} />
                          {store.viewCount || 0} {t("views")}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle size={15} />
                          {store.commentCount || 0}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-gray-600 sm:text-sm">
                        <p className="flex items-start gap-2">
                          <MapPin size={15} className="mt-0.5 shrink-0 text-gray-500" />
                          <span className="line-clamp-2">{store.address}</span>
                        </p>
                        {store.phone && (
                          <p className="flex items-center gap-2">
                            <Phone size={14} className="shrink-0 text-gray-500" />
                            <span>{store.phone}</span>
                          </p>
                        )}
                        {openStatus && (
                          <p className="flex items-center gap-2 font-semibold">
                            <Clock size={14} className={`shrink-0 ${openStatus.isOpen ? "text-green-600" : "text-red-500"}`} />
                            <span className={openStatus.isOpen ? "text-green-600" : "text-red-500"}>
                              {openStatus.isOpen ? t("Open") : t("Closed")}
                            </span>
                            {openStatus.todayHours && !openStatus.todayHours.isClosed && (
                              <span className="font-normal text-gray-500">
                                {formatTime(openStatus.todayHours.open)} - {formatTime(openStatus.todayHours.close)}
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* <span
                      aria-hidden="true"
                      className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-500 shadow-sm transition group-hover:text-[#206B3A]"
                    >
                      <Heart size={18} />
                    </span> */}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800">
                {t("No stores found")}
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                {t("Try a different search or category")}
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default ExploreHouston;
