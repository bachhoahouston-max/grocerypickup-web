import { Api } from "@/services/service";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { useRef } from "react";
import { IoIosArrowDown, IoIosArrowUp, IoIosClose } from "react-icons/io"; // Import IoIosClose
import { userContext } from "./_app";
import { GoDownload } from "react-icons/go";
import generatePDF, { usePDF, Margin } from "react-to-pdf";
import ReactToPrint from "react-to-print";
import { useTranslation } from "react-i18next";
import Invoice from "../components/Invoice"
import Swal from 'sweetalert2';

function Mybooking(props) {
    const ref = useRef();
    const { t } = useTranslation();
    const router = useRouter();
    const [user, setUser] = useContext(userContext)
    const [bookingsData, setBookingsData] = useState([]);
    const [expandedBookingId, setExpandedBookingId] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [parkingNo, setParkingNo] = useState("");
    const [carColor, setCarColor] = useState("");
    const [carBrand, setCarBrand] = useState("");
    const [Id, setId] = useState("")
    const [otp, setOtp] = useState("")
    const [isGenerating, setIsGenerating] = useState(false);

    const toggleModal = (id) => {
        setId(id)
        setIsOpen(!isOpen);
    }

    let secretCode = Math.floor(1000 + Math.random() * 9000);

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            parkingNo,
            carColor: carColor,
            carBrand: carBrand,
            id: Id,
            SecretCode: secretCode
        };

        console.log(data);
        props.loader(true);

        Api("post", "updateProductRequest", data, router)
            .then((res) => {
                props.loader(false);

                if (res.status) {
                    props.toaster({ type: "success", message: "Delivery Details Added Successfully" });
                    getBookingsByUser();
                    setIsOpen(false);
                    setParkingNo('');
                } else {
                    props.toaster({ type: "error", message: "Failed to Add Parking No." });
                }
            })
            .catch((err) => {
                props.loader(false);
                console.log(err);
                props.toaster({ type: "error", message: err?.message });
            });
    };



    const cancelOrder = (id) => {

        Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to cancel your order?",
            showCancelButton: true,
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No, keep it',
            confirmButtonColor: "#F38529",
            cancelButtonColor: "#F38529",
        }).then((result) => {
            if (result.isConfirmed) {
                const data = { id };
                props.loader(true);
                Api("post", "cancalOrder", data, router)
                    .then((res) => {
                        props.loader(false);
                        if (res.status) {
                            props.toaster({ type: "success", message: "Order canceled successfully" });
                            getBookingsByUser();
                        } else {
                            props.toaster({ type: "error", message: res.message || "Failed to cancel order" });
                        }
                    })
                    .catch((err) => {
                        props.loader(false);
                        console.log(err);
                        props.toaster({ type: "error", message: err?.message || "Something went wrong" });
                    });
            }
        });
    };

    const ReturnOrder = (id) => {

        Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to Return your order?",
            showCancelButton: true,
            confirmButtonText: 'Yes, Return it!',
            cancelButtonText: 'No, keep it',
            confirmButtonColor: "#F38529",
            cancelButtonColor: "#F38529",
        }).then((result) => {
            if (result.isConfirmed) {
                const data = { id };
                props.loader(true);
                Api("post", "RequestForReturn", data, router)
                    .then((res) => {
                        props.loader(false);
                        if (res.status) {
                            props.toaster({ type: "success", message: res.message });
                            getBookingsByUser();
                        } else {
                            props.toaster({ type: "error", message: res.message || "Failed to cancel order" });
                        }
                    })
                    .catch((err) => {
                        props.loader(false);
                        console.log(err);
                        props.toaster({ type: "error", message: err?.message || "Something went wrong" });
                    });
            }
        });
    };

    const toggleModal2 = (id) => {
        setId(id)
        getSecrectCode()
    }
    let secretCode1 = Math.floor(1000 + Math.random() * 9000);

    const getSecrectCode = () => {

        const data = {
            id: Id,
            SecretCode: secretCode1
        };

        console.log(data);
        props.loader(true);

        Api("post", "getSecrectCode", data, router)
            .then((res) => {
                props.loader(false);

                if (res.status) {
                    props.toaster({ type: "success", message: "Secret Code Send Successfully" });
                    getBookingsByUser();
                    setIsOpen(false);
                    setParkingNo('');
                } else {
                    props.toaster({ type: "error", message: "Failed to Send Secret Code" });
                }
            })
            .catch((err) => {
                props.loader(false);
                console.log(err);
                props.toaster({ type: "error", message: err?.message });
            });
    };


    useEffect(() => {
        getBookingsByUser();
    }, []);


    const getBookingsByUser = async () => {
        props.loader(true);
        Api("get", "getProductRequestbyUser ", "", router).then(
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

    function formatDate2(dateInput) {
        const date = new Date(dateInput);
        const options = { day: 'numeric', month: 'short' }; // e.g., "21 Apr"
        return date.toLocaleDateString('en-GB', options);
    }

    const isDriveUp = bookingsData?.some(order => order?.isDriveUp === true);

    return (
        <>
            <div className="mx-auto max-w-7xl py-12 min-h-screen">
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-center text-[35px] md:text-[45px] font-semibold text-black mb-2">
                        {t("My")}
                        <span className="ml-2 text-[35px] md:text-[45px] font-semibold mb-4 text-custom-green">
                            {t("Order")}
                        </span>
                    </h1>
                    <p className="md:px-0 px-12 text-center text-[16px] mb-6 w-full md:w-[40%] text-black">
                        {t("View and manage all your order in one place")}.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mx-2 md:mx-auto md:gap-4 gap-4 max-w-6xl">
                    {bookingsData && bookingsData.length > 0 ? (
                        bookingsData.map((booking, key) => (
                            <div key={key} className="bg-white rounded-lg shadow-md border border-gray-200 hover:border-gray-300 transition-all mb-2 p-1">
                                {/* Header - Order ID and Date */}
                                <div className="bg-gray-50 p-4 rounded-t-lg">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-custom-green text-white rounded-full h-10 w-10 flex items-center justify-center font-semibold">
                                                {key + 1}
                                            </div>
                                            <h3 className="text-sm md:text-lg font-medium text-gray-800">
                                                {t("My Order")} - <span className="text-gray-600">{formatDate(booking.createdAt) || "N/A"}</span>
                                            </h3>
                                        </div>
                                        <div className="flex justify-center items-center space-x-2">
                                            {(() => {
                                                switch (booking?.status) {
                                                    case 'Completed':
                                                        return (
                                                            <span className="px-3 md:w-full w-[110px] py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                                {t("Order Delivered")}
                                                            </span>
                                                        );
                                                    case 'Pending':
                                                        return (
                                                            <span className="px-3 md:w-full w-[110px] py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                                                                {t("Order Pending")}
                                                            </span>
                                                        );
                                                    case 'Return Requested':
                                                        return (
                                                            <span className="px-3 md:w-full w-[110px] py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                                {t("Order Return Requested")}
                                                            </span>
                                                        );
                                                    case 'Return':
                                                        return (
                                                            <span className="px-3 md:w-full w-[110px] py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                                {t("Order Returned")}
                                                            </span>
                                                        );
                                                    case 'Cancel':
                                                        return (
                                                            <span className="px-3 md:w-full w-[110px] py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                                                {t("Order Cancelled")}
                                                            </span>
                                                        );
                                                    default:
                                                        return null;
                                                }
                                            })()}


                                            <button onClick={() => toggleBooking(booking._id)} className="p-1 rounded-full hover:bg-gray-200">
                                                {expandedBookingId === booking._id ? (
                                                    <IoIosArrowUp className="text-xl text-gray-600" />
                                                ) : (
                                                    <IoIosArrowDown className="text-xl text-gray-600" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>


                                {(booking?.SecretCode || booking?.isShipmentDelivery || booking?.trackingNo) && (
                                    <div className="p-4 border-gray-200 bg-gray-50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {booking?.SecretCode && booking?.status === 'Pending' && (
                                                <div className="flex items-center">
                                                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">{t("Secret Code")}</p>
                                                        <p className="text-base font-medium text-gray-800">{booking.SecretCode}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {booking?.isShipmentDelivery && (
                                                <div className="flex items-center">
                                                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11a1 1 0 001-1v-1h2a1 1 0 001-1v-4a1 1 0 00-.293-.707l-2-2A1 1 0 0012 6h-1V5a1 1 0 00-1-1H3z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">{t("Delivery Expected")}</p>
                                                        <p className="text-base font-medium text-gray-800">
                                                            {formatDate2(new Date(new Date(booking.createdAt).setDate(new Date(booking.createdAt).getDate() + 3)))} 11 PM
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {booking?.trackingNo && booking?.trackingLink && (
                                                <div className="flex items-center md:col-span-2">
                                                    <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="text-sm text-gray-500">{t("Tracking Number")}</p>
                                                        <div className="flex items-center space-x-3">
                                                            <p className="text-[13px] font-medium text-gray-800">{booking.trackingNo}</p>

                                                        </div>
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="text-sm text-gray-500">{t("Company Name")}</p>
                                                        <div className="flex items-center space-x-3">
                                                            <p className="text-[13px] font-medium text-gray-800">{booking.trackingLink}</p>

                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="px-4 py-3 bg-white border-b border-gray-200">
                                    <div className="flex flex-wrap gap-2 justify-end">
                                        {(() => {
                                            const createdTime = new Date(booking.createdAt);
                                            const now = new Date();
                                            const diffInMinutes = (now - createdTime) / (1000 * 60);

                                            return booking?.status === 'Pending' && diffInMinutes <= 15;
                                        })() && (
                                                <div className="px-4 py-4 bg-white border-t border-gray-200 mt-4 flex justify-end">
                                                    <button
                                                        onClick={() => cancelOrder(booking._id)}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    >
                                                        {t("Cancel Order")}
                                                    </button>
                                                </div>
                                            )}
                                    </div>

                                    {booking?.status === 'Completed' && (booking?.isShipmentDelivery || booking?.isLocalDelivery) && (
                                        <div className="px-4 py-4 bg-white border-t border-gray-200 mt-4 flex justify-end">
                                            <button
                                                onClick={() => ReturnOrder(booking._id)}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium cursor-pointer rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                {t("Return Order")}
                                            </button>
                                        </div>
                                    )}


                                </div>
                                {/* Action Buttons */}
                                {booking?.status === 'Pending' && (booking?.isDriveUp || booking?.isOrderPickup) && (
                                    <div className=" px-4 py-3 bg-white border-b border-gray-200">
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            {booking?.isDriveUp && (
                                                <button
                                                    onClick={() => toggleModal(booking._id)}
                                                    className="px-4 py-2 bg-custom-gold hover:bg-yellow-600 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 cursor-pointer"
                                                >
                                                    {booking.parkingNo ? t("Update Parking Spot") : t("I'm here")}
                                                </button>
                                            )}

                                            {booking?.isOrderPickup && (
                                                <button
                                                    onClick={() => toggleModal2(booking._id)}
                                                    className="px-4 py-2 bg-custom-gold hover:bg-yellow-600 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                >
                                                    {t("I'm here")}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Expanded Order Details */}
                                <div className={expandedBookingId === booking._id ? "p-4" : "hidden"}>
                                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                                        {booking.productDetail.map((product, index) => (
                                            <div
                                                key={index}
                                                className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer ${index !== booking.productDetail.length - 1 ? 'border-b border-gray-200' : ''
                                                    }`}
                                                onClick={() => { router.push(`/myorder/${booking._id}?product_id=${product._id}`) }}
                                            >
                                                <div className="flex-shrink-0">
                                                    <img
                                                        className="w-16 h-16 rounded-md object-contain border border-gray-200 bg-white p-1"
                                                        src={product.image?.[0] || "/api/placeholder/100/100"}
                                                        alt={product.product?.name || "Product"}
                                                    />
                                                </div>
                                                <div className="ml-4 flex-grow">
                                                    <p className="text-gray-800 font-medium">
                                                        {product.product?.name.slice(0, 24) + ('...')}</p>
                                                    <div className="flex flex-col items-start mt-1 text-[14px] text-gray-600">
                                                        <span className="mr-4">{t("Quantity")}: {product.qty || 1}</span>
                                                        <span>{t("Order Id")}: {booking.orderId || 1}</span>
                                                    </div>
                                                </div>

                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Total */}
                                    <div className="mt-4 flex justify-end">
                                        <div className="bg-gray-50 px-6 py-3 rounded-lg border border-gray-200">
                                            <p className="text-sm text-gray-500">{t("Total")}</p>
                                            <p className="text-xl font-semibold text-gray-800">$ {booking.total || "0.00"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex justify-center items-center md:mt-5 w-full md:h-[300px] h-[200px] col-span-2">
                            <p className="text-center text-black text-2xl">
                                {t("No bookings available")}.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}

export default Mybooking;