import React, { useEffect, useState, useRef, useContext } from "react";
import constant from "../services/constant";
import { useRouter } from "next/router";
import { CheckCircle, Trash, X } from "lucide-react";
import { IoIosArrowBack, IoIosClose } from "react-icons/io";
import { produce } from "immer";
import { cartContext, userContext } from "@/pages/_app";
import { Api } from "@/services/service";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import { FaRegCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import CartDrawer from "@/components/CartDrawer";
import AddressForm from "@/components/AddressForm";
import ShippingInfoCard from "@/components/ShippingInfoCard";

function Cart(props) {
  const router = useRouter();
  const [user, setUser] = useContext(userContext);
  const [CartTotal, setCartTotal] = useState(0);
  const [pincodes, setPincodes] = useState([]);
  const [paymentChecked, setPaymentChecked] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);
  const [cartData, setCartData] = useContext(cartContext);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [mainTotal, setMainTotal] = useState(0);
  const [pickupOption, setPickupOption] = useState("");
  const [baseCartTotal, setBaseCartTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(false);
  const [deliverytip, setdeliverytip] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountCode, setDiscountCode] = useState(0);
  const [isOnce, setIsOnce] = useState(false);
  const { t } = useTranslation();
  const [cancelPopup, setCancelPopup] = useState(false);
  const isLoggedIn = user?._id || user?.token;
  const [open, setOpen] = useState(false);
  const [currentLocalCost, setCurrentLocalCost] = useState(0);
  const [currentShipmentCost, setCurrentShipmentCost] = useState(0);
  const [orderId, setOrderID] = useState("");
  const [successPopup, setSuccessPopup] = useState(false);
  const [shipcCost, setShipCost] = useState({});
  const [serviceFee, setServiceFee] = useState(0);

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

  const [profileData, setProfileData] = useState({});
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
    isBusinessAddress: "",
    BusinessAddress: "",
    name: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    location: {
      type: "Point",
      coordinates: [profileData.lng || null, profileData.lat || null],
    },
  });

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetail");
    const token = localStorage.getItem("token");

    if (userDetails) {
      setUser(JSON.parse(userDetails));
      getProfileData();
    }
  }, []);

  useEffect(() => {
    getAllPincodes();
    getShippingCost();
  }, []);

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

  const getShippingCost = async () => {
    try {
      const res = await Api("get", "getShippingCost", "", props.router);

      if (res.shippingCosts && res.shippingCosts.length > 0) {
        const costs = res.shippingCosts[0];
        setCurrentLocalCost(costs.ShippingCostforLocal || 0);
        setCurrentShipmentCost(costs.ShipmentCostForShipment || 0);

        setShipCost(costs);
      }
    } catch (err) {
      props.loader(false);
      props.toaster({ type: "error", message: err?.message });
    }
  };

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
          setProfileData(res.data);
          setLocalAddress({
            dateOfDelivery: "",
            address: res.data.address || "",
            name: res.data.username || "",
            lastname: res.data.lastname || "",
            phoneNumber: res.data?.number || "",
            email: res.data?.email || "",
            BusinessAddress: res.data?.BusinessAddress || "",
            SecurityGateCode: res.data?.SecurityGateCode || "",
            ApartmentNo: res.data?.ApartmentNo || "",
            zipcode: res.data?.zipcode || "",
            location: {
              type: "Point",
              coordinates: [
                res?.data?.location?.coordinates[0] || 0,
                res?.data?.location?.coordinates[1] || 0,
              ],
            },
          });
        }
      })
      .catch((err) => {
        props.loader(false);
      });
  };

  const updateProfile = () => {
    props.loader(true);
    const data = {
      ...localAddress,
      userId: user._id,
      number: localAddress.phoneNumber,
    };
    Api("post", "updateProfile", data, router)
      .then((res) => {
        props.loader(false);
        if (res?.status) {
          props.toaster({
            type: "success",
            message: t("Profile updated successfully"),
          });
          setOpen(false);

          if (res.data) {
            const userDetail = JSON.parse(
              localStorage.getItem("userDetail") || "{}"
            );
            const updatedUser = { ...userDetail, ...res.data };
            localStorage.setItem("userDetail", JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        } else {
          setOpen(false);
          props.toaster({
            type: "error",
            message: res?.data?.message || t("Failed to update profile"),
          });
        }
      })
      .catch((err) => {
        setOpen(false);
        props.loader(false);
        props.toaster({
          type: "error",
          message: err?.data?.message || t("Failed to update profile"),
        });
      });
  };

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

  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
    let fee = 0;
    if (pickupOption === "localDelivery") {
      delivery =
        sumWithInitial <= shipcCost?.minShippingCostforLocal
          ? currentLocalCost
          : 0;
      fee =
        sumWithInitial <= shipcCost?.minServiesCost
          ? shipcCost?.serviesCost
          : 0;
      console.log("ander", fee);
    } else if (pickupOption === "ShipmentDelivery") {
      delivery =
        sumWithInitial <= shipcCost?.minShipmentCostForShipment
          ? currentShipmentCost
          : 0;
    } else {
      delivery = 0;
    }

    setBaseCartTotal(sumWithInitial);
    setServiceFee(fee.toFixed(2));
    console.log("fee", fee);

    setDeliveryCharge(delivery.toFixed(2));

    const cartAfterDiscount = sumWithInitial - discount;
    let finalTotal;

    if (pickupOption === "localDelivery") {
      finalTotal = cartAfterDiscount + delivery + Number(deliverytip) + fee;
    } else {
      finalTotal = cartAfterDiscount + delivery;
    }

    setCartTotal(sumWithInitial.toFixed(2)); // Now correct total
    setMainTotal(finalTotal.toFixed(2));
  }, [cartData, pickupOption, deliverytip, discount]);

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

  const createProductRquest = async (e) => {
    if (!pickupOption) {
      return props.toaster({
        type: "error",
        message: "Please select a pickup option",
      });
    }

    if (pickupOption === "localDelivery") {
      if (!localAddress.dateOfDelivery) {
        return props.toaster({
          type: "error",
          message: "Please Enter Delivery Date",
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
        product: element?.id,
        image: element.selectedColor?.image,
        BarCode: element.BarCode,
        total: element.total,
        price: element.price,
        qty: element.qty,
        seller_id: element.userid,
        saleID: element.SaleID || null,
        productSource: element.productSource || "NORMAL",
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
    const deliveryTip = parseFloat(deliverytip || 0);
    const servicefee = parseFloat(serviceFee || 0);

    let newData = {
      productDetail: data,
      total: mainTotal,
      subtotal: CartTotal,
      discount: discount,
      discountCode: discountCode,
      user: user._id,
      Email: user.email,
      isOrderPickup,
      isOnce,
      isDriveUp,
      isLocalDelivery,
      isShipmentDelivery,
      dateOfDelivery: date || localAddress.dateOfDelivery,
      Deliverytip: deliveryTip.toString(),
      serviceFee: servicefee.toString(),
      order_platform: "web",
    };

    localStorage.setItem("checkoutData", JSON.stringify(newData));
    props.loader && props.loader(true);
    console.log(newData);
    try {
      const createRes = await Api(
        "post",
        "createProductRquest",
        newData,
        router
      );
      if (createRes.status) {
        const data = createRes.data.orders || [];
        console.log(data);
        setOrderID(data.orderId);
        createCheckoutSession(data.orderId);
      } else {
        props.loader && props.loader(false);
        props.toaster({ type: "error", message: "Order save failed" });
      }
    } catch (err) {
      props.loader && props.loader(false);
      props.toaster({ type: "error", message: err?.message });
    }

    // if (createRes.status) {

    // } else {
    //   props.loader && props.loader(false);
    //   props.toaster({ type: "error", message: "Order save failed" });
    // }
  };

  const createCheckoutSession = async (ID) => {
    const checkoutData = JSON.parse(localStorage.getItem("checkoutData"));
    const cartDetails = JSON.parse(localStorage.getItem("addCartDetail"));

    const lineItems = cartDetails.map((item) => ({
      quantity: item.qty || 1,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
          tax_code: item.tax_code || "txcd_10000000",
        },
      },
    }));

    const deliveryTip = parseFloat(checkoutData.Deliverytip || 0);
    const servicefee = parseFloat(serviceFee || 0);
    const deliveryCharge = parseFloat(
      pickupOption === "localDelivery" &&
        CartTotal < shipcCost?.minShippingCostforLocal
        ? currentLocalCost
        : pickupOption === "ShipmentDelivery" &&
          CartTotal < shipcCost?.minShipmentCostForShipment
        ? currentShipmentCost
        : 0 || 0
    );

    const metadata = {
      userId: user?._id,
      deliveryTip: deliveryTip.toString(),
      deliveryCharge: deliveryCharge.toString(), // still passing to backend
      serviceFee: servicefee.toString(),
      hasDiscount: "true",
      discountAmount: checkoutData?.discount?.toString() || "0",
      discountCode: checkoutData?.discountCode || "",
      isOnce: checkoutData?.isOnce,
      isPickupOrder: checkoutData?.isOrderPickup?.toString() || "false",
      isCurbside: checkoutData?.isDriveUp?.toString() || "false",
    };

    const body = {
      line_items: lineItems,
      customer_data: {
        email: user?.email,
        name: user?.name,
        phone: user?.phone,
        address: {
          line1: profileData?.Local_address?.address,
          city: profileData?.Local_address?.city,
          state: profileData?.Local_address?.state,
          postal_code: profileData?.Local_address?.zipcode || "77072",
          country: profileData?.Local_address?.country,
        },
      },
      metadata,
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: "Standard Delivery",
            type: "fixed_amount",
            fixed_amount: {
              amount: Math.round(deliveryCharge * 100), // deliveryCharge used here
              currency: "usd",
            },
          },
        },
      ],
      success_url: `${window.location.origin}/Cart?session_id={CHECKOUT_SESSION_ID}&from=${router.query.from}&orderId=${ID}`,
      cancel_url: `${window.location.origin}/Cart?status=cancelled&orderId=${ID}`,
    };

    // props.loader(true);
    try {
      props.loader(true);
      const res = await Api("post", "create-checkout-session", body, router);
      props.loader(false);

      if (res && res.url) {
        localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
        localStorage.setItem("sessionId", res.session_id);
        props.loader(false);
        window.location.href = res.url;
      } else {
        props.toaster({
          type: "error",
          message: res?.data?.message || "Failed to redirect to Stripe",
        });
      }
    } catch (error) {
      props.loader(false);
      props.toaster({
        type: "error",
        message:
          error?.message ||
          "Something went wrong while creating checkout session",
      });
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    if (cancelDone) return;

    const CancelPayment = async () => {
      props.loader(true);

      try {
        const data = { orderID: router.query.orderId };
        const Res = await Api("post", "cancel-checkout-session", data, router);

        if (Res.status) {
          setCancelPopup(true);
          setCancelDone(true);
        }
      } catch (error) {
        props.toaster({ type: "error", message: "Payment Failed" });
      } finally {
        props.loader(false);
      }
    };

    if (router.query.status === "cancelled" && router.query.orderId) {
      CancelPayment();
    }
  }, [router.isReady, router.query.status, router.query.orderId, cancelDone]);

  useEffect(() => {
    if (!router.isReady) return;
    if (paymentChecked) return;
    if (!router.query.orderId || !router.query.session_id) return;

    const checkPayment = async () => {
      setPaymentChecked(true);
      props.loader(true);

      const data = {
        orderID: router.query.orderId,
        session_id: router.query.session_id,
      };

      try {
        const stripeRes = await Api(
          "post",
          "new-retrieve-checkout-session",
          data,
          router
        );

        if (stripeRes) {
          localStorage.removeItem("addCartDetail");
          localStorage.removeItem("checkoutData");
          setCartData([]);
          setSuccessPopup(true);
        }
      } catch (error) {
        props.toaster({ type: "error", message: "Payment Failed" });
      } finally {
        props.loader(false);
      }
    };

    checkPayment();
  }, [
    router.isReady,
    router.query.orderId,
    router.query.session_id,
    paymentChecked,
  ]);

  const remainingLocal =
    Number(shipcCost?.minShippingCostforLocal) - Number(CartTotal);

  const remainingShipping =
    Number(shipcCost?.minShipmentCostForShipment) - Number(CartTotal);

  const isAfter12PM = () => {
    const now = new Date(); // local timezone
    const hours = now.getHours();
    const minutes = now.getMinutes();

    return hours > 12 || (hours === 12 && minutes > 0);
  };

  const isAfterNoon = isAfter12PM();

  const minDate1 = (() => {
    const now = new Date();
    const hours = now.getHours();

    const today = new Date(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    // 👉 12 PM ke baad → kal
    if (hours >= 12) {
      return tomorrow;
    }

    // 👉 12 PM se pehle → aaj
    return today;
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 py-2 md:mt-5 mt-8 md:mb-0 mb-10">
      <div
        className={`py-4 w-full relative  ${!cartData.length ? "h-full " : ""} 
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
            cartClose={cartClose}
          />
          <div className="w-full md:w-[40%] flex flex-col gap-4 px-0 md:px-0">
            {cartData.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border-2 p-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                    {[
                      {
                        id: "orderPickup",
                        title: t("In Store Pickup"),
                        subtitle: t("Pick it up inside the store"),
                        type: "pickup",
                      },
                      {
                        id: "driveUp",
                        title: t("Curbside Pickup"),
                        subtitle: t("We bring it out to your car"),
                        type: "pickup",
                      },
                      {
                        id: "localDelivery",
                        title: isAfterNoon
                          ? t("Next Day Local Delivery")
                          : t("Same Day Local Delivery"),
                        subtitle: isAfterNoon
                          ? t("Cut off time 11:59 pm")
                          : t("Cut off time 12 pm"),
                        type: "delivery",
                      },
                      {
                        id: "ShipmentDelivery",
                        title: t("Shipping"),
                        subtitle: t("Delivery in 3 to 5 business days"),
                        type: "delivery",
                      },
                    ].map((opt) => {
                      const selected = pickupOption === opt.id;

                      return (
                        <label
                          key={opt.id}
                          className={`flex flex-col border-gray-300 shadow-md border-2 items-start md:p-4 p-2 rounded-lg  ${
                            selected
                              ? "border-green-400 shadow-md border-3"
                              : "border-gray-200 border"
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
                                <div className="font-semibold text-base md:text-lg text-orange-600">
                                  {opt.title}
                                </div>
                                <div className="text-gray-500 text-sm ">
                                  {opt.subtitle}
                                </div>
                              </div>
                            </div>

                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selected
                                  ? "border-green-600"
                                  : "border-gray-300"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  selected ? "bg-green-600" : "bg-white"
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
                                    value={
                                      date ? formatDate(date) : t("Select date")
                                    }
                                    readOnly
                                    onClick={handleIconClick}
                                    className="w-full border-2 rounded-lg py-2 px-3 pr-5 text-gray-700 focus:outline-none focus:ring-2 "
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
                              <div className="flex flex-col gap-3">
                                {opt.id === "localDelivery" && (
                                  <div className="relative w-full max-w-[640px]">
                                    <input
                                      type="text"
                                      value={
                                        localAddress.dateOfDelivery
                                          ? formatDate(
                                              localAddress.dateOfDelivery
                                            )
                                          : t("Select date")
                                      }
                                      readOnly
                                      onClick={handleIconClick}
                                      className="border-2 text-black rounded-lg py-2 px-3 pr-10 w-full"
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

                                <ShippingInfoCard
                                  localAddress={localAddress}
                                  setOpen={setOpen}
                                  getProfileData={getProfileData}
                                />

                                {open && (
                                  <AddressForm
                                    profileData={localAddress}
                                    setProfileData={setLocalAddress}
                                    onclose={() => setOpen(false)}
                                    onSubmit={updateProfile}
                                    pincodes={pincodes}
                                    optionType={opt.id}
                                  />
                                )}

                                {opt.id === "localDelivery" && (
                                  <p className="text-[12px] text-gray-700 text-start">
                                    {t(
                                      "Note: We currently deliver only to selected ZIP codes. Orders placed before 12pm noon are eligible for same day delivery. Orders placed after 12pm will be available for delivery the next business day"
                                    )}
                                  </p>
                                )}
                                {opt.id === "ShipmentDelivery" && (
                                  <p className="text-[12px] text-gray-700 text-start">
                                    {t(
                                      "Note: We currently deliver to 49/50 U.S. states. Unfortunately, we do not deliver to Hawaii at this time"
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
              <>
                <div>
                  <div className="bg-white rounded-lg  flex flex-row gap-2">
                    <div className="relative flex-1 ">
                      <input
                        type="text"
                        placeholder={t("Enter coupon code")}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full text-[15px] shadow-md text-black border-2 rounded-md py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {searchTerm && (
                        <X
                          onClick={() => {
                            setAppliedCoupon(false);
                            setSearchTerm("");
                            setDiscountCode("");
                            setDiscount(0);
                            props.toaster({
                              type: "success",
                              message: "Coupon removed successfully",
                            });
                          }}
                          size={22}
                          className=" cursor-pointer absolute text-custom-green top-2.5 right-2"
                        />
                      )}
                    </div>
                    <button
                      className="bg-custom-green text-white md:px-8 px-4 py-2.5 cursor-pointer text-sm rounded-md"
                      onClick={handleApplyCoupon}
                    >
                      {t("Apply")}
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div className="m-2 text-custom-green rounded-md flex items-center justify-between md:w-[490px] mt-2 w-full ">
                      <span className="text-base">
                        {t("Coupon")} {t("applied!")}
                      </span>

                      <button
                        onClick={() => {
                          setAppliedCoupon(false);
                          setSearchTerm("");
                          setDiscountCode("");
                          setDiscount(0);
                          props.toaster({
                            type: "success",
                            message: "Coupon removed successfully",
                          });
                        }}
                        className="text-custom-green cursor-pointer text-sm ml-4"
                      >
                        <X size={22} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 md:p-5">
                  {pickupOption === "localDelivery" &&
                    (remainingLocal > 0 ? (
                      <h2 className="text-md text-orange-500 mb-2 font-bold">
                        {t("Add")} {constant.currency}
                        {remainingLocal.toFixed(2)}{" "}
                        {t("more to get Free Local Delivery")}
                      </h2>
                    ) : (
                      <h2 className="text-md text-green-600 mb-2 font-semibold">
                        🎉 {t("Free Local Delivery available")}
                      </h2>
                    ))}

                  {pickupOption === "ShipmentDelivery" &&
                    (remainingShipping > 0 ? (
                      <h2 className="text-md text-orange-500 mb-2 font-bold">
                        {t("Add")} {constant.currency}
                        {remainingShipping.toFixed(0)}{" "}
                        {t("more to get Free Shipping Delivery")}
                      </h2>
                    ) : (
                      <h2 className="text-md text-green-600 mb-2 font-semibold">
                        {t("Free Shipping available")}
                      </h2>
                    ))}

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

                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-black">
                        <p className="text-base">{t("Discount amount")}</p>
                        <p className="text-base font-medium">
                          - {constant.currency} {discount}
                        </p>
                      </div>
                    )}

                    {pickupOption === "localDelivery" && (
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-base text-black">
                            {t("Delivery Tip (optional)")}
                          </p>
                          <p className="text-xs text-black">
                            {t("100% of tip goes directly to your driver")}
                          </p>
                        </div>

                        <select
                          className="p-2 border rounded-sm text-black"
                          value={deliverytip}
                          onChange={(e) => setdeliverytip(e.target.value)}
                        >
                          <option value="" className="text-black">
                            {t("Select a tip")}
                          </option>
                          <option value="0">$0</option>
                          <option value="2">$2</option>
                          <option value="5">$5</option>
                          <option value="8">$8</option>
                        </select>
                      </div>
                    )}

                    <div className="flex text-black justify-between items-center">
                      <p className="text-base">{t("Delivery Charges")}</p>

                      <div>
                        {pickupOption === "orderPickup" ||
                        pickupOption === "driveUp" ? (
                          <span className="text-base">{t("$0.00")}</span>
                        ) : pickupOption === "localDelivery" ? (
                          CartTotal < shipcCost?.minShippingCostforLocal ? (
                            <span className="text-base font-medium">
                              {constant.currency} {currentLocalCost}
                            </span>
                          ) : (
                            <span className="text-base">{t("$0.00")}</span>
                          )
                        ) : pickupOption === "ShipmentDelivery" ? (
                          CartTotal < shipcCost?.minShipmentCostForShipment ? (
                            <span className="text-base font-medium">
                              {constant.currency} {currentShipmentCost}
                            </span>
                          ) : (
                            <span className="text-base">{t("$0.00")}</span>
                          )
                        ) : null}
                      </div>
                    </div>

                    <div className="flex text-black justify-between items-center">
                      {pickupOption === "localDelivery" && (
                        <>
                          <p className="text-base">{t("Serviecs Fee")}</p>

                          <div>
                            {CartTotal < shipcCost?.minServiesCost ? (
                              <span className="text-base font-medium">
                                {constant.currency} {serviceFee}
                              </span>
                            ) : (
                              <span className="text-base">{t("$0.00")}</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Total Payable */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <p className="text-lg font-bold text-black">
                        {t("Total Payable")}
                      </p>
                      <p className="text-lg font-bold text-black">
                        {constant.currency} {mainTotal}
                      </p>
                    </div>

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
                            router.push("/signIn");
                          }}
                        >
                          {t("Login to Checkout")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {cartData && cartData.length === 0 && (
          <div className="bg-white w-full rounded-[5px] md:p-5 p-4 mt-5 flex flex-col justify-center items-center min-h-[280px]">
            <div className="relative w-28 h-28 mb-4">
              <Image
                src="/cart2.jpg"
                alt="cart"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-black text-[18px] mb-2">
              {t("Your cart is empty")}
            </p>
            <button
              className="text-custom-green border-2 border-custom-green text-[16px] font-medium rounded-[18px] cursor-pointer w-[200px] mt-2 py-2 px-4"
              onClick={() => {
                router.push("/categories/all");
              }}
            >
              {t("Browse Products")}
            </button>
          </div>
        )}
        {cancelPopup && (
          <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex justify-center items-center z-[9999] px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 relative animate-fadeIn">
              <div className="flex justify-center mb-4">
                <div className="bg-orange-100 text-orange-600 w-16 h-16 flex justify-center items-center rounded-full text-4xl">
                  ⚠️
                </div>
              </div>

              {/* Title */}
              <h2 className="text-center text-2xl font-semibold text-gray-800">
                Order Cancelled
              </h2>

              {/* Message */}
              <p className="text-center text-gray-600 mt-2 text-sm">
                You were redirected back from Stripe. Your order has been
                cancelled successfully.
              </p>

              {/* Buttons */}
              <div className="flex justify-between gap-4 mt-6">
                <button
                  onClick={() => {
                    setCancelPopup(false);
                    router.push("/");
                  }}
                  className="w-1/2 bg-gray-200 cursor-pointer hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium"
                >
                  Home
                </button>

                <button
                  onClick={() => {
                    setCancelPopup(false);
                    router.push("/Cart");
                  }}
                  className="w-1/2 bg-custom-green cursor-pointer text-white py-2 rounded-lg font-medium shadow"
                >
                  Move to Cart
                </button>
              </div>
            </div>
          </div>
        )}
        {successPopup && (
          <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex justify-center items-center z-[9999] px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 relative animate-fadeIn">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 text-green-600 w-16 h-16 flex justify-center items-center rounded-full">
                  <CheckCircle className="w-10 h-10" />
                </div>
              </div>

              <h2 className="text-center text-2xl font-semibold text-gray-800">
                Payment Successful
              </h2>

              <p className="text-center text-gray-600 mt-2 text-sm">
                Your payment has been completed successfully. Your order is now
                placed and being processed.
              </p>

              {/* Buttons */}
              <div className="flex justify-between gap-4 mt-6">
                <button
                  onClick={() => {
                    setSuccessPopup(false);
                    router.push("/");
                  }}
                  className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium cursor-pointer"
                >
                  Home
                </button>

                <button
                  onClick={() => {
                    setSuccessPopup(false);
                    router.push("/Mybooking");
                  }}
                  className="w-1/2 bg-custom-green text-white py-2 rounded-lg font-medium shadow cursor-pointer"
                >
                  My Orders
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
