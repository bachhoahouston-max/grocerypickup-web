import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
  Apple,
  Beef,
  CakeSlice,
  Carrot,
  Coffee,
  Cookie,
  Egg,
  Fish,
  IceCreamBowl,
  Leaf,
  MapPin,
  Milk,
  Package,
  Pizza,
  Salad,
  Search,
  ShoppingBasket,
  Soup,
  Tag,
  Utensils,
  Wheat,
  Wine,
} from "lucide-react";
import { Api } from "@/services/service";

const ICON_MAP = {
  Apple,
  Beef,
  CakeSlice,
  Carrot,
  Coffee,
  Cookie,
  Egg,
  Fish,
  IceCreamBowl,
  Leaf,
  Milk,
  Package,
  Pizza,
  Salad,
  ShoppingBasket,
  Soup,
  Utensils,
  Wheat,
  Wine,
};

function ExploreHouston({ loader, toaster }) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [stores, setStores] = useState([]);
  const [storeCategories, setStoreCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
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
    const query = search.trim().toLowerCase();
    return stores.filter((store) => {
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
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesCategory && (!query || searchableText.includes(query));
    });
  }, [category, search, stores, categoryById]);

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
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 md:text-4xl">
              {t("Explore Houston")}
            </h1>
            <p className="mt-2 text-sm text-gray-600 md:text-base">
              {t("Discover local stores and businesses in Houston")}
            </p>
          </div>

          <div className="mb-8 grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-[1fr_260px]">
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
                className="h-12 w-full rounded-lg border border-gray-200 pl-10 pr-4 text-sm outline-none transition focus:border-[#206B3A] focus:ring-1 focus:ring-[#206B3A]"
              />
            </label>
            <label>
              <span className="sr-only">{t("Filter by category")}</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none focus:border-[#206B3A] focus:ring-1 focus:ring-[#206B3A]"
              >
                <option value="">{t("All categories")}</option>
                {categories.map((item) => (
                  <option key={item._id} value={item._id}>
                    {getCategoryName(item)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading ? null : filteredStores.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStores.map((store) => {
                const storeCategory = getStoreCategory(store);
                const Icon = ICON_MAP[storeCategory?.icon] || Tag;
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
                    className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative h-52 bg-[#edf6ef]">
                      {store.image ? (
                        <img
                          src={store.image}
                          alt={storeTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[#206B3A]">
                          <Icon size={64} strokeWidth={1.3} />
                        </div>
                      )}
                      {storeCategory && (
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#206B3A] shadow-sm">
                          {getCategoryName(storeCategory)}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h2 className="text-xl font-bold text-gray-900">
                        {storeTitle}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
                        {getText(store, "shortDescription", "shortDescription_v")}
                      </p>
                      <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <p className="flex gap-2">
                          <MapPin size={18} className="mt-0.5 shrink-0 text-[#206B3A]" />
                          <span>{getText(store, "address", "address_v")}</span>
                        </p>
                        {store.phone && <p>{store.phone}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          router.push(`/explore-houston/${store._id}`);
                        }}
                        className="mt-4 rounded-lg bg-[#206B3A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#18542d] focus:outline-none focus:ring-2 focus:ring-[#206B3A] focus:ring-offset-2"
                      >
                        {t("View Store")}
                      </button>
                    </div>
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
