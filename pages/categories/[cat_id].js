import React, { useEffect, useState, useRef } from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import FormControl from "@mui/material/FormControl";
import { FaCircleChevronDown } from "react-icons/fa6";
import { FaCircleChevronUp } from "react-icons/fa6";
import GroceryCatories from "@/components/GroceryCatories";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IoFilterSharp } from "react-icons/io5";
import Drawer from "@mui/material/Drawer";
import { useTranslation } from "react-i18next";
import Head from "next/head";
import { Filter } from "lucide-react";

const sortByData = [
  {
    name: "Featured",
    value: "featured",
  },
  {
    name: "Best selling",
    value: "is_top",
  },
  {
    name: "New Arrivals",
    value: "new",
  },
  {
    name: "Alphabetically, A-Z",
    value: "a_z",
  },
  {
    name: "Alphabetically, Z-A",
    value: "z_a",
  },
  {
    name: "Price, low to high",
    value: "low",
  },
  {
    name: "Price, high to low",
    value: "high",
  },
  {
    name: "Date, old to new",
    value: "old",
  },
];

function Categories(props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [productList, SetProductList] = useState([]);
  const [category, setCategory] = useState({});
  const [categoryList, SetCategoryList] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState("");
  const [selectedSortBy, setSelectedSortBy] = useState("");
  const [openData, setOpenData] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [open, setOpen] = useState(false);
  const topRef = useRef(null);

  // Infinite scroll states
  const [isFetching, setIsFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 24;

  const handleScroll = () => {
    const threshold = window.innerWidth < 768 ? 1000 : 500;

    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - threshold
    ) {
      if (!isFetching && hasMore) {
        setIsFetching(true);
      }
    }
  };



  useEffect(() => {
    const { cat_id, sort_by } = router?.query || {};
    setSelectedCategories(cat_id);
    setSelectedSortBy(sort_by);
  }, [router]);

  useEffect(() => {
    getCategory();
  }, []);

  useEffect(() => {
    if (selectedCategories) {
      resetAndFetchProducts();
    }
  }, [selectedCategories, selectedSortBy]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFetching, hasMore]);


  useEffect(() => {
    if (!isFetching || !hasMore) return;
    loadMoreProducts();
  }, [isFetching]);

  const resetAndFetchProducts = () => {
    SetProductList([]);
    setCurrentPage(1);
    setHasMore(true);
    setTotalPages(1);
    getproductByCategory(selectedCategories, 1, limit, true);
  };


  const loadMoreProducts = () => {
    const nextPage = currentPage + 1;

    if (nextPage <= totalPages) {
      getproductByCategory(selectedCategories, nextPage, limit, false);
      setCurrentPage(nextPage);
    } else {
      setHasMore(false);
      setIsFetching(false);
    }
  };


  const getproductByCategory = async (cat, page = 1, pageLimit = 25, reset = false) => {
    if (page === 1) props.loader(true);

    let url = `getProductBycategoryId?page=${page}&limit=${pageLimit}`;
    if (cat) url += `&category=${cat}`;
    if (selectedSortBy) url += `&sort_by=${selectedSortBy}`;

    Api("get", url, "", router).then(
      (res) => {
        if (page === 1) props.loader(false);

        const newProducts = res.data || [];

        if (reset || page === 1) {
          SetProductList(newProducts);
        } else {
          SetProductList(prev => [...prev, ...newProducts]);
        }

        setTotalPages(res.pagination?.totalPages || 1);

        // Only set hasMore to false if the page actually exceeds totalPages or no new data
        if (page >= (res.pagination?.totalPages || 1) || newProducts.length === 0) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        setIsFetching(false);
      },
      (err) => {
        if (page === 1) props.loader(false);
        setIsFetching(false);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };


  const getCategory = async (cat) => {
    props.loader(true);
    Api("get", "getCategory", "", router).then(
      (res) => {
        props.loader(false);
        res.data.push({
          name: "All",
          slug: "all",
        });
        SetCategoryList(res.data);
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const categoryData = categoryList.find(
    (cat) => cat.slug === selectedCategories
  );

  return (
    <>
      <Head>
        <title>{categoryData?.metatitle || "Shop All Categories – Bachhoahouston Retail Store"}</title>
        <meta name="description" content={categoryData?.metadescription || "Explore and shop all categories from groceries to beauty, books, and home goods at Bachhoahouston. Delivery and pickup options available"} />
        <link
          rel="canonical"
          href={`https://www.bachhoahouston.com/categories/${categoryData?.slug}`}
        />
      </Head>
      <div className="bg-white w-full min-h-screen" ref={topRef}>
        <section className="bg-white w-full relative flex flex-col justify-center items-center">
          <div className="md:max-w-7xl mx-auto w-full md:px-0 px-2 md:pt-10 pt-8 md:pb-10 pb-0">

            <div className="md:flex hidden flex-col w-full mb-4 mt-4">
              <div className="flex justify-between items-center flex-wrap gap-4 bg-white border border-gray-200 shadow-md px-6 py-4 rounded-xl">
                {/* Title */}
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  {t("All Products")}
                </h1>

                {/* Filter Controls */}
                <div className="flex flex-wrap justify-center items-center gap-4">
                  <p className="text-gray-800 flex items-center text-lg font-medium gap-2">
                    <Filter size={20} />
                    {t("Filter")}:
                  </p>

                  {/* Sort By */}
                  <div className="flex justify-center items-center gap-4">
                    <label
                      htmlFor="sortBy"
                      className="text-gray-700 font-medium text-md"
                    >
                      {t("Sort By")}:
                    </label>
                    <select
                      id="sortBy"
                      className="min-w-[220px] border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-800 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-custom-green/50 outline-none"
                      value={selectedSortBy}
                      onChange={(e) => setSelectedSortBy(e.target.value)}
                    >
                      <option value="">{t("Select")}</option>
                      {sortByData.map((item, i) => (
                        <option key={i} value={item?.value}>
                          {t(item?.name)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Categories */}
                  <div className="flex justify-center items-center gap-4">
                    <label
                      htmlFor="categories"
                      className="text-gray-700 font-medium text-md "
                    >
                      {t("Categories")}:
                    </label>
                    <select
                      id="categories"
                      className="min-w-[220px] border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-800 cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-custom-green/50"
                      value={selectedCategories}
                      onChange={(e) => {
                        router.replace(`/categories/${e.target.value}`);
                        setSelectedCategories(e.target.value);
                      }}
                    >
                      <option value="">{t("Select")}</option>
                      {categoryList.map((item, i) => (
                        <option key={i} value={item.slug}>
                          {item?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>


            <div className="flex md:hidden flex-col w-full mb-4 mt-4">
              <div className="flex justify-between items-center px-4 py-3 bg-white border border-gray-200 shadow-md rounded-lg">
                <h1 className="text-lg font-bold text-gray-800">{t("All Products")}</h1>
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 text-gray-800 font-medium"
                >
                  <Filter size={18} /> {t("Filter")}
                </button>
              </div>

              {open && (
                <div className="mt-2 bg-white border border-gray-200 shadow-md rounded-lg p-4 space-y-4">
                  {/* Sort By */}
                  <div>
                    <p className="text-gray-700 font-medium mb-2">{t("Sort By")}</p>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-800"
                      value={selectedSortBy}
                      onChange={(e) => setSelectedSortBy(e.target.value)}
                    >
                      <option value="">{t("Select")}</option>
                      {sortByData.map((item, i) => (
                        <option key={i} value={item?.value}>
                          {t(item?.name)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Categories */}
                  <div>
                    <p className="text-gray-700 font-medium mb-2">{t("Categories")}</p>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-800"
                      value={selectedCategories}
                      onChange={(e) => {
                        router.replace(`/categories/${e.target.value}`);
                        setSelectedCategories(e.target.value);
                      }}
                    >
                      <option value="">{t("Select")}</option>
                      {categoryList.map((item, i) => (
                        <option key={i} value={item.slug}>
                          {item?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="md:mt-0 mt-2">
              <div className="grid lg:grid-cols-4 xl:grid-cols-4 md:grid-cols-4 grid-cols-2 mb-6 space-x-2 justify-between">
                {productList.length > 0 ? (
                  productList.map((item, i) => (
                    <div key={`${item?.id || item?.slug}-${i}`} className="p-1 w-full md:mb-5 mb-2">
                      <GroceryCatories
                        loader={props.loader}
                        toaster={props.toaster}
                        item={item}
                        i={i}
                        url={`/product-details/${item?.slug}`}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-[500px] md:h-[600px] col-span-6">
                    <p className="text-black text-center font-semibold text-xl">
                      {t("No products available in this category")}.
                    </p>
                  </div>
                )}
              </div>

              {/* Infinite Scroll Loading Indicator */}
              {productList.length > 0 && (
                <div className="flex justify-center items-center mt-8 pb-10">
                  {isFetching && hasMore && (
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full bg-green-500 animate-pulse"
                        style={{ animationDuration: "1s", animationDelay: "0s" }}
                      />
                      <span
                        className="w-3 h-3 rounded-full bg-green-500 animate-pulse"
                        style={{ animationDuration: "1s", animationDelay: "150ms" }}
                      />
                      <span
                        className="w-3 h-3 rounded-full bg-green-500 animate-pulse"
                        style={{ animationDuration: "1s", animationDelay: "300ms" }}
                      />
                      <span className="ml-3 text-sm text-gray-500">
                        {t("Loading More Products...")}
                      </span>
                    </div>
                  )}

                  {!hasMore && productList.length > 0 && (
                    <div className="text-sm text-gray-500 py-2 text-center">
                      {t("No more products")}.
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </section>
      </div>
    </>
  );
}

export default Categories;