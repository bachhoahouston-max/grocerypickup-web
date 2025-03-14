import { Api } from "@/services/service";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { RxCrossCircled } from "react-icons/rx";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";

function Mybooking(props) {
    const router = useRouter();
    const [bookingsData, setBookingsData] = useState([]);
    const [expandedBookingId, setExpandedBookingId] = useState(null);
    const [showReviews, setShowReviews] = useState(false);
    const [reviewsData, setReviewsData] = useState({
        description: "",
        reviews: 0,
    });
    const [productId, setProductId] = useState("");
    const [reviews, setReviews] = useState("product");
    const [sellerId, setSellerId] = useState("");

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

    const openReviewModal = (id) => {
        setProductId(id);
        setShowReviews(true);
    };

    const createProductReview = (e) => {
        e.preventDefault();
        if (reviewsData?.reviews === 0) {
            props.toaster({ type: "success", message: "Rating is required" });
            return;
        }

        let data = {
            description: reviewsData?.description,
            rating: reviewsData?.reviews,
        };

        if (reviews === "product") {
            data.product = productId;
        } else {
            data.seller = sellerId;
        }

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
                    props.toaster({ type: "success", message: res.data?.message });
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
    const sr = 1;
    
    return (
        <>
            <div className="mx-auto max-w-7xl py-12">
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-center text-[35px] md:text-[45px] font-semibold text-black mb-2">
                        My
                        <span className="ml-2 text-[35px] md:text-[45px] font-semibold mb-4 text-custom-green">
                            Bookings !
                        </span>
                    </h1>
                    <p className="md:px-0 px-12 text-center text-[16px] mb-6 w-full md:w-[40%] text-black">
                        {" "}
                        View and manage all your bookings in one place. Leave reviews for products you've purchased.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mx-6 md:mx-auto md:gap-12 gap-8 max-w-6xl">
                    {bookingsData && bookingsData.length > 0 ? (
                        bookingsData.map((booking) => (
                            <div key={booking._id} className="bg-white p-4 rounded-md border-2 border-[#999999] h-auto self-start">
                                <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleBooking(booking._id)}>
                                    <div className="flex flex-col justify-start w-full">
                                        <div className="flex flex-row justify-between items-center mb-4">
                                            <div className="bg-custom-green text-white rounded-full h-[50px] w-[50px] flex items-center justify-center mr-3 text-[24px]">
                                               {sr}
                                            </div>
                                            <div className="flex items-center">
                                                <button 
                                                    className="bg-custom-green text-white px-4 py-2 rounded-md mr-4 text-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openReviewModal(booking.productDetail?._id);
                                                    }}
                                                >
                                                    Review
                                                </button>
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
                                        <div className="col-span-2 flex gap-5"
                                        onClick={() => { router.push(`/myorder/${booking?._id}?product_id=${booking?.productDetail?._id}`) }}
                                        >
                                            <img
                                                className="w-20 h-20 text-gray-600 rounded-[10px] object-contain border border-gray-200"
                                                src={booking?.productDetail?.image?.[0] || "/api/placeholder/100/100"}
                                                alt="Product"
                                            />
                                            <div>
                                                <p className="text-black text-base font-bold">
                                                    {booking?.productDetail?.product?.name || "Product Name"}
                                                </p>
                                                {/* {booking?.productDetail?.color && (
                                                    <div className="flex justify-start items-center pt-[6px]">
                                                        <p className="text-gray-600 text-xs font-bold">
                                                            Color:
                                                        </p>
                                                        <p
                                                            className="h-[10px] w-[10px] text-gray-600 rounded-full border border-black ml-2"
                                                            style={{
                                                                backgroundColor: booking?.productDetail?.color,
                                                            }}
                                                        ></p>
                                                    </div>
                                                )} */}
                                                <p className="text-gray-600 text-xs font-bold pt-[6px]">
                                                    Quantity: {booking?.productDetail?.qty || 1}
                                                </p>
                                                <p className="text-gray-600 text-xs font-bold pt-[6px]">
                                                    Order ID: {booking?._id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center items-end">
                                            <p className="text-gray-600 text-base font-bold">
                                                $ {booking?.total || "0.00"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex justify-center items-center md:mt-5 w-full md:h-[300px] h-[200px] col-span-2">
                            <p className="text-center text-black text-2xl">
                                No bookings available.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* {showReviews && (
                <div className="fixed top-0 left-0 w-screen h-screen bg-black/30 flex justify-center items-center z-50">
                    <div className="relative w-[300px] md:w-[360px] h-auto bg-white rounded-[15px] m-auto">
                        <div
                            className="absolute top-2 right-2 p-1 rounded-full text-black w-8 h-8 cursor-pointer"
                            onClick={() => {
                                setShowReviews(false);
                            }}
                        >
                            <RxCrossCircled className="h-full w-full font-semibold" />
                        </div>

                        <form className="px-5 py-5" onSubmit={createProductReview}>
                            <p className="text-black font-bold text-2xl mb-5">Reviews</p>

                            <div className="flex justify-center items-center mb-5 gap-5">
                                <button
                                    type="button"
                                    className={`h-[30px] w-32 rounded-[5px] text-black font-semibold text-sm ${
                                        reviews === "product"
                                            ? "underline underline-offset-8"
                                            : ""
                                    } `}
                                    onClick={() => {
                                        setReviews("product");
                                    }}
                                >
                                    Product
                                </button>
                                <button
                                    type="button"
                                    className={`h-[30px] w-32 rounded-[5px] text-black font-semibold text-sm ${
                                        reviews === "product"
                                            ? ""
                                            : "underline underline-offset-8"
                                    }`}
                                    onClick={() => {
                                        setReviews("seller");
                                    }}
                                >
                                    Seller
                                </button>
                            </div>

                            <div className="flex flex-col justify-center items-center border border-custom-newGray rounded-[10px] py-3 mb-5">
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
                                                style={{ opacity: 0.55 }}
                                                fontSize="inherit"
                                            />
                                        }
                                    />
                                </Box>
                                <p className="text-custom-newGrayColors font-bold text-center text-base mt-2">
                                    Rated {Number(reviewsData?.reviews || 0)?.toFixed(1)}/5.0
                                </p>
                            </div>

                            <div className="w-full">
                                <textarea
                                    className="bg-white md:w-full w-full px-5 py-2 rounded-[10px] border border-custom-newGray font-normal text-base text-black outline-none md:my-5 my-3"
                                    rows={4}
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
                                    className="bg-custom-purple w-full md:h-[50px] h-[40px] rounded-[5px] text-white font-normal text-base"
                                    type="submit"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )} */}
        </>
    );
}

export default Mybooking;