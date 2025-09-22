import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import moment from "moment";
import {
  MdLocationOn,
  MdCalendarToday,
  MdLocalShipping,
  MdColorLens,
  MdProductionQuantityLimits,
} from "react-icons/md";
import { FaMoneyBillWave } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Api } from "@/services/service";
import { languageContext } from "../_app";
import Image from "next/image";

export default function OrderDetails(props) {
  const router = useRouter();
  const [productsId, setProductsId] = useState({});
  const [ordersData, setOrdersData] = useState([]);
  const [selectedImageList, setSelectedImageList] = useState([]);
  const { id, productDetailId } = router.query;
  const [userAddress, setUserAddress] = useState([]);
  const { lang } = useContext(languageContext)
  useEffect(() => {
    if (router.isReady && id) {
      getProductById(id);
    }
  }, [router.isReady, id]);

  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 1,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  const getProductById = async (productId) => {
    try {
      props?.loader(true);
      const res = await Api(
        "get",
        `/getProductRequest/${productId}`,
        "",
        router
      );
      props?.loader(false);
      setOrdersData(res.data);

      const d = res.data.productDetail.find(
        (f) => f._id === router?.query?.product_id
      );
      setProductsId(d);
      setSelectedImageList(d?.image);
      const address = res.data.shipping_address;

      setUserAddress(address);
    } catch (err) {
      props?.loader(false);
      props?.toaster({ type: "error", message: err?.message });
    }
  };

  const imageOnError = (event) => {
    event.currentTarget.src = "/default-product-image.png";
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 mt-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
            <p className="text-gray-500">
              {ordersData.orderId || "Order Id Not Defined"}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-custom-green cursor-pointer rounded-lg hover:bg-gray-300 transition-all text-white"
          >
            Back to Orders
          </button>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-lg font-semibold flex items-center text-black">
                <MdCalendarToday className="mr-2 text-[#F38529]" />
                Order Date:{" "}
                <span className="font-normal ml-2">
                  {ordersData.createdAt
                    ? moment(new Date(ordersData.createdAt)).format(
                      "DD MMM YYYY"
                    )
                    : "-"}
                </span>
              </h2>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="bg-[#F38529] text-white px-4 py-2 rounded-full font-medium">
                {ordersData.status || "Processing"}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
          {/* Product Details */}
          <div className="md:col-span-3 col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Product Image Carousel */}
              <div className="border-b border-gray-100">
                <div className="p-4 bg-[#F38529]/5">
                  <Carousel
                    responsive={responsive}
                    autoPlay={false}
                    infinite={true}
                    arrows={true}
                    // showDots={true}
                    className="product-carousel"
                  >
                    {selectedImageList.length > 0 ? (
                      selectedImageList.map((img, index) => (
                        <div
                          key={index}
                          className="h-60 sm:h-72 md:h-80 lg:h-[22rem] xl:h-[24rem] flex items-center justify-center p-4"
                        >
                          <Image
                            fill
                            src={img}
                            alt={`Product image ${index + 1}`}
                            className="max-h-full object-contain"
                            onError={(e) =>
                              (e.target.src = "/default-product-image.png")
                            }
                          />
                        </div>
                      ))
                    ) : (
                      <div className="h-60 sm:h-72 md:h-80 flex items-center justify-center p-4">
                        <Image
                          fill
                          src="/default-product-image.png"
                          alt="Default product image"
                          className="max-h-full object-contain"
                        />
                      </div>
                    )}
                  </Carousel>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 sm:p-6">
                <h2 className="hidden md:block text-2xl font-bold text-gray-800 mb-4">
                  {lang === "en" ? productsId?.product?.name : productsId?.product?.vietnamiesName}
                </h2>
                <h2 className="block md:hidden text-xl font-bold text-gray-800 mb-4 truncate">
                  {productsId?.product?.name}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center mb-4">
                      <FaMoneyBillWave className="text-[#F38529] mr-3 text-xl" />
                      <div>
                        <p className="text-gray-500 text-sm">Price</p>
                        <p className="text-xl font-semibold text-gray-600">
                          ${productsId?.price}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center mb-4">
                      <MdProductionQuantityLimits className="text-[#F38529] mr-3 text-xl" />
                      <div>
                        <p className="text-gray-500 text-sm">Quantity</p>
                        <p className="font-bold text-gray-700">
                          {productsId?.qty}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary & Shipping */}
          <div className="md:col-span-2 col-span-1">
            {/* Shipping Info */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-100 flex items-center text-gray-600">
                <MdLocalShipping className="text-[#F38529] mr-2" /> Shipping
                Information
              </h3>

              {ordersData?.Local_address?.address ? (
                <div className="flex items-start">
                  <MdLocationOn className="text-[#F38529] text-xl mt-1 mr-3" />
                  <div>
                    <p className="font-medium mb-1 text-gray-600">
                      Delivery Address
                    </p>
                    <p className="text-gray-600">
                      {ordersData?.Local_address?.address}
                    </p>
                    {ordersData?.Local_address?.phoneNumber && (
                      <p className="text-gray-600 mt-2">
                        {ordersData?.Local_address?.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No shipping address available</p>
              )}
            </div>

            {/* Order Summary */}
            {/* <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-100 text-gray-600">
                Order Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-[#F38529]">
                    ${ordersData?.subtotal || 0}
                  </span>
                </div>
                 <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-[#F38529]">
                    ${ordersData?.discount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-[#F38529]">
                    ${ordersData?.totalTax || 0}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="text-gray-600 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-[#F38529]">
                      ${ordersData?.total || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Custom CSS for carousel buttons */}
      <style jsx global>{`
        .product-carousel .react-multiple-carousel__arrow {
          background-color: #f38529;
          min-width: 36px;
          min-height: 36px;
        }

        .product-carousel .react-multiple-carousel__arrow:hover {
          background-color: #e67a20;
        }

        .product-carousel .react-multi-carousel-dot button {
          border-color: #f38529;
        }

        .product-carousel .react-multi-carousel-dot--active button {
          background-color: #f38529;
        }
      `}</style>
    </div>
  );
}
