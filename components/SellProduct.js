import React, { useContext, useState, useEffect } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { useRouter } from "next/router";
import { cartContext, languageContext } from "@/pages/_app";
import Image from "next/image";
import { produce } from "immer";
import { Api } from "@/services/service";
import { IoRemoveSharp, IoAddSharp } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { Zap } from "lucide-react";

const SellProduct = ({ loader, toaster }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [cartData, setCartData] = useContext(cartContext);
  const [saleData, setSaleData] = useState([]);
  const [countdown, setCountdown] = useState({});
  const { lang } = useContext(languageContext)

  const handleAddToCart = (item) => {
    const updatedCart = produce(cartData, (draft) => {
      const existingItemIndex = draft.findIndex((f) => f.id === item?.product?._id);
      const price = parseFloat(item.price);

      let price_slot = {
        value: item?.price_slot?.value,
        unit: item?.price_slot?.unit,
        other_price: item?.price_slot?.our_price,
        our_price: item?.price,
      };

      if (existingItemIndex === -1) {
        console.log(item)
        draft.push({
          ...item,
          name: item?.product.name,
          vietnamiesName: item?.product.vietnamiesName,
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
          price_slot: price_slot || {},
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
    toaster({ type: "success", message: "Product added to cart" });
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
    // loader(true);
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
    <div className="container  md:mt-10 lg:mt-14 mb-4 bg-white md:px-0 px-2 mt-12">
      {saleData.length > 0 && (
        <>
          <p className="text-black flex justify-start items-center gap-2 md:text-[24px] text-xl font-semibold w-full px-1 md:px-0">
            {t("Offer of the Week")}
            <Zap className="text-custom-green" fill="#2e7d32" />
          </p>

          <div className="md:mt-4 mt-2 grid md:grid-cols-4 lg:grid-cols-4 grid-cols-2 gap-4 mx-auto">
            {saleData.map((item, i) => {
              const cartItem = cartData.find(
                (cartItem) => cartItem.id === item?.product?._id
              );
              const itemQuantity = cartItem ? cartItem.qty : 0;
              const currentSale = countdown[item._id];

              return (
                <div
                  key={i}
                  className="bg-white w-full rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-4 relative flex flex-col"
                >
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full z-10">
                    {item.product?.categoryName}
                  </div>

                  {/* Sale Timer */}
                  {currentSale?.status !== "expired" && (
                    <div className="md:flex flex-col hidden  absolute md:top-3 md:right-3 bg-custom-lightGreen text-custom-green text-xs md:px-4 px-6 py-1 rounded-md z-10">
                      <p className="font-semibold text-[12px]">
                        {currentSale?.status === "active" ? "Sale ends in" : "Sale starts soon"}
                      </p>
                      <div className="flex gap-1 text-[10px] font-bold">
                        <div>{currentSale?.days}d</div>:
                        <div>{currentSale?.hours}h</div>:
                        <div>{currentSale?.minutes}m</div>:
                        <div>{currentSale?.seconds}s</div>
                      </div>
                    </div>
                  )}

                  {currentSale?.status !== "expired" && (
                    <div className="md:hidden flex flex-col absolute bottom-38 bg-custom-lightGreen text-custom-green text-xs  px-6 py-1 rounded-md z-10">
                      <p className="font-semibold text-[12px]">
                        {currentSale?.status === "active" ? "Sale ends in" : "Sale starts soon"}
                      </p>
                      <div className="flex gap-1 text-[10px] font-bold">
                        <div>{currentSale?.days}d</div>:
                        <div>{currentSale?.hours}h</div>:
                        <div>{currentSale?.minutes}m</div>:
                        <div>{currentSale?.seconds}s</div>
                      </div>
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="relative w-full h-48 mb-4">
                    <Image
                      src={item.product?.varients[0]?.image[0]}
                      alt={item.product?.name || "Product Image"}
                      fill
                      className="object-contain rounded-xl cursor-pointer"
                      onClick={() => router.push(`/SaleDetails/${item?.product?.slug}`)}
                    />
                  </div>

                  <div className="flex justify-center items-center">
                    <h3 className="text-black font-semibold text-sm md:text-md min-h-[40px] line-clamp-2 mb-2">
                      {lang === "en"
                        ? item.product?.name
                        : item.product?.vietnamiesName || item.product?.name}
                    </h3>
                  </div>

                  {/* Price Section */}
                  <div className="flex items-center md:justify-center justify-start md:gap-3 gap-1 mb-3">
                    <span className="text-red-500 font-semibold text-[17px] md:text-xl">
                      ${item.price}
                    </span>
                    {item?.price_slot?.our_price && (
                      <span className="text-gray-500 text-sm line-through">
                        ${item.price_slot?.our_price}
                      </span>
                    )}
                    {item.product?.price_slot?.[0]?.our_price && (
                      <span className="md:flex hidden bg-red-100 text-red-600 text-[12px] px-1 py-1 rounded">
                        {Math.round(
                          ((item.price_slot?.our_price - item.price) /
                            item.price_slot?.our_price) *
                          100
                        )}
                        % OFF
                      </span>
                    )}
                  </div>

                  {/* Add to Cart / Quantity Controls */}
                  {item?.product?.Quantity <= 0 ? (
                    <button
                      className="w-full py-2 bg-gray-400 text-white font-semibold rounded-full cursor-not-allowed"
                    >
                      {t("Out of Stock")}
                    </button>
                  ) : itemQuantity > 0 ? (
                    <div className="flex justify-center items-center">
                      <div className="flex justify-between items-center gap-2 md:w-[200px] w-[150px] bg-gray-100 p-1 rounded-2xl">
                        <div
                          className="bg-custom-green cursor-pointer rounded-full p-2 flex justify-center items-center"
                          onClick={() => itemQuantity > 1 && handleRemoveFromCart(item)}
                        >
                          <IoRemoveSharp className="text-white w-5 h-5" />
                        </div>
                        <p className="text-center font-medium text-black">{itemQuantity}</p>
                        <div
                          className="bg-custom-green cursor-pointer rounded-full p-2 flex justify-center items-center"
                          onClick={() => handleAddToCart(item)}
                        >
                          <IoAddSharp className="text-white w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto">
                      <button
                        className="w-[150px] py-2 bg-custom-green text-white md:w-[200px] font-semibold rounded-full flex justify-center items-center gap-2 hover:bg-green-700 transition"
                        onClick={() => handleAddToCart(item)}
                      >
                        <FiShoppingCart className="w-5 h-5" />
                        {t("Add")}
                      </button>
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
