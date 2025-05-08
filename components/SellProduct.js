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

const SellProduct = ({ item, i, url, loader, toaster }) => {
    const router = useRouter();
    const { t } = useTranslation()
    const [cartData, setCartData] = useContext(cartContext);
    const [openCart, setOpenCart] = useContext(openCartContext);
    const [productsId, setProductsId] = useState([]);
    const [user] = useContext(userContext);
    const [isFavorite, setIsFavorite] = useState(false);
    const [saleData, setSaleData] = useState([])

    const handleAddToCart = (item) => {
        let updatedCart = [...cartData];
        const existingItemIndex = updatedCart.findIndex((f) => f._id === item?._id);
        const price = parseFloat(sellprice);
        if (existingItemIndex === -1) {
            const newItem = {
                ...item,
                selectedColor: item?.varients[0],
                image: item?.varients[0]?.image[0],
                total: price,
                qty: 1,
                price_slot: {
                    our_price: price,
                    other_price: item?.price_slot?.other_price,
                },
            };
            updatedCart.push(newItem);
        } else {
            const nextState = produce(updatedCart, (draft) => {
                draft[existingItemIndex].qty += 1;
                draft[existingItemIndex].total = (price * draft[existingItemIndex].qty).toFixed(2);
            });
            updatedCart = nextState;
        }

        setCartData(updatedCart);
        localStorage.setItem("addCartDetail", JSON.stringify(updatedCart));
    };

    const handleRemoveFromCart = (item) => {
        let updatedCart = [...cartData];
        const existingItemIndex = updatedCart.findIndex((f) => f._id === item?._id);
        const price = parseFloat(item?.price_slot[0]?.our_price);

        if (existingItemIndex !== -1) {
            const nextState = produce(updatedCart, (draft) => {
                if (draft[existingItemIndex].qty > 1) {
                    draft[existingItemIndex].qty -= 1;
                    draft[existingItemIndex].total = (price * draft[existingItemIndex].qty).toFixed(2);
                } else {

                    draft.splice(existingItemIndex, 1);
                }
            });
            updatedCart = nextState;
        }

        setCartData(updatedCart);
        localStorage.setItem("addCartDetail", JSON.stringify(updatedCart));
    };

    useEffect(() => {
        getSale();
    }, []);

    const getSale = async () => {
        loader(true);

        Api("get", "getFlashSale", router).then(
            (res) => {
                loader(false);
                if (res.status) {
                    setSaleData(res.data)
                    console.log("dfghj", res.data)
                }
            },
            (err) => {
                loader(false);
                console.log(err);
                // toaster({ type: "error", message: err?.message });
            }
        );
    };


    const cartItem = cartData.find((cartItem) => cartItem._id === item._id);
    const itemQuantity = cartItem ? cartItem.qty : 0;

    const convertedSellPrice = saleData.map((data) => data?.price);
    const sellprice = convertedSellPrice.map((price) => Number(price));

    return (
        <div
            key={i}
            className="bg-white w-full max-w-[350px] h-full md:h-[389px] rounded-lg md:p-2 p-1 hover:translate-y-[-10px] transition-all duration-500 border items-center flex flex-col mt-2 relative"
        >
            <div className='relative'>
                <img
                    src={item.varients[0].image[0]}
                    alt="Product image"
                    className="w-full p-1 md:h-44 h-36 object-cover rounded cursor-pointer"
                />

            </div>

            <h2 className="text-xs text-gray-400 font-normal mt-4 md:mt-8">
                {item.categoryName}
            </h2>
            <p className="text-sm md:text-base text-black font-semibold pt-1">
                {item.name}
            </p>

            <div className="flex justify-between items-center md:pt-1 pt-0">
                <p className="text-custom-gold text-lg md:text-xl font-semibold">
                    ${sellprice}
                    <del className="font-medium text-sm text-custom-black ml-2">
                        ${item.price_slot[0].our_price}
                    </del>
                </p>
            </div>

            {itemQuantity > 0 ? (
                <div className="bg-custom-offWhite w-[100px] h-[32px] rounded-[8px] md:mt-2 mt-1 flex items-center">
                    <div
                        className="bg-custom-gold cursor-pointer rounded-[8px] rounded-r-none flex justify-center md:px-2 px-1 py-1.5 items-center"
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
                        className="md:px-2 px-1 py-1.5 bg-custom-gold cursor-pointer rounded-[8px] rounded-l-none flex justify-center items-center"
                        onClick={() => {
                            handleAddToCart({ ...item, qty: itemQuantity + 1 });
                        }}
                    >
                        <IoAddSharp className="md:h-[23px] h-[20px] w-[20px] md:w-[25px] text-white" />
                    </div>
                </div>
            ) : (
                timeLeft ? (
                    <button
                        className="font-bold bg-custom-gold w-[120px] md:mt-2 mt-1 rounded-[6px] md:px-2 px-0 py-1.5 text-[13px] md:text-[16px] text-white cursor-pointer flex justify-center items-center"
                        onClick={handleAddToCart}
                    >
                        <FiShoppingCart className="md:w-[18px] w-[14px] h-[14px] md:h-[18px] text-white md:mr-2 mr-1 font-bold" />
                        {t("Add")}
                    </button>
                ) : (
                    <div className="w-[120px] md:mt-2 mt-1 py-1.5 text-[13px] md:text-[16px] text-gray-500 flex justify-center items-center border border-gray-300 rounded-[6px]">
                        {t("Start Soon")}
                    </div>
                )
            )}


            <div className="flex items-center text-black mt-2">
                <div className="flex items-center mr-2">
                    <FaStar className="text-yellow-500 md:text-xl text-sm" />
                    <FaStar className="text-yellow-500 md:text-xl text-sm" />
                    <FaStar className="text-yellow-500 md:text-xl text-sm" />
                    <FaStar className="text-yellow-500 md:text-xl text-sm" />
                    <FaStar className="text-yellow-500 md:text-xl text-sm" />
                </div>
                <span className="text-sm">(4.5)</span>
            </div>
        </div>
    );
};

export default SellProduct;