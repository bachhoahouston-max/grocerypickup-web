import React, { useContext, useState, useEffect } from 'react';
import { FaStar } from "react-icons/fa6";
import { FiShoppingCart } from "react-icons/fi";
import { useRouter } from "next/router";
import { userContext, cartContext, openCartContext, favoriteProductContext } from "@/pages/_app";
import { produce } from "immer";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { Api } from '@/services/service';
import { IoRemoveSharp } from "react-icons/io5";
import { IoAddSharp } from "react-icons/io5";
import { useTranslation } from 'react-i18next';
import constant from '@/services/constant';

const GroceryCatories = ({ item, i, url, loader, toaster }) => {
    const router = useRouter();
    const { t } = useTranslation();
    const [cartData, setCartData] = useContext(cartContext);
    const [openCart, setOpenCart] = useContext(openCartContext);
    const [productsId, setProductsId] = useState([]);
    const [user] = useContext(userContext);
    const [isFavorite, setIsFavorite] = useState(false);
    const [Favorite, setFavorite] = useContext(favoriteProductContext);
    const [availableQty, setAvailableQty] = useState(1);

    const handleAddToCart = () => {
        const itemQuantity = Number(item?.Quantity ?? 0);

        // Outside check — good for immediate feedback
        if (itemQuantity <= 0) {
            toaster({ type: "error", message: "This item is currently out of stock. Please choose a different item." });
            return;
        }

        const existingItem = cartData.find((f) => f._id === item?._id);

        // Prevent adding again if already in cart (optional)
        if (existingItem) {
            toaster({ type: "info", message: "Item already in cart." });
            return;
        }

        const newItem = {
            ...item,
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




    useEffect(() => {
        if (user && user.token) {
            getProductById();
        }
    }, [user?.token]);

    useEffect(() => {
        if (Array.isArray(productsId)) {
            const isProductFavorite = productsId.some((product) => product?.product?._id === item?._id);
            setIsFavorite(isProductFavorite);
        } else {
            setIsFavorite(false);
        }
    }, [productsId, item?._id]);

    const getProductById = async () => {
        loader(true);
        Api("get", "getFavourite", "", router).then(
            (res) => {
                loader(false);
                setProductsId(Array.isArray(res.data) ? res.data : []);
            },
            (err) => {
                console.log(err);
                setProductsId([]);
            }
        );
    };

    const addremovefavourite = () => {
        loader(true);
        if (!user?.token) {
            loader(false);
            return toaster({ type: "error", message: "Login required" });
        }

        let data = {
            product: item?._id,
        };

        Api("post", "addremovefavourite", data, router).then(
            (res) => {
                if (res.status) {
                    loader(false);
                    if (isFavorite) {
                        // Remove from favorites
                        setFavorite((prevFavorites) => {
                            const updatedFavorites = prevFavorites.filter(fav => fav._id !== item._id);
                            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
                            return updatedFavorites; // Return the updated favorites
                        });
                        toaster({ type: "error", message: "Item Removed From Favorite" });
                    } else {
                        // Add to favorites
                        setFavorite((prevFavorites) => {
                            const updatedFavorites = [...prevFavorites, item];
                            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
                            return updatedFavorites; // Return the updated favorites
                        });
                        toaster({ type: "success", message: "Item Added to Favorite" });
                    }

                    getProductById(); // Refresh the favorite products
                }
            },
            (err) => {
                console.log(err);
                loader(false); // Ensure loader is turned off in case of error
            }
        );
    };

    useEffect(() => {
        const storedFavorites = localStorage.getItem('favorites');
        if (storedFavorites) {
            setFavorite(JSON.parse(storedFavorites));
        }
    }, []);

    const cartItem = cartData.find((cartItem) => cartItem._id === item._id);
    const itemQuantity = cartItem ? cartItem.qty : 0;

    return (
        <div
            key={i}
            className="bg-white w-full max-w-[350px] h-full md:h-[389px] rounded-lg md:p-1 p-0 hover:translate-y-[-10px] transition-all duration-500  items-center flex flex-col mt-2 relative"
        >
            <div className='relative'>
                <img
                    src={item.varients[0].image[0]}
                    alt="Product image"
                    className="md:w-full w-56 md:h-44 h-40 object-contain rounded-xl cursor-pointer"
                    onClick={() => {
                        router.push(url);
                    }}
                />

                <div className='absolute rounded-full bottom-[-22px] left-1/2 transform -translate-x-1/2 bg-gray-200 md:w-[45px] w-[36px] md:h-[45px] h-[36px] flex justify-center items-center md:mb-1 mb-2'
                    onClick={addremovefavourite}
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
            <p className="text-sm md:text-base text-black font-semibold pt-1">
                {item.name.slice(0, 15) + ("...")}
            </p>

            <div className="flex justify-between items-center md:pt-1 pt-0">
                <p className="text-custom-gold text-lg md:text-xl font-semibold">
                    {constant.currency}{(item?.price_slot[0]?.our_price)}

                    {item?.price_slot[0]?.other_price && (
                        <del className="font-medium text-sm text-custom-black ml-2">
                            {constant.currency}{(item?.price_slot[0]?.other_price)}
                        </del>
                    )}


                </p>
            </div>

            {itemQuantity > 0 ? (
                <div className="bg-gray-100 w-[120px] h-[32px] rounded-[8px] md:mt-2 mt-1 flex items-center">
                    <div
                        className="bg-custom-gold cursor-pointer rounded-[8px] rounded-r-none flex justify-center md:px-2 px-2 py-1.5 items-center"
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
                            localStorage.setItem("addCartDetail", JSON.stringify(updatedCart));
                        }}


                    >
                        <IoRemoveSharp className="md:h-[23px] h-[20px] w-[30px] md:w-[25px] text-white" />
                    </div>


                    <p className="text-black md:text-xl text-lg font-medium text-center mx-3 ">
                        {itemQuantity}
                    </p>
                    <div
                        className="md:px-2 px-2 py-1.5 bg-custom-gold cursor-pointer rounded-[8px] rounded-l-none flex justify-center items-center"
                        onClick={() => {
                            const updatedCart = cartData.map((cartItem) => {
                                if (cartItem._id === item._id) {
                                    if (cartItem.qty + 1 > item.Quantity) {
                                        toaster({
                                            type: "error",
                                            message: "Item is not available in this quantity in stock. Please choose a different item.",
                                        });
                                        return cartItem;
                                    }
                                    return {
                                        ...cartItem,
                                        qty: cartItem.qty + 1,
                                        total: ((cartItem.price || 0) * (cartItem.qty + 1)).toFixed(2),
                                    };
                                }

                                // Return all other items unchanged
                                return cartItem;
                            });

                            setCartData(updatedCart);
                            localStorage.setItem("addCartDetail", JSON.stringify(updatedCart));
                        }}

                    >
                        <IoAddSharp className="md:h-[23px] h-[20px] w-[20px] md:w-[25px] text-white" />
                    </div>
                </div>
            ) : (
                <button
                    className="font-bold bg-custom-gold w-[120px] md:mt-2 mt-1 rounded-[6px] md:px-2 px-0 py-1.5 text-[13px] md:text-[16px] text-white cursor-pointer flex justify-center items-center"
                    onClick={handleAddToCart}
                >
                    <FiShoppingCart className="md:w-[18px] w-[14px] h-[14px] md:h-[18px] text-white md:mr-2 mr-1 font-bold " />
                    {t("Add")}
                </button>
            )}

            <div className="flex items-center text-black mt-2">
                <div className="flex items-center mr-2">
                    <FaStar className="text-[#F38529] md:text-xl text-sm" />
                    <FaStar className="text-[#F38529] md:text-xl text-sm" />
                    <FaStar className="text-[#F38529] md:text-xl text-sm" />
                    <FaStar className="text-[#F38529] md:text-xl text-sm" />
                    <FaStar className="text-[#F38529] md:text-xl text-sm" />
                </div>
                <span className="text-sm">(4.5)</span>
            </div>
        </div>
    );
};

export default GroceryCatories;