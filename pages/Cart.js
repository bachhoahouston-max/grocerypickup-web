import React, { useEffect, useState, useRef, useContext } from "react";
import constant from "../services/constant";
import { useRouter } from "next/router";
import { Search, Trash, X } from "lucide-react";
import { IoMdClose, IoIosArrowBack } from "react-icons/io";
import { IoAddSharp, IoRemoveSharp } from "react-icons/io5";
import { GoClock } from "react-icons/go";
import { produce } from "immer";
import {
    cartContext,
    openCartContext,
    userContext,
    favoriteProductContext,
} from "@/pages/_app";
import { Api } from "@/services/service";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import { FaRegCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import AddressInput from "@/components/addressInput";
import { useTranslation } from "react-i18next";
import { languageContext } from "@/pages/_app";
import Image from "next/image";
import CartDrawer from "@/components/CartDrawer";


function Cart(props) {
    const router = useRouter();
    const [user, setUser] = useContext(userContext);
    const [CartTotal, setCartTotal] = useState(0);
    const [openCart, setOpenCart] = useContext(openCartContext);
    const [pincodes, setPincodes] = useState([]);
    const [cartData, setCartData] = useContext(cartContext);
    const [deliveryCharge, setDeliveryCharge] = useState(0);
    const [mainTotal, setMainTotal] = useState(0);
    const [pickupOption, setPickupOption] = useState("orderPickup");
    const [openModel, setOpenModel] = useState(false);
    const [baseCartTotal, setBaseCartTotal] = useState(0);
    const [coupons, setCoupons] = useState([]);
    const [filteredCoupons, setFilteredCoupons] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [appliedCoupon, setAppliedCoupon] = useState(false);
    const [deliverytip, setdeliverytip] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [discountCode, setDiscountCode] = useState(0);
    const [isOnce, setIsOnce] = useState(false)
    // const [lang, setLang] = useState(null);
    const { lang, changeLang } = useContext(languageContext);
    const { i18n } = useTranslation();
    const { t } = useTranslation();
    const isLoggedIn = user?._id || user?.token;


    const fetchCoupons = async () => {
        Api("get", "GetAllCoupons", "", router).then(
            (res) => {
                const currentDate = new Date();
                const validCoupons = (res.data || []).filter((coupon) => {
                    const expiryDate = new Date(coupon.expiryDate);
                    return expiryDate > currentDate && coupon.isActive;
                });
                setCoupons(validCoupons);
                setFilteredCoupons(validCoupons);
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredCoupons(coupons);
        } else {
            const filtered = coupons.filter((coupon) =>
                coupon.code?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCoupons(filtered);
        }
    }, [searchTerm, coupons]);


    const handleApplyCoupon = () => {
        if (!user?._id) {
            props.toaster({ type: "error", message: "Please log in to apply the coupon." });
            return;
        }
        const newData = {
            code: searchTerm,
            cartValue: CartTotal,
            userId: user._id
        };
        props.loader(true);

        Api("post", "ValidateCouponforUser", newData, router)
            .then((res) => {
                if (res.status) {
                    setDiscount(res.data?.discount);
                    setDiscountCode(searchTerm);
                    setAppliedCoupon(true)
                    props.toaster({ type: "success", message: res?.data?.message || "Coupon applied successfully" });
                    setSearchTerm("");
                    setOpenModel(false);
                } else {
                    props.toaster?.({ type: "error", message: res?.data?.message });
                }
            })
            .catch((err) => {
                props.toaster?.({ type: "error", message: err?.message });
            })
            .finally(() => {
                props.loader(false);
            });
    };


    useEffect(() => {
        if (appliedCoupon && (baseCartTotal > mainTotal || discount > baseCartTotal)) {
            props.toaster({
                type: "error",
                message:
                    "Coupon removed Due to Main Total change, Please apply again",
            });
            setSearchTerm("");
            setAppliedCoupon(false);
            setDiscountCode("");
            setDiscount(0);
        }
    }, [baseCartTotal]);

    const [profileData, setProfileData] = useState({
        username: "",
        mobile: "",
        address: "",
        lastname: "",
        email: "",
        state: "",
        city: "",
        lat: null,
        lng: null,
    });

    const [date, setDate] = useState(null);
    const [parkingNo, setParkingNo] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleOptionChange = (event) => {
        setPickupOption(event.target.value);
    };

    const handleIconClick = () => {
        setIsOpen(!isOpen);
    };

    const [localAddress, setLocalAddress] = useState({
        dateOfDelivery: "",
        ApartmentNo: "",
        SecurityGateCode: "",
        zipcode: "",
        address: "",
        state: "",
        city: "",
        isBusinessAddress: "",
        BusinessAddress: "",
        name: "",
        lastname: "",
        email: "",
        phoneNumber: "",
        location: {
            type: "Point",
            coordinates: [profileData.lng || null, profileData.lat || null],
        }, // Initialize with null values
    });

    useEffect(() => {
        if (profileData) {
            setLocalAddress({
                address: profileData.address || "",
                name: profileData.username || "",
                lastname: profileData.lastname || "",
                email: profileData.email || "",
                phoneNumber: profileData.mobile || "",
                state: profileData.state || "",
                city: profileData.city,
                location: {
                    type: "Point",
                    coordinates: [profileData.lng || null, profileData.lat || null],
                },
            });
        }
    }, [
        profileData.email,
        profileData.lastname,
        profileData.mobile,
        profileData.username,
    ], []);

    const getLocalDateOnly = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    const handleDateChange1 = (date) => {
        const localDateOnly = getLocalDateOnly(date);
        setLocalAddress({ ...localAddress, dateOfDelivery: localDateOnly });
        setIsOpen(false);
    };

    const handleDateChange = (date) => {
        const localDateOnly = getLocalDateOnly(date);
        setDate(localDateOnly);
        setIsOpen(false);
    };

    const handleInputChange1 = (e) => {
        const { name, value } = e.target;
        setLocalAddress({ ...localAddress, [name]: value });
    };

    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const minDate1 = (() => {
        const now = new Date();
        const currentHour = now.getHours(); // 0–23

        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);

        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(now.getDate() + 2);

        if (currentHour >= 20) {
            return dayAfterTomorrow;
        } else {

            return tomorrow;
        }
    })();


    const minDate = (() => {
        const now = new Date();
        const currentHour = now.getHours();

        if (currentHour >= 14) {

            const tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);
            return tomorrow;
        }

        return now;
    })();


    useEffect(() => {
        fetchCoupons();
        getAllPincodes();
        getShippingCost();
    }, [openCart])

    const getAllPincodes = () => {
        Api("get", "getPinCode", null, router)
            .then((res) => {
                if (res?.error) {
                    props.toaster({ type: "error", message: res?.error });
                } else {
                    setPincodes(res.pincodes || []); // Make sure it's an array
                }
            })
            .catch((err) => {
                props.loader(false);
                props.toaster({
                    type: "error",
                    message: err?.message || "Failed to fetch pincodes",
                });
            });
    };

    useEffect(() => {
        const userDetails = localStorage.getItem("userDetail");
        const token = localStorage.getItem("token");

        if (userDetails) {
            setUser(JSON.parse(userDetails));
            getProfileData();
        }

    }, []);

    const getProfileData = () => {
        const token = localStorage.getItem("token");

        if (!token) {
            props.toaster({ type: "error", message: "Authentication required" });
            props.loader(false);
            return;
        }

        Api("get", "getProfile", null)
            .then((res) => {
                props.loader(false);
                if (res?.status) {
                    setProfileData({
                        username: res.data.username || "",
                        mobile: res.data.number || "",
                        address: res.data.address || "",
                        lastname: res.data.lastname || "",
                        email: res.data?.email || "",
                        state: profileData.state || "",
                        city: profileData.city || "",
                        lat: res?.data?.location?.coordinates[1],
                        lng: res?.data?.location?.coordinates[0],
                    });
                    setLocalAddress({
                        dateOfDelivery: "",
                        address: res.data.address || "",
                        name: res.data.username || "",
                        lastname: res.data.lastname || "",
                        email: res.data?.email || "",
                        phoneNumber: res.data.number || "",
                        location: {
                            type: "Point",
                            coordinates: [
                                res?.data?.location?.coordinates[1] || null,
                                res?.data?.location?.coordinates[0] || null,
                            ],
                        },
                    });
                }
            })
            .catch((err) => {
                props.loader(false);
            });
    };

    const [currentLocalCost, setCurrentLocalCost] = useState(0);
    const [currentShipmentCost, setCurrentShipmentCost] = useState(0);

    const getShippingCost = async () => {
        try {
            const res = await Api("get", "getShippingCost", "", props.router);

            if (res.shippingCosts && res.shippingCosts.length > 0) {
                const costs = res.shippingCosts[0];
                setCurrentLocalCost(costs.ShippingCostforLocal || 0);
                setCurrentShipmentCost(costs.ShipmentCostForShipment || 0);
            }
        } catch (err) {
            props.loader(false);
            props.toaster({ type: "error", message: err?.message });
        }
    };



    useEffect(() => {
        const sumWithInitial = cartData?.reduce(
            (accumulator, currentValue) =>
                accumulator + Number(currentValue?.total || 0),
            0
        );

        const sumWithInitial1 = cartData?.reduce(
            (accumulator, currentValue) =>
                accumulator + Number(currentValue?.qty || 0),
            0
        );

        let delivery = 0;

        if (pickupOption === "localDelivery") {
            delivery = sumWithInitial <= 35 ? currentLocalCost : 0;
        } else if (pickupOption === "ShipmentDelivery") {
            delivery = sumWithInitial <= 200 ? currentShipmentCost : 0;
        } else {
            delivery = 0;
        }

        setBaseCartTotal(sumWithInitial); // Save original value
        setDeliveryCharge(delivery.toFixed(2));

        const cartAfterDiscount = sumWithInitial - discount;
        let finalTotal;

        if (pickupOption === "localDelivery") {
            finalTotal = cartAfterDiscount + delivery + Number(deliverytip);
        } else {
            finalTotal = cartAfterDiscount + delivery;
        }

        setCartTotal(sumWithInitial.toFixed(2)); // Now correct total
        setMainTotal(finalTotal.toFixed(2));
    }, [cartData, openCart, pickupOption, deliverytip, discount]);

    const emptyCart = async () => {
        setCartData([]);
        setDate(null);
        setLocalAddress([]);
        setParkingNo("");
        setPickupOption("orderPickup");
        localStorage.removeItem("addCartDetail");
        setSearchTerm("");
        getProfileData();
    };

    const cartClose = (item, i) => {
        const nextState = produce(cartData, (draftState) => {
            if (i !== -1) {
                draftState.splice(i, 1);
            }
        });

        setCartData(nextState);
        localStorage.setItem("addCartDetail", JSON.stringify(nextState));


        if (nextState.length === 0) {
            setSearchTerm("");
            getProfileData();
        }
    };

    const createProductRquest = (e) => {
        if (pickupOption === "localDelivery") {
            if (!localAddress.dateOfDelivery) {
                return props.toaster({
                    type: "error",
                    message: "Please Enter Delivery Date",
                });
            }
        }

        if (localAddress.isBusinessAddress) {
            if (!localAddress.BusinessAddress) {
                return props.toaster({
                    type: "error",
                    message:
                        "Business Address is required if 'This is business address' is checked.",
                });
            }
        }

        if (pickupOption === "localDelivery") {
            if (!localAddress.zipcode) {
                return props.toaster({
                    type: "error",
                    message:
                        "Please Select a ZIP code. We only deliver to the selected ZIP codes",
                });
            }
        }


        if (
            pickupOption === "localDelivery" ||
            pickupOption === "ShipmentDelivery"
        ) {
            const { email, name, phoneNumber, lastname, address } = localAddress;

            if (
                !email?.trim() ||
                !name?.trim() ||
                !phoneNumber?.toString().trim() ||
                !lastname?.trim() ||
                !address?.trim()
            ) {
                return props.toaster({
                    type: "error",
                    message: "Please Enter Delivery Info",
                });
            }
        }

        if (pickupOption === "driveUp" || pickupOption === "orderPickup") {
            if (!date) {
                return props.toaster({
                    type: "error",
                    message: "Please Enter Delivery Date",
                });
            }
        }

        let data = [];
        let cart = localStorage.getItem("addCartDetail");

        let d = JSON.parse(cart);

        d.forEach((element) => {
            data.push({
                product: element?._id,
                image: element.selectedColor?.image,
                BarCode: element.BarCode,
                color: element.selectedColor?.color || "",
                total: element.total,
                price: element.total,
                qty: element.qty,
                seller_id: element.userid,
                isShipmentAvailable: element.isShipmentAvailable,
                isNextDayDeliveryAvailable: element.isNextDayDeliveryAvailable,
                isCurbSidePickupAvailable: element.isCurbSidePickupAvailable,
                isInStoreAvailable: element.isInStoreAvailable,
            });
        });

        const isLocalDelivery = pickupOption === "localDelivery";
        const isOrderPickup = pickupOption === "orderPickup";
        const isDriveUp = pickupOption === "driveUp";
        const dateOfDelivery = (isDriveUp || isOrderPickup) && date ? date : null;
        const isShipmentDelivery = pickupOption === "ShipmentDelivery";

        const unavailableProducts = data.filter(
            (item) => item.isShipmentAvailable === false
        );

        const isShipmentAvailable = unavailableProducts.length === 0;

        if (isShipmentDelivery) {
            if (!isShipmentAvailable) {
                if (unavailableProducts.length === 1) {
                    props.toaster({
                        type: "error",
                        message:
                            "One product in your cart is not available for shipment. Please remove it or choose a different delivery option.",
                    });
                } else {
                    props.toaster({
                        type: "error",
                        message:
                            "Some products in your cart are not available for shipment. Please remove them or choose a different delivery option.",
                    });
                }
                return false;
            }
        }

        if (isLocalDelivery) {
            const unavailableForNextDay = data.filter(
                (item) => item.isNextDayDeliveryAvailable === false
            );

            if (unavailableForNextDay.length > 0) {
                props.toaster({
                    type: "error",
                    message:
                        unavailableForNextDay.length === 1
                            ? "One product in your cart is not available for next-day delivery. Please remove it or choose a different delivery option."
                            : "Some products in your cart are not available for next-day delivery. Please remove them or choose a different delivery option.",
                });
                return false;
            }
        }
        if (isDriveUp) {
            const unavailableForDriveUp = data.filter(
                (item) => item.isCurbSidePickupAvailable === false
            );

            if (unavailableForDriveUp.length > 0) {
                props.toaster({
                    type: "error",
                    message:
                        unavailableForDriveUp.length === 1
                            ? "One product in your cart is not available for curbside pickup. Please remove it or choose a different delivery option."
                            : "Some products in your cart are not available for curbside pickup. Please remove them or choose a different delivery option.",
                });
                return false;
            }
        }

        if (isOrderPickup) {
            const unavailableForOrderPickup = data.filter(
                (item) => item.isInStoreAvailable === false
            );

            if (unavailableForOrderPickup.length > 0) {
                props.toaster({
                    type: "error",
                    message:
                        unavailableForOrderPickup.length === 1
                            ? "One product in your cart is not available for in-store pickup. Please remove it or choose a different delivery option."
                            : "Some products in your cart are not available for in-store pickup. Please remove them or choose a different delivery option.",
                });
                return false;
            }
        }

        let newData = {
            productDetail: data,
            total: mainTotal,
            Deliverytip: deliverytip,
            deliveryfee: deliveryCharge,
            discount: discount,
            discountCode: discountCode,
            user: user._id,
            Email: user.email,
            isOrderPickup,
            isOnce,
            isDriveUp,
            isLocalDelivery,
            isShipmentDelivery,
            dateOfDelivery,
            ...((isShipmentDelivery || isLocalDelivery) && {
                Local_address: {
                    ...localAddress,
                    name: localAddress.name,
                    phoneNumber: localAddress.phoneNumber,
                    address: localAddress.address,
                    email: localAddress.email,
                    city: localAddress.city,
                    state: localAddress.state,
                    ApartmentNo: localAddress.ApartmentNo,
                    SecurityGateCode: localAddress.SecurityGateCode,
                    lastname: localAddress.lastname,
                    BusinessAddress: localAddress.BusinessAddress,
                    dateOfDelivery: localAddress.dateOfDelivery,
                    location: {
                        type: "Point",
                        coordinates: [
                            localAddress.location.coordinates[0] || null,
                            localAddress.location.coordinates[1] || null,
                        ],
                    },
                },
            }),
        };


        localStorage.setItem("checkoutData", JSON.stringify(newData));
        props.loader && props.loader(true);
        setOpenCart(false);
        router.push("/payment?from=cart");
    };

    function formatDate(dateString) {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return "Invalid date";
        }
        const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits
        const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
        const year = date.getFullYear();

        return `${month}/${day}/${year}`;
    }
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    const createConfirmEmptyCart = (t, emptyCart) => {
        const drawerElement = document.querySelector(".MuiDrawer-paper");

        Swal.fire({
            text: t("Are you sure you want to empty your cart?"),
            showCancelButton: true,
            confirmButtonText: t("Yes"),
            cancelButtonText: t("No"),
            confirmButtonColor: "#2e7d32",
            cancelButtonColor: "#2e7d32",
            customClass: {
                confirmButton: "px-12 rounded-xl",
                cancelButton: "px-12 py-2 rounded-lg text-white border-[12px] border-custom-green hover:none",
                text: "text-[20px] text-black",
                actions: "swal2-actions-no-hover",
                popup: "rounded-[15px] shadow-custom-green",
                container: "swal2-drawer-container",
            },
            buttonsStyling: true,
            reverseButtons: true,
            width: "320px",
            target: drawerElement,
            didOpen: () => {
                const swalContainer = document.querySelector(".swal2-drawer-container");
                if (swalContainer) {
                    swalContainer.style.position = "absolute";
                    swalContainer.style.zIndex = "9999";
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                emptyCart();
            }
        });
    };


    return (
        <div className="max-w-7xl mx-auto px-4 py-2 md:mt-5 mt-8 md:mb-0 mb-10">
            <div
                className={`py-4 w-full relative  ${!cartData.length ? "h-full " : ""
                    } 
              ${cartData.length > 1 ? "pb-8" : "pb-40"} `}
            >
                <div className="bg-white w-full rounded-[5px] flex justify-between items-center">
                    <div
                        className="flex justify-start items-center gap-1 cursor-pointer"
                        onClick={() => {
                            router.back();
                        }}
                    >
                        <IoIosArrowBack className="md:w-[32px] w-[28px] md:h-[28px] h-[21px] text-black" />
                        <p className="text-black md:text-[18px] text-[18px] font-bold">
                            {t("My cart")}
                        </p>
                    </div>
                    {cartData.length > 0 && (
                        <button
                            className="text-black flex justify-center items-center gap-2 font-medium bg-white border-2 border-red-400 cursor-pointer text-[15px] rounded-[12px] md:px-4 px-3 py-2 "
                            onClick={() => createConfirmEmptyCart(t, emptyCart)}
                        >
                            {t("Empty Cart")}
                            <Trash size={20} />
                        </button>
                    )}

                </div>


                <div className="w-full flex flex-col md:flex-row gap-2 justify-center items-start mt-4">
                    <CartDrawer
                        toaster={props.toaster}
                        pickupOption={pickupOption}
                        setOpenCart={setOpenCart}
                        cartClose={cartClose}
                    />
                    <div className="w-full md:w-[40%] flex flex-col gap-4 px-0 md:px-0">
                        {cartData.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-3">
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                                        {[
                                            {
                                                id: "orderPickup",
                                                title: t("In Store Pickup"),
                                                subtitle: t("Pick it up inside the store"),
                                                type: "pickup"
                                            },
                                            {
                                                id: "driveUp",
                                                title: t("Curbside Pickup"),
                                                subtitle: t("We bring it out to your car"),
                                                type: "pickup"
                                            },
                                            {
                                                id: "localDelivery",
                                                title: t("Next Day Local Delivery"),
                                                subtitle: t("Cut off time 8 pm"),
                                                type: "delivery"
                                            },
                                            {
                                                id: "ShipmentDelivery",
                                                title: t("Shipping"),
                                                subtitle: t("Delivery in 3 to 5 business days"),
                                                type: "delivery"
                                            },
                                        ].map((opt) => {
                                            const selected = pickupOption === opt.id;

                                            return (
                                                <label
                                                    key={opt.id}
                                                    className={`flex flex-col items-start p-4 rounded-lg border ${selected ? "border-green-400 shadow-md" : "border-gray-200"
                                                        } cursor-pointer bg-white`}
                                                >
                                                    <div className="flex items-start justify-between w-full">
                                                        <div className="flex items-start gap-2">
                                                            <input
                                                                type="radio"
                                                                id={opt.id}
                                                                name="pickupOption"
                                                                value={opt.id}
                                                                checked={selected}
                                                                onChange={handleOptionChange}
                                                                className="hidden mt-1 form-radio h-4 w-4 text-green-600"
                                                            />

                                                            <div>
                                                                <div className="font-semibold text-base md:text-lg text-black">
                                                                    {opt.title}
                                                                </div>
                                                                <div className="text-gray-500 text-sm ">{opt.subtitle}</div>
                                                            </div>
                                                        </div>

                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "border-green-600" : "border-gray-300"
                                                            }`}>
                                                            <div
                                                                className={`w-2 h-2 rounded-full ${selected ? "bg-green-600" : "bg-white"
                                                                    }`}
                                                            />
                                                        </div>
                                                    </div>


                                                    {selected && opt.type === "pickup" && (
                                                        <div className="bg-white pt-3">
                                                            <p className=" mb-1 text-[13px] text-gray-700 text-start max-w-[430px md:text-[14px] font-semibold">
                                                                {t("Pick up in 2 Hours")}
                                                            </p>
                                                            <div className="flex flex-col items-center gap-2">

                                                                <div className="w-full max-w-[420px] relative">
                                                                    <input
                                                                        type="text"
                                                                        value={date ? formatDate(date) : t("Select date")}
                                                                        readOnly
                                                                        onClick={handleIconClick}
                                                                        className="w-full border rounded-lg py-2 px-3 pr-5 text-gray-700 focus:outline-none focus:ring-2 "
                                                                    />

                                                                    <span
                                                                        onClick={handleIconClick}
                                                                        className="absolute right-3 top-2 text-custom-green cursor-pointer"
                                                                    >
                                                                        <FaRegCalendarAlt size={18} />
                                                                    </span>

                                                                    {isOpen && DatePicker && (
                                                                        <div className="absolute z-40 mt-2">
                                                                            <DatePicker
                                                                                selected={date}
                                                                                onChange={handleDateChange}
                                                                                inline
                                                                                minDate={minDate}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <p className="text-[12px] text-gray-700 text-start max-w-[430px]">
                                                                    {t(
                                                                        "*Note: Bach Hoa Houston will hold your order until close of the next business day if your order isn’t picked up within your scheduled pick up date, after that your order will be cancelled and refunded less 5% restocking fee"
                                                                    )}
                                                                </p>
                                                                <p className="text-[12px] text-gray-700 text-start max-w-[430px]">
                                                                    {t(
                                                                        "*Note: Orders placed before 2 PM are eligible for same-day pickup. Orders placed after 2 PM will be available for pickup the next day."
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {selected && opt.type === "delivery" && (
                                                        <div className="bg-white w-full mt-4">
                                                            <p className="text-black mb-2 font-semibold text-[16px] md:text-[15px]">
                                                                {opt.id === "localDelivery"
                                                                    ? t("Delivery is next day")
                                                                    : t("Delivery in 3 to 5 business days")}
                                                            </p>

                                                            <div className="flex flex-col gap-3">

                                                                {opt.id === "localDelivery" && (
                                                                    <div className="relative w-full max-w-[640px]">
                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                localAddress.dateOfDelivery
                                                                                    ? formatDate(localAddress.dateOfDelivery)
                                                                                    : t("Select date")
                                                                            }
                                                                            readOnly
                                                                            onClick={handleIconClick}
                                                                            className="border text-black rounded-lg py-2 px-3 pr-10 w-full"
                                                                        />

                                                                        <span
                                                                            onClick={handleIconClick}
                                                                            className="absolute right-3 top-2 text-gray-400 cursor-pointer"
                                                                        >
                                                                            <FaRegCalendarAlt />
                                                                        </span>

                                                                        {isOpen && DatePicker && (
                                                                            <div className="absolute z-40 mt-1">
                                                                                <DatePicker
                                                                                    selected={localAddress.dateOfDelivery}
                                                                                    onChange={handleDateChange1}
                                                                                    inline
                                                                                    minDate={minDate1}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-wrap gap-2">
                                                                    <input
                                                                        type="text"
                                                                        name="name"
                                                                        placeholder={t("First Name")}
                                                                        value={localAddress.name || ""}
                                                                        onChange={handleInputChange1}
                                                                        className="border rounded-lg py-2 px-3 text-sm w-full md:w-[420px] text-black"
                                                                    />

                                                                    <input
                                                                        type="text"
                                                                        name="lastname"
                                                                        placeholder={t("Last Name")}
                                                                        value={localAddress.lastname || ""}
                                                                        onChange={handleInputChange1}
                                                                        className="border rounded-lg py-2 px-3 text-sm w-full md:w-[420px] text-black"
                                                                    />

                                                                    <input
                                                                        type="email"
                                                                        name="email"
                                                                        placeholder={t("Email")}
                                                                        value={localAddress.email || ""}
                                                                        onChange={handleInputChange1}
                                                                        className="border rounded-lg py-2 px-3 text-sm w-full md:w-[420px] text-black"
                                                                    />

                                                                    <input
                                                                        type="text"
                                                                        name="phoneNumber"
                                                                        placeholder={t("Phone Number")}
                                                                        value={localAddress.phoneNumber || ""}
                                                                        onChange={handleInputChange1}
                                                                        className="border rounded-lg py-2 px-3 text-sm w-full md:w-[420px] text-black"
                                                                    />

                                                                    {opt.id === "localDelivery" && (
                                                                        <select
                                                                            name="zipcode"
                                                                            value={localAddress.zipcode || ""}
                                                                            onChange={handleInputChange1}
                                                                            className="border rounded-lg py-2 px-3 text-sm w-full md:w-[420px] text-black"
                                                                        >
                                                                            <option value="">{t("Select Zipcode")}</option>
                                                                            {pincodes.map((z, idx) => (
                                                                                <option key={idx} value={z.pincode}>
                                                                                    {z.pincode}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    )}

                                                                    <textarea
                                                                        name="address"
                                                                        placeholder={t("Enter shipping address")}
                                                                        value={localAddress.address || ""}
                                                                        onChange={handleInputChange1}
                                                                        className="border rounded-lg py-2 px-3 text-sm w-full md:w-[420px] text-black"
                                                                    />

                                                                    <input
                                                                        type="text"
                                                                        name="ApartmentNo"
                                                                        placeholder={t("Apartment #")}
                                                                        value={localAddress.ApartmentNo || ""}
                                                                        onChange={handleInputChange1}
                                                                        className="border rounded-lg py-2 px-3 text-sm w-full md:w-[420px] text-black"
                                                                    />

                                                                    <input
                                                                        type="text"
                                                                        name="SecurityGateCode"
                                                                        placeholder={t("Security Gate Code")}
                                                                        value={localAddress.SecurityGateCode || ""}
                                                                        onChange={handleInputChange1}
                                                                        className="border rounded-lg py-2 px-3 text-sm w-full md:w-[420px] text-black"
                                                                    />

                                                                    <label className="flex items-center gap-2 mt-1">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={localAddress.isBusinessAddress || false}
                                                                            onChange={(e) =>
                                                                                setLocalAddress({ ...localAddress, isBusinessAddress: e.target.checked })
                                                                            }
                                                                            className="form-checkbox"
                                                                        />
                                                                        <span className="text-sm text-black">{t("This is business address")}</span>
                                                                    </label>

                                                                    <input
                                                                        type="text"
                                                                        name="BusinessAddress"
                                                                        placeholder={t("Enter Company Name")}
                                                                        value={localAddress.BusinessAddress || ""}
                                                                        onChange={handleInputChange1}
                                                                        className="border rounded-lg py-2 px-3 text-sm w-full md:w-[420px] text-black"
                                                                    />
                                                                </div>

                                                                {opt.id === "localDelivery" && (
                                                                    <p className="text-[12px] text-gray-700 text-start">
                                                                        {t(
                                                                            "*Note: Bach Hoa Houston will hold your order until close of the next business day if your order isn’t picked up within your scheduled pick up date, after that your order will be cancelled and refunded less 5% restocking fee"
                                                                        )}
                                                                    </p>
                                                                )}

                                                                {opt.id === "ShipmentDelivery" && (
                                                                    <p className="text-[12px] text-gray-700 text-start">
                                                                        {t(
                                                                            "We deliver to 49 US states. Hawaii delivery not supported."
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                        {cartData.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-4 md:p-5">

                                <h4 className="text-xl font-bold text-gray-800 mb-4">
                                    {t("Bill Summary")}
                                </h4>

                                <div className="space-y-3">

                                    {/* Subtotal */}
                                    <div className="flex justify-between items-center text-black">
                                        <p className="text-base">{t("Subtotal")}</p>
                                        <p className="text-base font-medium">
                                            {constant.currency} {CartTotal}
                                        </p>
                                    </div>

                                    {/* Coupon */}
                                    <div className="flex justify-between items-center">
                                        <p className="text-base text-black">{t("Coupon Discount")}</p>

                                        {!appliedCoupon ? (
                                            <p
                                                onClick={() => setOpenModel(true)}
                                                className="text-green-600 font-semibold cursor-pointer"
                                            >
                                                {t("Apply Coupon")}
                                            </p>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-green-800">
                                                    {t("Coupon applied!")}
                                                </span>

                                                <button
                                                    onClick={() => {
                                                        setAppliedCoupon(false);
                                                        setSearchTerm("");
                                                        setDiscountCode("");
                                                        setDiscount(0);
                                                        toaster?.({
                                                            type: "success",
                                                            message: "Coupon removed successfully",
                                                        });
                                                    }}
                                                    className="text-red-600"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Discount Amount */}
                                    {appliedCoupon && (
                                        <div className="flex justify-between items-center">
                                            <p className="text-base">{t("Discount amount")}</p>
                                            <p className="text-base font-medium">
                                                - {constant.currency} {discount}
                                            </p>
                                        </div>
                                    )}

                                    {/* Delivery Tip */}
                                    {pickupOption === "localDelivery" && (
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-base text-black">{t("Delivery Tip (optional)")}</p>
                                                <p className="text-xs text-black">
                                                    {t("100% of tip goes directly to your driver")}
                                                </p>
                                            </div>

                                            <select
                                                className="p-2 border rounded-sm text-black"
                                                value={deliverytip}
                                                onChange={(e) => setdeliverytip(e.target.value)}
                                            >
                                                <option value="" className="text-black">{t("Select a tip")}</option>
                                                <option value="0">$0</option>
                                                <option value="2">$2</option>
                                                <option value="5">$5</option>
                                                <option value="8">$8</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Delivery Charges */}
                                    <div className="flex text-black justify-between items-center">
                                        <p className="text-base">{t("Delivery Charges")}</p>

                                        <div>
                                            {/* Pickup Free */}
                                            {pickupOption === "orderPickup" || pickupOption === "driveUp" ? (
                                                <span className="text-base">{t("$0.00")}</span>
                                            ) : pickupOption === "localDelivery" ? (
                                                CartTotal < 35 ? (
                                                    <span className="text-base font-medium">
                                                        {constant.currency} {currentLocalCost}
                                                    </span>
                                                ) : (
                                                    <span className="text-base">{t("$0.00")}</span>
                                                )
                                            ) : pickupOption === "ShipmentDelivery" ? (
                                                CartTotal < 200 ? (
                                                    <span className="text-base font-medium">
                                                        {constant.currency} {currentShipmentCost}
                                                    </span>
                                                ) : (
                                                    <span className="text-base">{t("$0.00")}</span>
                                                )
                                            ) : null}
                                        </div>
                                    </div>

                                    {/* Total Payable */}
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                        <p className="text-lg font-bold text-black">{t("Total Payable")}</p>
                                        <p className="text-lg font-bold text-black">
                                            {constant.currency} {mainTotal}
                                        </p>
                                    </div>

                                    {/* Coupon Modal */}
                                    {openModel && (
                                        <div className="mt-4 w-full">
                                            <div className="bg-gray-50 p-3 rounded-md">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h5 className="font-semibold text-black">{t("Apply Coupon")}</h5>

                                                    <button
                                                        onClick={() => setOpenModel(false)}
                                                        className="text-black"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>

                                                <div className="flex flex-col md:flex-row gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder={t("Enter coupon code or search coupons")}
                                                        value={searchTerm}
                                                        onChange={handleSearchChange}
                                                        className="flex-1 text-[14px] text-black border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />

                                                    <button
                                                        className="bg-custom-green text-white px-2 py-2 cursor-pointer text-sm rounded-md"
                                                        onClick={handleApplyCoupon}
                                                    >
                                                        {t("Apply Coupon")}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Checkout Button */}
                                    <div className="mt-4">
                                        {isLoggedIn ? (
                                            <button
                                                className="w-full cursor-pointer bg-custom-green text-white py-3 rounded-lg font-semibold"
                                                onClick={() => {
                                                    if (cartData?.length === 0) {
                                                        toaster?.({
                                                            type: "warning",
                                                            message: "Your cart is empty",
                                                        });
                                                    } else {
                                                        createProductRquest && createProductRquest();
                                                    }
                                                }}
                                            >
                                                {t("Proceed To Checkout")}
                                            </button>
                                        ) : (
                                            <button
                                                className="w-full cursor-pointer bg-custom-green text-white py-3 rounded-lg font-semibold"
                                                onClick={() => {
                                                    setOpenCart(false);
                                                    router.push("/signIn");
                                                }}
                                            >
                                                {t("Login to Checkout")}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}


                    </div>
                </div>


                {cartData && cartData.length === 0 && (
                    <div className="bg-white w-full rounded-[5px] md:p-5 p-4 mt-5 flex flex-col justify-center items-center min-h-[280px]">
                        <div className="relative w-28 h-28 mb-4">
                            <Image src="/cart2.jpg" alt="cart" fill className="object-contain" />
                        </div>
                        <p className="text-black text-[18px] mb-2">{t("Your cart is empty")}</p>
                        <button
                            className="text-custom-green border-2 border-custom-green text-[16px] font-medium rounded-[18px] cursor-pointer w-[200px] mt-2 py-2 px-4"
                            onClick={() => {
                                setOpenCart(false);
                                router.push("/categories/all");
                            }}
                        >
                            {t("Browse Products")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Cart
