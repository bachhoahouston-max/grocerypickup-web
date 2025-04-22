import React from 'react';

function ReturnPolicy() {
    return (
        <div className="relative min-h-screen">
            <img
                src="./image12345.png"
                alt="Return Policy"
                className="h-20 md:h-full w-full"
            />
            <div className="absolute top-[44px] md:top-14 left-1/2 transform -translate-x-1/2 flex justify-center items-center ">
                <p className="text-black font-bold text-[10px] md:text-[24px] p-2 bg-opacity-75 rounded lg:mt-3 ">
                    Return Policy
                </p>
            </div>
            <div className="text-black mx-auto text-start w-[80%] space-x-2 mb-4 mt-6 ">
                <p> ✅ 
                    At GroceryPickup Store , we strive to ensure every order meets your expectations. However, we understand that sometimes things can go wrong. That’s why we’ve made our return policy simple and fair.
               </p>
                    <p className='text-black pt-4 font-bold'>
                    🛒 What Can Be Returned? </p>
                <p>
                    We accept returns or replacements in the following cases:

                    Items that are damaged during delivery or pickup

                    Items that are expired or spoiled upon arrival

                    Items that were not what you ordered

                    <p className='text-black pt-4 font-bold'>⏳ Return Window </p>   
                    You must report the issue within 48 hours of receiving the product.

                    Returns requested after 48 hours may not be accepted, especially for perishable goods.

                    <p className='text-black pt-4 font-bold'> 🚚 How to Request a Return </p>
                    Contact our support team via chat, phone, or email.

                    Provide your order number and a photo of the item.

                    Our team will review your request and arrange a replacement or refund.

                    <p className='text-black pt-4 font-bold'> 💳 Refunds & Replacements </p>  
                    Refunds will be issued to your original payment method or as store credit, based on your preference.

                    For damaged or incorrect items, we may also offer free replacements.

                    <p className='text-black pt-4 font-bold'>  🚫 Non-returnable Items </p>  
                    Fresh produce that was delivered in good condition

                    Opened or used products (unless proven damaged/expired)

                    Items returned after the allowed window

                    <p className='text-black pt-4 font-bold'>   ✅ Customer Satisfaction First </p> 
                    We aim to provide high-quality service and fresh products. If something doesn’t feel right, we’re here to help — your satisfaction is our top priority.</p>
            </div>
        </div>
    );
}

export default ReturnPolicy;