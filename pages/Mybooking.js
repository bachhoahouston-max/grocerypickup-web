import { Api } from "@/services/service";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { useRef } from "react";
import { IoIosArrowDown, IoIosArrowUp, IoIosClose } from "react-icons/io"; // Import IoIosClose
import { userContext } from "./_app";
import { GoDownload } from "react-icons/go";
import generatePDF, { usePDF, Margin } from "react-to-pdf";
import ReactToPrint from "react-to-print";

function Mybooking(props) {
    const ref = useRef();
    const router = useRouter();
    const [user, setUser] = useContext(userContext)
    const [bookingsData, setBookingsData] = useState([]);
    const [expandedBookingId, setExpandedBookingId] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [parkingNo, setParkingNo] = useState("");
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
            id: Id,
            SecretCode: secretCode
        };

        console.log(data);
        props.loader(true);

        Api("post", "updateProductRequest", data, router)
            .then((res) => {
                props.loader(false);

                if (res.status) {
                    props.toaster({ type: "success", message: "Parking No. Added Successfully" });
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
                        My
                        <span className="ml-2 text-[35px] md:text-[45px] font-semibold mb-4 text-custom-green">
                            Order
                        </span>
                    </h1>
                    <p className="md:px-0 px-12 text-center text-[16px] mb-6 w-full md:w-[40%] text-black">
                        View and manage all your order in one place.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mx-3 md:mx-auto md:gap-12 gap-4 max-w-6xl">
                    {bookingsData && bookingsData.length > 0 ? (
                        bookingsData.map((booking, key) => (
                            <div key={key} className="bg-white md:p-4 p-2.5 rounded-md border-2 border-[#999999] h-auto self-start">
                                <div className="flex items-center justify-between cursor-pointer" >
                                    <div className="flex flex-col justify-start w-full">
                                        <div className="flex flex-row justify-between items-center mb-2">
                                            <div className="bg-custom-green text-white rounded-full 
                                            md:h-[50px] h-[40px] md:w-[50px] w-[40px] flex items-center justify-center mr-1 md:text-[24px] text-[18px]">
                                                {key + 1}
                                            </div>
                                            {booking?.status === 'Completed' ? (
                                                <p className="">
                                                </p>
                                            ) : (
                                                booking?.SecretCode && (
                                                    <p className="px-2 py-2 md:text-[16px] text-[14px] text-black md:w-[440px] w-[230px]">
                                                        Secret Code is {booking.SecretCode}. Please do not share this with anyone.
                                                    </p>
                                                )
                                            )}
                                            {booking?.isShipmentDelivery && (
                                                <p className="text-black  md:text-[16px] text-[14px]">
                                                    Delivery expected by {formatDate2(new Date(new Date(booking.createdAt).setDate(new Date(booking.createdAt).getDate() + 3)))} 11 PM
                                                </p>
                                            )}


                                            <div className="flex items-center">

                                                <div>

                                                    <GoDownload className="text-black text-2xl"

                                                    />

                                                </div>

                                                <div>
                                                    {expandedBookingId === booking._id ? (
                                                        <IoIosArrowUp className="text-2xl text-black"
                                                            onClick={() => toggleBooking(booking._id)}
                                                        />
                                                    ) : (
                                                        <IoIosArrowDown className="text-2xl text-black"
                                                            onClick={() => toggleBooking(booking._id)} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <p className="text-[15px] text-black md:text-[20px]">My Order ({formatDate(booking.createdAt) || "N/A"})</p>
                                            {booking?.status === 'Completed' ? (
                                                <p className=" md:py-2 py-0 text-[15px] text-green-500 rounded">
                                                    Order Delivered
                                                </p>
                                            ) : booking?.status === 'Pending' ? (
                                                <>
                                                    <div className="flex md:flex-row flex-col">

                                                        {booking?.isDriveUp && (
                                                            <p
                                                                onClick={() => toggleModal(booking._id)}
                                                                className="px-3 py-1.5 bg-custom-gold md:text-[16px] md:mr-2 mr-0 text-[14px] text-white rounded"
                                                            >
                                                                {booking.parkingNo ? "Update Parking No." : "Parking No."}
                                                            </p>
                                                        )}
                                                        <p className="md:py-2 text-right pr-2  py-0 text-[16px] text-red-500 rounded">
                                                            Order Pending
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                (booking?.isLocalDelivery || booking?.isOrderPickup) && (
                                                    <p className="px-4 py-2 text-[16px] text-red-500 rounded">
                                                        Order Pending
                                                    </p>
                                                )
                                            )}

                                        </div>
                                    </div>
                                </div>

                                {isOpen && (
                                    <div className="fixed top-0 left-0 w-screen h-screen bg-black/10 flex justify-center items-center z-50">
                                        <div className="relative w-[320px] md:w-[400px] h-auto bg-white rounded-lg shadow-lg">
                                            <div className="p-6">
                                                <button
                                                    onClick={toggleModal}
                                                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                                                >
                                                    <IoIosClose className="text-2xl" />
                                                </button>
                                                <h2 className="text-xl font-bold mb-4 text-black text-center">Parking Information</h2>
                                                <form onSubmit={handleSubmit}>
                                                    <label htmlFor="parkingNo" className="block mb-2 text-black">
                                                        Parking No:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="parkingNo"
                                                        value={parkingNo} // Ensure value is controlled
                                                        onChange={(e) => setParkingNo(e.target.value)} // Ensure setParkingNo is defined
                                                        className="border text-black border-gray-300 rounded p-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-black"
                                                        placeholder="Enter Parking Number"
                                                        required
                                                    />
                                                    <div className="flex justify-end gap-4">
                                                        <button
                                                            type="button"
                                                            onClick={toggleModal}
                                                            className="px-4 py-2 text-black bg-gray-300 rounded hover:bg-gray-400 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className="px-4 py-2 bg-custom-gold text-white rounded hover:bg-gray-800 transition"
                                                        >
                                                            Submit
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className={expandedBookingId === booking._id ? "block mt-4" : "hidden"}>
                                    <div className="grid md:grid-cols-3 grid-cols-1 w-full gap-5 bg-white p-3 rounded-[10px] border border-gray-200">
                                        {booking.productDetail.map((product, index) => (
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
                        <p className="text-black">No bookings available.</p>
                    )}
                </div>

                <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    <div className="bg-white w-[1024px] text-gray-700  min-h-screen">
                        <div className='relative'>
                            <div className='absolute top-0 right-0 '>
                                <div className='bg-white h-[110px]  border-2 border-dashed px-4 pb-4 border-gray-400 w-full flex-col flex justify-center items-center '>
                                    <p className='text-[34px] text-gray-400 font-bold pb-2 mb-2 leading-3'>ORIGINAL</p>
                                    {/* <hr className='text-black'/> */}
                                    <p className='text-[18px] text-gray-400 m-0 border-t-2 border-t-gray-700 mt-4 w-[160px] text-center'>FOR Recipient</p>
                                </div>
                            </div>


                            <div className="w-full max-w-5xl mx-auto px-8 py-5">

                                <div className='flex justify-start'>
                                    <h1 className="text-gray-700 font-bold text-5xl mb-14">Tax Invoice</h1>
                                </div>

                                <div className='grid grid-cols-1 md:grid-cols-3 gap-10 mb-11 text-gray-600 mt-6'>
                                    {/* <div>
                                        {logoBase64 && (
                                            <Image
                                                src={logoBase64}
                                                alt="signature"
                                                width="240"
                                                height="100"
                                                className="object-contain "
                                            />
                                        )}
                                    </div> */}
                                    <div className='col-span-2'>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-11 text-gray-600">

                                            <div>
                                                <div className="text-lg font-semibold mb-3">INVOICE NUMBER</div>
                                                <div className="text-xl text-gray-900">{bookingsData.invoiceNumber}</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-semibold mb-3">DATE OF ISSUE</div>
                                                <div className="text-xl text-gray-900">{bookingsData.invoiceDate}</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-semibold mb-3">DUE DATE</div>
                                                <div className="text-xl text-gray-900">{bookingsData.dueDate}</div>
                                            </div>

                                        </div>

                                        {/* Billing Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-14 text-gray-600">
                                            <div>
                                                <div className="text-lg font-semibold mb-3">BILLED TO</div>
                                                <div className="text-xl text-gray-900 whitespace-pre-line">{bookingsData.billTo}</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-semibold mb-3">FROM</div>
                                                <div className="text-xl text-gray-900 whitespace-pre-line">{bookingsData.companyDetails}</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-semibold mb-3">PURCHASE ORDER</div>
                                                <div className="text-xl text-gray-900">{bookingsData.purchaseOrder}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-14">
                                    {/* Header Row */}
                                    <div className="flex text-gray-600 font-semibold border-b-2 border-gray-500 py-3 mb-4">
                                        <div className="w-1/2 text-lg">Description</div>
                                        <div className="w-1/6 text-right text-lg">Unit cost</div>
                                        <div className="w-1/6 text-right text-lg">QTY</div>
                                        <div className="w-1/6 text-right text-lg">Amount</div>
                                    </div>

                                    {/* Line Items */}
                                    <div className="border-b-2 border-gray-300 pb-4">
                                        {bookingsData?.productDetail?.map((item, index) => (
                                            <div key={index} className="flex text-gray-900 py-1">
                                                <div className="w-1/2 text-lg leading-relaxed">{item.description}</div>
                                                <div className="w-1/6 text-right text-lg">{item.unitCost}</div>
                                                <div className="w-1/6 text-right text-lg">{item.quantity}</div>
                                                <div className="w-1/6 text-right text-lg font-medium">{item.amount.toLocaleString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>


                                <div className="flex flex-col md:flex-row justify-between">
                                    {/* Terms */}
                                    <div className="w-full md:w-1/2 mb-8 md:mb-0 pr-0 md:pr-12">
                                        <div className="text-lg font-semibold text-gray-600 mb-3">TERMS</div>
                                        <div className="text-lg text-gray-900 whitespace-pre-line">{bookingsData.notes}</div>
                                    </div>


                                    <div className="w-full md:w-1/2">
                                        <div className="flex justify-between text-lg text-gray-600 mb-2">
                                            <span>SUBTOTAL</span>
                                            {/* <span className="text-gray-900">{subtotal.toLocaleString()}</span> */}
                                        </div>
                                        <div className="flex justify-between text-lg text-gray-600 mb-2">
                                            <span>DISCOUNT</span>
                                            {/* <span className="text-gray-900">-{bookingsData.discount.toLocaleString()}</span> */}
                                        </div>
                                        <div className="flex justify-between text-lg text-gray-600 mb-2">
                                            <span>(TAX RATE)</span>
                                            {/* <span className="text-gray-900">({bookingsData.tax}%) {taxAmount()}</span> */}
                                        </div>
                                        <div className="flex justify-between text-lg text-gray-600 mb-2">
                                            <span>SHIPPING</span>
                                            {/* <span className="text-gray-900">{bookingsData.shipping.toLocaleString()}</span> */}
                                        </div>
                                        <div className="flex justify-between text-xl font-semibold text-gray-900 border-t-2 border-gray-300 mt-4 pt-4">
                                            <span>INVOICE TOTAL</span>
                                            {/* <span>{total.toLocaleString()}</span> */}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between">
                                    <div>
                                        <div className="text-lg font-semibold text-gray-600 mb-3">BANK ACCOUNT DETAILS</div>
                                        <div className="text-lg text-gray-900 whitespace-pre-line">{bookingsData.bankAccount}</div>
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Mybooking;