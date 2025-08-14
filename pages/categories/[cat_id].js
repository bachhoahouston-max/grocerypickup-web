import React, { useEffect, useState } from "react";
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
    name: "Best Bulk Selling",
    value: "bulk",
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
  // {
  //     name: 'Date, new to old',
  //     value: 'new'
  // },
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

  const [paginationData, setPaginationData] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 12,
  });

  useEffect(() => {
    const { cat_id, sort_by } = router?.query || {};
    setSelectedCategories(cat_id);
    setSelectedSortBy(sort_by);
  }, [router]);

  useEffect(() => {
    getCategory();
  }, []);

  useEffect(() => {
    // Run only if both are present (optional sort check)
    if (selectedCategories /* && selectedSortBy */) {
      getproductByCategory(selectedCategories);
    }
  }, [selectedCategories, selectedSortBy]); // Include both

  const getproductByCategory = async (cat, page = 1, limit = 18) => {
    props.loader(true);
    let url = `getProductBycategoryId?page=${page}&limit=${limit}`;

    if (cat) {
      url += `&category=${cat}`;
    }

    if (selectedSortBy) {
      url += `&sort_by=${selectedSortBy}`;
    }

    Api("get", url, "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        SetProductList(res.data);
        setPaginationData(res.pagination);
      },
      (err) => {
        props.loader(false);

        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > paginationData.totalPages) return;
    getproductByCategory(
      selectedCategories,
      newPage,
      paginationData.itemsPerPage
    );
  };

  const getCategory = async (cat) => {
    props.loader(true);
    Api("get", "getCategory", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        res.data.push({
          name: "All",
          slug: "all",
        });
        SetCategoryList(res.data);
      },
      (err) => {
        props.loader(false);
        console.log(err);
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
      <div className="bg-white w-full min-h-screen">
        <section className="bg-white w-full  relative flex flex-col justify-center items-center">
          <div className="lg:max-w-9xl md:max-w-9xl mx-auto w-full md:px-8 px-5 md:pt-5 pt-8 md:pb-10 pb-0">
            <div className="flex justify-center flex-col items-center md:mt-10 mt-0">
              {" "}
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
              <div className="bg-custom-green col-span-1.5 md:flex hidden flex-col w-full px-5 py-5">
                <div className="border-b border-custom-gray">
                  <div className="flex justify-between items-center w-full  pb-5">
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
                  <div className="flex justify-between items-center w-full  pb-5">
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
                    <div className="flex justify-between items-center w-full  pb-5">
                      <p className="text-black font-semibold text-lg">
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
                    <div className="flex justify-between items-center w-full  pb-5">
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
                          className="text-lg text-white  cursor-pointer"
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
              <div className="col-span-5  md:mt-0 mt-8 ">
                <div className="grid lg:grid-cols-5 xl:grid-cols-6 md:grid-cols-4 grid-cols-2  mb-6 space-x-2  justify-between">
                  {productList.length > 0 ? (
                    productList.map((item, i) => (
                      <div key={i} className="p-1 w-full md:mb-5 mb-2">
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
                    <div className="flex justify-center items-center h-[500px] md:h-[600px] col-span-6 ">
                      <p className="text-black text-center font-semibold text-xl">
                        {t("No products available in this category")}.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-6 w-full flex justify-center mt-8 mb-8">
                {productList?.length > 0 && paginationData?.totalPages > 1 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handlePageChange(paginationData.currentPage - 1)
                      }
                      disabled={paginationData.currentPage === 1}
                      className={`px-3.5 py-3 rounded-md ${paginationData.currentPage === 1
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-custom-gold text-white"
                        }`}
                    >
                      <FaChevronLeft />
                    </button>

                    {/* Page numbers */}
                    {Array.from(
                      { length: paginationData.totalPages },
                      (_, i) => i + 1
                    )
                      .filter((page) => {
                        return (
                          page <= 2 || // first two pages
                          page > paginationData.totalPages - 2 || // last two pages
                          Math.abs(page - paginationData.currentPage) <= 1 // current +/- 1
                        );
                      })
                      .reduce((acc, page, index, arr) => {
                        // Insert ellipsis if gap between pages
                        if (index > 0 && page - arr[index - 1] > 1) {
                          acc.push("ellipsis");
                        }
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((item, index) => {
                        if (item === "ellipsis") {
                          return (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-2 text-gray-500"
                            >
                              ...
                            </span>
                          );
                        }

                        return (
                          <button
                            key={item}
                            onClick={() => handlePageChange(item)}
                            className={`w-10 h-10 flex items-center justify-center rounded-md ${item === paginationData.currentPage
                              ? "bg-custom-gold text-white"
                              : "text-black bg-gray-200"
                              }`}
                          >
                            {item}
                          </button>
                        );
                      })}

                    {/* Next button */}
                    <button
                      onClick={() =>
                        handlePageChange(paginationData.currentPage + 1)
                      }
                      disabled={
                        paginationData.currentPage === paginationData.totalPages
                      }
                      className={`px-3.5 py-3 rounded-md ${paginationData.currentPage === paginationData.totalPages
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-custom-gold text-white"
                        }`}
                    >
                      <FaChevronRight />
                    </button>
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
