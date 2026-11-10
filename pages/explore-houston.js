import React, { useEffect, useMemo, useState } from "react";
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
        store?.address_v,
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
      <main className="min-h-screen bg-[var(--theme-var)] px-4 py-8 md:px-10 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#cfe8cf] bg-[#e8f6e6] px-3 py-3 shadow-sm md:mb-8 md:gap-6 md:px-8 md:py-5">
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

          <div className="mb-4 grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-[1fr_260px]">
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
            <label className="relative block">
              <span className="sr-only">{t("Sort By")}</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="h-12 w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm text-gray-700 outline-none transition focus:border-[#206B3A] focus:ring-1 focus:ring-[#206B3A]"
              >
                <option value="newest">{t("Newest")}</option>
                <option value="oldest">{t("Oldest")}</option>
                <option value="mostViewed">{t("Most viewed")}</option>
                <option value="name">{t("Name A-Z")}</option>
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </label>
          </div>

          <div className="mb-8 overflow-hidden rounded-2xl bg-white px-4 py-3 shadow-sm">
            <div className="flex gap-3 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setCategory("")}
                aria-pressed={!category}
                className={`flex min-w-[78px] shrink-0 flex-col items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${!category ? "bg-[#edf6ef] text-[#206B3A]" : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf6ef] text-[#206B3A]">
                  <Store size={22} />
                </span>
                <span className="max-w-24 truncate">{t("All categories")}</span>
              </button>
              {categories.map((item) => {
                const Icon = ICON_MAP[item.icon] || Store;
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => setCategory(item._id)}
                    aria-pressed={category === item._id}
                    className={`flex min-w-[78px] shrink-0 flex-col items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${category === item._id
                      ? "bg-[#edf6ef] text-[#206B3A]"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    {item.image ? (
                      <img src={item.image} alt="" className="h-11 w-11 rounded-full object-cover" />
                    ) : (
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-full text-[#206B3A]"
                        style={{ backgroundColor: item.iconBackground || DEFAULT_ICON_BACKGROUND }}
                      >
                        <Icon size={22} />
                      </span>
                    )}
                    <span className="max-w-24 truncate">{getCategoryName(item)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? null : filteredStores.length > 0 ? (
            <div className="mx-auto grid max-w-7xl gap-4">
              {filteredStores.map((store) => {
                const storeCategory = getStoreCategory(store);
                const Icon = ICON_MAP[storeCategory?.icon] || Store;
                const storeTitle = getText(store, "title", "title_v");
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
                    className="group cursor-pointer w-full relative flex min-h-[170px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md"
                  >
                    <div className="relative h-[154px] w-[38%] min-w-[132px] overflow-hidden rounded-xl bg-[#edf6ef] sm:w-[230px]">
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
                      <div className="flex items-start gap-3">
                        <div className="min-w-0">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                              {storeTitle}
                            </h2>
                          </div>
                          {storeCategory && (
                            <span className="rounded-md bg-[#fff3e8] px-2.5 py-1 text-[11px] font-semibold text-[#c87831]">
                              {getCategoryName(storeCategory)}
                            </span>
                          )}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-gray-600 mt-2">
                            <span className="inline-flex items-center gap-1">
                              <Eye size={16} />
                              {store.viewCount || 0} {t("views")}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MessageCircle size={16} />
                              {store.commentCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-600">
                        {getText(store, "shortDescription", "shortDescription_v")}
                      </p>
                      <div className="mt-3 space-y-1 text-xs text-gray-600">
                        <p className="flex items-start gap-2">
                          <MapPin size={15} className="mt-0.5 shrink-0 text-gray-500" />
                          <span className="line-clamp-2">{getText(store, "address", "address_v")}</span>
                        </p>
                        {store.phone && (
                          <p className="flex items-center gap-2">
                            <Phone size={14} className="shrink-0 text-gray-500" />
                            <span>{store.phone}</span>
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          router.push(`/explore-houston/${store._id}`);
                        }}
                        className="mt-3 cursor-pointer text-sm font-semibold bg-[#206B3A] text-white px-3 py-1.5 rounded transition focus:outline-none focus:ring-2 focus:ring-[#206B3A] focus:ring-offset-2"
                      >
                        {t("View Store")}
                      </button>
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
