import React, { useContext } from 'react';
import { FaStar } from "react-icons/fa6";
import { FiShoppingCart } from "react-icons/fi";
import { useRouter } from "next/router";
import { cartContext, openCartContext } from "@/pages/_app";
import { produce } from "immer";

const GroceryCatories = ({ item, i, url }) => {
    const router = useRouter();
    const [cartData, setCartData] = useContext(cartContext);
    const [openCart, setOpenCart] = useContext(openCartContext);

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
                price:price,
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
        console.log(updatedCart)
        localStorage.setItem("addCartDetail", JSON.stringify(updatedCart));
        setOpenCart(true);
    };

    return (
        <>
            <div 
                key={i} 
                className="bg-white w-[280px] md:w-full h-full md:h-[389px] rounded-lg p-2 hover:translate-y-[-10px] transition-all duration-500 border items-center flex flex-col mt-2 relative"
            >
                <div className='bg-gray-200 p-2 relative'>
                    <img
                        src={item.varients[0].image[0]}
                        alt="Product image"
                        className="w-full h-44 object-cover rounded cursor-pointer"
                        onClick={() => {
                            router.push(url);
                        }}
                    />
                    <div className=''>
                        <img src="bag2.png" alt="Bag" className="absolute bottom-[-55px] left-1/2 transform -translate-x-1/2 flex justify-center w-[65px] h-[90px] p-2"/>
                    </div>
                </div>
                
                <h2 className="text-xs text-gray-400 font-normal mt-8">
                    {item.categoryName}
                </h2>
                <p className="text-base text-black font-semibold pt-1">
                    {item.name}
                </p>
                <div className="flex justify-between items-center pt-1">
                    <p className="text-custom-green text-xl font-semibold">
                        ${item.price_slot[0].our_price}
                        <del className="font-medium text-sm text-custom-gray ml-2">
                            ${item.price_slot[0].other_price}
                        </del>
                    </p>
                </div> 
                <button
                    className="font-bold py-[8px] w-[90px] rounded-[2px] text-[16px] text-black flex justify-center items-center"
                    onClick={() => handleAddToCart(item)}
                >
                    <FiShoppingCart className="w-[16px] h-[16px] text-custom-purple mr-2 font-bold" />
                    Add
                </button>
                <div className="flex items-center text-black ">
                    <div className="flex items-center mr-2">
                        <FaStar className="text-yellow-500 text-xl" />
                        <FaStar className="text-yellow-500 text-xl" />
                        <FaStar className="text-yellow-500 text-xl" />
                        <FaStar className="text-yellow-500 text-xl" />
                        <FaStar className="text-yellow-500 text-xl" />
                    </div>
                    (4.5)
                </div>
            </div>
        </>
    );
};

export default GroceryCatories;