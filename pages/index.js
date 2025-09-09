import { useEffect, useState } from "react";
import MainHeader from "@/components/MainHeader";
import Testimonials from "@/components/Testimonials";
import DealsOnOrganicFood from "@/components/DealsOnOrganicFood";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faHeadset,
  faTruck,
  faLock,
} from "@fortawesome/free-solid-svg-icons";

import { FaArrowRight } from "react-icons/fa6";
import GroceryCatories from "@/components/GroceryCatories";
import SellProduct from "@/components/SellProduct";
import { useTranslation } from "react-i18next";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import ProductCategory from "@/components/ProductCategory";
import Head from "next/head";
import { useContext } from "react";
import { favoriteProductContext, userContext } from "./_app";

export default function Home(props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [user] = useContext(userContext)
  const [category, setCategory] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [productList, setProductList] = useState([]);
  const [iscatdata, setIscatdata] = useState(false);
  const [newArivalsData, setNewArivalsData] = useState([]);
  const [bulkProduct, setBulkProduct] = useState([]);
  const [setFavorite] = useContext(favoriteProductContext);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    getNewArrivals();
    getBulkProduct();
    fetchFavorite();
  }, []);

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 7,
      slidesToSlide: 1,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 6,
      slidesToSlide: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3,
      slidesToSlide: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2,
      slidesToSlide: 1,
    },
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetchFavorite();
  }, []);

  const fetchFavorite = async () => {
    props.loader(true);
    try {
      const res = await Api("get", "getFavourite", null, router, {
        id: user._id,
      });
      const favs = Array.isArray(res?.data) ? res.data : [];
      setFavorite(favs);
      localStorage.setItem("Favorite", JSON.stringify(favs));
    } catch (err) {
      console.log(err);
    } finally {
      props.loader(false);
    }
  };

  const responsive1 = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 7,
      slidesToSlide: 1,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 7,
      slidesToSlide: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3,
      slidesToSlide: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2,
      slidesToSlide: 1,
    },
  };

  const getBulkProduct = async () => {
    props.loader(true);
    Api("get", "getBulkBuyProduct", router).then(
      (res) => {
        props.loader(false);
        if (res.status) {
          setBulkProduct(res.data);
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const getNewArrivals = async () => {
    props.loader(true);
    Api("get", "getNewArrival", router).then(
      (res) => {
        props.loader(false);
        if (res.status) {
          setNewArivalsData(res.data);
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const fetchCategories = () => {
    props.loader(true);
    Api("get", "getCategory", null, router).then(
      (res) => {
        props.loader(false);
        setCategory(res.data);
      },
      (err) => {
        props.loader(false);
        props.toaster({
          type: "error",
          message: err?.data?.message || "Failed to load categories",
        });
      }
    );
  };

  const fetchProducts = (page = 1, limit = 12) => {
    props.loader(true);
    Api(
      "get",
      `getTopSoldProduct?page=${page}&limit=${limit}`,
      null,
      router
    ).then(
      (res) => {
        props.loader(false);
        if (res.data && Array.isArray(res.data)) {
          setProductList(res.data);
          setIscatdata(false);
        } else {
          console.error("Unexpected response format:", res);
          props.toaster({
            type: "error",
            message: "Unexpected response format",
          });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchProductsByCategory(categoryId);
  };

  const fetchProductsByCategory = async (categoryId) => {
    props.loader(true);
    let url = `getProductbycategory/${categoryId}`;
    let params = {};

    Api("get", url, "", router, params).then(
      (res) => {
        props.loader(false);
        if (res.data && Array.isArray(res.data)) {
          setProductsData(res.data);
          setIscatdata(true);
        } else {
          console.error("Unexpected response format:", res);
          props.toaster({
            type: "error",
            message: "Unexpected response format",
          });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const handleCategoryClick1 = (path) => {
    router.push(path);
    setSelectedCategory("all");
    setIscatdata(false);
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
      <div className="">
        <MainHeader loader={props.loader} toaster={props.toaster} />
        <SellProduct loader={props.loader} toaster={props.toaster} />

        <div className="bg-white w-full min-h-screen">
          <section className="bg-white w-full relative flex flex-col justify-center items-center">
            <div className="container mx-auto px-6 md:px-0  md:max-w-9xl lg:max-w-9xl">
              <div className="flex justify-center flex-col items-center">
                <h1 className="text-center text-[20px] md:text-2xl font-bold mb-4 mt-4 text-black">
                  {t("Bách Hoá Houston Best Sellers")}
                </h1>

              </div>

              <div className="flex md:flex-row flex-col ">
                {/* Sidebar */}
                <div className=" hidden md:flex flex-col md:w-1/6  w-full">
                  <ul className="rounded-lg p-4 space-y-2">
                    <li
                      onClick={() => handleCategoryClick1("/categories/all")}
                      className={`flex lg:text-[14px] 2xl:[text-18px] md:text-[17px] bg-gray-100 py-3 ps-4 font-bold items-center justify-between transition-transform duration-300 hover:-translate-y-[5px] p-2 ${selectedCategory === "all"
                        ? "text-custom-green"
                        : "text-black"
                        } cursor-pointer`}
                    >
                      <span> {t("View All")}</span>
                      <FaArrowRight />
                    </li>
                    {category.slice(0, 13).map((cat, index) => (
                      <li
                        key={index}
                        onClick={() => handleCategoryClick(cat._id)}
                        className={`flex text-[14px] hover:text-[#F38529] lg:text-[14px]  2xl:[text-18px] bg-gray-100 py-3 ps-4 font-bold transition-transform duration-300 hover:-translate-y-[5px] items-center justify-between p-2 ${selectedCategory === cat._id
                          ? "text-custom-green"
                          : "text-black"
                          } cursor-pointer`}
                      >
                        <span className="">{cat.name}</span>
                        <FaArrowRight className="" />
                      </li>
                    ))}
                  </ul>
                  {/* <div className="md:flex hidden ms-4 mt-4">
                  <img
                    src="./Rectangle3.png"
                    alt="Decorative image"
                    className="w-full h-[496px]"
                  />
                </div> */}
                </div>

                {/* Product Grid */}
                <div className="relative w-full md:w-5/6 grid md:grid-cols-5 lg:grid-cols-6 grid-cols-2 gap-2 mx-auto md:mx-1 md:space-x-2 space-x-0">
                  {iscatdata ? (
                    productsData.length > 0 ? (
                      productsData
                        .slice(0, 12)
                        .map((item, i) => (
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
                      <div className="col-span-6 flex justify-center xl:text-[20px] lg:text-[18px] text-[16px] items-center text-gray-500 min-h-[500px]">
                        {" "}
                        {t("No products available in this category")}.
                      </div>
                    )
                  ) : productList.length > 0 ? (
                    productList
                      .slice(0, 12)
                      .map((item, i) => (
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
                    <div className="col-span-6 flex justify-center xl:text-[20px] lg:text-[18px] text-[16px] items-center text-gray-500 min-h-[500px]">
                      {t("No products available")}.
                    </div>
                  )}
                </div>
              </div>
              <div className=" transition-transform duration-300 hover:-translate-y-[5px] flex justify-center text-custom-green items-center  underline mt-5">
                <p
                  className=" text-lg px-3 py-2 rounded-sm cursor-pointer font-bold"
                  onClick={() => handleCategoryClick1("/categories/all")}
                >
                  {t("View More")}{" "}
                </p>
                <FaArrowRight />
              </div>
            </div>
          </section>
        </div>

        <section className="container mx-auto md:max-w-8xl lg:max-w-9xl py-8 md:px-4 px-5">
          <div className="flex flex-row justify-between w-full mb-6 px-1 md:px-6">
            <p className="text-black 2xl:text-[24px] xl:text-[21px] lg:text-[19px] text-[17px] font-semibold">
              {t("Explore by Categories")}
            </p>
            <p
              className="text-black md:text-[18px] text-[16px] font-semibold hover:text-[#F38529] hover:underline cursor-pointer transition-transform duration-300 hover:-translate-y-[5px]"
              onClick={() =>
                router.push("/AllCategory")
              }
            >
              {t("View All")}
            </p>
          </div>

          <div className="bg-white w-full px-1 md:px-6 2xl:px-0">
            {category && category.length > 0 ? (
              <Carousel
                responsive={responsive}
                autoPlay={true}
                autoPlaySpeed={3000}
                infinite={true}
                // arrows={true}
                showDots={false}
                swipeable={true}
                draggable={true}
                keyBoardControl={true}
                customTransition="transform 300ms ease-in-out"
                transitionDuration={300}
                containerClass="carousel-container"
                removeArrowOnDeviceType={["tablet", "mobile"]}
                dotListClass="custom-dot-list-style"
                itemClass="px-2"
              >
                {category.map((item, i) => (
                  <div key={item._id || i} className="h-full">
                    <ProductCategory
                      item={item}
                      i={i}
                      url={`/categories/${item?.slug}`}
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="flex justify-center items-center py-8">
                <p className="text-gray-500 text-lg">
                  {t("No categories available")}
                </p>
              </div>
            )}
          </div>

          {/* Custom CSS for better carousel styling */}
          <style jsx>{`
          .carousel-container {
            padding: 0 !important;
          }

          .react-multi-carousel-list {
            padding: 10px 0;
          }

          .react-multi-carousel-item {
            padding: 0 8px;
          }

          .react-multi-carousel-dot-list {
            bottom: -30px;
          }

          .react-multi-carousel-dot button {
            background: #ddd;
            border: none;
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }

          .react-multi-carousel-dot--active button {
            background: #f38529;
          }

          .react-multiple-carousel__arrow {
            background: #f38529 !important;
            border: none !important;
            color: white !important;
            min-width: 35px !important;
            min-height: 35px !important;
          }

          .react-multiple-carousel__arrow:hover {
            background: #e67419 !important;
          }

          .react-multiple-carousel__arrow::before {
            font-size: 14px !important;
          }
        `}</style>
        </section>

        <section className="container mx-auto md:max-w-8xl lg:max-w-9xl py-8 md:px-4 px-5 pb-5">
          <div className="flex flex-row justify-between w-full mb-6 px-1 md:px-6">
            <p className="text-black 2xl:text-[24px] xl:text-[21px] lg:text-[19px] text-[17px] font-semibold">
              {t("New Arrivals")}
            </p>
            <p
              className="text-black md:text-[18px] text-[16px] font-semibold hover:text-[#F38529] hover:underline cursor-pointer transition-transform duration-300 hover:-translate-y-[5px]"
              onClick={() =>
                router.push("/categories/all?category=all&sort_by=new")
              }
            >
              {t("View All")}
            </p>
          </div>

          <div className="bg-white w-full px-1 md:px-6 2xl:px-0">
            {newArivalsData && newArivalsData.length > 0 ? (
              <Carousel
                responsive={responsive1}
                autoPlay={true}
                autoPlaySpeed={3000}
                infinite={true}
                // arrows={true}
                showDots={false}
                swipeable={true}
                draggable={true}
                keyBoardControl={true}
                customTransition="transform 300ms ease-in-out"
                transitionDuration={300}
                containerClass="carousel-container"
                removeArrowOnDeviceType={["tablet", "mobile"]}
                dotListClass="custom-dot-list-style"
                itemClass="px-2"
              >
                {newArivalsData.map((item, i) => (
                  <div key={item._id || i} className="h-full">
                    <GroceryCatories
                      loader={props.loader}
                      toaster={props.toaster}
                      key={i}
                      item={item}
                      i={i}
                      url={`/product-details/${item?.slug}`}
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="flex justify-center items-center py-8">
                <p className="text-gray-500 text-lg">
                  {t("No New Arrival available")}
                </p>
              </div>
            )}
          </div>

          {/* Custom CSS for better carousel styling */}
          <style jsx>{`
          .carousel-container {
            padding: 0 !important;
          }

          .react-multi-carousel-list {
            padding: 10px 0;
          }

          .react-multi-carousel-item {
            padding: 0 8px;
          }

          .react-multi-carousel-dot-list {
            bottom: -30px;
          }

          .react-multi-carousel-dot button {
            background: #ddd;
            border: none;
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }

          .react-multi-carousel-dot--active button {
            background: #f38529;
          }

          .react-multiple-carousel__arrow {
            background: #f38529 !important;
            border: none !important;
            color: white !important;
            min-width: 35px !important;
            min-height: 35px !important;
          }

          .react-multiple-carousel__arrow:hover {
            background: #e67419 !important;
          }

          .react-multiple-carousel__arrow::before {
            font-size: 14px !important;
          }
        `}</style>
        </section>

        <section className="container mx-auto md:max-w-8xl lg:max-w-9xl py-8 md:px-4 px-5 pb-5">
          <div className="flex flex-row justify-between w-full mb-6 px-1 md:px-6">
            <p className="text-black 2xl:text-[24px] xl:text-[21px] lg:text-[19px] text-[17px] font-semibold">
              {t("Bulk Best Sellers")}
            </p>
            <p
              className="text-black md:text-[18px] text-[16px] font-semibold hover:text-[#F38529] hover:underline cursor-pointer transition-transform duration-300 hover:-translate-y-[5px]"
              onClick={() =>
                router.push("/categories/bulk-buy")
              }
            >
              {t("View All")}
            </p>
          </div>

          <div className="bg-white w-full px-1 md:px-6 2xl:px-0">
            {bulkProduct && bulkProduct.length > 0 ? (
              <Carousel
                responsive={responsive1}
                autoPlay={true}
                autoPlaySpeed={3000}
                infinite={true}
                // arrows={true}
                showDots={false}
                swipeable={true}
                draggable={true}
                keyBoardControl={true}
                customTransition="transform 300ms ease-in-out"
                transitionDuration={300}
                containerClass="carousel-container"
                removeArrowOnDeviceType={["tablet", "mobile"]}
                dotListClass="custom-dot-list-style"
                itemClass="px-2"
              >
                {bulkProduct.map((item, i) => (
                  <div key={item._id || i} className="h-full">
                    <GroceryCatories
                      loader={props.loader}
                      toaster={props.toaster}
                      key={i}
                      item={item}
                      i={i}
                      url={`/product-details/${item?.slug}`}
                    />
                  </div>
                ))}
              </Carousel>
            ) : (
              <div className="flex justify-center items-center py-8">
                <p className="text-gray-500 text-lg">
                  {t("No New Bulk Product available")}
                </p>
              </div>
            )}
          </div>

          {/* Custom CSS for better carousel styling */}
          <style jsx>{`
          .carousel-container {
            padding: 0 !important;
          }

          .react-multi-carousel-list {
            padding: 10px 0;
          }

          .react-multi-carousel-item {
            padding: 0 8px;
          }

          .react-multi-carousel-dot-list {
            bottom: -30px;
          }

          .react-multi-carousel-dot button {
            background: #ddd;
            border: none;
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }

          .react-multi-carousel-dot--active button {
            background: #f38529;
          }

          .react-multiple-carousel__arrow {
            background: #f38529 !important;
            border: none !important;
            color: white !important;
            min-width: 35px !important;
            min-height: 35px !important;
          }

          .react-multiple-carousel__arrow:hover {
            background: #e67419 !important;
          }

          .react-multiple-carousel__arrow::before {
            font-size: 14px !important;
          }
        `}</style>
        </section>

        <div className="container mx-auto md:max-w-8xl lg:max-w-9xl py-12 md:px-4 px-5">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 md:gap-12 gap-4">
            <div className="bg-white p-4 shadow-md text-center transition-transform duration-300 hover:-translate-y-[8px] hover:shadow-xl">
              <FontAwesomeIcon
                icon={faBoxOpen}
                className="text-xl text-[#F38529] mb-2"
              />
              <h3 className="text-[16px] md:text-[18px] md:text-lg font-semibold text-black">
                {t("Product Package")}
              </h3>
              <p className="text-gray-500 text-[13px] md:text-[16px]">
                {t("Fresh and safely packed for you")}
              </p>
            </div>
            <div className="bg-white p-4 shadow-md text-center transition-transform duration-300 hover:-translate-y-[8px] hover:shadow-xl">
              <FontAwesomeIcon
                icon={faHeadset}
                className="text-xl text-[#F38529] mb-4"
              />
              <h3 className="text-[16px] md:text-[18px] font-semibold text-black">
                {t("7 Days A Week Support")}
              </h3>
              <p className="text-gray-500 text-[13px] md:text-[16px]">
                {t("Available during business hours")}
              </p>
            </div>
            <div className="bg-white p-4 shadow-md text-center transition-transform duration-300 hover:-translate-y-[8px] hover:shadow-xl">
              <FontAwesomeIcon
                icon={faTruck}
                className="text-xl text-[#F38529] mb-4"
              />
              <h3 className="text-[16px] md:text-[18px] font-semibold text-black">
                {t("Next Day Local Delivery")}
              </h3>
              <p className="text-gray-500 text-[13px] md:text-[16px]">
                {t("Quick delivery in next day")}
              </p>
            </div>
            <div className="bg-white p-4 shadow-md text-center transition-transform duration-300 hover:-translate-y-[8px] hover:shadow-xl">
              <FontAwesomeIcon
                icon={faLock}
                className="text-xl text-[#F38529] mb-4"
              />
              <h3 className="text-[16px] md:text-[18px] font-semibold text-black">
                {t("Payment Secure")}
              </h3>
              <p className="text-gray-500 text-[13px] md:text-[16px]">
                {t("Safe and secure payment options")}
              </p>
            </div>
          </div>
        </div>
        <DealsOnOrganicFood />
        <Testimonials />
      </div>
    </>

  );
}
