import { Api } from "@/services/service";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

function Mybooking(props) {
    const router = useRouter();
    const [bookingsData, setBookingsData] = useState([]);
    const [expandedBookingId, setExpandedBookingId] = useState(null);



    useEffect(() => {
        getBookingsByUser();
    }, []);

    const getBookingsByUser = async () => {
        props.loader(true);
        Api("get", "getProductRequestbyUser", "", router).then(
            (res) => {
                props.loader(false);
                console.log("res================>", res);
                setBookingsData(res.data);
            },
            (err) => {
                props.loader(false);
                console.log(err);
                props.toaster({ type: "error", message: err?.message });

            }
        );
    };

    const toggleBooking = (id) => {
        setExpandedBookingId(expandedBookingId === id ? null : id);
    };



    function formatDate(date) {
        if (!date) return null; // Handle null or undefined dates
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(date).toLocaleDateString('en-US', options);
    }


const groupedBookings = bookingsData.reduce((acc, booking) => {
    if (!acc[booking._id]) {
        acc[booking._id] = {
            ...booking,
            products: []
        };
    }
    acc[booking._id].products.push(booking.productDetail);
    return acc;
}, {});


const groupedBookingsArray = Object.values(groupedBookings);

    return (
        <>
            <div className="mx-auto max-w-7xl py-12">
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-center text-[35px] md:text-[45px] font-semibold text-black mb-2">
                        My
                        <span className="ml-2 text-[35px] md:text-[45px] font-semibold mb-4 text-custom-green">
                            Order
                        </span>
                    </h1>
                    <p className="md:px-0 px-12 text-center text-[16px] mb-6 w-full md:w-[40%] text-black">
                        {" "}
                        View and manage all your order in one place.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mx-6 md:mx-auto md:gap-12 gap-8 max-w-6xl">
                    {groupedBookingsArray && groupedBookingsArray.length > 0 ? (
                        groupedBookingsArray.map((booking, key) => (
                            <div key={key} className="bg-white p-4 rounded-md border-2 border-[#999999] h-auto self-start">
                                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleBooking(booking._id)}>
                                    <div className="flex flex-col justify-start w-full">
                                        <div className="flex flex-row justify-between items-center mb-4">
                                            <div className="bg-custom-green text-black rounded-full h-[50px] w-[50px] flex items-center justify-center mr-3 text-[24px]">
                                                {key + 1}
                                            </div>
                                            <div className="flex items-center">
                                                {expandedBookingId === booking._id ? (
                                                    <IoIosArrowUp className="text-2xl text-black" />
                                                ) : (
                                                    <IoIosArrowDown className="text-2xl text-black" />
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-[18px] text-black md:text-[24px]">My Booking ({formatDate(booking.createdAt) || "N/A"})</p>
                                    </div>
                                </div>

                                <div className={expandedBookingId === booking._id ? "block mt-4" : "hidden"}>
                                    <div className="grid md:grid-cols-3 grid-cols-1 w-full gap-5 bg-white p-3 rounded-[10px] border border-gray-200">
                                        {booking.products.map((product, index) => (
                                            <div key={index} className="col-span-2 flex gap-5"
                                                onClick={() => { router.push(`/myorder/${booking._id}?product_id=${product._id}`) }}
                                            >
                                                <img
                                                    className="w-20 h-20 text-gray-600 rounded-[10px] object-contain border border-gray-200"
                                                    src={product.image?.[0] || "/api/placeholder/100/100"}
                                                    alt="Product"
                                                />
                                                <div>
                                                    <p className="text-black text-base font-bold">
                                                        {product.product?.name || "Product Name"}
                                                    </p>
                                                    <p className="text-gray-600 text-xs font-bold pt-[6px]">
                                                        Quantity: {product.qty || 1}
                                                    </p>
                                                    <p className="text-gray-600 text-xs font-bold pt-[6px]">
                                                        Order Id: {booking._id || 1}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex flex-col justify-center items-end">
                                            <p className="text-gray-600 text-base font-bold">
                                               Total: $ {booking.total || "0.00"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No bookings available.</p>
                    )}
                </div>
            </div>


        </>
    );
}

export default Mybooking;