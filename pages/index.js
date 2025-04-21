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
export default function Home(props) {
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
        console.log("====>", res.data)
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.data?.message || "Failed to load categories" });
      }
    );
  };

  const fetchProducts = () => {
    props.loader(true);
    Api("get", "getProduct", null, router).then(
      (res) => {
        props.loader(false);
        if (res.data && Array.isArray(res.data)) {
          console.log("All products", res.data);
          setProductList(res.data);
          setIscatdata(false); // Ensure iscatdata is false to show all products initially
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
          console.log("Category products", res.data);
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
                return { ...sale, timeLeft: null, status: 'Sale will start soon' };
            } else if (nowIndia >= startDate && nowIndia < endDate) {
                const distance = endDate - nowIndia;
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                return {
                    ...sale,
                    timeLeft: { days, hours, minutes, seconds },
                    status: 'Sale is live'
                };
            } else {
                return { ...sale, timeLeft: null, status: 'Sale has ended' };
            }
        });
        
        setCountdown(newCountdown);
    };
    
    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
}, [saleData]);


  return (
    <div className="">
      <MainHeader />
      <div className="container mb-8 md:mt-8 mt-4 mx-auto bg-white max-w-7xl md:px-0 px-6">
        {sellProduct.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-[20px] md:text-2xl font-bold mt-4 text-black">Flash Sale</h1>
              {/* <p className="text-gray-600 mt-2 w-full md:w-[50%] text-center text-[13px] md:text-[16px] italic">
                Grab any product at a single price before the sale ends!
              </p> */}
              <div>
                <h1 className="text-black m-2 text-[14px]"> Sale Status: </h1>
                <div className="flex flex-col space-y-4">
                {countdown.map((sale, index) => (
                                <div key={index} className="p-4 bg-white rounded-lg shadow-lg">
                                    {/* <h3 className="text-xl text-black font-semibold">Status</h3> */}
                                    {sale.timeLeft ? (
                                        <div className="flex space-x-4 mt-2">
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl text-black font-bold">{sale.timeLeft.days}</span>
                                                <span className="text-sm text-gray-500">Days</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl text-black font-bold">{sale.timeLeft.hours}</span>
                                                <span className="text-sm text-gray-500">Hours</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl text-black font-bold">{sale.timeLeft.minutes}</span>
                                                <span className="text-sm text-gray-500">Minutes</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl text-black font-bold">{sale.timeLeft.seconds}</span>
                                                <span className="text-sm text-gray-500">Seconds</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-red-600">{sale.status}</p>
                                    )}
                                </div>
                            ))}
                </div>
              </div>
            </div>
            <div className="md:mt-4 mt-4 relative w-full md:w-4/5 grid md:grid-cols-3 lg:grid-cols-4 grid-cols-2 gap-2.5 mx-auto md:mx-4 md:space-x-2 space-x-0">
              {sellProduct.map((item, i) => (
                <SellProduct
                  loader={props.loader}
                  toaster={props.toaster}
                  key={i}
                  item={item}
                  i={i}
                  url={`/product-details/${item?.slug}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="hidden md:flex flex-col container mx-auto bg-white max-w-7xl md:px-0 px-6">
        <div className="text-center mb-8 flex flex-col items-center justify-center">
          <h1 className="text-[20px] md:text-2xl font-bold mt-4 text-black">Categories</h1>
          <p className="text-gray-600 mt-4 w-full md:w-[50%] text-center text-[13px] md:text-[16px] italic">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy.
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-start md:space-x-4">
          <div className="mb-4 md:mb-0 w-full md:w-1/3 ms-0 md:ms-4  cursor-pointer">
            <div>
              <div className="">
                {category.slice(0, 4).map((category, index) => (
                  <div key={index} className="mb-4 bg-[#F7F7F8] flex flex-col py-[18px] cursor-pointer rounded-sm justify-center items-center"
                    onClick={() => { router.push(`/categories/${category?.slug}`) }}
                  >
                    <p className="text-custom-black md:mb-2 mb-1 font-semibold 
                    md:text-[16px] text-[14px]">
                      {category.name}
                    </p>
                    <p className="cursor-pointer text-[#767C7D] md:text-[14px] text-[13px]">(65 items)</p>
                  </div>
                ))}
              </div>

              <div className="mb-4 bg-[#F7F7F8] flex flex-col py-6 md:py-7 cursor-pointer rounded-sm justify-center items-center">
                <p className="text-[#FEC200] mb-2 font-semibold text-[16px]"
                  onClick={() => handleCategoryClick1('/categories/all')}
                >
                  View More
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-2 w-full md:w-2/3">
            <div className="w-full md:w-1/2">
              <img
                alt="A beautifully decorated cake with flowers and berries on a green cake stand"
                className="shadow-md"
                src="./Rectangle2.png"
              />
            </div>
            <div className="w-full md:w-1/2">
              <img
                alt="A glass of green smoothie with kiwi slices and a straw"
                className="shadow-md"
                src="./Rectangle1.png"
              />
            </div>
          </div>
        </div>
      </div>


      <div className="bg-white w-full">
        <section className="bg-white w-full relative flex flex-col justify-center items-center">
          <div className="container mx-auto px-6 md:px-0 xl:w-full md:max-w-7xl">
            <div className="flex justify-center flex-col items-center mt-4">
              <h1 className="text-center text-[20px] md:text-2xl font-bold mb-2 mt-4 text-black">Popular Products</h1>
              <p className="text-center w-full text-[13px] md:text-[16px] md:w-[50%] text-gray-500 mb-6 mt-2 italic">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy.
              </p>
            </div>

            <div className="flex md:flex-row flex-col ">
              {/* Sidebar */}
              <div className=" hidden md:flex flex-col md:w-1/5 lg:w-1/4 w-full">
                <ul className="rounded-lg p-4 space-y-2">
                  <li
                    onClick={() => handleCategoryClick1('/categories/all')}
                    className={`flex text-[14px] md:text-[17px] bg-gray-100 py-3 ps-4 font-bold items-center justify-between p-2 ${selectedCategory === 'all' ? 'text-[#FEC200]' : 'text-black'} cursor-pointer`}
                  >
                    <span>View All</span>
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
              <div className="relative w-full md:w-4/5 grid md:grid-cols-3 lg:grid-cols-4 grid-cols-2 gap-2.5 mx-auto md:mx-4 md:space-x-2 space-x-0 ">
                {iscatdata ? (
                  productsData.length > 0 ? (
                    productsData.slice(0, 8).map((item, i) => (
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
                    <div className="absolute top-48 left-64 col-span-4 flex justify-center text-[24px] items-center text-gray-500 ">No products available in this category.</div>
                  )
                ) : (
                  productList.length > 0 ? (
                    productList.slice(0, 8).map((item, i) => (
                      <GroceryCatories
                        loader={props.loader}
                        toaster={props.toaster}
                        key={i}
                        item={item}
                        i={i}
                        url={`/product-details/${item?.slug}`} />
                    ))
                  ) : (
                    <div className="flex justify-center md:text-[24px] items-center text-[18px] text-gray-500">No products available.</div>
                  )
                )}
              </div>
            </div>

          </div>
        </section>
      </div>
      <div className="container mx-auto max-w-7xl py-12 md:px-4 px-5">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 md:gap-12 gap-4">
          <div className="bg-white p-4 shadow-md text-center">
            <FontAwesomeIcon icon={faBoxOpen} className="text-xl text-[#F38529] mb-2" />
            <h3 className="text-[16px] md:text-[18px] md:text-lg font-semibold text-black">Product Package</h3>
            <p className="text-gray-500 text-[13px] md:text-[16px]">Lorem Ipsum is simply dummy</p>
          </div>
          <div className="bg-white p-4 shadow-md text-center">
            <FontAwesomeIcon icon={faHeadset} className="text-xl text-[#F38529] mb-4" />
            <h3 className="text-[16px] md:text-[18px] font-semibold text-black">24/7 Support</h3>
            <p className="text-gray-500 text-[13px] md:text-[16px]">Lorem Ipsum is simply dummy</p>
          </div>
          <div className="bg-white p-4 shadow-md text-center">
            <FontAwesomeIcon icon={faTruck} className="text-xl text-[#F38529] mb-4" />
            <h3 className="text-[16px] md:text-[18px] font-semibold text-black">Delivery in 5 Days</h3>
            <p className="text-gray-500 text-[13px] md:text-[16px]">Orders from all item</p>
          </div>
          <div className="bg-white p-4 shadow-md text-center">
            <FontAwesomeIcon icon={faLock} className="text-xl text-[#F38529] mb-4" />
            <h3 className="text-[16px] md:text-[18px] font-semibold text-black">Payment Secure</h3>
            <p className="text-gray-500 text-[13px] md:text-[16px]">Lorem Ipsum is simply dummy</p>
          </div>
        </div>
      </div>
      <DealsOnOrganicFood />
      <Testimonials />
    </div>
  );
}