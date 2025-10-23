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
      className="bg-white w-full max-w-[350px] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 relative"
    >
      {/* Category Badge */}
      <div className="absolute top-6 left-6 bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
        {item.categoryName}
      </div>

      {/* Favorite Button */}
      <div
        className="absolute top-6 right-6 rounded-full bg-white w-12 h-12 flex justify-center items-center shadow-md cursor-pointer hover:scale-110 transition-transform"
        onClick={toggleFavorite}
      >
        {isFavorite ? (
          <FaHeart className="text-red-600 w-6 h-6" />
        ) : (
          <FaRegHeart className="text-black w-6 h-6" />
        )}
      </div>

      {/* Product Image */}
      <div className="relative w-full h-64 flex items-center justify-center mb-4">
        <Image
          src={item.varients[0].image[0]}
          alt={item?.imageAltName || "Product Image"}
          className="object-contain cursor-pointer"
          onClick={() => router.push(url)}
          fill
          priority
        />
      </div>

      {/* Product Name */}
      <h3 className="text-black text-lg font-semibold mb-3 min-h-[56px] line-clamp-2">
        {lang === "en"
          ? item.name
          : item.vietnamiesName || item.name}
      </h3>

      {/* Price and Add to Cart */}
      <div className="flex justify-between items-center gap-3">
        {/* Price */}
        <div className="flex flex-col">
          <p className="text-red-500 text-2xl font-bold">
            {constant.currency} {item?.price_slot[0]?.our_price}
          </p>
          {item?.price_slot[0]?.other_price && (
            <del className="text-gray-400 text-sm font-medium">
              {constant.currency} {item?.price_slot[0]?.other_price}
            </del>
          )}
        </div>

        {/* Add to Cart / Quantity Controls */}
        {item?.Quantity <= 0 ? (
          <button
            className="bg-gray-400 text-white font-semibold px-6 py-3 rounded-full text-sm cursor-not-allowed flex items-center gap-2"
            disabled
          >
            {t("Out of Stock")}
          </button>
        ) : itemQuantity > 0 ? (
          <div className="bg-gray-100 rounded-full flex items-center px-2 py-1">
            <div
              className="bg-green-600 hover:bg-green-700 cursor-pointer rounded-full w-9 h-9 flex justify-center items-center transition-colors"
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
                      return cartItem;
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
              <IoRemoveSharp className="text-white w-5 h-5" />
            </div>

            <p className="text-black text-lg font-semibold mx-4 min-w-[20px] text-center">
              {itemQuantity}
            </p>

            <div
              className="bg-green-600 hover:bg-green-700 cursor-pointer rounded-full w-9 h-9 flex justify-center items-center transition-colors"
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
                      total: ((cartItem.price || 0) * (cartItem.qty + 1)).toFixed(2),
                    };
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
              <IoAddSharp className="text-white w-5 h-5" />
            </div>
          </div>
        ) : (
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-full text-sm cursor-pointer flex items-center gap-2 transition-colors"
            onClick={handleAddToCart}
          >
            {t("Add")}
            <FiShoppingCart className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default GroceryCatories;
