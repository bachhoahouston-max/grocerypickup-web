import React, { useEffect, useState, useRef, useContext } from "react";
import constant from "../services/constant";
import { useRouter } from "next/router";
import { Search, X, Heart, ShoppingCart, CircleUserRound } from "lucide-react";
import { Drawer } from "@mui/material";
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
import { IoIosArrowForward } from "react-icons/io";
import DatePicker from "react-datepicker";
import { FaRegCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import AddressInput from "./addressInput";
import { useTranslation } from "react-i18next";
import { languageContext } from "@/pages/_app";
import Image from "next/image";
import HeaderFirst from "./HeaderFirst";

const Navbar = (props) => {
  const router = useRouter();
  const [showHover, setShowHover] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [user, setUser] = useContext(userContext);
  const [searchData, setSearchData] = useState("");
  const [CartTotal, setCartTotal] = useState(0);
  const [openCart, setOpenCart] = useContext(openCartContext);
  const [CartItem, setCartItem] = useState(0);
  const [cartData, setCartData] = useContext(cartContext);
  const [Favorite, setFavorite] = useContext(favoriteProductContext);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [mainTotal, setMainTotal] = useState(0);
  const [productList, SetProductList] = useState([]);
  const [productsId, setProductsId] = useState([]);
  const [pickupOption, setPickupOption] = useState("orderPickup");
  const [openModel, setOpenModel] = useState(false);
  const [baseCartTotal, setBaseCartTotal] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(false);
  const [deliverytip, setdeliverytip] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountCode, setDiscountCode] = useState(0);
  const [isOnce, setIsOnce] = useState(false)
  const { lang, changeLang } = useContext(languageContext);
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const isLoggedIn = user?._id || user?.token;
  const [pincodes, setPincodes] = useState([]);
  const [date, setDate] = useState(null);
  const [isOpen, setIsOpen] = useState(false);


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


  const handleClick = (language) => {
    try {
      changeLang(language);
      i18n.changeLanguage(language);
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

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
        props.toaster &&
          props.toaster({ type: "error", message: err?.message });
      }
    );
  };

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


  const closeDrawers = async () => {
    setOpenCart(false);
  };

  useEffect(() => {
    if (openCart) {
      fetchCoupons();
      getAllPincodes();
      getShippingCost();
    }

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


  const hasFetchedFavourite = useRef(false); // track once

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetail");

    if (userDetails) {
      setUser(JSON.parse(userDetails));
      getProfileData();
    }
    const token = localStorage.getItem("token");
    if (!token || hasFetchedFavourite) return;
    hasFetchedFavourite.current = true;
    getProductById();
  }, []);

  const getProfileData = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      // props.toaster({ type: "error", message: "Authentication required" });
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
    setCartItem(sumWithInitial1);
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

  const getProductById = async () => {
    Api("get", "getFavourite", null, router, { id: user._id }).then(
      (res) => {
        setProductsId(res.data);
      },
      (err) => {
        console.log(err);
      }
    );
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchData.trim() === "") {
      props.toaster({
        type: "error",
        message: "Please enter search value",
      });
      return;
    }
    props.loader(true);
    router.push(`/Search/${searchData}`);
    // setSearchData("");
    props.loader(false);
  };

  const cartlenth = cartData.reduce((total, item) => total + (item.qty || 0), 0)

  return (
    <>
      <header className="md:shadow-none shadow-md bg-white w-full sticky top-0 z-100">
        <div className="max-w-7xl mx-auto flex items-center md:justify-between justify-center md:gap-0 gap-2 md:ps-0 ps-4 py-2">

          <div className="relative md:w-40 w-32 h-14  flex items-center ">
            <Image
              src="/imagelogo.png"
              alt="bachhoustan logo"
              fill
              // sizes="(max-width: 768px) 64px, 80px"
              className="object-contain cursor-pointer"
              onClick={() => router.push("/")}
            />
          </div>

          <div className="hidden md:flex flex-grow justify-center">
            <HeaderFirst loader={props.loader} toaster={props.toaster} />
          </div>

          <div className="hidden md:flex items-center md:space-x-8">

            {user?.token === undefined ? (
              <div
                className="flex items-center space-x-4 cursor-pointer"
                onClick={() => router.push("/signIn")}
              >
                <CircleUserRound className="text-black" size={30} />
                <span className="text-gray-800 font-medium">{t("Sign in")}</span>
              </div>
            ) : (
              <div
                className="relative group cursor-pointer"
                onClick={() => setShowHover(!showHover)}
              >
                <div className="w-10 h-10 bg-custom-green rounded-full flex items-center justify-center">
                  <p className="text-white font-bold text-base">
                    {user?.username?.charAt(0).toUpperCase() || "T"}
                  </p>
                </div>

                {/* Hover Dropdown */}
                {showHover && (
                  <div className="absolute right-0 top-12 bg-custom-green text-white rounded-lg shadow-lg w-56 py-2">
                    <ul className="divide-y divide-white/20">
                      <li
                        className="px-4 py-2 hover:bg-white/10 flex justify-between items-center cursor-pointer"
                        onClick={() => {
                          setShowHover(false);
                          router.push("/Mybooking")
                        }}
                      >
                        {t("My Order")}
                        <IoIosArrowForward className="text-xl" />
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-white/10 flex justify-between items-center cursor-pointer"
                        onClick={() => {
                          setShowHover(false);
                          router.push("/Myhistory")
                        }}
                      >
                        {t("History")}
                        <IoIosArrowForward className="text-xl" />
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-white/10 flex justify-between items-center cursor-pointer"
                        onClick={() => {
                          setShowHover(false)
                          router.push("/editProfile")
                        }}
                      >
                        {t("Edit Profile")}
                        <IoIosArrowForward className="text-xl" />
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-white/10 flex justify-between items-center cursor-pointer"
                        onClick={() => {
                          Swal.fire({
                            text: t("Are you sure you want to logout?"),
                            showCancelButton: true,
                            confirmButtonText: t("Yes"),
                            cancelButtonText: t("No"),
                            confirmButtonColor: "#F38529",
                            cancelButtonColor: "#F38529",
                            customClass: {
                              confirmButton: "px-12 rounded-xl",
                              cancelButton:
                                "px-12 py-2 rounded-lg text-white border-[12px] border-custom-green",
                            },
                            buttonsStyling: true,
                            reverseButtons: true,
                            width: "320px",
                          }).then((result) => {
                            if (result.isConfirmed) {
                              setUser({});
                              setShowHover(false);
                              localStorage.removeItem("userDetail");
                              localStorage.removeItem("token");
                              router.push("/signIn");
                            }
                          });
                        }}
                      >
                        {t("Sign out")}
                        <IoIosArrowForward className="text-xl" />
                      </li>
                    </ul>
                  </div>
                )}


              </div>
            )}


            <div
              className="relative cursor-pointer hidden md:flex"
              onClick={() => {
                setOpenCart(true);
                setMobileMenu(!mobileMenu);
                getProfileData();
              }}
            >
              <ShoppingCart className="text-black" size={28} />
              {cartData.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-custom-green text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartlenth}
                </span>
              )}
            </div>


            <div
              className="relative cursor-pointer"
              onClick={() => router.push("/Favourite")}
            >
              <Heart className="text-black" size={28} />
              {Favorite.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-custom-green text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {Favorite.length}
                </span>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center  bg-gray-50 rounded-full px-4 py-2 border-2 relative">
            <Search size={17} className="text-gray-400" />
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <input
                type="text"
                value={searchData}
                onChange={(e) => setSearchData(e.target.value)}
                placeholder={t("Search")}
                className="w-full bg-transparent text-black text-sm px-2 outline-none placeholder:text-gray-400"
              />
            </form>
            {searchData && (
              <button
                type="button"
                onClick={() => setSearchData("")}
                className="absolute right-3 text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="md:hidden flex justify-end items-center gap-1">

            <select
              className="bg-white border border-gray-300 text-sm px-1 py-2 rounded-md text-gray-700 focus:outline-none"
              value={lang}
              onChange={(e) => handleClick(e.target.value)}
            >
              <option value="en">EN</option>
              <option value="vi">VI</option>
            </select>

            <div
              className="relative cursor-pointer"
              onClick={() => router.push("/Favourite")}
            >
              <Heart className="text-custom-green" size={24} />
              {Favorite.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-custom-green text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                  {Favorite.length}
                </span>
              )}
            </div>

          </div>


          <div>
          </div>
        </div>
      </header>



      <Drawer open={openCart} onClose={closeDrawers} anchor={"right"}>
        <div
          className={`md:w-[750px] w-full relative bg-custom-green pt-5 md:px-10 px-2 ${!cartData.length ? "h-full " : ""
            } 
          ${cartData.length > 1 ? "pb-8" : "pb-40"} `}
        >
          <div className="bg-white w-full rounded-[5px] shadow-md md:p-5 p-2 flex justify-between items-center">
            <div
              className="flex justify-start items-center gap-1 cursor-pointer"
              onClick={() => {
                setOpenCart(false);
              }}
            >
              <IoIosArrowBack className="md:w-[38px] w-[28px] md:h-[31px] h-[21px] text-black" />
              <p className="text-black md:text-[18px] text-[15px] font-bold">
                {t("Back")}
              </p>
            </div>
            {cartData.length > 0 && (
              <button
                className="text-white font-bold bg-custom-green cursor-pointer text-[15px] md:text-[18px] rounded-[12px] md:px-4 px-3 py-2 md:py-3"
                onClick={() => {
                  const drawerElement =
                    document.querySelector(".MuiDrawer-paper");
                  Swal.fire({
                    text: t("Are you sure you want to empty your cart?"),
                    showCancelButton: true,
                    confirmButtonText: t("Yes"),
                    cancelButtonText: t("No"),
                    confirmButtonColor: "#2e7d32",
                    cancelButtonColor: "#2e7d32",
                    customClass: {
                      confirmButton: "px-12 rounded-xl",
                      cancelButton:
                        "px-12 py-2 rounded-lg text-white border-[12px] border-custom-green hover:none",
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
                      const swalContainer = document.querySelector(
                        ".swal2-drawer-container"
                      );
                      if (swalContainer) {
                        swalContainer.style.position = "absolute";
                        swalContainer.style.zIndex = "9999";
                      }
                    },
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
                    checked={pickupOption === "orderPickup"}
                    onChange={handleOptionChange}
                  />
                  <label htmlFor="orderPickup" className="ml-2">
                    <span className="font-semibold text-[15px]">
                      {t("In Store Pickup")}{" "}
                    </span>
                    <br />
                    <span className="text-gray-500 text-[13px] w-full">
                      {t("Pick it up inside the store")}
                    </span>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="driveUp"
                    name="pickupOption"
                    value="driveUp"
                    className="form-radio h-5 w-5 text-green-600"
                    checked={pickupOption === "driveUp"}
                    onChange={handleOptionChange}
                  />
                  <label htmlFor="driveUp" className="ml-2">
                    <span className="font-semibold text-[15px]">
                      {t("Curbside Pickup")}
                    </span>
                    <br />
                    <span className="text-gray-500 text-[13px]">
                      {t("We bring it out to your car")}
                    </span>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="localDelivery"
                    name="pickupOption"
                    value="localDelivery"
                    className="form-radio h-5 w-5 text-green-600"
                    checked={pickupOption === "localDelivery"}
                    onChange={handleOptionChange}
                  />
                  <label htmlFor="localDelivery" className="ml-2">
                    <span className="font-semibold text-[15px]">
                      {t("Next Day Local Delivery")}{" "}
                    </span>
                    <br />
                    <span className="text-gray-500 text-[13px]">
                      {t("Cut off time 8 pm")}
                    </span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="ShipmentDelivery"
                    name="pickupOption"
                    value="ShipmentDelivery"
                    className="form-radio h-5 w-5 text-green-600"
                    checked={pickupOption === "ShipmentDelivery"}
                    onChange={handleOptionChange}
                  />
                  <label htmlFor="localDelivery" className="ml-2">
                    <span className="font-semibold text-[15px]">
                      {t("Shipping")}
                    </span>
                    <br />
                    <span className="text-gray-500 text-[13px]">
                      {t("Delivery in 3 to 5 business days")}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {cartData.length > 0 &&
            (pickupOption === "driveUp" || pickupOption === "orderPickup") && (
              <div className="bg-white w-full rounded-[8px] shadow-md p-4 md:p-6 mt-5">
                <div className="text-center">
                  <h1 className="text-xl font-semibold text-gray-800 mb-4">
                    {t("Select a Pickup Date")}
                  </h1>

                  <div className="relative inline-block text-left">
                    <input
                      type="text"
                      value={date ? formatDate(date) : t("Select date")}
                      placeholder={t("Select date")}
                      className="border border-gray-300 rounded-lg py-2 px-4 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      readOnly
                      onClick={handleIconClick}
                    />
                    <span
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-orange-500 cursor-pointer"
                      onClick={handleIconClick}
                    >
                      <FaRegCalendarAlt size={18} />
                    </span>

                    {isOpen && (
                      <div className="absolute z-20 mt-2 shadow-lg">
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

                  <p className="text-sm text-red-500 mt-3">
                    {t(
                      "*Note: Bach Hoa Houston will hold your order until close of the next business day if your order isn’t picked up within your scheduled pick up date, after that your order will be cancelled and refunded less 5% restocking fee"
                    )}
                    .
                  </p>
                </div>
              </div>
            )}

          {cartData.length > 0 &&
            (pickupOption === "localDelivery" ||
              pickupOption === "ShipmentDelivery") && (
              <div className="bg-white w-full rounded-[5px] shadow-md md:p-5 p-2 mt-5">
                <div className="flex items-center justify-center w-full">
                  <div className="relative md:grid-cols-2 grid-cols-1 ">
                    <h1 className="text-lg font-semibold ">
                      {t("Delivery Info")}
                    </h1>
                    {pickupOption === "localDelivery" && (
                      <p className="text-red-500 text-sm py-1  mb-2">
                        {t(
                          "Note: We currently deliver only to selected ZIP codes. Orders placed before 8 pm are eligible for next day delivery. Orders placed after 8pm will be available for delivery in 2 days"
                        )}
                        .
                      </p>
                    )}
                    {pickupOption === "localDelivery" && (
                      <div className="relative inline-block">
                        <input
                          type="text"
                          value={
                            localAddress.dateOfDelivery
                              ? formatDate(localAddress.dateOfDelivery)
                              : t("Select date")
                          }
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
                              minDate={minDate1} // disables past dates
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
                      type="email"
                      name="email"
                      placeholder={t("Email")}
                      value={localAddress.email}
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
                      className="m-1 border rounded-lg h-10 py-2 pl-2 md:pl-4 pr-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 grid-cols-1 text-sm w-[295px] md:w-[300px]"
                      required
                    />

                    {pickupOption === "localDelivery" && (
                      <select
                        name="zipcode"
                        value={localAddress.zipcode}
                        onChange={handleInputChange1}
                        className="m-1.5 border rounded-lg h-10 py-2 pl-2 md:pl-2 pr-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 grid-cols-1 text-sm w-[295px] md:w-[300px]"
                        required
                      >
                        <option value="">{t("Select Zipcode")}</option>
                        {pincodes.map((zipcode, index) => (
                          <option key={index} value={zipcode.pincode}>
                            {zipcode.pincode}
                          </option>
                        ))}
                      </select>
                    )}

                    <AddressInput
                      setProfileData={setLocalAddress}
                      profileData={localAddress}
                      value={localAddress.address}
                      className=" m-1 border rounded-lg py-2 pl-2 md:pl-4 md:pr-2 pr-7 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500  !z-[999999999] text-xs md:text-sm md:w-[608px] w-[295px]"
                      required
                    />

                    <input
                      type="text"
                      name="ApartmentNo"
                      placeholder={t("Enter Apartment # ")}
                      value={localAddress.ApartmentNo}
                      onChange={handleInputChange1}
                      className="m-1 border rounded-lg h-10 py-2 pl-2 md:pl-4 pr-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 grid-cols-1 text-sm w-[295px] md:w-[300px]"
                    />

                    <input
                      type="text"
                      name="SecurityGateCode"
                      placeholder={t("Security Gate Code")}
                      value={localAddress.SecurityGateCode}
                      onChange={handleInputChange1}
                      className="m-1 border rounded-lg h-10 py-2 pl-2 md:pl-4 pr-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 grid-cols-1 text-sm w-[295px] md:w-[300px]"
                    />
                    {pickupOption === "ShipmentDelivery" && (
                      <p className="text-red-500 text-sm py-1 pl-2 md:pl-1 md:pr-2 pr-7">
                        {" "}
                        {t(
                          "Note: We currently deliver to 49/50 U.S. states. Unfortunately, we do not deliver to Hawaii at this time"
                        )}
                        .{" "}
                      </p>
                    )}
                    <label className="flex items-center space-x-2 ps-2">
                      <input
                        type="checkbox"
                        checked={localAddress.isBusinessAddress || false}
                        onChange={(e) =>
                          setLocalAddress({
                            ...localAddress,
                            isBusinessAddress: e.target.checked,
                          })
                        }
                      />
                      <span className="text-sm mt-1 mb-1">
                        {t("This is business address")}
                      </span>
                    </label>

                    <input
                      type="text"
                      name="BusinessAddress"
                      placeholder={t("Enter Company Name")}
                      value={localAddress.BusinessAddress}
                      onChange={handleInputChange1}
                      className="m-1.5 border rounded-lg h-10 py-2 pl-2 md:pl-4 pr-10 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500  text-sm md:w-[608px] w-[295px]"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

          <div className="bg-white w-full rounded-[5px] shadow-md md:p-5 p-2 mt-5">
            {cartData && cartData.length > 0 ? (
              <>
                <div className="flex justify-start items-center gap-5">
                  <div className="md:w-[45px] w-[35px] h-[30px] md:h-[35px] rounded-[8px] bg-custom-green flex justify-center items-center">
                    <GoClock className="text-white md:w-[30px] w-[25px] md:h-[24px] h-[20px]" />
                  </div>
                  <div>
                    <p className="text-black font-semibold text-[18px]">
                      {pickupOption === "orderPickup" ||
                        pickupOption === "driveUp"
                        ? t("Pick up in 2 Hours")
                        : pickupOption === "localDelivery"
                          ? t("Delivery is next day")
                          : t("Delivery in 3 to 5 business days")}
                    </p>
                  </div>
                </div>
                {(pickupOption === "orderPickup" ||
                  pickupOption === "driveUp") && (
                    <p className="text-red-500 text-sm py-1 mb-2 px-2">
                      {t(
                        "*Note: Orders placed before 2 PM are eligible for same-day pickup. Orders placed after 2 PM will be available for pickup the next day."
                      )}
                    </p>
                  )}
              </>
            ) : (
              <div className="bg-white w-full rounded-[5px] md:p-5 p-2 mt-5 flex flex-col justify-center items-center md:min-h-[580px] min-h-[700px]">
                <Image src="/cart2.jpg" alt="cart" width={100} height={100} style={{ width: "auto", height: "auto" }} />
                <p className="text-black  text-[18px] mb-2 mt-2">
                  {t("Your cart is empty")}
                </p>
                <button
                  className=" text-custom-green border-2 border-custom-green text-[20px] font-medium rounded-[18px] px-4 md:px-8 mt-2 py-2 "
                  onClick={() => {
                    setOpenCart(false);
                    router.push("/categories/all");
                  }}
                >
                  {t("Browse Products")}
                </button>
              </div>
            )}
            {cartData?.map((item, i) => (
              <div key={i} className="grid w-full md:gap-3 gap-2 mt-3">
                <div className="flex justify-start md:gap-4 gap-4 items-start  w-full">
                  <div className="relative md:w-[120px] w-[80px] md:h-[120px] h-[80px] rounded-[10px] flex items-center justify-center overflow-hidden">
                    <Image
                      src={item?.selectedImage || item?.image}
                      alt="item"
                      fill
                      className="object-cover rounded-[10px]"
                      sizes="120px"
                    />
                  </div>


                  <div className="md:w-full  w-[250px] flex flex-col justify-start items-start md:gap-0 gap-2">
                    <p className="md:pl-3 w-full  text-custom-purple  md:text-base text-[14px]">
                      {lang === "en" ? item?.name : item?.vietnamiesName}
                    </p>

                    <div className="flex flex-col md:flex-row justify-center md:gap-20 gap-1 mt-1">
                      <div className="md:pt-2 pt-0 flex md:flex-col flex-row md:w-[80px]">
                        <p className="text-custom-newGrayColors font-normal text-sm ">
                          <span className="md:pl-3">
                            {item?.price_slot?.value ?? 1}
                          </span>{" "}
                          <span>{item?.price_slot?.unit ?? "unit"}</span>
                        </p>
                        <p className="text-custom-newGrayColors font-normal text-sm ">
                          <span className="pl-3">
                            {constant.currency}
                            {item?.price}
                          </span>{" "}
                          {item?.price_slot?.other_price && (
                            <span className="line-through pl-3">
                              {constant.currency}
                              {item?.price_slot?.other_price}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-row justify-center md:gap-20 gap-4">
                        <div className="flex justify-center items-center  md:mt-0 mt-3 md:gap-10 gap-4">
                          <div className="bg-gray-100 md:w-[153px] w-[125px] md:h-[39px] rounded-[8px] flex justify-center items-center">
                            <div
                              className="h-[39px] w-[51px] bg-[#2e7d32] cursor-pointer rounded-[8px] rounded-r-none flex justify-center items-center"
                              onClick={() => {
                                if (item.qty > 1) {
                                  const nextState = produce(
                                    cartData,
                                    (draft) => {
                                      draft[i].qty -= 1;
                                      const price = parseFloat(draft[i]?.price);
                                      draft[i].total = price * draft[i].qty;
                                    }
                                  );
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
                              className="h-[39px] w-[51px] bg-[#2e7d32] cursor-pointer rounded-[8px] rounded-l-none flex justify-center items-center"
                              onClick={() => {
                                const nextState = produce(cartData, (draft) => {
                                  if (draft[i].qty + 1 > item.Quantity) {
                                    props.toaster({
                                      type: "error",
                                      message:
                                        "Item is not available in this quantity in stock. Please choose a different item.",
                                    });
                                    return;
                                  }
                                  draft[i].qty += 1;
                                  const price = parseFloat(draft[i]?.price);
                                  draft[i].total = price * draft[i].qty;
                                });
                                setCartData(nextState);
                                localStorage.setItem(
                                  "addCartDetail",
                                  JSON.stringify(nextState)
                                );
                              }}
                            >
                              <IoAddSharp className="h-[30px] w-[30px] text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="flex md:justify-center justify-start md:items-center items-start  md:mt-0 mt-5 gap-5">
                          <p className="text-custom-purple font-semibold text-base">
                            {constant.currency}
                            {item?.total}
                            {/* {item?.price_slot?.other_price && (
                              <del className="text-custom-red font-normal text-xs ml-2">
                                {constant.currency}
                                {item?.price_slot?.other_price}
                              </del>
                            )} */}
                          </p>
                          <IoMdClose
                            className="w-[22px] h-[22px] text-custom-newGray ml-1 cursor-pointer"
                            onClick={() => {
                              cartClose(item, i);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex text-center w-full md:-mt-6 -mt-3">
                  {pickupOption === "ShipmentDelivery" &&
                    (item.isShipmentAvailable ? (
                      <p className="text-custom-green text-sm md:text-base md:mt-3 mt-4 w-full md:text-center">
                        {t("Product is available for Shipment Delivery")}
                      </p>
                    ) : (
                      <p className="text-red-500 text-sm md:text-base md:mt-3 mt-4 w-full md:text-center">
                        {t("Product is Not available for Shipment Delivery")}
                      </p>
                    ))}

                  {pickupOption === "driveUp" &&
                    (item.isCurbSidePickupAvailable ? (
                      <p className="text-custom-green text-sm md:text-base md:mt-3 mt-4 w-full md:text-center">
                        {t("Product is available for CurbSide Pickup")}
                      </p>
                    ) : (
                      <p className="text-red-500 text-sm md:text-base md:mt-3 mt-4 w-full md:text-center">
                        {t("Product is Not available for CurbSide Pickup")}
                      </p>
                    ))}
                  {pickupOption === "orderPickup" &&
                    (item.isInStoreAvailable ? (
                      <p className="text-custom-green text-sm md:text-base md:mt-3 mt-4 w-full md:text-center">
                        {t("Product is available for In Store Pickup")}
                      </p>
                    ) : (
                      <p className="text-red-500 text-sm md:text-base md:mt-3 mt-4 w-full md:text-center">
                        {t("Product is Not available for In Store Pickup")}
                      </p>
                    ))}
                  {pickupOption === "localDelivery" &&
                    (item.isNextDayDeliveryAvailable ? (
                      <p className="text-custom-green text-sm md:text-base md:mt-3 mt-4 w-full md:text-center">
                        {t("Product is available for Next Day Delivery")}
                      </p>
                    ) : (
                      <p className="text-red-500 text-sm md:text-base md:mt-3 mt-4 w-full md:text-center">
                        {t("Product is Not available for Next Day Delivery")}
                      </p>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {cartData.length > 0 && (
            <div className="bg-white w-full rounded-[5px] shadow-md md:p-5 p-3 mt-5">
              <div className="flex justify-between items-center w-full">
                <p className="text-custom-black font-semibold text-[18px]">
                  {t("Cart Summary")}
                </p>
              </div>
              <div className=" pt-2 flex justify-between items-center w-full">
                <p className="text-custom-black font-normal text-base">
                  {t("Subtotal")}
                </p>
                <p className="text-custom-black font-normal text-base">
                  {constant.currency}
                  {CartTotal}
                </p>
              </div>
              <div className=" pt-2 flex justify-between items-center w-full">
                <p className="text-custom-black font-normal text-base">
                  {t("Coupon Discount")}
                </p>

                {!appliedCoupon && (
                  <p
                    className="text-custom-green font-semibold hover:underline text-base cursor-pointer"
                    onClick={() => setOpenModel(true)}
                  >
                    {t("Apply Coupon")}
                  </p>
                )}

                {appliedCoupon && (
                  <div className=" text-custom-green rounded-md flex items-center justify-end w-full md:w-[400px]">
                    <span className="text-base">
                      {t("Coupon")} {" "}
                      {t("applied!")}
                    </span>

                    <button
                      onClick={() => {
                        setAppliedCoupon(false)
                        setSearchTerm("");
                        setDiscountCode("")
                        setDiscount(0);
                        props.toaster({
                          type: "success",
                          message: "Coupon removed successfully",
                        });
                      }}
                      className="text-red-600 hover:text-red-800 text-sm ml-4"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
              {appliedCoupon && (
                <div className=" pt-2 flex justify-between items-center w-full">
                  <p className="text-custom-black font-normal text-base">
                    {t("Discount amount")}
                  </p>
                  <p className="text-custom-black font-normal text-base">
                    - {constant.currency}
                    {discount}
                  </p>
                </div>
              )}
              {pickupOption === "localDelivery" && (
                <div className="flex justify-between items-center w-full pt-3 ">
                  <p className="text-black font-normal text-base">
                    {t("Delivery Tip (optional)")}
                    <p className="text-black font-normal text-[12px]">
                      {t("100% of tip goes directly to your driver")}
                    </p>
                  </p>
                  <div>
                    <select
                      className="p-2 border rounded-sm"
                      value={deliverytip}
                      onChange={(e) => setdeliverytip(e.target.value)}
                    >
                      <option value="">{t("Select a tip")}</option>
                      <option value="0">$0</option>
                      <option value="2">$2</option>
                      <option value="5">$5</option>
                      <option value="8">$8</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center w-full pt-2">
                <p className="text-black font-normal text-base">
                  {t("Delivery Charges")}
                </p>

                {pickupOption === "orderPickup" ||
                  pickupOption === "driveUp" ? (
                  <p className="font-normal text-base">{t("$0.00")}</p>
                ) : pickupOption === "localDelivery" ? (
                  CartTotal < 35 ? (
                    <p className="text-custom-black font-normal text-base">
                      {constant.currency} {currentLocalCost}
                    </p>
                  ) : (
                    <p className="font-normal text-base">{t("$0.00")}</p>
                  )
                ) : pickupOption === "ShipmentDelivery" ? (
                  CartTotal < 200 ? (
                    <p className="text-custom-black font-normal text-base">
                      {constant.currency} {currentShipmentCost}
                    </p>
                  ) : (
                    <p className=" font-normal text-base">{t("$0.00")}</p>
                  )
                ) : null}
              </div>

              <div className="flex justify-between items-center w-full pt-5">
                <p className="text-custom-black font-bold text-[18px]">
                  {t("Total Payable")}
                </p>
                <p className="text-custom-black font-bold text-base">
                  {constant.currency}
                  {mainTotal}
                </p>
              </div>

              {openModel && (
                <div className="w-full  mx-auto">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2"></div>

                    {/* Search input */}
                    <div className="flex">
                      <div className="relative w-full">
                        <input
                          type="text"
                          className="w-full md:px-10 ps-6 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black md:text-[16px] text-sm"
                          placeholder={t("Enter coupon code or search coupons")}
                          value={searchTerm}
                          onChange={handleSearchChange}
                        />
                        <Search
                          className="absolute left-1 md:left-3 top-2.5 text-gray-400"
                          size={20}
                        />
                        {searchTerm && (
                          <button
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            onClick={() => setSearchTerm("")}
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>
                      <p
                        onClick={() => setOpenModel(false)}
                        className="text-black cursor-pointer text-[20px] font-bold md:mx-2 mx-1 pt-1"
                      >
                        {" "}
                        <X size={28} />
                      </p>
                    </div>
                  </div>

                  {!appliedCoupon && (
                    <button
                      className="mt-4 w-full py-2 bg-custom-green text-white rounded-md  focus:outline-none  disabled:bg-gray-400 disabled:cursor-not-allowed"
                      onClick={handleApplyCoupon}
                    >
                      {t("Apply Coupon")}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {cartData.length > 0 && (
            <>
              {isLoggedIn ? (
                <button
                  className="bg-white border-gray-200 border-[3px] h-[50px] rounded-[12px] w-full font-semibold text-custom-green cursor-pointer text-lg md:texl-xl text-center mt-5 mb-6"
                  onClick={() => {
                    if (cartData?.length === 0) {
                      toaster &&
                        toaster({
                          type: "warning",
                          message: "Your cart is empty",
                        });
                    } else {
                      createProductRquest();
                    }
                  }}
                >
                  {t("Proceed To Checkout")}
                </button>
              ) : (
                <button
                  className="bg-white border-gray-200 border-[3px] h-[50px] rounded-[12px] w-full font-semibold text-black cursor-pointer text-lg md:texl-xl  text-center mt-5 mb-6"
                  onClick={() => {
                    setOpenCart(false);
                    router.push("/signIn");
                  }}
                >
                  {t("Login to Checkout")}
                </button>
              )}
            </>
          )}
        </div>
      </Drawer>


    </>
  );
};

export default Navbar;
