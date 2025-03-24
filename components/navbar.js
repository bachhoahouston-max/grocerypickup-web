import React, { useEffect, useState, useRef, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { IoPersonOutline } from "react-icons/io5";
import { CiHeart } from "react-icons/ci";
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

const Navbar = (props) => {
    const router = useRouter();
    const [serchData, setSearchData] = useState("");
    const [productsList, setProductsList] = useState([]);
    const inputRef1 = useRef(null);
    const inputRef2 = useRef(null);
    const [showCategory1, setShowCategory1] = useState(false);
    const [showHover, setShowHover] = useState(true);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [noProductsFound, setNoProductsFound] = useState(false);
    const [user, setUser] = useContext(userContext);
    const [CartTotal, setCartTotal] = useState(0);
    const [openCart, setOpenCart] = useContext(openCartContext);
    const [CartItem, setCartItem] = useState(0);
    const [cartData, setCartData] = useContext(cartContext);
    const [showcart, setShowcart] = useState(false);
    const [Favorite, setFavorite] = useContext(favoriteProductContext);
    const [deliveryCharge, setDeliveryCharge] = useState(0);
    const [deliveryPartnerTip, setDeliveryPartnerTip] = useState(0);
    const [mainTotal, setMainTotal] = useState(0);
    const [productList, SetProductList] = useState([]);
    const [productsId, setProductsId] = useState([]);
    const [pickupOption, setPickupOption] = useState("orderPickup");
    const [profileData,setProfileData] = useState([])
    const [date, setDate] = useState(null);
    const [parkingNo, setParkingNo] = useState(null)
    const [isOpen, setIsOpen] = useState(false);


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
        phoneNumber: "",
    });

    const handleDateChange1 = (date) => {
        setLocalAddress({ ...localAddress, dateOfDelivery: date });
        setIsOpen(false);
    };

    const handleInputChange1 = (e) => {
        const { name, value } = e.target;
        setLocalAddress({ ...localAddress, [name]: value });
    };

    const timeoutRef = useRef(null);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchData(value);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (value) {
                getproductBySearchCategory(value);
            } else {
                setProductsList([]);
            }
        }, 500);
    };

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

    const getproductBySearchCategory = async (text) => {
        let parmas = {};
        let url = `productsearch?key=${text}`;

        Api("get", url, "", router, parmas).then(
            (res) => {
                props.loader && props.loader(false);
                setProductsList(res.data);
                if (res.data.length === 0) {
                    setNoProductsFound(true);
                } else {
                    setNoProductsFound(false);
                }
            },
            (err) => {
                props.loader && props.loader(false);
                props.toaster && props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    const closeDrawer1 = async () => {
        inputRef1.current && inputRef1.current.blur();
        setTimeout(() => {
            setShowCategory1(false);
        }, 500);
    };

    const closeDrawers = async () => {
        setOpenCart(false);
    };


    useEffect(() => {
        const userDetails = localStorage.getItem('userDetail');
        if (userDetails) {
            setUser (JSON.parse(userDetails));
            getProfileData();
        }
        getProductById();
    }, []);

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
                            Shiping_address: res.data.Shiping_address || '' // Ensure this is set correctly
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
        setMainTotal(sumWithInitial + deliveryCharge + deliveryPartnerTip);
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

        let data = [];
        let cart = localStorage.getItem("addCartDetail");

        let d = JSON.parse(cart);

        d.forEach((element) => {
            data.push({
                product: element?._id,
                image: element.selectedColor?.image,
                color: element.selectedColor?.color || "",
                total: element.total,
                price: element.our_price,
                qty: element.qty,
                seller_id: element.userid,
            });
        });

        const isLocalDelivery = pickupOption === 'localDelivery';
        const isOrderPickup = pickupOption === 'orderPickup';
        const isDriveUp = pickupOption === 'driveUp';
        const dateOfDelivery = isDriveUp && date ? date : null;
        const ParkingNo = isDriveUp && parkingNo ? parkingNo : null;

        let newData = {
            productDetail: data,
            total: CartTotal.toFixed(2),
            Local_address: {
                ...localAddress,
                name : localAddress.name || profileData.username,
                phoneNumber : localAddress.phoneNumber || profileData.number,
                address : localAddress.address || profileData.Shiping_address
                },
            dateOfDelivery: dateOfDelivery,
            isOrderPickup: isOrderPickup,
            isDriveUp: isDriveUp,
            isLocalDelivery: isLocalDelivery,
            parkingNo: ParkingNo
        };

        props.loader && props.loader(true);
        Api("post", "createProductRquest", newData, router).then(
            (res) => {
                props.loader && props.loader(false);
                if (res.status) {
                    setCartData([]);
                    setLocalAddress([])
                    setCartTotal(0);
                    // setShowcart(false);
                    setOpenCart(false);
                    setDate('')
                    localStorage.removeItem("addCartDetail");

                    const data = res.data.orders
                    const isOrderPickup = data?.map((data) => data.isOrderPickup === true)

                    if (isOrderPickup) {
                        props.toaster({ type: "success", message: "Your item is ready for delivery! Please pick it up at the store. Thank you!" });
                    } else {
                        props.toaster && props.toaster({ type: "success", message: "Thank you for your order! Your item will be processed shortly" });
                    }

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
    return (
        <>
            <header className="flex  justify-between items-center p-4 bg-white shadow-md">
                {/* Logo */}
                <div className="md:ms-20 ms-0 flex items-center">
                    <img
                        src="/logo.png"
                        alt="Grocery logo with palm tree and text 'Tropicana' in green and 'Freshness' in blue"
                        className="object-contain cursor-pointer"
                        width="150"
                        height="50"
                        onClick={() => router.push('/')}
                    />
                </div>

                {/* Search Bar */}
                <div className="flex items-center justify-center flex-grow mx-4">
                    <input
                        type="text"
                        placeholder="Search for Products"
                        className="md:text-[15px] text-[10px] text-black md:text-lg w-[150px] md:w-[500px] p-2 border border-[#FFD67E] rounded-l-md focus:outline-none"
                        value={serchData}
                        onChange={handleInputChange}
                        ref={inputRef2}
                    />
                    <button
                        className="py-[4.5px] md:py-[8.5px] md:px-4 px-1 bg-custom-green text-white rounded-r-md"
                        onClick={() => {
                            if (serchData) {
                                getproductBySearchCategory(serchData);
                                router.push(`/search-result?query=${serchData}`);
                            }
                        }}
                    >
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </div>


                <div className="hidden md:flex items-center space-x-4 mr-20">
                    {user?.token === undefined ? (
                        <>
                            <div className="text-white border-2 rounded-full w-[40px] h-[40px] cursor-pointer border-black flex justify-center items-center"
                                onClick={() => router.push('/signIn')}>
                                <IoPersonOutline className="text-black text-xl" />
                            </div>
                            <div className="text-black flex items-center w-14 cursor-pointer">
                                <span onClick={() => router.push('/signIn')}>Sign in</span>
                            </div>
                        </>
                    ) : (
                        <div
                            className="bg-custom-green text-black h-[40px] w-[40px] rounded-full flex items-center justify-center cursor-pointer relative group"
                            onClick={() => setShowHover(true)}
                        >
                            <p className="font-bold text-black text-base text-center capitalize">
                                {user?.username?.charAt(0).toUpperCase() || "R"}
                            </p>
                            {showHover && (
                                <div className="lg:absolute top-4 right-0 lg:min-w-[250px] group-hover:text-black hidden group-hover:lg:block hover:lg:block md:z-40">
                                    <div className="bg-custom-green lg:shadow-inner z-10 rounded-md lg:mt-8 shadow-inner">
                                        <ul>

                                            <li className="px-3 shadow-inner py-2 flex justify-between">
                                                <div
                                                    className="block px-5 py-1 pl-0 text-black text-left font-semibold text-base"
                                                    onClick={() => { router.push("/Mybooking") }}
                                                >
                                                    {"My Order"}
                                                </div>
                                                <IoIosArrowForward className="text-2xl text-black" />
                                            </li>
                                            <li className="px-3 shadow-inner py-2 flex justify-between">
                                                <div
                                                    className="block px-5 py-1 pl-0 text-black text-left font-semibold text-base"
                                                    onClick={() => { router.push("/Myhistory") }}
                                                >
                                                    {"History"}
                                                </div>
                                                <IoIosArrowForward className="text-2xl text-black" />
                                            </li>

                                            <li className="px-3 shadow-inner py-2 flex justify-between">
                                                <div
                                                    className="block px-5 py-1 pl-0 text-black text-left font-semibold text-[16px]"
                                                    onClick={() => { router.push("/editProfile") }}
                                                >
                                                    {"Edit Profile"}
                                                </div>
                                                <IoIosArrowForward className="text-2xl text-black" />
                                            </li>

                                            <li className="px-3 shadow-inner py-2 flex justify-between">
                                                <div
                                                    onClick={() => {
                                                        Swal.fire({
                                                            text: "Are you sure you want to logout?",
                                                            showCancelButton: true,
                                                            confirmButtonText: "Yes",
                                                            cancelButtonText: "No",
                                                            confirmButtonColor: "#FEC200",
                                                            cancelButtonColor: "#ffffff",
                                                            customClass: {
                                                                confirmButton: 'px-12 rounded-xl',
                                                                cancelButton: 'px-12 py-2 rounded-lg text-custom-black border-[12px] border-custom-green hover:none',
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
                                                    className="block px-5 py-1 pl-0 text-black text-left font-semibold text-base"
                                                >
                                                    {"Sign out"}
                                                </div>
                                                <IoIosArrowForward className="text-2xl text-black" />
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
                        className="cursor-pointer"
                        onClick={() => {
                            setOpenCart(true);
                            setMobileMenu(!mobileMenu);
                        }}
                    >

                        <FiLock className="relative md:text-3xl text-black text-lg cursor-pointer" />
                        {cartData.length > 0 && (
                            <div className="absolute bg-red-500 text-white rounded-full md:w-4.5 w-3.5 h-3.5 md:h-4.5 flex items-center justify-center top-8 md:top-11 md:right-13 right-11 md:text-[9px] text-[7px] ">
                                {cartData.length}
                            </div>
                        )}
                    </div>

                    <div
                        className="cursor-pointer"
                        onClick={() => router.push("/Favourite")}
                    >
                        <CiHeart className="relative text-black text-2xl md:text-3xl  cursor-pointer" />
                        {Favorite.length > 0 && (
                            <div className="absolute bg-red-500 text-white rounded-full full md:w-4.5 w-3.5 h-3.5 md:h-4.5 flex items-center justify-center top-8 md:top-11  md:text-[9px] text-[7px] right-4 ">
                                {Favorite.length}
                            </div>
                        )}
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
                            <p className="text-black md:text-[18px] text-[17px] font-bold">
                                Your Cart
                            </p>
                        </div>
                        {cartData.length > 0 && (
                            <button
                                className="text-black font-bold cursor-pointer text-[18px] rounded-[12px] px-4 py-3"
                                onClick={() => {
                                    const drawerElement = document.querySelector('.MuiDrawer-paper');
                                    Swal.fire({
                                        text: "Are you sure you want to empty your cart?",
                                        showCancelButton: true,
                                        confirmButtonText: "Yes",
                                        cancelButtonText: "No",
                                        confirmButtonColor: "#FEC200",
                                        cancelButtonColor: "#ffffff",
                                        customClass: {
                                            confirmButton: 'px-12 rounded-xl',
                                            cancelButton: 'px-12 py-2 rounded-lg text-custom-black border-[12px] border-custom-green hover:none',
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
                                Empty Cart
                            </button>
                        )}
                    </div>


                    {cartData.length > 0 && (
                        <div className="bg-white w-full rounded-[5px] shadow-md md:p-5 p-2 mt-5 flex items-center justify-center ">
                            <div className="rounded-lg p-4 flex items-center justify-center gap-3 md:gap-10 w-full max-w-4xl">
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
                                        <span className="font-semibold text-[15px]">Order Pickup</span>
                                        <br />
                                        <span className="text-gray-500 text-[13px] w-full">Pick it up inside the store</span>
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
                                        <span className="font-semibold text-[15px]">Drive up</span>
                                        <br />
                                        <span className="text-gray-500 text-[13px]">We bring it out to your car</span>
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
                                        <span className="font-semibold text-[15px]">Local Delivery</span>
                                        <br />
                                        <span className="text-gray-500 text-[13px]">We bring it to your Home</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {cartData.length > 0 && pickupOption === 'driveUp' && (
                        <div className="bg-white w-full rounded-[5px] shadow-md md:p-5 p-2 mt-5">
                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-lg font-semibold mb-4">Select Date of Delivery</h1>
                                    <div className="relative inline-block">
                                        <input
                                            type="text"
                                            value={date ? formatDate(date) : "Select date"} // Check if date is valid
                                            placeholder="Select date"
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
                                                    minDate={new Date()}
                                                    onClickOutside={() => setIsOpen(false)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        name="parkingNo"
                                        placeholder="Designated Parking No"
                                        value={parkingNo}
                                        onChange={handleInputChange2}
                                        className="m-1 border rounded-lg py-2 pl-4 pr-10 text-gray-600 focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {cartData.length > 0 && pickupOption === 'localDelivery' && (
                        <div className="bg-white w-full rounded-[5px] shadow-md md:p-5 p-2 mt-5">
                            <div className="flex items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-lg font-semibold mb-4">Delivery Info</h1>
                                    <div className="relative inline-block">
                                        <input
                                            type="text"
                                            value={localAddress.dateOfDelivery ? formatDate(localAddress.dateOfDelivery) : "Select date"}
                                            placeholder="Select date"
                                            className="border rounded-lg py-2 pl-4 pr-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            readOnly
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
                                                    minDate={new Date()} // This will disable all dates before today
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Name"
                                        value={localAddress.name || profileData.username}
                                        onChange={handleInputChange1}
                                        className="m-1 border rounded-lg py-2 pl-4 pr-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />

                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        placeholder="Phone Number"
                                        value={localAddress.phoneNumber || profileData.number}
                                        onChange={handleInputChange1}
                                        className="m-1 border rounded-lg py-2 pl-4 pr-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Address"
                                        value={localAddress.address || profileData.Shiping_address}
                                        onChange={handleInputChange1}
                                        className="m-1 border rounded-lg py-2 pl-4 pr-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    Delivery in Next Day
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white w-full rounded-[5px] md:p-5 p-2 mt-5 flex flex-col justify-center items-center">

                                <img src="/image77.png"
                                    className="w-20 h-20" />
                                <p className="text-black  text-[18px]">
                                    Your cart is empty
                                </p>
                                <button
                                    className=" text-custom-green border-2 border-custom-green text-[20px] font-medium rounded-[18px] md:w-[180px] w-full mt-2 py-2 px-1"
                                    onClick={() => {
                                        setOpenCart(false);
                                        router.push("/categories/all")
                                    }}
                                >
                                    Browse Products
                                </button>
                            </div>
                        )}
                        {cartData?.map((item, i) => (
                            <div
                                key={i}
                                className="grid md:grid-cols-9 grid-cols-1 w-full md:gap-5 gap-0 mt-5"
                            >
                                <div className="flex justify-start items-start col-span-4 md:gap-0 gap-2">
                                    <img
                                        className="md:w-[135px] md:h-[94px] w-[80px] h-[60px] object-contain"
                                        src={item?.selectedImage || item?.image}
                                        alt={item?.name}
                                    />
                                    <div className="pt-2 flex justify-start items-start">
                                        <div className="flex justify-center items-center">
                                            <p className=" text-custom-black md:w-[80%] w-[60%] font-semibold md:text-[16px] text-[13px] ">
                                                {item?.name}
                                            </p>
                                        </div>
                                        <p className="text-gray-500 w-full md:w-[100px] font-normal text-[11px] md:text-sm md:pt-7 pt-4">
                                            <span className="pl-3">
                                                {item?.value}
                                            </span>{" "}
                                            <span>{item?.price_slot && item?.price_slot[0]?.unit}</span>
                                        </p>
                                    </div>
                                    <div className="flex  justify-center items-center col-span-3 md:mt-0 mt-5 md:hidden">
                                        <p className="text-custom-black font-semibold text-base">
                                            ₹{item?.our_price}
                                            <del className="text-red-500 font-normal text-xs ml-2">
                                                ₹{item?.other_price}
                                            </del>
                                        </p>
                                        <IoMdClose
                                            className="w-[22px] h-[22px] text-gray-500 ml-2 cursor-pointer"
                                            onClick={() => {
                                                cartClose(item, i);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-center items-center  col-span-3 md:mt-0 mt-5">
                                    <div className="bg-gray-100 w-[153px] h-[39px] rounded-[8px] flex justify-center items-center">
                                        <div
                                            className="h-[39px] w-[51px] bg-custom-green cursor-pointer rounded-[8px] rounded-r-none flex justify-center items-center"
                                            onClick={() => {
                                                if (item.qty > 1) {
                                                    const nextState = produce(cartData, (draft) => {
                                                        draft[i].qty -= 1;
                                                        draft[i].total = (parseFloat(draft[i].our_price * draft[i].qty)
                                                        ).toFixed(2);
                                                    });
                                                    setCartData(nextState);
                                                    localStorage.setItem(
                                                        "addCartDetail",
                                                        JSON.stringify(nextState)
                                                    );
                                                }
                                            }}
                                        >
                                            <IoRemoveSharp className="h-[30px] w-[30px] text-white" />
                                        </div>
                                        <p className="text-black md:text-xl text-lg font-medium text-center mx-5">
                                            {item?.qty}
                                        </p>
                                        <div
                                            className="h-[39px] w-[51px] bg-custom-green cursor-pointer rounded-[8px] rounded-l-none flex justify-center items-center"
                                            onClick={() => {
                                                const nextState = produce(cartData, (draft) => {
                                                    if (draft[i]) {
                                                        draft[i].qty += 1;
                                                        const price = draft[i].our_price
                                                        if (price) {
                                                            draft[i].total = (parseFloat(price) * draft[i].qty).toFixed(2);
                                                        }
                                                    }
                                                });

                                                setCartData(nextState);
                                                localStorage.setItem("addCartDetail", JSON.stringify(nextState));
                                            }}
                                        >
                                            <IoAddSharp className="h-[30px] w-[30px] text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="md:flex md:justify-center justify-start md:items-center items-start col-span-2 md:mt-0 mt-5 hidden">
                                    <p className="text-custom-black font-semibold text-base">
                                        ₹{item?.our_price}
                                        <del className="text-red-500 font-normal text-xs ml-2">
                                            ₹{item?.other_price}
                                        </del>
                                    </p>
                                    <IoMdClose
                                        className="w-[22px] h-[22px] text-gray-500 ml-1 cursor-pointer"
                                        onClick={() => {
                                            cartClose(item, i);
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {cartData.length > 0 && (
                        <div className="bg-white w-full rounded-[5px] shadow-md md:p-5 p-2 mt-5">
                            <div className="flex justify-between items-center w-full">
                                <p className="text-custom-black font-normal text-base">
                                    Item Total
                                </p>
                                <p className="text-custom-black font-normal text-base">
                                    ₹{CartTotal}
                                </p>
                            </div>

                            <div className="flex justify-between items-center w-full pt-3">
                                <p className="text-black font-normal text-base">
                                    Delivery Fee (₹35 Saved)
                                </p>
                                <p className="text-custom-black font-normal text-base">
                                    ₹{deliveryCharge}
                                </p>
                            </div>

                            <div className="flex justify-between items-center w-full pt-3 border-b border-b-[#97999B80] pb-5">
                                <p className="text-gray-500 font-normal text-base">
                                    Delivery Partner Tip
                                </p>
                                <p className="font-normal text-base text-custom-black">
                                    ₹{deliveryPartnerTip}
                                </p>
                            </div>

                            <div className="flex justify-between items-center w-full pt-5">
                                <p className="text-custom-black font-normal text-base">
                                    Total Payable
                                </p>
                                <p className="text-custom-black font-medium text-base">
                                    ₹{mainTotal}
                                </p>
                            </div>
                        </div>
                    )}

                    {cartData.length > 0 && (
                        <button
                            className="bg-black h-[50px] rounded-[12px] w-full font-semibold text-white text-base text-center mt-5 mb-6"
                            onClick={() => {
                                if (cartData?.length === 0) {
                                    props.toaster && props.toaster({
                                        type: "warning",
                                        message: "Your cart is empty",
                                    });
                                    return;
                                } else {
                                    createProductRquest();
                                    // setShowcart(true);
                                    // setOpenCart(false);
                                }
                            }}
                        >
                            CONTINUE TO PAY ₹{CartTotal}
                        </button>
                    )}
                </div>
            </Drawer>

            {/* Shipping Form Modal */}
           

            <Drawer open={showCategory1} anchor="top" onClose={closeDrawer1}>
                <div className="max-w-7xl  mx-auto w-full  relative">
                    <div className="flex items-center justify-between border-b border-custom-newLightGray p-5 gap-5">
                        {/* <p className='text-black text-2xl font-normal AbrilFatface'>Filters</p> */}
                        <input
                            type="text"
                            ref={inputRef2}
                            value={serchData}
                            onChange={(text) => {
                                setSearchData(text.target.value);
                                if (text.target.value) {
                                    getproductBySearchCategory(text.target.value);
                                } else {
                                    setProductsList([]);
                                }
                            }}
                            placeholder="Search for products..."
                            className="bg-custom-lightGray px-5 h-10 w-full rounded-[62px] outline-none  text-black"
                        />
                        <IconButton
                            variant="text"
                            color="blue-gray"
                            onClick={() => {
                                setShowCategory1(false);
                                setSearchData("");
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </IconButton>
                    </div>
                    <div>
                        <section className="w-full ">
                            <div className="max-w-7xl mx-auto w-full md:px-0 px-5 md:py-5 py-5">
                                <p className="md:text-[48px] text-2xl text-black font-normal text-center">
                                    Products
                                </p>
                                <div className="md:py-10 py-5 grid md:grid-cols-4 grid-cols-1 gap-5 w-full">
                                    {productsList.map((item, i) => (
                                        <div
                                            key={i}
                                            className="w-full"
                                            onClick={() => {
                                                setShowCategory1(false);
                                                setSearchData("");
                                                setProductsList([]);
                                            }}
                                        >
                                            <GroceryCatories
                                                item={item}
                                                i={i}
                                                url={`/product-details/${item?.slug}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                                {productsList?.length === 0 && (
                                    <p className="text-2xl text-black font-normal text-center">
                                        No Products
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </Drawer>
        </>
    );
};

export default Navbar;             