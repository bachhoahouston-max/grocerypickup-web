import React, { useEffect, useState, useRef, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { IoPersonOutline } from "react-icons/io5";
import { CiHeart } from "react-icons/ci";
import constant from "../services/constant"
import { FiLock, FiShoppingCart, FiSearch } from "react-icons/fi";
import { useRouter } from 'next/router';
import { Drawer, Typography, IconButton, Button } from "@mui/material";
import { RxCrossCircled } from "react-icons/rx";
import { IoMdClose, IoIosArrowBack } from "react-icons/io";
import { IoAddSharp, IoRemoveSharp } from "react-icons/io5";
import { GoClock } from "react-icons/go";
import { MdOutlineShoppingCart } from "react-icons/md";
import { produce } from "immer";
import { cartContext, openCartContext, userContext, favoriteProductContext } from "@/pages/_app";
import { Api } from "@/services/service";
import Swal from "sweetalert2";
import { IoIosArrowForward } from "react-icons/io";
import GroceryCatories from "../components/GroceryCatories"
import DatePicker from 'react-datepicker';
import { FaRegCalendarAlt } from "react-icons/fa"
import 'react-datepicker/dist/react-datepicker.css';
import { BsCart2 } from "react-icons/bs";
import { RxCross2 } from "react-icons/rx";
import AddressInput from './addressInput';
import { useTranslation } from "react-i18next";

const Navbar = (props) => {
    const { t } = useTranslation()
    const router = useRouter();
    const [serchData, setSearchData] = useState("");
    const [productsList, setProductsList] = useState([]);
    const inputRef1 = useRef(null);
    const inputRef2 = useRef(null);
    const [showHover, setShowHover] = useState(true);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [user, setUser] = useContext(userContext);
    const [CartTotal, setCartTotal] = useState(0);
    const [openCart, setOpenCart] = useContext(openCartContext);
    const [CartItem, setCartItem] = useState(0);
    const [cartData, setCartData] = useContext(cartContext);
    const [showcart, setShowcart] = useState(false);
    const [Favorite, setFavorite] = useContext(favoriteProductContext);
    const [deliveryCharge, setDeliveryCharge] = useState(0);
    const [mainTotal, setMainTotal] = useState(0);
    const [productList, SetProductList] = useState([]);
    const [productsId, setProductsId] = useState([]);
    const [pickupOption, setPickupOption] = useState("orderPickup");

    const [profileData, setProfileData] = useState({
        username: '',
        mobile: '',
        address: '',
        lastname: '',
        lat: null,
        lng: null
    })
    const [date, setDate] = useState(null);
    const [parkingNo, setParkingNo] = useState(null)
    const [isOpen, setIsOpen] = useState(false);
    const [allProduct, setAllProduct] = useState([]);
    const [clientSecret,setClientSecret] = useState([]);

    const handleOptionChange = (event) => {
        setPickupOption(event.target.value);
    };

    const handleIconClick = () => {
        setIsOpen(!isOpen);
    };

    const handleDateChange = (date) => {
        setDate(date);
        setIsOpen(false);
    };

    const handleInputChange2 = (e) => {
        setParkingNo(e.target.value);
        // console.log(e.target.value)
    };

    const [localAddress, setLocalAddress] = useState({
        dateOfDelivery: "",
        address: "",
        name: "",
        lastname: "",
        phoneNumber: "",
        location: { type: 'Point', coordinates: [null, null] }, // Initialize with null values
    });


    useEffect(() => {
        if (profileData) {
            setLocalAddress({
                dateOfDelivery: "",
                address: profileData.address || '',
                name: profileData.username || '',
                lastname: profileData.lastname || '',
                phoneNumber: profileData.mobile || '',
                location: {
                    type: 'Point',
                    coordinates: [
                        profileData.lat || null,
                        profileData.lng || null
                    ],
                },
            });
        }
    }, [profileData]);

    const handleDateChange1 = (date) => {
        setLocalAddress({ ...localAddress, dateOfDelivery: date });
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


    useEffect(() => {
        if (cartData?.length > 0) {
            getproductByCategory();
        }
        fetchProducts()
    }, []);

    const getproductByCategory = async () => {
        props.loader && props.loader(true);
        Api(
            "get",
            `getProductBycategoryId?category=${cartData[0]?.category._id}&product_id=${cartData[0]?._id}`,
            "",
            router
        ).then(
            (res) => {
                props.loader && props.loader(false);
                SetProductList(res.data);
            },
            (err) => {
                props.loader && props.loader(false);
                props.toaster && props.toaster({ type: "error", message: err?.message });
            }
        );
    };


    const fetchProducts = () => {
        props.loader(true);
        Api("get", "getProduct", null, router).then(
            (res) => {
                props.loader(false);
                if (res.data && Array.isArray(res.data)) {
                    console.log("All products", res.data);
                    setAllProduct(res.data);

                } else {
                    console.error("Unexpected response format:", res);
                    props.toaster({ type: "error", message: "Unexpected response format" });
                }
            },
            (err) => {
                props.loader(false);
                console.log(err);
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    const minDate = (() => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Set to tomorrow
        return tomorrow;
    })();

    const closeDrawers = async () => {
        setOpenCart(false);
    };


    useEffect(() => {
        const userDetails = localStorage.getItem('userDetail');
        if (userDetails) {
            setUser(JSON.parse(userDetails));
            getProfileData();
        }
        if (user?.token) {
            getProductById();
        }
    }, [user?.token]);

    const getProfileData = () => {
        props.loader(true);
        const token = localStorage.getItem('token');

        if (!token) {
            toaster({ type: "error", message: "Authentication required" });
            props.loader(false);
            return;
        }

        Api("get", "getProfile", null)
            .then(res => {
                props.loader(false);
                if (res?.status) {
                    setProfileData({
                        username: res.data.username || '',
                        mobile: res.data.number || '',
                        address: res.data.address || '',
                        lastname: res.data.lastname || '',
                        lat: res?.data?.location?.coordinates[1],
                        lng: res?.data?.location?.coordinates[0],
                    });
                } else {
                    props.toaster({ type: "error", message: res?.data?.message || "Failed to load profile" });
                }
            })
            .catch(err => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.data?.message || "Failed to load profile" });
            });
    };

    console.log(profileData)


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
    
        setCartItem(sumWithInitial1);
        setCartTotal(sumWithInitial);
    
        // Delivery charge condition: only add $15 if total <= 35
        const delivery = sumWithInitial <= 35 ? 15 : 0;
        setDeliveryCharge(delivery);
    
        // Apply delivery conditionally to main total
        setMainTotal(sumWithInitial + delivery);
    }, [cartData, openCart]);
    
    const emptyCart = async () => {
        setCartData([]);
        setDate([])
        setLocalAddress([])
        setParkingNo('')
        setPickupOption("orderPickup")
        localStorage.removeItem("addCartDetail");
    };

    const cartClose = (item, i) => {
        const nextState = produce(cartData, (draftState) => {
            if (i !== -1) {
                draftState.splice(i, 1);
            }
        });
        setCartData(nextState);
        localStorage.setItem("addCartDetail", JSON.stringify(nextState));
    };

    const createProductRquest = (e) => {
        // e.preventDefault();

        if (pickupOption === 'localDelivery') {
            console.log('pickupOption:', pickupOption);
            console.log('localAddress.dateOfDelivery:', localAddress.dateOfDelivery);

            if (localAddress.dateOfDelivery === null) {
                return props.toaster({ type: "error", message: "Please Enter Delivery Date" });
            }
        }

        let data = [];
        let cart = localStorage.getItem("addCartDetail");

        let d = JSON.parse(cart);

        d.forEach((element) => {
            data.push({
                product: element?._id,
                image: element.selectedColor?.image,
                color: element.selectedColor?.color || "",
                total: element.total,
                price: element.total,
                qty: element.qty,
                seller_id: element.userid,
                isShipmentAvailable: element.isShipmentAvailable
            });
        });

        console.log("qsdcfvgbn", data)

        const isLocalDelivery = pickupOption === 'localDelivery';
        const isOrderPickup = pickupOption === 'orderPickup';
        const isDriveUp = pickupOption === 'driveUp';
        const dateOfDelivery = isDriveUp && date ? date : null;
        const isShipmentDelivery = pickupOption === 'ShipmentDelivery';

        const unavailableProducts = data.filter(item => item.isShipmentAvailable === false);
        const availableProducts = data.filter(item => item.isShipmentAvailable === true);
        const isShipmentAvailable = unavailableProducts.length === 0;

        console.log(isShipmentAvailable);

        if (isShipmentDelivery) {
            if (!isShipmentAvailable) {
                if (unavailableProducts.length === 1) {
                    props.toaster({ type: "error", message: "One product in your cart is not available for shipment. Please remove it or choose a different delivery option." });
                } else {
                    props.toaster({ type: "error", message: "Some products in your cart are not available for shipment. Please remove them or choose a different delivery option." });
                }
                return false;
            }
        }
        else {
            if (availableProducts.length > 0) {
                const message = availableProducts.length === 1
                    ? "Note: One product in your cart is not available for delivery if you wish to change delivery method later."
                    : "Note: Some products in your cart are not available for delivery if you wish to change delivery method later.";

                return props.toaster({ type: "info", message: message });

            }
        }

        let newData = {
            productDetail: data,
            total: CartTotal.toFixed(2),
            user: user._id,
            Local_address: {
                ...localAddress,
                name: localAddress.name,
                phoneNumber: localAddress.phoneNumber,
                address: localAddress.address,
                lastname: localAddress.lastname,
                dateOfDelivery: dateOfDelivery,
                location: {
                    type: 'Point',
                    coordinates: [
                        localAddress.location.coordinates[0] || null,
                        localAddress.location.coordinates[1] || null
                    ],
                },
            },

            // location: {
            //     type: "Point",
            //     coordinates: [
            //         (localAddress && localAddress.lng) ? Number(localAddress.lng) : (profileData.lng ? Number(profileData.lng) : 0),
            //         (localAddress && localAddress.lat) ? Number(localAddress.lat) : (profileData.lat ? Number(profileData.lat) : 0),
            //     ],
            // },
            isOrderPickup: isOrderPickup,
            isDriveUp: isDriveUp,
            isLocalDelivery: isLocalDelivery,
            isShipmentDelivery: isShipmentDelivery
        };

        console.log(newData)
        props.loader && props.loader(true);
        Api("post", "createProductRquest", newData, router).then(
            (res) => {
                props.loader && props.loader(false);
                if (res.status) {
                    setCartData([]);
                    setLocalAddress([])
                    setCartTotal(0);
                    setOpenCart(false);
                    setDate('')
                    localStorage.removeItem("addCartDetail");
                    props.toaster({ type: "success", message: "Thank you for your order! Your item will be processed shortly." });

                    router.push("/Mybooking");
                } else {
                    props.toaster && props.toaster({ type: "error", message: res?.data?.message });
                }
            },
            (err) => {
                props.loader && props.loader(false);
                props.toaster && props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    function formatDate(dateString) {

        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Invalid date";
        }

        const day = String(date.getDate()).padStart(2, '0'); // Ensure two digits
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    const getProductById = async () => {
        Api("get", "getFavourite", "", router).then(
            (res) => {
                setProductsId(res.data);
                console.log("fgh", res.data)
            },
            (err) => {
                console.log(err);
            }
        );
    };


    const payment = () => {
        const cur = {
            "$": "USD",
            "£": "GBP",
            "€": "EUR"
        };
    
        if (!user?._id) {
            props.toaster({ type: "error", message: "Please login for Shopping" });
            return; // Early return to prevent further execution
        }
    
        const data = {
            price: CartTotal.toFixed(2),
            currency: "USD" // Consider making this dynamic
        };
    
        console.log(data);
        props.loader(true);
    
        Api("post", `poststripe`, data, router).then(
            (res) => {
                props.loader(false);
                console.log("Payment called", res);
                setClientSecret(res.clientSecret);
                router.push(`/payment?clientSecret=${res.clientSecret}&price=${CartTotal}`);
            },
            (err) => {
                console.error(err); // Use console.error for errors
                props.loader(false);
                props.toaster({ type: "error", message: err?.message || "An error occurred" });
            }
        );
    };

    return (
        <>
            <header className="flex max-w-8xl justify-between items-center p-4 bg-white shadow-md">
                {/* Logo */}
                <div className="md:ms-32 lg:ms-10 xl:ms-28 ms-0 flex items-center">
                    <img
                        src="/Logo2.png"
                        alt="Grocery logo with palm tree and text 'Tropicana' in green and 'Freshness' in blue"
                        className="object-contain cursor-pointer"
                        width="150"
                        height="50"
                        onClick={() => router.push('/')}
                    />
                </div>

                {/* Search Bar */}
                <div className="flex items-center justify-center flex-grow mx-4 relative">
                    <input
                        type="text"
                        ref={inputRef2}
                        value={serchData}
                        onChange={(text) => {
                            setSearchData(text.target.value);
                        }}
                        placeholder={t("Search for products...")}
                        className=" md:text-[15px] text-[10px] text-black md:text-lg w-[150px] md:w-[500px] p-2 border border-[#F38529] rounded-l-md focus:outline-none pr-10"
                    />

                    <button
                        className="py-[4.5px] xl:py-[9px] md:py-[8.5px] md:px-4 px-1 bg-custom-green cursor-pointer  rounded-r-md"
                        onClick={() => { router.push(`/Search/${serchData}`); }}
                    >
                        <FontAwesomeIcon icon={faSearch} className='text-white relative' />
                    </button>
                    {serchData && ( // Conditionally render the cross icon
                        <div
                            onClick={() => setSearchData('')}
                            className=" absolute flex justify-center items-center right-6 2xl:right-72 xl:right-48 lg:right-40 
                              cursor-pointer" // Positioning the cross icon
                        >
                            <RxCross2 className="md:h-4 mx-1 md:w-4 w-3 h-3 font-bold text-black" />
                        </div>
                    )}
                </div>

                <div className="xl:mr-20 lg:mr-12  mr-2 flex">
                    <div className="hidden md:flex items-center space-x-4 mr-4">
                        {user?.token === undefined ? (
                            <>
                                <div className="text-white border-2 rounded-full w-[40px] h-[40px] cursor-pointer border-black flex justify-center items-center"
                                    onClick={() => router.push('/signIn')}>
                                    <IoPersonOutline className="text-black text-xl" />
                                </div>
                                <div className="text-black flex items-center w-20 cursor-pointer">
                                    <span onClick={() => router.push('/signIn')}> {t("Sign in")}</span>
                                </div>
                            </>
                        ) : (
                            <div
                                className="bg-custom-green text-black h-[40px] w-[40px] rounded-full flex items-center justify-center cursor-pointer relative group"
                                onClick={() => setShowHover(true)}
                            >
                                <p className="font-bold text-white text-base text-center capitalize">
                                    {user?.username?.charAt(0).toUpperCase() || "T"}
                                </p>
                                {showHover && (
                                    <div className="lg:absolute top-4 right-0 lg:min-w-[250px] group-hover:text-black hidden group-hover:lg:block hover:lg:block md:z-40">
                                        <div className="bg-custom-green lg:shadow-inner z-10 rounded-md lg:mt-8 shadow-inner">
                                            <ul>

                                                <li className="px-3 shadow-inner py-2 flex justify-between">
                                                    <div
                                                        className="block px-5 py-1 pl-0 text-white text-left font-semibold text-base"
                                                        onClick={() => { router.push("/Mybooking") }}
                                                    >
                                                        {t("My Order")}
                                                    </div>
                                                    <IoIosArrowForward className="text-2xl text-white" />
                                                </li>
                                                <li className="px-3 shadow-inner py-2 flex justify-between">
                                                    <div
                                                        className="block px-5 py-1 pl-0 text-white text-left font-semibold text-base"
                                                        onClick={() => { router.push("/Myhistory") }}
                                                    >
                                                        {t("History")}
                                                    </div>
                                                    <IoIosArrowForward className="text-2xl text-white" />
                                                </li>

                                                <li className="px-3 shadow-inner py-2 flex justify-between">
                                                    <div
                                                        className="block px-5 py-1 pl-0 text-white text-left font-semibold text-[16px]"
                                                        onClick={() => { router.push("/editProfile") }}
                                                    >
                                                        {t("Edit Profile")}
                                                    </div>
                                                    <IoIosArrowForward className="text-2xl text-white" />
                                                </li>

                                                <li className="px-3 shadow-inner py-2 flex justify-between">
                                                    <div
                                                        onClick={() => {
                                                            Swal.fire({
                                                                text: t("Are you sure you want to logout?"),
                                                                showCancelButton: true,
                                                                confirmButtonText: t("Yes"),
                                                                cancelButtonText: t("No"),
                                                                confirmButtonColor: "#F38529",
                                                                cancelButtonColor: "#F38529",
                                                                customClass: {
                                                                    confirmButton: 'px-12 rounded-xl',
                                                                    cancelButton: 'px-12 py-2 rounded-lg text-white border-[12px] border-custom-green hover:none',
                                                                    title: 'text-[20px] text-black',
                                                                    actions: 'swal2-actions-no-hover',
                                                                    popup: 'rounded-[15px] shadow-custom-green'
                                                                },
                                                                buttonsStyling: true,
                                                                reverseButtons: true,
                                                                width: '320px'
                                                            }).then(function (result) {
                                                                if (result.isConfirmed) {
                                                                    setUser({});
                                                                    setShowHover(false);
                                                                    localStorage.removeItem("userDetail");
                                                                    localStorage.removeItem("token");
                                                                    router.push("/signIn");
                                                                }
                                                            });
                                                        }}
                                                        className="block px-5 py-1 pl-0 text-white text-left font-semibold text-base"
                                                    >
                                                        {t("Sign out")}
                                                    </div>
                                                    <IoIosArrowForward className="text-2xl text-white" />
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Lock and Heart Icons */}
                    <div className="flex items-center justify-end space-x-2">
                        <div
                            className="cursor-pointer md:flex hidden"
                            onClick={() => {
                                setOpenCart(true);
                                setMobileMenu(!mobileMenu);
                            }}
                        >

                            <BsCart2 className="relative md:text-3xl text-[#F38529] text-lg cursor-pointer" />
                            {cartData.length > 0 && (
                                <div className="absolute bg-[#F38529] text-white rounded-full md:w-4.5 w-3.5 h-3.5 md:h-4.5 flex items-center justify-center top-8 md:top-10 lg:right-24 xl:right-32 right-11 md:text-[9px] text-[7px] ">
                                    {cartData.length}
                                </div>
                            )}
                        </div>

                        <div
                            className="cursor-pointer"
                            onClick={() => router.push("/Favourite")}
                        >
                            <CiHeart className="relative text-[#F38529] text-2xl md:text-3xl  cursor-pointer" />
                            {Favorite.length > 0 && (
                                <div className="absolute bg-[#F38529] text-white rounded-full full md:w-4.5 w-3.5 h-3.5 md:h-4.5 flex items-center justify-center top-8 md:top-10  md:text-[9px] text-[7px] lg:right-16 xl:right-24 right-6 ">
                                    {Favorite.length}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Cart Drawer */}
            <Drawer open={openCart} onClose={closeDrawers} anchor={"right"}>
                <div className={`md:w-[750px] w-[360px]  relative  bg-custom-green  pt-5 md:px-10 px-5 ${!cartData.length ? "h-full " : ""} 
                    ${cartData.length > 1 ? "pb-8" : "pb-40"} `}>

                    <div className="bg-white w-full rounded-[5px] shadow-md md:p-5 p-2 flex justify-between items-center">
                        <div
                            className="flex justify-start items-center gap-1 cursor-pointer"
                            onClick={() => {
                                setOpenCart(false);
                            }}
                        >
                            <IoIosArrowBack className="md:w-[38px] w-[28px] md:h-[31px] h-[21px] text-black" />
                            <p className="text-black md:text-[18px] text-[15px] font-bold">
                                {t("Your Cart")}
                            </p>
                        </div>
                        {cartData.length > 0 && (
                            <button
                                className="text-white font-bold bg-custom-green cursor-pointer text-[15px] md:text-[18px] rounded-[12px] md:px-4 px-3 py-2 md:py-3"
                                onClick={() => {
                                    const drawerElement = document.querySelector('.MuiDrawer-paper');
                                    Swal.fire({
                                        text: t("Are you sure you want to empty your cart?"),
                                        showCancelButton: true,
                                        confirmButtonText: t("Yes"),
                                        cancelButtonText: t("No"),
                                        confirmButtonColor: "#F38529",
                                        cancelButtonColor: "#F38529",
                                        customClass: {
                                            confirmButton: 'px-12 rounded-xl',
                                            cancelButton: 'px-12 py-2 rounded-lg text-white border-[12px] border-custom-green hover:none',
                                            text: 'text-[20px] text-black',
                                            actions: 'swal2-actions-no-hover',
                                            popup: 'rounded-[15px] shadow-custom-green',
                                            container: 'swal2-drawer-container'
                                        },
                                        buttonsStyling: true,
                                        reverseButtons: true,
                                        width: '320px',
                                        target: drawerElement,
                                        didOpen: () => {

                                            const swalContainer = document.querySelector('.swal2-drawer-container');
                                            if (swalContainer) {
                                                swalContainer.style.position = 'absolute';
                                                swalContainer.style.zIndex = '9999';
                                            }
                                        }
                                    }).then(function (result) {
                                        if (result.isConfirmed) {
                                            emptyCart();
                                        }
                                    });
                                }}
                            >
                                {t("Empty Cart")}
                            </button>
                        )}
                    </div>


                    {cartData.length > 0 && (
                        <div className="bg-white w-full rounded-[5px] shadow-md md:p-5 p-2 mt-5 flex items-center justify-center ">
                            <div className="rounded-lg p-2  items-center justify-center gap-3 md:gap-4 w-full grid  md:grid-cols-4 grid-cols-2">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="orderPickup"
                                        name="pickupOption"
                                        value="orderPickup"
                                        className="form-radio h-5 w-5 text-gray-600"
                                        checked={pickupOption === 'orderPickup'}
                                        onChange={handleOptionChange}
                                    />
                                    <label htmlFor="orderPickup" className="ml-2">
                                        <span className="font-semibold text-[15px]">
                                            {t("In Store Pickup")} </span>
                                        <br />
                                        <span className="text-gray-500 text-[13px] w-full">
                                            {t("Pick it up inside the store")}</span>
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="driveUp"
                                        name="pickupOption"
                                        value="driveUp"
                                        className="form-radio h-5 w-5 text-green-600"
                                        checked={pickupOption === 'driveUp'}
                                        onChange={handleOptionChange}
                                    />
                                    <label htmlFor="driveUp" className="ml-2">
                                        <span className="font-semibold text-[15px]">{t("Curbside Pickup")}</span>
                                        <br />
                                        <span className="text-gray-500 text-[13px]">
                                            {t("We bring it out to your car")}</span>
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="localDelivery"
                                        name="pickupOption"
                                        value="localDelivery"
                                        className="form-radio h-5 w-5 text-green-600"
                                        checked={pickupOption === 'localDelivery'}
                                        onChange={handleOptionChange}
                                    />
                                    <label htmlFor="localDelivery" className="ml-2">
                                        <span className="font-semibold text-[15px]">
                                            {t("Next Day Delivery")} </span>
                                        <br />
                                        <span className="text-gray-500 text-[13px]">
                                            {t("Cut of time 4 pm")}</span>
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="ShipmentDelivery"
                                        name="pickupOption"
                                        value="ShipmentDelivery"
                                        className="form-radio h-5 w-5 text-green-600"
                                        checked={pickupOption === 'ShipmentDelivery'}
                                        onChange={handleOptionChange}
                                    />
                                    <label htmlFor="localDelivery" className="ml-2">
                                        <span className="font-semibold text-[15px]">{t("Shipping")}</span>
                                        <br />
                                        <span className="text-gray-500 text-[13px]">
                                            {t("Delivery in 2 or 3 business days")}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {cartData.length > 0 && pickupOption === 'driveUp' && (
                        <div className="bg-white w-full rounded-[5px] shadow-md md:p-5 p-2 mt-5">
                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-lg font-semibold mb-4">
                                        {t("Select of Date Pick up")}</h1>
                                    <div className="relative inline-block">
                                        <input
                                            type="text"
                                            value={date ? formatDate(date) : t("Select date")} // Check if date is valid
                                            placeholder={t("Select date")}
                                            className="border rounded-lg py-2 pl-4 pr-10 text-gray-600 focus:outline-none"
                                            readOnly
                                            required
                                            onClick={handleIconClick}
                                        />
                                        <span
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 cursor-pointer"
                                            onClick={handleIconClick}
                                        >
                                            <FaRegCalendarAlt />
                                        </span>
                                        {isOpen && (
                                            <div className="absolute z-10 mt-1">
                                                <DatePicker
                                                    selected={date}
                                                    onChange={handleDateChange}
                                                    inline
                                                    minDate={minDate}
                                                    onClickOutside={() => setIsOpen(false)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {/* <input
                                        type="text"
                                        name="parkingNo"
                                        placeholder="Designated Parking No"
                                        value={parkingNo}
                                        onChange={handleInputChange2}
                                        className="m-1 border rounded-lg py-2 pl-4 pr-10 text-gray-600 focus:outline-none"
                                        required
                                    /> */}
                                </div>
                            </div>
                        </div>
                    )}

                    {cartData.length > 0 && (pickupOption === 'localDelivery' || pickupOption === 'ShipmentDelivery') && (
                        <div className="bg-white w-full rounded-[5px] shadow-md md:p-5 p-2 mt-5">
                            <div className="flex items-center justify-center w-full">
                                <div className="relative md:grid-cols-2 grid-cols-1 ">
                                    <h1 className="text-lg font-semibold mb-4">
                                        {t("Delivery Info")}</h1>
                                    {pickupOption === 'localDelivery' && (
                                        <div className="relative inline-block">
                                            <input
                                                type="text"
                                                value={localAddress.dateOfDelivery ? formatDate(localAddress.dateOfDelivery) : t("Select date")}
                                                placeholder={t("Select date")}
                                                className="m-1 border rounded-lg py-2 pl-2 md:pl-4 pr-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 grid-cols-1 text-sm w-[295px] md:w-[300px] "
                                                readOnly
                                                required
                                                onClick={handleIconClick}
                                            />
                                            <span
                                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 cursor-pointer"
                                                onClick={handleIconClick}
                                            >
                                                <FaRegCalendarAlt />
                                            </span>
                                            {isOpen && (
                                                <div className="absolute z-10 mt-1">
                                                    <DatePicker
                                                        selected={localAddress.dateOfDelivery}
                                                        onChange={handleDateChange1}
                                                        inline
                                                        onClickOutside={() => setIsOpen(false)}
                                                        minDate={minDate} // disables past dates
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder={t("First Name")}
                                        value={localAddress.name}
                                        onChange={handleInputChange1}
                                        className="m-1 border rounded-lg py-2 pl-2 md:pl-4 pr-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 grid-cols-1 text-sm w-[295px] md:w-[300px] "
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="lastname"
                                        placeholder={t("Last Name")}
                                        value={localAddress.lastname}
                                        onChange={handleInputChange1}
                                        className="m-1 border rounded-lg py-2 pl-2 md:pl-4 pr-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 grid-cols-1 text-sm w-[295px] md:w-[300px] "
                                        required
                                    />

                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        placeholder={t("Phone Number")}
                                        value={localAddress.phoneNumber}
                                        onChange={handleInputChange1}
                                        className="m-1 border rounded-lg py-2 pl-2 md:pl-4 pr-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 grid-cols-1 text-sm w-[295px] md:w-[300px]"
                                        required
                                    />

                                    <AddressInput
                                        setProfileData={setProfileData}
                                        profileData={localAddress}
                                        value={localAddress.address}
                                        // defaultvalue={profileData.address}
                                        className=" m-1 border rounded-lg py-2 pl-2 md:pl-4 md:pr-2 pr-7 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500  !z-[999999999] text-xs md:text-sm md:w-[608px] w-[295px]"
                                        required
                                    />


                                </div>
                            </div>
                        </div>
                    )}


                    <div className="bg-white w-full rounded-[5px] shadow-md md:p-5 p-2 mt-5">
                        {cartData && cartData.length > 0 ? (
                            <div className="flex justify-start items-center gap-5">
                                <div className="md:w-[45px] w-[35px] h-[30px] md:h-[35px] rounded-[8px] bg-custom-green flex justify-center items-center">
                                    <GoClock className="text-white md:w-[30px] w-[25px] md:h-[24px] h-[20px]" />
                                </div>
                                <p className="text-black font-semibold text-[18px]">
                                    {pickupOption === 'orderPickup' || pickupOption === 'driveUp'
                                        ? t("Pick up in 2 Hours")
                                        : t("Delivery in 2 or 3 business days")}
                                </p>

                            </div>
                        ) : (
                            <div className="bg-white w-full rounded-[5px] md:p-5 p-2 mt-5 flex flex-col justify-center items-center">

                                <img src="/image77.png"
                                    className="w-20 h-20" />
                                <p className="text-black  text-[18px]">
                                    {t("Your cart is empty")}
                                </p>
                                <button
                                    className=" text-custom-green border-2 border-custom-green text-[20px] font-medium rounded-[18px] md:w-[180px] w-full mt-2 py-2 px-1"
                                    onClick={() => {
                                        setOpenCart(false);
                                        router.push("/categories/all")
                                    }}
                                >
                                    {t("Browse Products")}
                                </button>
                            </div>
                        )}
                        {cartData?.map((item, i) => (
                            <div
                                key={i}
                                className="grid md:grid-cols-9 grid-cols-1 w-full md:gap-5 gap-2 mt-5"
                            >
                                <div className="flex justify-start items-start col-span-4 md:gap-0 gap-2">
                                    <img
                                        className="md:w-[145px] md:h-[104px] w-[50px] h-[50px] object-contain"
                                        src={item?.selectedImage || item?.image}
                                    />
                                    <div className="pt-2 flex-1">
                                        <p className="text-custom-purple font-semibold text-base pl-3">
                                            {item?.name}
                                        </p>
                                        <p className="text-custom-newGrayColors font-normal text-sm pt-2">
                                            <span className="pl-3">
                                                {item?.price_slot?.value ?? 1}
                                            </span>{" "}
                                            <span>{item?.price_slot?.unit ?? "unit"}</span>
                                        </p>
                                        <p className="text-custom-newGrayColors font-normal text-sm pt-2">
                                            <span className="pl-3">
                                                {constant.currency}{(item?.price_slot?.our_price * (1 + (item?.tax ? item.tax / 100 : 0))).toFixed(2)}
                                            </span>{" "}
                                            <span className="line-through">
                                                {constant.currency}{(item?.price_slot?.other_price * (1 + (item?.tax ? item.tax / 100 : 0))).toFixed(0)}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex justify-end items-start md:hidden">
                                        <IoMdClose
                                            className="w-[22px] h-[22px] text-custom-newGray cursor-pointer"
                                            onClick={() => {
                                                cartClose(item, i);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-center items-center  col-span-3 md:mt-0 mt-3">
                                    <div className="bg-gray-100 w-[153px] h-[39px] rounded-[8px] flex justify-center items-center">
                                        <div
                                            className="h-[39px] w-[51px] bg-custom-gold cursor-pointer rounded-[8px] rounded-r-none flex justify-center items-center"
                                            onClick={() => {
                                                if (item.qty > 1) {
                                                    const nextState = produce(cartData, (draft) => {
                                                        draft[i].qty -= 1;
                                                        const price = parseFloat(draft[i]?.price_slot?.our_price);
                                                        const tax = draft[i]?.tax ? draft[i].tax / 100 : 0;
                                                        draft[i].total = (price * draft[i].qty * (1 + tax)).toFixed(2);
                                                    });
                                                    setCartData(nextState);
                                                    localStorage.setItem("addCartDetail", JSON.stringify(nextState));
                                                }
                                            }}
                                        >
                                            <IoRemoveSharp className="h-[30px] w-[30px] text-white" />
                                        </div>
                                        <p className="text-black md:text-xl text-lg font-medium text-center mx-5">
                                            {item?.qty}
                                        </p>
                                        <div
                                            className="h-[39px] w-[51px] bg-custom-gold cursor-pointer rounded-[8px] rounded-l-none flex justify-center items-center"
                                            onClick={() => {
                                                const nextState = produce(cartData, (draft) => {
                                                    draft[i].qty += 1;
                                                    const price = parseFloat(draft[i]?.price_slot?.our_price);
                                                    const tax = draft[i]?.tax ? draft[i].tax / 100 : 0; 
                                                    draft[i].total = (price * draft[i].qty * (1 + tax)).toFixed(1);
                                                    draft[i].total += draft[i].total <= 35 ? deliveryCharge : 0;

                                                });
                                                setCartData(nextState);
                                                localStorage.setItem("addCartDetail", JSON.stringify(nextState));
                                            }}
                                        >
                                            <IoAddSharp className="h-[30px] w-[30px] text-white" />
                                        </div>

                                    </div>
                                </div>

                                {/* Price and close button for desktop */}
                                <div className="md:flex md:justify-center justify-start md:items-center items-start col-span-2 md:mt-0 mt-5 hidden ">
                                    <p className="text-custom-purple font-semibold text-base">
                                        {constant.currency}{item?.total}
                                        <del className="text-custom-red font-normal text-xs ml-2">
                                            {constant.currency}{(item?.price_slot?.other_price * (1 + (item?.tax ? item.tax / 100 : 0))).toFixed(0)}
                                        </del>
                                    </p>
                                    <IoMdClose
                                        className="w-[22px] h-[22px] text-custom-newGray ml-1 cursor-pointer"
                                        onClick={() => {
                                            cartClose(item, i);
                                        }}
                                    />
                                </div>

                                {/* Shipment availability notification */}
                                <div className='flex md:col-span-9 col-span-2 w-full md:-mt-10 mt-0'>
                                    {pickupOption === 'ShipmentDelivery' && (
                                        item.isShipmentAvailable ? (
                                            <p className="text-green-500 text-sm md:text-base md:mt-3 mt-2 w-full md:text-center">
                                                {t("Product is available for Shipment Delivery")}
                                            </p>
                                        ) : (
                                            <p className="text-red-500 text-sm md:text-base md:mt-3 mt-2 w-full  md:text-center">
                                                {t("Product is Not available for Shipment Delivery")}
                                            </p>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {cartData.length > 0 && (
                        <div className="bg-white w-full rounded-[5px] shadow-md md:p-5 p-2 mt-5">
                            <div className="flex justify-between items-center w-full">
                                <p className="text-custom-black font-normal text-base">
                                    {t("Item Total")}
                                </p>
                                <p className="text-custom-black font-normal text-base">
                                    {constant.currency}{CartTotal}
                                </p>
                            </div>

                            {CartTotal < 35 && (
                                <div className="flex justify-between items-center w-full pt-3 border-b border-b-[#97999B80] pb-4">
                                    <p className="text-black font-normal text-base">
                                        {t("Delivery Fee")}
                                    </p>
                                    <p className="text-custom-black font-normal text-base">
                                        {constant.currency}{deliveryCharge}
                                    </p>
                                </div>
                            )}

                            {CartTotal >= 35 && (
                                <div className="flex justify-between items-center w-full pt-3 border-b border-b-[#97999B80] pb-4">
                                    <p className="text-black font-normal text-base">
                                        {t("Delivery Fee")}
                                    </p>
                                    <p className="text-green-500 font-normal text-base">
                                        {t("Free")}
                                    </p>
                                </div>
                            )}




                            <div className="flex justify-between items-center w-full pt-5">
                                <p className="text-custom-black font-normal text-base">
                                    {t("Total Payable")}
                                </p>
                                <p className="text-custom-black font-medium text-base">
                                    {constant.currency}{mainTotal}
                                </p>
                            </div> <div className="flex justify-between items-center w-full pt-1">
                                <p className="text-red-500 font-normal text-base">
                                    * {t("Note : Tax is included in this price")}"
                                </p>
                            </div>
                        </div>
                    )}

                    {cartData.length > 0 && (
                        <button
                            className="bg-custom-gold border-white border-[3px] h-[50px] rounded-[12px] w-full font-semibold text-white cursor-pointer text-base text-center mt-5 mb-6"
                            onClick={() => {
                                if (cartData?.length === 0) {
                                    props.toaster && props.toaster({
                                        type: "warning",
                                        message: "Your cart is empty",
                                    });
                                    return;
                                } else {
                                    // createProductRquest();
                                    payment()
                                }
                            }}
                        >
                            {t("CONTINUE TO PAY")}  {constant.currency}{CartTotal}
                        </button>
                    )}
                </div>
            </Drawer>
        </>
    );
};

export default Navbar;             