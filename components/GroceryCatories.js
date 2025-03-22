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

const GroceryCatories = ({ item, i, url, toaster, loader }) => {
    const router = useRouter();
    const [cartData, setCartData] = useContext(cartContext);
    const [openCart, setOpenCart] = useContext(openCartContext);
    const [productsId, setProductsId] = useState([]);
    const [user] = useContext(userContext);
    const [isFavorite, setIsFavorite] = useState(false);
    const [Favorite, setFavorite] = useContext(favoriteProductContext);

    const handleAddToCart = (item) => {
        let updatedCart = [...cartData];
        const existingItemIndex = updatedCart.findIndex((f) => f._id === item?._id);
        const price = parseFloat(item?.price_slot[0]?.our_price);

        if (existingItemIndex === -1) {
            const newItem = {
                ...item,
                selectedColor: item?.varients[0],
                image: item?.varients[0]?.image[0],
                total: price,
                our_price: item?.price_slot[0]?.our_price,
                other_price: item?.price_slot[0]?.other_price,
                price: price,
                value: item?.price_slot[0]?.value,
                qty: 1,
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
        if (user?.token) {
            getProductById();
        }
        
    }, [user]);

    useEffect(() => {
        // Fix: Check if productsId is an array before using .some()
        if (Array.isArray(productsId)) {
            const isProductFavorite = productsId.some((product) => product?.product?._id === item?._id);
            setIsFavorite(isProductFavorite);
        } else {
            setIsFavorite(false);
        }
    }, [productsId, item?._id]);

    const getProductById = async () => {
        Api("get", "getFavourite", "", router).then(
            (res) => {
                // Ensure we're setting an array
                setProductsId(Array.isArray(res.data) ? res.data : []);
            },
            (err) => {
                console.log(err);
                setProductsId([]);  // Set empty array on error
            }
        );
    };

    // const getProductBySlug = async () => {
    //     let url = `getProductByslug/${router?.query?.id}`;
    //     if (user?.token) {
    //         url = `getProductByslug/${router?.query?.id}?user=${user?._id}`;
    //     }
    //     // loader(true);
    //     Api("get", url, "", router).then(
    //         (res) => {
    //             // loader(false);
    //             // Ensure we're setting an array
    //             setProductsId(Array.isArray(res.data) ? res.data : []);
    //         },
    //         (err) => {
    //             // loader(false);
    //             console.log(err);
    //             setProductsId([]);  // Set empty array on error
    //             // toaster({ type: "error", message: err?.message });
    //         }
    //     );
    // };

    const addremovefavourite = () => {
        if (!user?.token) {
            return;
        }
        let data = {
            product: item?._id,
        };
        Api("post", "addremovefavourite", data, router).then(
            (res) => {
                if (res.status) {
                    if (isFavorite) {
                        setFavorite((prevFavorites) =>
                            prevFavorites.filter(fav => fav._id !== item._id)
                        );
                    } else {
                        setFavorite((prevFavorites) => [...prevFavorites, item]);
                    }
                    getProductById(); // Refresh the favorite products
                }
            },
            (err) => {
                console.log(err);
            }
        );
    };

    // Check if the item is in the cart and get its quantity
    const cartItem = cartData.find((cartItem) => cartItem._id === item._id);
    const itemQuantity = cartItem ? cartItem.qty : 0;

    return (
        <div
            key={i}
            className="bg-white w-full max-w-[350px] h-full md:h-[389px] rounded-lg md:p-2 p-1 hover:translate-y-[-10px] transition-all duration-500 border items-center flex flex-col mt-2 relative"
        >
            <div className='relative'>
                <img
                    src={item.varients[0].image[0]}
                    alt="Product image"
                    className="w-full p-1 h-44 object-cover rounded cursor-pointer"
                    onClick={() => {
                        router.push(url);
                    }}
                />
                <div className='absolute rounded-full bottom-[-22px] left-1/2 transform -translate-x-1/2 bg-gray-200 w-[45px] h-[45px] flex justify-center items-center md:mb-1 mb-2'
                    onClick={addremovefavourite}
                >
                    {isFavorite ? (
                        <FaHeart className="text-red-700 w-[23px] h-[23px]" />
                    ) : (
                        <FaRegHeart className="text-black w-[23px] h-[23px]" />
                    )}
                </div>
            </div>

            <h2 className="text-xs text-gray-400 font-normal mt-4 md:mt-8">
                {item.categoryName}
            </h2>
            <p className="text-sm md:text-base text-black font-semibold pt-1">
                {item.name}
            </p>

            <div className="flex justify-between items-center pt-1">
                <p className="text-custom-gold text-lg md:text-xl font-semibold">
                    ${item.price_slot[0].our_price}
                    <del className="font-medium text-sm text-custom-black ml-2">
                        ${item.price_slot[0].other_price}
                    </del>
                </p>
            </div>

            {itemQuantity > 0 ? (
                <div className="bg-custom-offWhite w-[100px] h-[32px] rounded-[8px] md:mt-2 mt-2 flex items-center">
                    <div
                        className=" bg-custom-gold cursor-pointer rounded-[8px] rounded-r-none flex justify-center px-2 py-1.5 items-center"
                        onClick={() => {
                            if (itemQuantity > 1) {
                                handleRemoveFromCart(item)
                            }
                        }}
                    >
                        <IoRemoveSharp className="h-[23px] w-[25px] text-white" />
                    </div>
                    <p className="text-black md:text-xl text-lg font-medium text-center px-3 py-0.5 border-y-2 border-y-gray-200">
                        {itemQuantity}
                    </p>
                    <div
                        className="px-2 py-1.5 bg-custom-gold cursor-pointer rounded-[8px] rounded-l-none flex justify-center items-center"
                        onClick={() => {
                            handleAddToCart({ ...item, qty: itemQuantity + 1 });
                        }}
                    >
                        <IoAddSharp className="h-[23px] w-[25px] text-white" />
                    </div>
                </div>
            ) : (
                <button
                    className="font-bold bg-custom-gold w-[90px] mt-2 rounded-[6px] px-4 py-1.5 text-[14px] md:text-[16px] text-black flex justify-center items-center"
                    onClick={() => handleAddToCart(item)}
                >
                    <FiShoppingCart className="w-[18px] h-[18px] text-custom-black mr-2 font-bold" />
                    Add
                </button>
            )}

            <div className="flex items-center text-black mt-2">
                <div className="flex items-center mr-2">
                    <FaStar className="text-yellow-500 text-xl" />
                    <FaStar className="text-yellow-500 text-xl" />
                    <FaStar className="text-yellow-500 text-xl" />
                    <FaStar className="text-yellow-500 text-xl" />
                    <FaStar className="text-yellow-500 text-xl" />
                </div>
                <span className="text-sm">(4.5)</span>
            </div>
        </div>
    );
};

export default GroceryCatories;