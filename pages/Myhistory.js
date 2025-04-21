import { Api } from "@/services/service";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { RxCrossCircled } from "react-icons/rx";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";

function Myhistory(props) {
    const router = useRouter();
    const [bookingsData, setBookingsData] = useState([]);
    const [expandedHistoryId, setExpandedHistoryId] = useState(null);
    const [showReviews, setShowReviews] = useState(false);
    const [reviewsData, setReviewsData] = useState({
        description: "",
        reviews: 0,
    });
    const [productId, setProductId] = useState("");
    const [reviews, setReviews] = useState("product");
    const [sellerId, setSellerId] = useState("");

    useEffect(() => {
        getHistoryByUser();
    }, []);

    const getHistoryByUser = async () => {
        props.loader(true);
        Api("get", "getStatusCompletedProducts", "", router).then(
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
        setExpandedHistoryId(expandedHistoryId === id ? null : id);
    };

    const createProductRquest = (e) => {
        e.preventDefault();
        if (reviewsData?.reviews === 0) {
            props.toaster({ type: "success", message: "Rating is required" });
            return;
        }

        let data = {
            description: reviewsData?.description,
            product: productId,
            rating: reviewsData?.reviews,
        };

        // if (reviews === "product") {
        //     data.product = productId;
        // } else {
        //     data.seller = sellerId;
        // }

        console.log(data);
        props.loader(true);

        Api("post", "giverate", data, router).then(
            (res) => {
                props.loader(false);
                console.log("res================>", res);
                if (res.status) {
                    setShowReviews(false);
                    setReviewsData({
                        description: "",
                        reviews: 0,
                    });
                    setProductId("");
                    setSellerId("");
                    props.toaster({ type: "success", message: "Reviews Submitted Successfully" });
                } else {
                    props.toaster({ type: "error", message: res?.data?.message });
                }
            },
            (err) => {
                props.loader(false);
                console.log(err);
                props.toaster({ type: "error", message: err?.message });
            }
        );
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
            <div className="mx-auto max-w-7xl py-12 min-h-screen">
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-center text-[35px] md:text-[45px] font-semibold text-black mb-2">
                        My
                        <span className="ml-2 text-[35px] md:text-[45px] font-semibold mb-4 text-custom-green">
                            History !
                        </span>
                    </h1>
                    <p className="md:px-0 px-12 text-center text-[16px] mb-6 w-full md:w-[40%] text-black">
                        {" "}
                        View all your order History in one place. Leave reviews for products you've purchased.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mx-3 md:mx-auto md:gap-12 gap-8 max-w-6xl">
                    {groupedBookingsArray && groupedBookingsArray.length > 0 ? (
                        groupedBookingsArray.map((booking, key) => (
                            <div key={key} className="bg-white md:p-4 p-2.5 rounded-md border-2 border-[#999999] h-auto self-start">
                                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleBooking(booking._id)}>
                                    <div className="flex flex-col justify-start w-full">
                                        <div className="flex flex-row justify-between items-center mb-4">
                                            <div className="bg-custom-green text-white rounded-full 
                                            md:h-[50px] h-[40px] md:w-[50px] w-[40px] flex items-center justify-center mr-3 md:text-[24px] text-[18px]">
                                                {key + 1}
                                            </div>
                                            <div className="flex items-center">
                                                {expandedHistoryId === booking._id ? (
                                                    <IoIosArrowUp className="text-2xl text-black" />
                                                ) : (
                                                    <IoIosArrowDown className="text-2xl text-black" />
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-[16px] text-black md:text-[24px]">My History ({formatDate(booking.createdAt) || "N/A"})</p>
                                        <div className="flex flex-col justify-end items-end mr-3 mt-[-24px]">
                                            <p className="text-gray-600 md:text-base text-[15px] font-bold">
                                                Total: $ {booking?.total || "0.00"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className={expandedHistoryId === booking._id ? "block mt-4" : "hidden"}>
                                    <div className="grid md:grid-cols-3 grid-cols-1 w-full gap-5 bg-white md:p-3 p-1 rounded-[10px] border border-gray-200">
                                        {booking.products.map((product, index) => (
                                            <div className="relative col-span-3 flex md:gap-5 gap-2 " key={index}>
                                                <img
                                                    className="w-20 h-20 text-gray-600 rounded-[10px] object-contain border border-gray-200"
                                                    src={product?.image?.[0] || "/api/placeholder/100/100"}
                                                    alt="Product"
                                                />
                                                <div className="flex-grow">
                                                    <p className="text-black md:text-base text-[13px] font-bold">
                                                        {product?.product?.name}
                                                    </p>
                                                    <p className="text-gray-600 text-xs font-bold pt-[6px]">
                                                        Quantity: {product.qty || 1}
                                                    </p>
                                                    <p className="text-gray-600 text-xs font-bold pt-[6px]">
                                                        Order ID: {booking?._id}
                                                    </p>
                                                </div>
                                                <div className="justify-start items-start">
                                                    <button
                                                        className="absolute md:right-0 right-2 mt-2 mb-2 bg-custom-gold text-white px-4 py-1.5 rounded-md text-[14px]"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setProductId(product?.product);
                                                            console.log("abcd", product?._id);
                                                            setShowReviews(true);
                                                        }}
                                                    >
                                                        Review
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="flex justify-center items-center md:mt-5 w-full md:h-[300px] h-[200px] col-span-2">
                            <p className="text-center text-black text-2xl">
                                No history available.
                            </p>
                        </div>
                    )}

                    {showReviews && (
                        <div className="fixed top-0 left-0 w-screen h-screen bg-black/30 flex justify-center items-center z-50">
                            <div className="relative w-[300px] md:w-[360px] h-auto  bg-white rounded-[15px] m-auto">
                                <div
                                    className="absolute top-2 right-2 p-1 rounded-full  text-black w-8 h-8 cursor-pointer"
                                    onClick={() => {
                                        setShowReviews(false);
                                    }}
                                >
                                    <RxCrossCircled className="h-full w-full font-semibold " />
                                </div>

                                <form className="px-5 py-5" onSubmit={createProductRquest}>
                                    <p className="text-black font-bold text-2xl mb-5 mt-4 text-center">How many stars would you give to them?</p>


                                    <div className="flex flex-col justify-center items-center  rounded-[10px] py-1 ">
                                        <Box
                                            sx={{
                                                width: 200,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Rating
                                                name="text-feedback"
                                                value={reviewsData?.reviews}
                                                onChange={(e, value) => {
                                                    console.log(e, value);
                                                    setReviewsData({ ...reviewsData, reviews: value });
                                                }}
                                                precision={0.5}
                                                emptyIcon={
                                                    <StarIcon
                                                        sx={{ opacity: 0.55, fontSize: '40px' }} // Change the size here
                                                    />
                                                }
                                                icon={<StarIcon sx={{ fontSize: '40px' }} />} // Change the size here for filled stars
                                            />

                                            {/* <Box sx={{ ml: 2 }}>rating</Box> */}
                                        </Box>

                                    </div>

                                    <div className="w-full">
                                        <input
                                            className="bg-white md:w-full w-full px-5 py-2 border-b border-b-black font-normal  text-base text-black outline-none md:my-5 my-3"
                                            type="text"
                                            placeholder="Description"
                                            value={reviewsData.description}
                                            onChange={(e) => {
                                                setReviewsData({
                                                    ...reviewsData,
                                                    description: e.target.value,
                                                });
                                            }}
                                            required
                                        />
                                    </div>

                                    <div className="flex md:justify-start justify-center">
                                        <button
                                            className="bg-custom-gold w-full md:h-[50px] h-[40px] rounded-[5px] text-white font-normal text-base"
                                            type="submit"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Myhistory;