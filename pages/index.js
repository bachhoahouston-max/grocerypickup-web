import { useEffect, useState } from "react";
import MainHeader from "@/components/MainHeader";
import Testimonials from "@/components/Testimonials";
import DealsOnOrganicFood from "@/components/DealsOnOrganicFood";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen, faHeadset, faTruck, faLock } from '@fortawesome/free-solid-svg-icons';
import { FaArrowRight } from "react-icons/fa6";
import GroceryCatories from "@/components/GroceryCatories";
import SellProduct from "@/components/SellProduct";
import { useTranslation } from "react-i18next";


export default function Home(props) {
  const { t } = useTranslation()
  const router = useRouter();
  const [category, setCategory] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productList, setProductList] = useState([]);
  const [sellProduct, setSellProduct] = useState([])
  const [iscatdata, setIscatdata] = useState(false);
  const [saleData, setSaleData] = useState([])
  const [countdown, setCountdown] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchSellProduct();
    getSale()
  }, []);

  const getSale = async () => {
    props.loader(true);

    Api("get", "getFlashSale", router).then(
      (res) => {
        props.loader(false);
        if (res.status) {
          setSaleData(res.data)
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
        props.toaster({ type: "error", message: err?.data?.message || "Failed to load categories" });
      }
    );
  };

  const fetchSellProduct = () => {
    props.loader(true);
    Api("get", "getProductbySale", null, router).then(
      (res) => {
        props.loader(false);
        setSellProduct(res.data);
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.data?.message || "Failed to load categories" });
      }
    );
  };

  const fetchProducts = (page = 1, limit = 12) => {
    props.loader(true);
    Api("get", `getProduct?page=${page}&limit=${limit}`, null, router).then(
      (res) => {
        props.loader(false);
        if (res.data && Array.isArray(res.data)) {
          setProductList(res.data);
          setIscatdata(false);
        } else {
          console.error("Unexpected response format:", res);
          props.toaster({ type: "error", message: "Unexpected response format" });
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
          props.toaster({ type: "error", message: "Unexpected response format" });
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
    setSelectedCategory('all');
    setIscatdata(false);
  };

  useEffect(() => {
    const calculateCountdown = () => {

      const nowIndia = new Date().getTime();
      const newCountdown = saleData.map(sale => {
        const startDate = new Date(sale.startDateTime).getTime();
        const endDate = new Date(sale.endDateTime).getTime();

        if (nowIndia < startDate) {
          return { ...sale, timeLeft: null, status: t('Sale will start soon') };
        } else if (nowIndia >= startDate && nowIndia < endDate) {
          const distance = endDate - nowIndia;
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          return {
            ...sale,
            timeLeft: { days, hours, minutes, seconds },
            status: t('Sale is live')
          };
        } else {
          return { ...sale, timeLeft: null, status: t('Sale has ended') };
        }
      });

      setCountdown(newCountdown);
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [saleData]);

  const sell = countdown.map((sale) => sale.timeLeft)
  

  return (
    <div className="">
      <MainHeader
        loader={props.loader}
        toaster={props.toaster}
      />
      <div className="container mb-8 md:mt-12 lg:mt-18 mt-4 mx-auto bg-white max-w-9xl md:px-6 px-6">
        {sellProduct.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              {/* <h1 className="text-[20px] md:text-2xl font-bold mt-4 text-black">{t("Flash Sale")}</h1> */}

              <div className="w-full">
                <div className="flex items-center mb-3">
                  <div className="w-1 h-6 bg-[#F38529] rounded-full mr-2"></div>
                  <h2 className="text-gray-800 font-bold text-lg">{t("Sale Status")}</h2>
                </div>

                <div className="space-y-3">
                  {countdown.map((sale, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      {sale.timeLeft ? (
                        <div>
                          {/* Status header */}
                          <div className="bg-[#F38529] bg-opacity-10 px-4 py-2 border-b border-[#F38529] border-opacity-20">
                            <div className="flex items-center">
                              <span className="h-2 w-2 rounded-full bg-[#F38529] mr-2"></span>
                              <span className="font-medium text-sm md:text-[16px] text-white">
                                {sale.status || t("Sale in progress")}
                              </span>
                            </div>
                          </div>

                          {/* Countdown display */}
                          <div className="grid grid-cols-4 divide-x divide-gray-100">
                            {/* Days */}
                            <div className="flex flex-col items-center py-3">
                              <div className="relative mb-1">
                                <span className="text-xl md:text-3xl font-bold text-[#F38529]">
                                  {sale.timeLeft.days < 10 ? `0${sale.timeLeft.days}` : sale.timeLeft.days}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">{t("Days")}</span>
                            </div>

                            {/* Hours */}
                            <div className="flex flex-col items-center py-3">
                              <div className="relative mb-1">
                                <span className="text-xl md:text-3xl font-bold text-[#F38529]">
                                  {sale.timeLeft.hours < 10 ? `0${sale.timeLeft.hours}` : sale.timeLeft.hours}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">{t("Hours")}</span>
                            </div>

                            {/* Minutes */}
                            <div className="flex flex-col items-center py-3">
                              <div className="relative mb-1">
                                <span className="text-xl md:text-3xl font-bold text-[#F38529]">
                                  {sale.timeLeft.minutes < 10 ? `0${sale.timeLeft.minutes}` : sale.timeLeft.minutes}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">{t("Minutes")}</span>
                            </div>

                            {/* Seconds */}
                            <div className="flex flex-col items-center py-3">
                              <div className="relative mb-1">
                                <span className="text-2xl md:text-3xl font-bold text-[#F38529]">
                                  {sale.timeLeft.seconds < 10 ? `0${sale.timeLeft.seconds}` : sale.timeLeft.seconds}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">{t("Seconds")}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 py-3">
                          <div className="flex items-center">
                            <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                            <span className="font-medium text-red-600">
                              {sale.status || t("Sale ended")}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <style>
                  {`
                    @keyframes moveCenterToRight {
                    0% {
                     transform: translateX(0);
                       }
                    100% {
                    transform: translateX(50vw);
                    }
                   }
                  .animate-moveCenterToRight {
                   animation: moveCenterToRight 20s linear infinite;
                  }
                 `}
                </style>
                <div className="flex justify-center overflow-hidden w-[320px] md:w-full">
                  <p className="text-gray-800 font-bold text-lg whitespace-nowrap animate-moveCenterToRight mt-2">
                    🔥 Hurry! Our biggest limited-time sale is live grab your favorite products at unbeatable prices before the timer runs out!
                  </p>
                </div>
              </div>

            </div>
            <div className="md:mt-4 mt-4 relative w-full md:w-5/5 grid md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-7 grid-cols-2 gap-2.5 mx-auto md:mx-4 md:space-x-2 space-x-0">
              {sellProduct.map((item, i) => (
                <SellProduct
                  loader={props.loader}
                  toaster={props.toaster}
                  key={i}
                  timeleft={sell}
                  item={item}
                  i={i}
                  url={`/product-details/${item?.slug}`}
                />
              ))}
            </div>
          </>
        )}
      </div>


      <div className="bg-white w-full">
        <section className="bg-white w-full relative flex flex-col justify-center items-center">
          <div className="container mx-auto px-6 md:px-0 xl:w-full md:max-w-8xl lg:max-w-9xl">
            <div className="flex justify-center flex-col items-center mt-4">
              <h1 className="text-center text-[20px] md:text-2xl font-bold mb-2 mt-4 text-black">
                {t("Popular Products")}</h1>
              <p className="text-center w-full text-[13px] md:text-[16px] md:w-[60%] text-gray-500 mb-6 mt-2 italic">
                {t("Check out our most-loved picks  from best-selling fruits and veggies to everyday essentials your kitchen can’t go without. Freshness and quality, trusted by our customers")}
              </p>
            </div>

            <div className="flex md:flex-row flex-col ">
              {/* Sidebar */}
              <div className=" hidden md:flex flex-col md:w-1/6 lg:w-1/4 w-full">
                <ul className="rounded-lg p-4 space-y-2">
                  <li
                    onClick={() => handleCategoryClick1('/categories/all')}
                    className={`flex text-[14px] md:text-[17px] bg-gray-100 py-3 ps-4 font-bold items-center justify-between p-2 ${selectedCategory === 'all' ? 'text-custom-green' : 'text-black'} cursor-pointer`}
                  >
                    <span> {t("View All")}</span>
                    <FaArrowRight />
                  </li>
                  {category.slice(0, 4).map((cat, index) => (
                    <li
                      key={index}
                      onClick={() => handleCategoryClick(cat._id)}
                      className={`flex text-[14px] md:text-[17px] bg-gray-100 py-3 ps-4 font-bold items-center justify-between p-2 ${selectedCategory === cat._id ? 'text-[#FEC200]' : 'text-black'} cursor-pointer`}
                    >
                      <span>{cat.name}</span>
                      <FaArrowRight />
                    </li>
                  ))}
                </ul>
                <div className="md:flex hidden ms-4 mt-4">
                  <img
                    src="./Rectangle3.png"
                    alt="Decorative image"
                    className="w-full h-[496px]"
                  />
                </div>
              </div>

              {/* Product Grid */}
              <div className="relative w-full md:w-5/6 grid md:grid-cols-4 lg:grid-cols-6 grid-cols-2 gap-2.5 mx-auto md:mx-4 md:space-x-2 space-x-0">
                {iscatdata ? (
                  productsData.length > 0 ? (
                    productsData.slice(0, 12).map((item, i) => (
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
                    <div className="absolute top-48 left-64 col-span-4 flex justify-center text-[24px] items-center text-gray-500 "> {t("No products available in this category")}.</div>
                  )
                ) : (
                  productList.length > 0 ? (
                    productList.slice(0, 12).map((item, i) => (
                      <GroceryCatories
                        loader={props.loader}
                        toaster={props.toaster}
                        key={i}
                        item={item}
                        i={i}
                        url={`/product-details/${item?.slug}`} />
                    ))
                  ) : (
                    <div className="absolute top-48 left-64 col-span-4 flex justify-center text-[24px] items-center text-gray-500 ">{t("No products available")}.</div>
                  )
                )}
              </div>

            </div>
            <div className=" flex justify-center items-center">
              <p className="text-custom-green underline  text-lg px-3 py-2 rounded-sm cursor-pointer"
                onClick={() => handleCategoryClick1('/categories/all')}
              >{t("View More")} </p>
            </div>
          </div>
        </section>
      </div>
      <div className="container mx-auto md:max-w-8xl lg:max-w-9xl py-12 md:px-4 px-5">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 md:gap-12 gap-4">
          <div className="bg-white p-4 shadow-md text-center">
            <FontAwesomeIcon icon={faBoxOpen} className="text-xl text-[#F38529] mb-2" />
            <h3 className="text-[16px] md:text-[18px] md:text-lg font-semibold text-black">
              {t("Product Package")}</h3>
            <p className="text-gray-500 text-[13px] md:text-[16px]">
              {t("Fresh and safely packed for you")}</p>
          </div>
          <div className="bg-white p-4 shadow-md text-center">
            <FontAwesomeIcon icon={faHeadset} className="text-xl text-[#F38529] mb-4" />
            <h3 className="text-[16px] md:text-[18px] font-semibold text-black">{t("24/7 Support")}</h3>
            <p className="text-gray-500 text-[13px] md:text-[16px]">
              {t("Help available anytime you need it")}</p>
          </div>
          <div className="bg-white p-4 shadow-md text-center">
            <FontAwesomeIcon icon={faTruck} className="text-xl text-[#F38529] mb-4" />
            <h3 className="text-[16px] md:text-[18px] font-semibold text-black">{t("Delivery in 5 Days")}</h3>
            <p className="text-gray-500 text-[13px] md:text-[16px]">{t("Quick delivery within just 5 days")}</p>
          </div>
          <div className="bg-white p-4 shadow-md text-center">
            <FontAwesomeIcon icon={faLock} className="text-xl text-[#F38529] mb-4" />
            <h3 className="text-[16px] md:text-[18px] font-semibold text-black">{t("Payment Secure")}</h3>
            <p className="text-gray-500 text-[13px] md:text-[16px]">{t("Safe and secure payment options")}</p>
          </div>
        </div>
      </div>
      <DealsOnOrganicFood />
      <Testimonials />
    </div>
  );
}