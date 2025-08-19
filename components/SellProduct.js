import React, { useContext, useState, useEffect } from "react";
import { FaStar } from "react-icons/fa6";
import { FiShoppingCart } from "react-icons/fi";
import { useRouter } from "next/router";
import { userContext, cartContext, openCartContext } from "@/pages/_app";
import { produce } from "immer";
import { Api } from "@/services/service";
import { IoRemoveSharp, IoAddSharp } from "react-icons/io5";
import { useTranslation } from "react-i18next";

const SellProduct = ({ loader, toaster }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [cartData, setCartData] = useContext(cartContext);
  const [saleData, setSaleData] = useState([]);
  const [countdown, setCountdown] = useState({});

  const handleAddToCart = (item) => {
    const updatedCart = produce(cartData, (draft) => {
      const existingItemIndex = draft.findIndex((f) => f._id === item._id);
      const price = parseFloat(item.price);

      if (existingItemIndex === -1) {
        draft.push({
          ...item,
          name: item?.product.name,
          id: item?.product?._id,
          selectedColor: item?.product.varients?.[0] || {},
          selectedImage: item.product?.varients[0]?.image[0] || "",
          BarCode: item?.product.DateBarCode || "",
          total: price,
          isCurbSidePickupAvailable: item?.product?.isCurbSidePickupAvailable,
          isInStoreAvailable: item?.product?.isInStoreAvailable,
          isNextDayDeliveryAvailable: item?.product?.isNextDayDeliveryAvailable,
          isReturnAvailable: item?.product?.isReturnAvailable,
          isShipmentAvailable: item?.product?.isShipmentAvailable,
          qty: 1,
          price: price ?? 0,
          price_slot: item.product.price_slot?.[0] || {},
          tax_code: item?.product.tax_code,
        });
      } else {
        draft[existingItemIndex].qty += 1;
        draft[existingItemIndex].total = (
          price * draft[existingItemIndex].qty
        ).toFixed(2);
      }
    });

    setCartData(updatedCart);
    localStorage.setItem("addCartDetail", JSON.stringify(updatedCart));
  };

  const handleRemoveFromCart = (item) => {
    const updatedCart = produce(cartData, (draft) => {
      const existingItemIndex = draft.findIndex((f) => f._id === item._id);
      const price = parseFloat(item.price);

      if (existingItemIndex !== -1) {
        if (draft[existingItemIndex].qty > 1) {
          draft[existingItemIndex].qty -= 1;
          draft[existingItemIndex].total = (
            price * draft[existingItemIndex].qty
          ).toFixed(2);
        } else {
          draft.splice(existingItemIndex, 1);
        }
      }
    });

    setCartData(updatedCart);
    localStorage.setItem("addCartDetail", JSON.stringify(updatedCart));
  };

  const getSale = async () => {
    loader(true);
    try {
      const res = await Api("get", "getActiveFlashSales", router);
      if (res.status) {
        setSaleData(res.data);
      }
    } catch (err) {
      console.error(err);
      toaster({ type: "error", message: err?.message });
    } finally {
      loader(false);
    }
  };

  useEffect(() => {
    getSale();
  }, []);

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date().getTime();
      const newCountdown = {};

      saleData.forEach((sale) => {
        const startDate = new Date(sale.startDateTime).getTime();
        const endDate = new Date(sale.endDateTime).getTime();

        if (now < startDate) {
          const distance = startDate - now;
          newCountdown[sale._id] = {
            ...calculateTimeLeft(distance),
            status: "upcoming",
            message: "Sale starts in",
          };
        } else if (now >= startDate && now < endDate) {
          const distance = endDate - now;
          newCountdown[sale._id] = {
            ...calculateTimeLeft(distance),
            status: "active",
            message: "Sale ends in",
          };
        } else {
          newCountdown[sale._id] = {
            status: "expired",
            message: "Sale has ended",
          };
        }
      });

      setCountdown(newCountdown);
    };

    const calculateTimeLeft = (distance) => {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    if (saleData.length > 0) {
      calculateCountdown();
      const interval = setInterval(calculateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [saleData]);

  return (
    <div className="container mb-2 md:mt-10 lg:mt-14 mt-4 mx-auto bg-white max-w-9xl md:px-6 px-6">
      {saleData.length > 0 && (
        <>
          <p className="text-black text-center md:text-[24px] text-xl font-semibold w-full px-1 md:px-6">
            {t("Offer of the Week")}
          </p>
          <div className="md:mt-2 mt-2 relative w-full md:w-5/5 grid md:grid-cols-5 lg:grid-cols-7 grid-cols-2 gap-2.5 mx-auto md:mx-4 md:space-x-2 space-x-0">
            {saleData.map((item, i) => {
              const cartItem = cartData.find(
                (cartItem) => cartItem._id === item._id
              );
              const itemQuantity = cartItem ? cartItem.qty : 0;
              const currentSale = countdown[item._id];
              const isActive = currentSale?.status === "active";
              const isUpcoming = currentSale?.status === "upcoming";

              return (
                <div
                  key={i}
                  className="bg-white w-full max-w-[390px] h-full md:h-[400px] rounded-lg md:p-2 p-1 hover:translate-y-[-10px] transition-all duration-500 flex items-center flex-col mt-2 relative"
                >
                  {/* Countdown Badge */}
                  {currentSale?.status !== "expired" && (
                    <div className="absolute md:top-1 -top-2 -left-2 md:left-6 bg-custom-green  shadow-md rounded-md px-2 py-1.5 z-10 text-xs font-medium text-white">
                      <p className="text-[12px] font-semibold">
                        {currentSale?.status === "active"
                          ? "Sale end in"
                          : "sale start soon"}
                      </p>
                      <div className="flex gap-1 text-center text-[10px] font-bold text-white">
                        <div>{currentSale?.days}d</div>:
                        <div>{currentSale?.hours}h</div>:
                        <div>{currentSale?.minutes}m</div>:
                        <div>{currentSale?.seconds}s</div>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <img
                      src={item.product?.varients[0]?.image[0]}
                      alt="vietnamese specialty food"
                      className="md:w-full w-56 md:h-44 h-40 object-contain rounded-xl cursor-pointer"
                    />
                  </div>

                  <h2 className="text-xs text-gray-400 font-normal mt-4">
                    {item.product?.categoryName}
                  </h2>
                  <p className="xl:flex lg:hidden text-sm lg:text-[14px]  2xl:[text-18px]  text-black font-semibold pt-1 ">
                    {item.product.name.length > 30 ? item.product.name.slice(0, 30) + "..." : item.name}
                  </p>
                  <p className="lg:flex xl:hidden  hidden text-sm lg:text-[12px] 2xl:[text-18px]  text-black font-semibold pt-1 ">
                    {item.product.name.length > 25 ? item.product.name.slice(0, 25) + "..." : item.name}
                  </p>

                  <div className="h-12 md:flex-row flex-col flex justify-center mb-1 md:gap-2 items-center md:pt-2 pt-0">
                    <div className="gap-2 flex items-center pt-1">
                      <span className="text-custom-gold text-[22px] lg:text-[14px] 2xl:[text-18px] font-semibold">
                        ${item.price}
                      </span>
                      {item.product?.price_slot &&
                        item.product.price_slot[0]?.our_price && (
                          <span className="text-sm text-gray-500 line-through font-semibold">
                            ${item.product.price_slot[0].our_price}
                          </span>
                        )}
                    </div>
                    {item.product?.price_slot &&
                      item.product.price_slot[0]?.our_price && (
                        <span className="md:text-[10px] text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded">
                          {Math.round(
                            ((item.product.price_slot[0].our_price -
                              item.price) /
                              item.product.price_slot[0].our_price) *
                            100
                          )}
                          % OFF
                        </span>
                      )}
                  </div>

                  {/* Add/Remove or Buttons */}
                  {itemQuantity > 0 ? (
                    <div className="w-[100px] h-[32px] rounded-[8px] md:mt-2 mt-1 flex justify-center items-center">
                      <div
                        className="bg-[#5CB447]  cursor-pointer rounded-[8px] rounded-r-none flex justify-center md:px-2 px-1 py-1.5 items-center"
                        onClick={() => {
                          if (itemQuantity > 1) {
                            handleRemoveFromCart(item);
                          }
                        }}
                      >
                        <IoRemoveSharp className="md:h-[23px] h-[20px] w-[20px] md:w-[25px] text-white" />
                      </div>
                      <p className="text-black md:text-xl text-lg font-medium text-center px-3 md:py-0.5 py-0 border-y-2 border-y-gray-200">
                        {itemQuantity}
                      </p>
                      <div
                        className="md:px-2 px-1 py-1.5 bg-[#5CB447]  cursor-pointer rounded-[8px] rounded-l-none flex justify-center items-center"
                        onClick={() => {
                          handleAddToCart(item);
                        }}
                      >
                        <IoAddSharp className="md:h-[23px] h-[20px] w-[20px] md:w-[25px] text-white" />
                      </div>
                    </div>
                  ) : isActive ? (
                    <button
                      className="font-bold bg-[#5CB447]  w-[120px] md:mt-2 mt-1 rounded-[6px] md:px-2 px-0 py-1.5 text-[13px] md:text-[12px] lg:text-[13px] 2xl:text-[16px] text-white cursor-pointer flex justify-center items-center"
                      onClick={() => handleAddToCart(item)}
                    >
                      <FiShoppingCart className="md:w-[18px] w-[14px] h-[14px] md:h-[18px] text-white md:mr-2 mr-1 font-bold" />
                      <p>{t("Add")}</p>
                    </button>
                  ) : isUpcoming ? (
                    <div className="w-[120px] bg-[#5CB447]  md:mt-2 mt-1 py-1.5 text-[13px] md:text-[16px] text-white flex justify-center items-center  rounded-[6px]">
                      {t("Start Soon")}
                    </div>
                  ) : (
                    <div className="w-[120px] bg-[#5CB447]  md:mt-2 mt-1 py-1.5 text-[13px] md:text-[16px] text-white flex justify-center items-center  rounded-[6px] text-center">
                      {t("Ended")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SellProduct;
