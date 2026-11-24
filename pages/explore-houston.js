import React, { useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
  Apple,
  Beef,
  CakeSlice,
  BookOpen,
  Bookmark,
  Building2,
  Camera,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  Star,
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
import { getStoreModulePageProps } from "@/services/storeModule";
import { StoreCommunityIcon } from "@/components/ExploreHoustonBanner";
import { StoreBookmarkButton, StoreBookmarksError, useStoreBookmarks } from "@/components/StoreBookmarks";

export const getServerSideProps = getStoreModulePageProps;

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
const PHOTO_ARROW_CLASS = "absolute top-1/2 z-10 flex size-0 sm:size-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#1f6b3a]/85 text-white shadow-sm transition hover:bg-[#1f6b3a]/95 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white";

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

function StoreCardCarousel({ photos, href, detailsLabel }) {
  const { t } = useTranslation();
  const [viewportRef, carousel] = useEmblaCarousel({
    loop: true,
    breakpoints: { "(prefers-reduced-motion: reduce)": { duration: 0 } },
  });
  const [currentPhoto, setCurrentPhoto] = useState(0);

  useEffect(() => {
    if (!carousel) return;
    const updateCurrentPhoto = () => setCurrentPhoto(carousel.selectedScrollSnap());
    updateCurrentPhoto();
    carousel.on("select", updateCurrentPhoto).on("reInit", updateCurrentPhoto);
    return () => {
      carousel.off("select", updateCurrentPhoto).off("reInit", updateCurrentPhoto);
    };
  }, [carousel]);

  return (
    <div role="group" aria-label={t("Store photos")} className="absolute inset-0">
      <Link href={href} prefetch={false} tabIndex={-1} draggable={false} aria-label={detailsLabel} className="block h-full">
        <div ref={viewportRef} className="h-full overflow-hidden">
          <div className="flex h-full [touch-action:pan-y_pinch-zoom]">
            {photos.map((photo, index) => (
              <div key={`${photo}-${index}`} className="min-w-0 flex-[0_0_100%]">
                <img src={photo} alt="" draggable={false} loading={index > 0 ? "lazy" : undefined} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </Link>
      <button
        type="button"
        aria-label={t("Previous photo")}
        disabled={!carousel}
        onClick={() => carousel?.scrollPrev()}
        className={`${PHOTO_ARROW_CLASS} left-1.5 sm:left-2`}
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={t("Next photo")}
        disabled={!carousel}
        onClick={() => carousel?.scrollNext()}
        className={`${PHOTO_ARROW_CLASS} right-1.5 sm:right-2`}
      >
        <ChevronRight size={20} aria-hidden="true" />
      </button>
      <span className="sr-only" role="status">
        {t("Photo {{current}} of {{total}}", { current: currentPhoto + 1, total: photos.length })}
      </span>
    </div>
  );
}

export default function ExploreHouston({ loader, toaster }) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { bookmarks, showBookmarks, setShowBookmarks, isSignedIn, signInHref } = useStoreBookmarks();
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
      if (showBookmarks && !bookmarks?.has(store._id)) return false;
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
      const personalOrder = Number(second.isPersonal === true) - Number(first.isPersonal === true);
      if (personalOrder) return personalOrder;

      if (first.isPersonal === true) {
        const markedOrder = (Date.parse(second.personalMarkedAt) || 0) - (Date.parse(first.personalMarkedAt) || 0);
        if (markedOrder) return markedOrder;
      }

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
  }, [category, search, sortBy, stores, categoryById, showBookmarks, bookmarks]);

  const toggleBookmarksView = () => {
    if (!isSignedIn) {
      router.push(signInHref);
      return;
    }
    setSearch("");
    setCategory("");
    setShowBookmarks((current) => !current);
  };

  const hasFilter = Boolean(category || search.trim());
  const filterEntryRef = useRef(false);

  useEffect(() => {
    if (hasFilter && !filterEntryRef.current) {
      window.history.pushState({ ...(window.history.state || {}), exploreFilter: true }, "", window.location.href);
      filterEntryRef.current = true;
    } else if (!hasFilter && filterEntryRef.current) {
      // Filters were cleared manually: drop the extra entry so back works normally.
      filterEntryRef.current = false;
      window.history.back();
    }
  }, [hasFilter]);

  useEffect(() => {
    // Next.js skips beforePopState on the first popstate of a page load, so we
    // listen to popstate ourselves. Next's own listener is registered first and
    // runs before ours: beforePopState stops it from re-routing while our
    // extra entry is being popped, then our listener clears the filters.
    router.beforePopState(() => !filterEntryRef.current);
    const onPopState = () => {
      if (!filterEntryRef.current) return;
      filterEntryRef.current = false;
      setSearch("");
      setCategory("");
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      router.beforePopState(() => true);
    };
  }, [router]);

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
      <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3 rounded-2xl border border-[#cfe8cf] bg-[#e8f6e6] px-3 py-3 shadow-sm md:mb-5 md:gap-6 md:px-8 md:py-5">
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

          <div className="mb-3 mt-4 flex items-center gap-2 md:mt-0">
            <label className="relative block min-w-0 flex-1">
              <span className="sr-only">{t("Search stores")}</span>
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1f3d1f]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("Search stores")}
                className="h-12 w-full placeholder-gray-500 text-gray-500 rounded-xl border-2 border-[#206B3A] pl-10 pr-4 text-sm outline-none transition focus:border-[#206B3A] focus:ring-1 focus:ring-[#206B3A]"
              />
            </label>
            <button
              type="button"
              aria-pressed={isSignedIn ? showBookmarks : undefined}
              aria-label={isSignedIn ? undefined : t("Sign in to view bookmarks")}
              onClick={toggleBookmarksView}
              disabled={isSignedIn && !bookmarks}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border-2 border-[#206B3A] bg-white px-2.5 text-xs font-semibold text-[#206B3A] transition hover:bg-[#edf6ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#206B3A] aria-pressed:bg-[#206B3A] aria-pressed:text-white disabled:opacity-60 sm:px-4 sm:text-sm"
            >
              <Bookmark size={17} fill={showBookmarks ? "currentColor" : "none"} aria-hidden="true" />
              {t("Bookmarks")}
            </button>
          </div>

          <StoreBookmarksError />

          <div className={`relative mb-3 items-center gap-1 py-1 ${showBookmarks ? "hidden" : "flex"}`}>
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

          {!showBookmarks && !category && categories.length > 0 && (
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
                    <span className="min-w-0 break-words text-[11px] font-normal leading-tight text-black md:text-sm">
                      {getCategoryName(item)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <p className="my-4 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm leading-snug text-gray-900">
            {t("Restaurant listings notice")}
          </p>

          {loading ? null : filteredStores.length > 0 ? (
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-3">
              {filteredStores.map((store) => {
                const storeCategory = getStoreCategory(store);
                const Icon = ICON_MAP[storeCategory?.icon] || Store;
                const storeTitle = getText(store, "title", "title_v");
                const specialty = getText(store, "specialty", "specialty_v");
                const specialtyId = specialty ? `store-specialty-${store._id}` : undefined;
                const detailsHref = `/explore-houston/${store._id}`;
                const detailsLabel = `${t("View details for")} ${storeTitle}`;
                const additionalImages = Array.isArray(store.additionalImages) ? store.additionalImages : [];
                const photos = [store.image, ...additionalImages].filter(Boolean);
                const openStatus = getStoreOpenStatus(store);
                return (
                  <article
                    key={store._id}
                    className="group relative flex w-full items-stretch rounded-2xl border border-gray-100 bg-white p-1 shadow-sm hover:shadow-md"
                  >
                    <div className="relative min-h-[150px] w-[46%] min-w-[140px] shrink-0 self-stretch overflow-hidden rounded-xl bg-[#edf6ef] sm:min-h-[190px] sm:w-[340px] lg:w-[250px]">
                      {photos.length > 1 ? (
                        <StoreCardCarousel photos={photos} href={detailsHref} detailsLabel={detailsLabel} />
                      ) : (
                        <Link href={detailsHref} prefetch={false} tabIndex={-1} aria-label={detailsLabel} className="absolute inset-0">
                          {photos[0] ? (
                            <img src={photos[0]} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div
                              className="flex h-full items-center justify-center text-[#206B3A]"
                              style={{ backgroundColor: storeCategory?.iconBackground || DEFAULT_ICON_BACKGROUND }}
                            >
                              <Icon size={64} strokeWidth={1.3} aria-hidden="true" />
                            </div>
                          )}
                        </Link>
                      )}
                      <StoreBookmarkButton storeId={store._id} storeName={storeTitle} className="absolute right-2 top-2 z-20" />
                    </div>
                    <Link href={detailsHref} prefetch={false} aria-label={detailsLabel} aria-describedby={specialtyId} className="min-w-0 flex-1 rounded-xl px-3 py-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#206B3A] sm:px-5">
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
                      {specialty && (
                        <p id={specialtyId} className="mt-1.5 w-fit max-w-full rounded-md bg-amber-100 px-2 py-1 text-xs break-words text-amber-950">
                          <span className="font-semibold">{t("Specialty")}:</span> {specialty}
                        </p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-gray-500 sm:text-sm">
                        <span className="inline-flex items-center gap-1 text-amber-500">
                          <Star size={15} fill="currentColor" />
                          <span>{Number(store.averageRating || 0).toFixed(1)}</span>
                          <span className="font-normal text-gray-500">({store.reviewCount || 0})</span>
                        </span>
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
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : showBookmarks && !stores.some((store) => bookmarks?.has(store._id)) ? (
            <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800">{t("No bookmarked stores yet")}</h2>
              <p className="mt-2 text-sm text-gray-500">{t("Bookmark stores to find them here.")}</p>
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
