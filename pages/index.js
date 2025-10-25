
import { Suspense, useEffect, useState ,useRef } from "react";
import MainHeader from "@/components/MainHeader";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import { FaChevronDown } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";
import GroceryCatories from "@/components/GroceryCatories";
import SellProduct from "@/components/SellProduct";
import { useTranslation } from "react-i18next";
import "react-multi-carousel/lib/styles.css";
import Head from "next/head";
import { useContext } from "react";
import { favoriteProductContext, userContext } from "./_app";
import ShopByCategory from "@/components/ShopByCategory";

export default function Home(props) {
  const { t } = useTranslation();
  const [user] = useContext(userContext)
  const router = useRouter();
  const [setFavorite] = useContext(favoriteProductContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetchFavorite();
  }, []);

  const fetchFavorite = async () => {
    // props.loader(true);
    try {
      const res = await Api("get", "getFavourite", null, router, {
        id: user._id,
      });
      const favs = Array.isArray(res?.data) ? res.data : [];
      setFavorite(favs);
      localStorage.setItem("Favorite", JSON.stringify(favs));
    } catch (err) {
      props.loader(false);

    }
  };

  const handleCategoryClick1 = (path) => {
    router.push(path);
  };

  return (
    <>
      <Head>
        <title>Shop Everyday Essentials at Bachhoahouston Today</title>
        <meta
          name="description"
          content="Bachhoahouston offers top-quality groceries, beauty & more with fast home delivery, curbside pickup & shipping. Shop daily essentials now!"
        />
        <link
          rel="canonical"
          href="https://www.bachhoahouston.com/"
        />
      </Head>
      <div className="mx-auto md:max-w-7xl ">
        <Suspense fallback={<div>Loading.....</div>}>
          <MainHeader />
        </Suspense>

        <Suspense fallback={<div>Loading.....</div>}>
          <SellProduct loader={props.loader} toaster={props.toaster} />
        </Suspense>
        <Suspense fallback={<div>Loading.....</div>}>
          <ShopByCategory loader={props.loader} toaster={props.toaster} />
        </Suspense>


        <div className="bg-white w-full ">
          <section className="bg-white w-full relative flex flex-col justify-center items-center">
            <div className="container mx-auto px-2 md:px-0">
              <div className="flex justify-center flex-col items-center">
                <h1 className=" text-[20px] md:text-2xl font-bold mb-10 mt-10 text-black">
                  {t("All Products")}
                </h1>

              </div>
              <Suspense fallback={<div>Loading.....</div>}>
                <BestSeller loader={props.loader} toaster={props.toaster} />
              </Suspense>
            </div>
          </section>
        </div>
      </div>
    </>

  );
}



 function BestSeller(props) {
  const router = useRouter();
  const { t } = useTranslation();

  const [category, setCategory] = useState([]);
  const [productList, setProductList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const observerRef = useRef(null);

  // Fetch categories & first page products
  useEffect(() => {
    async function fetchData() {
      const cat = await Api("get", "getCategory", null, router);
      setCategory(cat.data);

      fetchProducts(1, true); // Fetch initial page
    }
    fetchData();
  }, []);

  // Fetch products function (with page & reset option)
  const fetchProducts = async (pageNum, reset = false) => {
    setLoadingMore(true);
    const res = await Api(
      "get",
      `getTopSoldProduct?page=${pageNum}&limit=15`,
      null,
      router
    );
    setProductList((prev) => (reset ? res.data : [...prev, ...res.data]));
    setLoadingMore(false);
  };

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loadingMore) {
        setPage((prev) => prev + 1);
      }
    });

    const loader = document.querySelector("#infinite-loader");
    if (loader) observerRef.current.observe(loader);

    return () => observerRef.current?.disconnect();
  }, [loadingMore]);

  // Fetch next page when page changes
  useEffect(() => {
    if (page > 1) {
      fetchProducts(page);
    }
  }, [page]);

  // Category Click handlers
  const handleCategoryClick1 = () => {
    setSelectedCategory("all");
    setPage(1);
    fetchProducts(1, true);
  };

  const handleCategoryClick = (id) => {
    setSelectedCategory(id);
    setPage(1);
    fetchProducts(1, true);
  };

  // CATEGORY DROPDOWN COMPONENT
  const CategoryDropdown = () => {
    const [open, setOpen] = useState(false);

    const selectedName =
      selectedCategory === "all"
        ? t("View All")
        : category.find((cat) => cat._id === selectedCategory)?.name || t("View All");

    const handleSelect = (value) => {
      setOpen(false);
      if (value === "all") handleCategoryClick1();
      else handleCategoryClick(value);
    };

    return (
      <div className="relative w-full md:w-1/6 mb-4">
        <button
          onClick={() => setOpen(!open)}
          className="w-full bg-gray-100 flex items-center justify-between px-4 py-3 rounded-lg shadow-sm font-bold text-sm text-black hover:shadow-md transition"
        >
          <span>{t("Filter")}: {selectedName}</span>
          <FaChevronDown className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <ul className="absolute z-20 bg-white w-full mt-2 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            <li
              onClick={() => handleSelect("all")}
              className={`px-4 py-2 text-sm font-bold cursor-pointer hover:bg-gray-100 ${selectedCategory === "all" ? "text-custom-green" : "text-black"}`}
            >
              {t("View All")}
            </li>
            {category.slice(0, 13).map((cat, index) => (
              <li
                key={index}
                onClick={() => handleSelect(cat._id)}
                className={`px-4 py-2 text-sm font-bold cursor-pointer hover:bg-gray-100 ${selectedCategory === cat._id ? "text-custom-green" : "text-black"}`}
              >
                {cat.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <CategoryDropdown />

      <div className="grid md:grid-cols-4 lg:grid-cols-5 grid-cols-2 gap-4 mx-auto w-full">
        {productList.length > 0 ? (
          productList.map((item, i) => (
            <GroceryCatories
              loader={props.loader}
              toaster={props.toaster}
              key={i}
              item={item}
              i={i}
              url={`/product-details/${item?.slug}`}
            />
          ))
        ) : (
          <div className="col-span-6 flex justify-center text-[16px] text-gray-500 min-h-[200px]">
            {t("No products available")}.
          </div>
        )}
      </div>

      {/* Infinite Scroll Loader */}
      <div id="infinite-loader" className="text-center py-4">
        {loadingMore && <p className="text-black">Loading more...</p>}
      </div>
    </div>
  );
}
