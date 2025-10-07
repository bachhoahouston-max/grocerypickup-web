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
  const [openData, setOpenData] = useState(true);
  const [openCategory, setOpenCategory] = useState(true);
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
    // Reset when category or sort changes
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

    // Only fetch if nextPage <= totalPages
    if (nextPage <= totalPages) {
      getproductByCategory(selectedCategories, nextPage, limit, false);
      setCurrentPage(nextPage);
    } else {
      setHasMore(false);
      setIsFetching(false);
    }
  };


  const getproductByCategory = async (cat, page = 1, pageLimit = 24, reset = false) => {
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
          <div className="lg:max-w-9xl md:max-w-9xl mx-auto w-full md:px-8 px-5 md:pt-5 pt-8 md:pb-10 pb-0">
            <div className="flex justify-center flex-col items-center md:mt-10 mt-0">
              <h1 className="text-center text-[20px] md:text-2xl font-bold mb-2 mt-2 text-black">
                {t("Popular Products")}
              </h1>
              <p className="text-center w-full text-[13px] md:text-[16px] md:w-[50%] text-gray-500 mb-6 mt-2 italic">
                {t(
                  "Browse through a wide range of categories from fresh produce to pantry staples. We've got everything you need, all in one place"
                )}
                .
              </p>
            </div>

            <div className="grid md:grid-cols-6 mx-auto grid-cols-1 w-full md:gap-3">
              <div className=" col-span-1.5 md:flex hidden flex-col w-full ">
                <div className="bg-custom-green px-5 py-5 rounded">
                  <div className=" border-b border-custom-gray">
                    <div className="flex justify-between items-center w-full pb-5">
                      <p className="text-white font-semibold text-lg">
                        {t("Sort By")}
                      </p>
                      {!openData && (
                        <FaCircleChevronDown
                          className="text-xl text-white"
                          onClick={() => {
                            setOpenData(true);
                          }}
                        />
                      )}
                      {openData && (
                        <FaCircleChevronUp
                          className="text-xl text-white"
                          onClick={() => setOpenData(false)}
                        />
                      )}
                    </div>
                    {openData && (
                      <FormControl className="">
                        <FormGroup className="flex flex-col">
                          {sortByData.map((item, i) => (
                            <FormControlLabel
                              className="text-white"
                              key={i}
                              control={
                                <Checkbox
                                  onChange={() => {
                                    if (selectedSortBy === item?.value) {
                                      setSelectedSortBy("");
                                    } else {
                                      setSelectedSortBy(item?.value);
                                    }
                                  }}
                                  checked={item?.value === selectedSortBy}
                                />
                              }
                              label={t(`${item?.name}`)}
                            />
                          ))}
                        </FormGroup>
                      </FormControl>
                    )}
                  </div>

                  <div className="pt-5">
                    <div className="flex justify-between items-center w-full pb-5">
                      <p className="text-white font-semibold text-lg">
                        {t("Categories")}
                      </p>
                      {!openCategory && (
                        <FaCircleChevronDown
                          className="text-xl text-white cursor-pointer"
                          onClick={() => {
                            setOpenCategory(true);
                          }}
                        />
                      )}
                      {openCategory && (
                        <FaCircleChevronUp
                          className="text-xl text-white cursor-pointer"
                          onClick={() => setOpenCategory(false)}
                        />
                      )}
                    </div>

                    {openCategory && (
                      <FormGroup>
                        {categoryList.map((item, i) => (
                          <FormControlLabel
                            className="text-white"
                            key={i}
                            control={
                              <Checkbox
                                onChange={() => {
                                  router.replace(`/categories/${item.slug}`);
                                  setSelectedCategories(item?.slug);
                                }}
                                checked={item.slug === selectedCategories}
                              />
                            }
                            label={item?.name}
                          />
                        ))}
                      </FormGroup>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:hidden col-span-1 flex -pt-8">
                <button className="flex-row py-1 flex justify-between gap-50 mx-4">
                  <p className="text-black text-[20px] w-24">{t("Categories")}</p>
                  <IoFilterSharp
                    className="text-black text-3xl"
                    onClick={() => setOpen(true)}
                  />
                </button>
              </div>

              <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
                <div className="bg-custom-green w-[250px] h-full px-5 py-5 md:hidden block md:col-span-1">
                  <div className="border-b border-custom-gray">
                    <div className="flex justify-between items-center w-full pb-5">
                      <p className="text-white font-semibold text-lg">
                        {t("Sort By")}
                      </p>
                      {!openData && (
                        <FaCircleChevronDown
                          className="text-lg text-white"
                          onClick={() => {
                            setOpenData(true);
                          }}
                        />
                      )}
                      {openData && (
                        <FaCircleChevronUp
                          className="text-lg text-white"
                          onClick={() => setOpenData(false)}
                        />
                      )}
                    </div>
                    {openData && (
                      <FormControl className="">
                        <FormGroup className="flex flex-col">
                          {sortByData.map((item, i) => (
                            <FormControlLabel
                              className="text-white"
                              key={i}
                              control={
                                <Checkbox
                                  className="text-white"
                                  onChange={() => {
                                    if (selectedSortBy === item?.value) {
                                      setSelectedSortBy("");
                                    } else {
                                      setOpen(false);
                                      setSelectedSortBy(item?.value);
                                    }
                                  }}
                                  checked={item?.value === selectedSortBy}
                                />
                              }
                              label={t(`${item?.name}`)}
                            />
                          ))}
                        </FormGroup>
                      </FormControl>
                    )}
                  </div>

                  <div className="pt-5">
                    <div className="flex justify-between items-center w-full pb-5">
                      <p className="text-white font-semibold text-lg">
                        {t("Categories")}
                      </p>
                      {!openCategory && (
                        <FaCircleChevronDown
                          className="text-lg text-white cursor-pointer"
                          onClick={() => {
                            setOpenCategory(true);
                          }}
                        />
                      )}
                      {openCategory && (
                        <FaCircleChevronUp
                          className="text-lg text-white cursor-pointer"
                          onClick={() => setOpenCategory(false)}
                        />
                      )}
                    </div>

                    {openCategory && (
                      <FormGroup>
                        {categoryList.map((item, i) => (
                          <FormControlLabel
                            className="text-white"
                            key={i}
                            control={
                              <Checkbox
                                className="text-white"
                                onChange={() => {
                                  router.replace(`/categories/${item.slug}`);
                                  setSelectedCategories(item?.slug);
                                }}
                                checked={item.slug === selectedCategories}
                              />
                            }
                            label={item?.name}
                          />
                        ))}
                      </FormGroup>
                    )}
                  </div>
                </div>
              </Drawer>

              <div className="col-span-5 md:mt-0 mt-8">
                <div className="grid lg:grid-cols-5 xl:grid-cols-6 md:grid-cols-4 grid-cols-2 mb-6 space-x-2 justify-between">
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
          </div>
        </section>
      </div>
    </>
  );
}

export default Categories;