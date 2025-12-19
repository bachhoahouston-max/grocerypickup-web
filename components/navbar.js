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
  const [isOnce, setIsOnce] = useState(false);
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
      props.toaster({
        type: "error",
        message: "Please log in to apply the coupon.",
      });
      return;
    }
    const newData = {
      code: searchTerm,
      cartValue: CartTotal,
      userId: user._id,
    };
    props.loader(true);

    Api("post", "ValidateCouponforUser", newData, router)
      .then((res) => {
        if (res.status) {
          setDiscount(res.data?.discount);
          setDiscountCode(searchTerm);
          setAppliedCoupon(true);
          props.toaster({
            type: "success",
            message: res?.data?.message || "Coupon applied successfully",
          });
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
    if (
      appliedCoupon &&
      (baseCartTotal > mainTotal || discount > baseCartTotal)
    ) {
      props.toaster({
        type: "error",
        message: "Coupon removed Due to Main Total change, Please apply again",
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

  useEffect(
    () => {
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
    },
    [
      profileData.email,
      profileData.lastname,
      profileData.mobile,
      profileData.username,
    ],
    []
  );

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
  }, [openCart]);

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

  const cartlenth = cartData.reduce(
    (total, item) => total + (item.qty || 0),
    0
  );

  return (
    <>
      <header className="md:shadow-none shadow-md bg-white w-full sticky top-0 z-100">
        <div className="max-w-7xl mx-auto flex items-center md:justify-between justify-center md:gap-0 gap-2 md:ps-0 ps-4 py-2">
          <div className="relative md:w-40 w-32 h-14  flex items-center ">
            <Image
              src="/Logo2.png"
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
                <span className="text-gray-800 font-medium">
                  {t("Sign in")}
                </span>
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
                          router.push("/Mybooking");
                        }}
                      >
                        {t("My Order")}
                        <IoIosArrowForward className="text-xl" />
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-white/10 flex justify-between items-center cursor-pointer"
                        onClick={() => {
                          setShowHover(false);
                          router.push("/Myhistory");
                        }}
                      >
                        {t("History")}
                        <IoIosArrowForward className="text-xl" />
                      </li>
                      <li
                        className="px-4 py-2 hover:bg-white/10 flex justify-between items-center cursor-pointer"
                        onClick={() => {
                          setShowHover(false);
                          router.push("/editProfile");
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
                            confirmButtonColor: "#2e7d32",
                            cancelButtonColor: "#2e7d32",
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
                // setOpenCart(true);
                // setMobileMenu(!mobileMenu);
                // getProfileData();
                router.push("/Cart");
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
              <option value="vi">VI</option>
              <option value="en">EN</option>
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

          <div></div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
