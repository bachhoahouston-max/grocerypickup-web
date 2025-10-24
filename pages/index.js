
import { Suspense, useEffect, useState } from "react";
import MainHeader from "@/components/MainHeader";
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
                <h1 className="text-center text-[20px] md:text-2xl font-bold mb-10 mt-10 text-black">
                  {t("Bách Hoá Houston Best Sellers")}
                </h1>

              </div>
              <Suspense fallback={<div>Loading.....</div>}>
                <BestSeller loader={props.loader} toaster={props.toaster} />
              </Suspense>
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


        {/* <section className="container  py-8 md:px-0 px-5 pb-5">
          <div className="flex flex-row justify-between w-full mb-6 px-1 md:px-6">
            <p className="text-black 2xl:text-[24px] xl:text-[21px] lg:text-[19px] text-[17px] font-semibold">
              {t("New Arrivals")}
            </p>
            <p
              className=" md:text-[18px] text-[16px] font-semibold text-[#F38529] hover:underline cursor-pointer transition-transform duration-300 hover:-translate-y-[5px]"
              onClick={() =>
                router.push("/categories/all?category=all&sort_by=new")
              }
            >
              {t("View All")}
            </p>
          </div>
          <Suspense fallback={<div>Loading.....</div>}>
            <NewArrivalSection loader={props.loader} toaster={props.toaster} />
          </Suspense>
        </section>


        <section className="container  py-8 md:px-0 px-5 pb-5">
          <div className="flex flex-row justify-between w-full mb-6 px-1 md:px-6">
            <p className="text-black 2xl:text-[24px] xl:text-[21px] lg:text-[19px] text-[17px] font-semibold">
              {t("Bulk Best Sellers")}
            </p>
            <p
              className=" md:text-[18px] text-[16px] font-semibold text-[#F38529] hover:underline cursor-pointer transition-transform duration-300 hover:-translate-y-[5px]"
              onClick={() =>
                router.push("/categories/bulk-buy")
              }
            >
              {t("View All")}
            </p>
          </div>
          <Suspense fallback={<div>Loading.....</div>}>
            <BulkSellerSection loader={props.loader} toaster={props.toaster} />
          </Suspense>

        </section> */}

        <div className="container  py-12 md:px-0 px-5">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 md:gap-12 gap-4">
            <div className="bg-white p-4 shadow-md text-center transition-transform duration-300 hover:-translate-y-[8px] hover:shadow-xl rounded-md">
              <FontAwesomeIcon
                icon={faBoxOpen}
                className="text-xl text-custom-green mb-2"
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
                className="text-xl text-custom-green mb-4"
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
                className="text-xl text-custom-green mb-4"
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
                className="text-xl text-custom-green mb-4"
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

      </div>
    </>

  );
}

export function BulkSellerSection(props) {
  const { t } = useTranslation();
  const [bulkProduct, setBulkProduct] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const cat = await Api("get", `getBulkBuyProduct`, router)
      setBulkProduct(cat.data)
    }
    fetchData();
  }, []);

  const responsive1 = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 6,
      slidesToSlide: 1,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
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

  if (!bulkProduct) return <div>Loading.....</div>;

  return (
    <>
      <div className="bg-white w-full ">
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

    </>
  )

}

export function NewArrivalSection(props) {
  const { t } = useTranslation();
  const [newArivalsData, setNewArivalsData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const cat = await Api("get", `getNewArrival?limit=35`, router)
      setNewArivalsData(cat.data)
    }
    fetchData();
  }, []);

  const responsive1 = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 6,
      slidesToSlide: 1,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 5,
      slidesToSlide: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2,
      slidesToSlide: 1,
    },
  };

  if (!newArivalsData) return <div>Loading.....</div>;

  return (

    <>
      <div className="bg-white w-full ">
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
    </>
  )

}

export function CategorySection() {
  const { t } = useTranslation();
  const [category, setCategory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const cat = await Api("get", "getCategory", null, router)
      setCategory(cat.data)
    }
    fetchData();
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

  if (!category) return <div>Loading.....</div>;

  return (
    <>

      <div className="bg-white w-full px-1 md:px-6 2xl:px-0">
        {category && category.length > 0 ? (
          <Carousel
            responsive={responsive}
            autoPlay={true}
            autoPlaySpeed={3000}
            infinite={true}
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

    </>

  )

}


export function BestSeller(props) {
  const router = useRouter();
  const [category, setCategory] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [productList, setProductList] = useState([]);
  const [iscatdata, setIscatdata] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchData() {
      const cat = await Api("get", "getCategory", null, router)
      setCategory(cat.data)
      const res = await Api(
        "get",
        `getTopSoldProduct?page=1&limit=20`,
        null,
        router
      )
      setProductList(res.data)
      setIscatdata(false);
      // fetchProducts()
    }
    fetchData();
  }, []);

  const handleCategoryClick1 = (path) => {
    router.push(path);
  };


  if (!productList) return <div>Loading.....</div>;

  return (

    <div className="flex md:flex-row flex-col ">
      {/* Sidebar */}
      {/* <div className=" hidden md:flex flex-col md:w-1/6  w-full">
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

      </div> */}


      <div className="relative w-full md:w-full grid md:grid-cols-4 lg:grid-cols-5 grid-cols-2 gap-4 mx-auto md:mx-1 md:space-x-2 space-x-0">
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

  );
}