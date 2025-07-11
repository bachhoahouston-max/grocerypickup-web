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
import { languageContext } from "@/pages/_app";
import { useContext } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import ProductCategory from "@/components/ProductCategory";

export default function Home(props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [category, setCategory] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [productList, setProductList] = useState([]);
  const [sellProduct, setSellProduct] = useState([]);
  const [iscatdata, setIscatdata] = useState(false);
  const [saleData, setSaleData] = useState([]);
  const [countdown, setCountdown] = useState([]);
  const [newArivalsData, setNewArivalsData] = useState([]);
  const [lang, setLang] = useState(null);
  const [globallang, setgloballang] = useContext(languageContext);
  const [bulkProduct, setBulkProduct] = useState([]);
  const { i18n } = useTranslation();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    getNewArrivals();
    getBulkProduct();
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
    Api("get", "getBulkProduct", router).then(
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

  function handleClick(idx) {
    try {
      setLang(idx);
      const language = idx || "en";
      console.log(language);
      i18n.changeLanguage(language);
      setgloballang(language);
      localStorage.setItem("LANGUAGE", language);
    } catch (err) {
      console.log(err.message);
    }
  }
  return (
    <div className="">
      <div className="rounded-lg flex md:hidden justify-end m-2">
        <select
          className="bg-white w-[50px] font-normal text-sm text-black outline-none cursor-pointer border border-custom-green p-1 rounded-[5px]"
          value={lang}
          onChange={(e) => handleClick(e.target.value)}
        >
          <option value={"en"}>EN</option>
          <option value={"vi"}>VI</option>
        </select>
      </div>
      <MainHeader loader={props.loader} toaster={props.toaster} />
      <SellProduct loader={props.loader} toaster={props.toaster} />

      <div className="bg-white w-full min-h-screen">
        <section className="bg-white w-full relative flex flex-col justify-center items-center">
          <div className="container mx-auto px-6 md:px-0  md:max-w-9xl lg:max-w-9xl">
            <div className="flex justify-center flex-col items-center">
              <h1 className="text-center text-[20px] md:text-2xl font-bold mb-2 mt-4 text-black">
                {t("Bách Hoá Houston Best Sellers")}
              </h1>
              <p className="text-center w-full text-[13px] md:text-[16px] md:w-[60%] text-gray-500 mb-6 mt-2 italic">
                {t(
                  "Check out our most-loved picks  from best-selling fruits and veggies to everyday essentials your kitchen can’t go without. Freshness and quality, trusted by our customers"
                )}
              </p>
            </div>

            <div className="flex md:flex-row flex-col ">
              {/* Sidebar */}
              <div className=" hidden md:flex flex-col md:w-1/6  w-full">
                <ul className="rounded-lg p-4 space-y-2">
                  <li
                    onClick={() => handleCategoryClick1("/categories/all")}
                    className={`flex text-[14px] md:text-[17px] bg-gray-100 py-3 ps-4 font-bold items-center justify-between transition-transform duration-300 hover:-translate-y-[5px] p-2 ${
                      selectedCategory === "all"
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
                      className={`flex text-[14px] hover:text-[#F38529] md:text-[17px] bg-gray-100 py-3 ps-4 font-bold transition-transform duration-300 hover:-translate-y-[5px] items-center justify-between p-2 ${
                        selectedCategory === cat._id
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
                    <div className="absolute top-48 left-64 col-span-4 flex justify-center text-[24px] items-center text-gray-500 ">
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
                  <div className="absolute top-48 left-64 col-span-4 flex justify-center text-[24px] items-center text-gray-500 ">
                    {t("No products available")}.
                  </div>
                )}
              </div>
            </div>
            <div className=" transition-transform duration-300 hover:-translate-y-[5px] flex justify-center text-custom-green items-center  underline ">
              <p
                className=" text-lg px-3 py-2 rounded-sm cursor-pointer "
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
        <div className="md:flex justify-between items-center w-full mb-6">
          <p className="text-black md:text-[24px] text-xl font-semibold w-full px-1 md:px-6">
            {t("Explore by Categories")}
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
          <p className="text-black md:text-[24px] text-xl font-semibold">
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
          <p className="text-black md:text-[24px] text-xl font-semibold">
            {t("Bulk Best Sellers")}
          </p>
          <p
            className="text-black md:text-[18px] text-[16px] font-semibold hover:text-[#F38529] hover:underline cursor-pointer transition-transform duration-300 hover:-translate-y-[5px]"
            onClick={() =>
              router.push("/categories/all?category=all&sort_by=bulk")
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
              {t("24/7 Support")}
            </h3>
            <p className="text-gray-500 text-[13px] md:text-[16px]">
              {t("Help available anytime you need it")}
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
  );
}
