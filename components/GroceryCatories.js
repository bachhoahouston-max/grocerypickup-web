import React, { useContext, useEffect } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { useRouter } from "next/router";
import {
  userContext,
  cartContext,
  openCartContext,
  favoriteProductContext,
  languageContext
} from "@/pages/_app";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { Api } from "@/services/service";
import { IoRemoveSharp } from "react-icons/io5";
import { IoAddSharp } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import constant from "@/services/constant";
import Image from "next/image";

const GroceryCatories = ({ item, i, url, loader, toaster }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [cartData, setCartData] = useContext(cartContext);
  const { lang } = useContext(languageContext);
  const [user] = useContext(userContext);
  const [Favorite, setFavorite] = useContext(favoriteProductContext);

 
  const handleAddToCart = () => {
    const itemQuantity = Number(item?.Quantity ?? 0);

    if (itemQuantity <= 0) {
      toaster({
        type: "error",
        message: "This item is currently out of stock. Please choose a different item.",
      });
      return;
    }

    const existingItem = cartData.find((f) => f._id === item?._id);

    if (existingItem) {
      toaster({ type: "info", message: "Item already in cart." });
      return;
    }

    const newItem = {
      ...item,
      id: item?._id,
      selectedColor: item?.varients?.[0] || {},
      selectedImage: item?.varients?.[0]?.image?.[0] || "",
      BarCode: item?.BarCode || "",
      qty: 1,
      price: item.price_slot?.[0]?.our_price ?? 0,
      total: Number(item.price_slot?.[0]?.our_price ?? 0),
      price_slot: item.price_slot?.[0] || {},
      tax: item?.tax,
    };

    const updatedCart = [...cartData, newItem];
    setCartData(updatedCart);
    localStorage.setItem("addCartDetail", JSON.stringify(updatedCart));

    toaster({ type: "success", message: "Product added to cart" });
  };

  const isFavorite = Favorite.some(
    (fav) => fav._id === item?._id || fav?.product?._id === item?._id
  );

  const toggleFavorite = async () => {
    if (!user?.token) {
      return toaster({ type: "error", message: "Login required" });
    }

    loader(true);
    try {
      const data = { product: item?._id };
      const res = await Api("post", "addremovefavourite", data, router);

      if (res.status) {
        if (isFavorite) {
          // Remove
          const updated = Favorite.filter(
            (fav) => fav._id !== item._id && fav?.product?._id !== item._id
          );
          setFavorite(updated);
          localStorage.setItem("Favorite", JSON.stringify(updated));
          toaster({ type: "error", message: "Item Removed From Favorite" });
        } else {
          // Add
          const updated = [...Favorite, item];
          setFavorite(updated);
          localStorage.setItem("Favorite", JSON.stringify(updated));
          toaster({ type: "success", message: "Item Added to Favorite" });
        }
      }
    } catch (err) {
      loader(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("Favorite");
    if (stored) {
      try {
        setFavorite(JSON.parse(stored));
      } catch {
        localStorage.removeItem("Favorite");
      }
    }
  }, []);


  const cartItem = cartData.find((cartItem) => cartItem._id === item._id);
  const itemQuantity = cartItem ? cartItem.qty : 0;

  return (
    <div
      key={i}
      className="bg-white w-full max-w-[350px] h-full rounded-lg md:p-1 p-0 hover:translate-y-[-10px] transition-all duration-500  items-center flex flex-col mt-2 relative max-h-[380px]"
    >

      <div className="relative md:w-full w-40 md:h-44 h-40">
        <Image
          src={item.varients[0].image[0]}
          alt={item?.imageAltName || "Product Image"}
          className="object-contain rounded-xl cursor-pointer"
          onClick={() => router.push(url)}
          fill
          // sizes="100px"
          priority
        />
        <div
          className="absolute rounded-full bottom-[-22px] left-1/2 transform -translate-x-1/2 bg-gray-200 md:w-[45px] w-[36px] md:h-[45px] h-[36px] flex justify-center items-center md:mb-1 mb-2"
          onClick={toggleFavorite}
        >
          {isFavorite ? (
            <FaHeart className="text-red-700 md:w-[23px] w-[18px] md:h-[23px] h-[20px]" />
          ) : (
            <FaRegHeart className="text-black md:w-[23px] w-[18px] md:h-[23px] h-[20px]" />
          )}
        </div>
      </div>

      <h2 className="text-xs text-gray-400 font-normal mt-4 md:mt-8">
        {item.categoryName}
      </h2>

      <div className="flex flex-col items-center justify-center h-12">
        <p className="xl:flex lg:hidden text-sm 2xl:hidden lg:text-[14px]  2xl:[text-18px]  text-black font-semibold pt-1 ">
          {lang === "en"
            ? (item.name.length > 30 ? item.name.slice(0, 30) + "..." : item.name)
            : (item.vietnamiesName?.length > 30
              ? item.vietnamiesName.slice(0, 30) + "..."
              : item.vietnamiesName)}

        </p>
        <p className="lg:flex xl:hidden 2xl:hidden  hidden text-sm lg:text-[12px] 2xl:[text-18px]  text-black font-semibold pt-1 ">
          {item.name.length > 25 ? item.name.slice(0, 25) + "..." : item.name}
          {lang === "en"
            ? (item.name.length > 25 ? item.name.slice(0, 25) + "..." : item.name)
            : (item.vietnamiesName?.length > 25
              ? item.vietnamiesName.slice(0, 25) + "..."
              : item.vietnamiesName)}

        </p>
        <p className="lg:hidden xl:hidden 2xl:flex  hidden text-sm 2xl:[text-18px]  text-black font-semibold pt-1 ">
          {lang === "en"
            ? (item.name.length > 40 ? item.name.slice(0, 40) + "..." : item.name)
            : (item.vietnamiesName?.length > 40
              ? item.vietnamiesName.slice(0, 40) + "..."
              : item.vietnamiesName)}

        </p>
      </div>

      <div className="flex justify-between items-center md:pt-2 pt-0">
        <p className="text-custom-gold text-[20px] lg:text-[17px] 2xl:[text-20px] font-semibold">
          {constant.currency}
          {item?.price_slot[0]?.our_price}

          {item?.price_slot[0]?.other_price && (
            <del className="font-medium text-[20px] lg:text-[14px] 2xl:[text-18px] text-custom-black ml-2">
              {constant.currency}
              {item?.price_slot[0]?.other_price}
            </del>
          )}
        </p>
      </div>

      {item?.Quantity <= 0 ? (
        <button
          className="font-bold bg-[#5CB447]/80 w-[120px] md:mt-2 mt-1 rounded-[6px] md:px-2 px-0 py-1.5 text-[13px] md:text-[12px] lg:text-[13px] 2xl:text-[16px] text-gray-200  flex justify-center items-center cursor-not-allowed"
        >

          {t("Out of Stock")}
        </button>
      ) : (
        itemQuantity > 0 ? (
          <div className="bg-gray-100 w-[120px] h-[32px] rounded-[8px] md:mt-2 mt-1 flex items-center">
            <div
              className="bg-[#5CB447] cursor-pointer rounded-[8px] rounded-r-none flex justify-center md:px-2 px-2 py-1.5 items-center"
              onClick={() => {
                const updatedCart = cartData.map((cartItem) => {
                  if (cartItem._id === item._id) {
                    if (cartItem.qty > 1) {
                      const newQty = cartItem.qty - 1;
                      return {
                        ...cartItem,
                        qty: newQty,
                        total: (newQty * (cartItem.price || 0)).toFixed(2),
                      };
                    } else {
                      return cartItem; // Don't change anything if qty is 1
                    }
                  }
                  return cartItem;
                });

                setCartData(updatedCart);
                localStorage.setItem(
                  "addCartDetail",
                  JSON.stringify(updatedCart)
                );
              }}
            >
              <IoRemoveSharp className="md:h-[23px] h-[20px] w-[30px] md:w-[25px] text-white" />
            </div>

            <p className="text-black md:text-xl text-lg font-medium text-center mx-3 ">
              {itemQuantity}
            </p>
            <div
              className="md:px-2 px-2 py-1.5 bg-[#5CB447] cursor-pointer rounded-[8px] rounded-l-none flex justify-center items-center"
              onClick={() => {
                const updatedCart = cartData.map((cartItem) => {
                  if (cartItem._id === item._id) {
                    if (cartItem.qty + 1 > item.Quantity) {
                      toaster({
                        type: "error",
                        message:
                          "Item is not available in this quantity in stock. Please choose a different item.",
                      });
                      return cartItem;
                    }
                    return {
                      ...cartItem,
                      qty: cartItem.qty + 1,
                      total: ((cartItem.price || 0) * (cartItem.qty + 1)).toFixed(
                        2
                      ),
                    };
                  }

                  // Return all other items unchanged
                  return cartItem;
                });

                setCartData(updatedCart);
                localStorage.setItem(
                  "addCartDetail",
                  JSON.stringify(updatedCart)
                );
              }}
            >
              <IoAddSharp className="md:h-[23px] h-[20px] w-[20px] md:w-[25px] text-white" />
            </div>
          </div>
        ) : (
          <button
            className="font-bold bg-[#5CB447] w-[120px] md:mt-2 mt-1 rounded-[6px] md:px-2 px-0 py-1.5 text-[13px] md:text-[12px] lg:text-[13px] 2xl:text-[16px] text-white cursor-pointer flex justify-center items-center"
            onClick={handleAddToCart}
          >
            <FiShoppingCart className="md:w-[18px] w-[14px] h-[14px] md:h-[18px] text-white md:mr-2 mr-1 font-bold " />
            {t("Add")}
          </button>
        ))
      }
    </div>
  );
};

export default GroceryCatories;
