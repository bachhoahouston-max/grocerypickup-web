import React, { useEffect, useState, useRef, useContext } from "react";
import constant from "../services/constant";
import { useRouter } from "next/router";
import { CheckCircle, Mail, Trash, X } from "lucide-react";
import { IoIosArrowBack, IoIosClose } from "react-icons/io";
import { produce } from "immer";
import { cartContext, userContext } from "@/pages/_app";
import { Api } from "@/services/service";
import { clearSyncedCart } from "@/services/cartSync";
import { getReferralCode, getProductReferralCode } from "@/services/affiliateReferral";
import { cartLineProductId } from "@/services/rewardCart";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import { FaRegCalendarAlt, FaRegCalendarCheck } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import CartDrawer from "@/components/CartDrawer";
import AddressForm from "@/components/AddressForm";
import ShippingInfoCard from "@/components/ShippingInfoCard";
import moment from "moment";

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
  const { t, i18n } = useTranslation();
  const [cancelPopup, setCancelPopup] = useState(false);
  const isLoggedIn = user?._id || user?.token;
  const [open, setOpen] = useState(false);
  const [currentLocalCost, setCurrentLocalCost] = useState(0);
  const [currentShipmentCost, setCurrentShipmentCost] = useState(0);
  const [orderId, setOrderID] = useState("");
  const [successPopup, setSuccessPopup] = useState(false);
  const [shipcCost, setShipCost] = useState({});
  const [serviceFee, setServiceFee] = useState(0);
  const [closureDates, setClosureDates] = useState([]);
  const [extraFees, setExtrafees] = useState(0);
  const [ExtraFeesObj, setExtraFeesObj] = useState({});

  const handleApplyCoupon = () => {
    if (!user?._id) {
      props.toaster({
        type: "error",
        message: "Please log in to apply the coupon.",
      });
      return;
    }

    const notAvailablecoupan = cartData.some(
      (item) => item?.combo_id && item?.accept_coupon === false,
    );

    if (notAvailablecoupan) {
      props.toaster({
        type: "error",
        message:
          "Coupon cannot be applied because one combo product does not allow coupons.",
      });
      return;
    }

    const newData = {
      code: searchTerm,
      cartValue: CartTotal,
      userId: user._id,
      option: pickupOption,
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

  // Keep the latest cart for async validation results to land on
  const cartRef = useRef(cartData);
  cartRef.current = cartData;
  const hasValidatedOnLoad = useRef(false);

  const persistCart = (nextCart) => {
    setCartData(nextCart);
    localStorage.setItem("addCartDetail", JSON.stringify(nextCart));
  };

  const cartSignature = (lines) =>
    JSON.stringify((lines || []).map((line) => [line?.id, line?.qty]));

  // Asks the server for the live price and stock of every cart line and
  // returns the cart with stockStatus / availableQty / updated prices applied.
  const validateCart = async (lines) => {
    const res = await Api(
      "post",
      "validateCart",
      {
        items: lines.map((line) => ({
          productId:
            cartLineProductId(line) || line?.product?._id || line?._id,
          productSource: line?.productSource || "NORMAL",
          priceSlotIndex: line?.priceSlotIndex,
          qty: line?.qty,
        })),
      },
      router,
    );
    const results = Array.isArray(res?.data) ? res.data : [];

    return lines.map((line, i) => {
      const result = results[i];
      if (!result) return line;

      const next = {
        ...line,
        stockStatus: result.stockStatus,
        availableQty: result.availableQty,
        productUnavailable: result.productUnavailable,
      };

      // Reward lines come back without a price — they stay $0
      if (result.price !== null && result.price !== undefined) {
        if (Number(line?.price) !== Number(result.price)) {
          next.previousPrice = line?.price;
          next.priceReviewed = false;
          next.price = result.price;
          next.our_price = result.price;
        }
        if (line?.productSource === "COMBO" && result.productSource !== "COMBO") {
          next.free_product = [];
        }
        if (line?.productSource === "SALE" && result.productSource !== "SALE") {
          next.SaleID = null;
          next.isSaleExpired = true;
        }
        next.productSource = result.productSource;
        next.total = Number(next.price || 0) * Number(line?.qty || 1);
      }

      return next;
    });
  };

  const hasStockIssue = (line) =>
    line?.stockStatus === "UNAVAILABLE" ||
    line?.stockStatus === "OUT_OF_STOCK" ||
    line?.stockStatus === "LIMITED";
  const hasUnreviewedPrice = (line) =>
    line?.previousPrice !== undefined &&
    line?.previousPrice !== null &&
    !line?.priceReviewed;

  // Check stock and prices as soon as the cart page opens (no message)
  const checkCartOnLoad = (snapshot, attempt = 0) => {
    validateCart(snapshot)
      .then((checked) => {
        const latest = cartRef.current;
        if (cartSignature(latest) === cartSignature(snapshot)) {
          persistCart(checked);
        } else if (latest?.length && attempt < 2) {
          // The cart changed while we were checking (e.g. the synced server
          // cart arrived) — check the new cart instead
          checkCartOnLoad(latest, attempt + 1);
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (hasValidatedOnLoad.current || !cartData?.length) return;
    hasValidatedOnLoad.current = true;
    checkCartOnLoad(cartData);
  }, [cartData]);

  const proceedToCheckout = async () => {
    if (!cartData?.length) {
      props.toaster({ type: "warning", message: t("Your cart is empty") });
      return;
    }

    let checked;
    try {
      props.loader(true);
      checked = await validateCart(cartData);
    } catch (err) {
      props.toaster({ type: "error", message: err?.message });
      return;
    } finally {
      props.loader(false);
    }

    // One click shows every problem at once with a single message
    if (checked.some((line) => line?.productUnavailable)) {
      persistCart(checked);
      props.toaster({
        type: "error",
        message: t("Product Unavailable. Remove it from your cart to continue."),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (checked.some(hasStockIssue) || checked.some(hasUnreviewedPrice)) {
      persistCart(
        checked.map((line) =>
          hasUnreviewedPrice(line) ? { ...line, priceReviewed: true } : line,
        ),
      );
      props.toaster({
        type: "error",
        message: t(
          "Remove out-of-stock items and review updated prices before continuing. Sale prices may have ended. Click “Proceed to Checkout” again to continue.",
        ),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    persistCart(checked);
    createProductRquest();
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
  console.log(user);

  const handleOptionChange = (event) => {
    setPickupOption(event.target.value);
    setDiscount(0);
    setDiscountCode(0);
    setAppliedCoupon(false);
    setSearchTerm("");
    console.log("pickup option", event.target.value);
    if (user.zipcode) {
      if (event.target.value === "localDelivery") {
        checkawailability(user.zipcode);
      } else {
        setExtrafees(0);
      }
    }
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
    getClosureDate();
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

  console.log("extraFees", extraFees);

  const checkawailability = (pincode) => {
    Api("post", "checkAvailable", { pincode }, router)
      .then((res) => {
        if (res?.error) {
          props.toaster({ type: "error", message: res?.error });
        } else {
          setExtraFeesObj(res.data);
          if (res?.data?.extendedCharge) {
            if (CartTotal > res?.data.extendedMinCharge) {
              setExtrafees(0);
            } else {
              setExtrafees(res.data.extendedCharge);
            }
          } else {
            setExtrafees(0);
          }
          // setPincodes(res.pincodes || []); // Make sure it's an array
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

  const getClosureDate = () => {
    Api("get", "getClosureDates", null, router)
      .then((res) => {
        if (res?.error) {
          props.toaster({ type: "error", message: res?.error });
        } else {
          setClosureDates(res.data.map((d) => new Date(d.closureDate)));
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
          if (res.data.zipcode) {
            if (pickupOption === "localDelivery") {
              checkawailability(res.data.zipcode);
            } else {
              setExtrafees(0);
            }
          }
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
              localStorage.getItem("userDetail") || "{}",
            );
            const updatedUser = { ...userDetail, ...res.data };
            localStorage.setItem("userDetail", JSON.stringify(updatedUser));
            setUser(updatedUser);
            if (pickupOption === "localDelivery") {
              checkawailability(res.data.zipcode);
            }
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

  const checkAvailabilityAndAddToCart = (mdate) => {
    let cDate = moment(new Date(mdate)).format("YYYY-MM-DD");
    const fdate = closureDates.find(
      (e) => cDate.toString() === moment(new Date(e)).format("YYYY-MM-DD"),
    );
    if (fdate) {
      const cdate = new Date(mdate);
      cdate.setDate(mdate.getDate() + 1);
      checkAvailabilityAndAddToCart(cdate);
    } else {
      return mdate;
    }
  };

  const minDate = (() => {
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour >= 17) {
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      return checkAvailabilityAndAddToCart(tomorrow);
    }
    return checkAvailabilityAndAddToCart(now);
  })();

  useEffect(() => {
    const now = new Date();

    const updatedCart = cartData?.map((item) => {
      const isSaleExpired =
        item?.productSource === "SALE" &&
        item?.endDateTime &&
        new Date(item.endDateTime) < now;

      if (isSaleExpired) {
        return {
          ...item,
          productSource: "NORMAL",
          SaleID: null,
          price: item?.regularPrice,
          total: Number(item?.regularPrice || 0) * Number(item?.qty || 0),
          isSaleExpired: true,
          previousPrice: item?.price,
          priceReviewed: false,
        };
      }

      return item;
    });

    if (JSON.stringify(updatedCart) !== JSON.stringify(cartData)) {
      setCartData(updatedCart);
      localStorage.setItem("addCartDetail", JSON.stringify(updatedCart));
    }

    const sumWithInitial = updatedCart?.reduce((acc, item) => {
      return acc + Number(item?.total || 0);
    }, 0);

    const sumQty = updatedCart?.reduce(
      (acc, item) => acc + Number(item?.qty || 0),
      0,
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
    } else if (pickupOption === "ShipmentDelivery") {
      delivery =
        sumWithInitial <= shipcCost?.minShipmentCostForShipment
          ? currentShipmentCost
          : 0;
    }

    setBaseCartTotal(sumWithInitial);
    setServiceFee(fee.toFixed(2));
    setDeliveryCharge(delivery.toFixed(2));

    const cartAfterDiscount = sumWithInitial - discount;
    let finalTotal;

    if (pickupOption === "localDelivery") {
      if (sumWithInitial < ExtraFeesObj.extendedMinCharge) {
        finalTotal =
          cartAfterDiscount +
          delivery +
          Number(deliverytip) +
          fee +
          ExtraFeesObj.extendedCharge;

        setExtrafees(ExtraFeesObj.extendedCharge);
      } else {
        finalTotal = cartAfterDiscount + delivery + Number(deliverytip) + fee;

        setExtrafees(0);
      }
    } else {
      finalTotal = cartAfterDiscount + delivery;
    }

    setCartTotal(sumWithInitial.toFixed(2));
    setMainTotal(finalTotal.toFixed(2));
  }, [cartData, pickupOption, deliverytip, discount, extraFees]);

  const emptyCart = async () => {
    setCartData([]);
    setDate(null);
    setLocalAddress([]);
    setParkingNo("");
    setPickupOption("orderPickup");
    localStorage.removeItem("addCartDetail");
    setSearchTerm("");
    getProfileData();
    if (user?._id && user?.token) {
      clearSyncedCart(router).catch(() => { });
    }
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

  // "Remove all" on the out-of-stock panel
  const removeOutOfStock = () => {
    const nextState = cartData.filter((line) => !hasStockIssue(line));

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
    const now = new Date();

    d.forEach((element) => {
      const isSaleExpired =
        element?.productSource === "SALE" &&
        element?.endDateTime &&
        new Date(element.endDateTime) < now;

      const finalPrice = isSaleExpired ? element?.regularPrice : element?.price;

      const isReward = element?.productSource === "REWARD";

      data.push({
        product: isReward ? element?.product_id : element?.id,
        point_id: isReward ? element?.point_id : undefined,
        image: element?.selectedColor?.image,
        BarCode: element?.BarCode,
        qty: element?.qty,
        price: finalPrice,
        total: isSaleExpired ? finalPrice * element?.qty : element?.total,
        seller_id: element?.userid,
        saleID: element?.SaleID,
        productSource: isSaleExpired
          ? "NORMAL"
          : element?.productSource || "NORMAL",
        isShipmentAvailable: element?.isShipmentAvailable,
        isNextDayDeliveryAvailable: element?.isNextDayDeliveryAvailable,
        isCurbSidePickupAvailable: element?.isCurbSidePickupAvailable,
        isInStoreAvailable: element?.isInStoreAvailable,
        free_product: element?.free_product?._id,
        combo_id: element?.combo_id,
        referralCode: isReward
          ? ""
          : element?.referralCode || getProductReferralCode(element?.slug),
      });
    });

    const isLocalDelivery = pickupOption === "localDelivery";
    const isOrderPickup = pickupOption === "orderPickup";
    const isDriveUp = pickupOption === "driveUp";
    const dateOfDelivery = (isDriveUp || isOrderPickup) && date ? date : null;
    const isShipmentDelivery = pickupOption === "ShipmentDelivery";

    const unavailableProducts = data.filter(
      (item) => item.isShipmentAvailable === false,
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
        (item) => item.isNextDayDeliveryAvailable === false,
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
        (item) => item.isCurbSidePickupAvailable === false,
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
        (item) => item.isInStoreAvailable === false,
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
      referralCode: getReferralCode(),
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
      extraFees,
      order_platform: "web",
      lang: i18n.language?.startsWith("vi") ? "vi" : "en",
    };

    localStorage.setItem("checkoutData", JSON.stringify(newData));
    props.loader && props.loader(true);

    try {
      const createRes = await Api(
        "post",
        "createProductRquest",
        newData,
        router,
      );
      if (createRes.status) {
        const data = createRes.data.orders || [];
        console.log(data);
        setOrderID(data.orderId);
        // Rewards only and nothing to pay: no Stripe, the order is placed directly
        const rewardOnly = cartData.every((item) => item?.productSource === "REWARD");
        if (rewardOnly && Number(mainTotal) <= 0) {
          await placeFreeOrder(data.orderId);
        } else {
          createCheckoutSession(data.orderId);
        }
      } else {
        props.loader && props.loader(false);
        props.toaster({ type: "error", message: t("Order save failed") });
      }
    } catch (err) {
      props.loader && props.loader(false);
      let errorMsg = err?.message || t("Order save failed");
      if (
        i18n.language?.startsWith("vi") &&
        typeof errorMsg === "string" &&
        errorMsg.includes("is deleted. Remove the item to continue.")
      ) {
        errorMsg = errorMsg.replace(
          "is deleted. Remove the item to continue.",
          "đã bị xóa. Vui lòng xóa sản phẩm để tiếp tục."
        );
      }
      props.toaster({ type: "error", message: errorMsg });
    }

    // if (createRes.status) {

    // } else {
    //   props.loader && props.loader(false);
    //   props.toaster({ type: "error", message: "Order save failed" });
    // }
  };

  const clearCartAfterOrder = () => {
    localStorage.removeItem("addCartDetail");
    localStorage.removeItem("checkoutData");
    setCartData([]);
    // Clear the synced cart immediately rather than waiting on the
    // generic debounced sync — Stripe's redirect back to this page is
    // a full reload, so a pending debounce here can get cancelled
    // before it fires, leaving the pre-order cart on the server to
    // reappear on the next load.
    if (user?._id && user?.token) {
      clearSyncedCart(router).catch(() => { });
    }
    setSuccessPopup(true);
  };

  const placeFreeOrder = async (ID) => {
    try {
      const res = await Api("post", "place-free-order", { orderID: ID }, router);
      if (res?.status) {
        clearCartAfterOrder();
      } else {
        props.toaster({ type: "error", message: res?.message || "Order save failed" });
      }
    } catch (err) {
      props.toaster({ type: "error", message: err?.message || "Order save failed" });
    } finally {
      props.loader && props.loader(false);
    }
  };

  const createCheckoutSession = async (ID) => {
    const checkoutData = JSON.parse(localStorage.getItem("checkoutData"));
    const cartDetails = JSON.parse(localStorage.getItem("addCartDetail"));

    // Reward items are $0 and paid with points, so they're not sent to Stripe
    const lineItems = cartDetails
      .filter((item) => item.productSource !== "REWARD")
      .map((item) => ({
        quantity: item.qty || 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.name,
            tax_code: item.tax_code || "txcd_10000000",
            metadata: {
              productId: item.id || item._id || "",
            },
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
          : 0 || 0,
    );

    // Stripe needs at least one line item. A rewards-only order that still has
    // a delivery fee (and no tip/service fee, which the backend adds as items)
    // charges the fee as a line item instead of as the shipping rate.
    const shippingAmount = Number(deliveryCharge) + Number(extraFees || 0);
    const feeAsLineItem = !lineItems.length && !(deliveryTip > 0) && !(servicefee > 0) && shippingAmount > 0;
    if (feeAsLineItem) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(shippingAmount * 100),
          product_data: { name: "Delivery Fee", tax_code: "txcd_92010001" },
        },
      });
    }

    const metadata = {
      userId: user?._id,
      deliveryTip: deliveryTip.toString(),
      deliveryCharge: deliveryCharge.toString(), // still passing to backend
      serviceFee: servicefee.toString(),
      hasDiscount: "true",
      extraFees,
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
              amount: feeAsLineItem ? 0 : Math.round(shippingAmount * 100), // deliveryCharge used here
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
          router,
        );

        if (stripeRes) {
          clearCartAfterOrder();
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
    <div className="bg-[var(--theme-var)] md:bg-[var(--theme-dek)]">
      <div className="max-w-7xl mx-auto px-4 py-2 md:mt-5 mt-8 md:mb-0 mb-10">
        <div
          className={`py-4 w-full relative  ${!cartData.length ? "h-full " : ""} 
              ${cartData.length > 1 ? "pb-8" : "pb-40"} `}
        >
          <div className="bg-transparent w-full rounded-[5px] flex justify-between items-center">
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
              removeOutOfStock={removeOutOfStock}
              loader={props.loader}
            />
            <div className="w-full md:w-[40%] flex flex-col gap-4 px-0 md:px-0">
              {cartData.length > 0 && (
                <div className="bg-transparent rounded-lg shadow-sm ">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                      {[
                        {
                          id: "orderPickup",
                          title: t("In Store Pickup"),
                          subtitle: t("Pick it up inside the store"),
                          image: "/delivery-instore.png",
                          type: "pickup",
                        },
                        {
                          id: "driveUp",
                          title: t("Curbside Pickup"),
                          subtitle: t("We bring it out to your car"),
                          image: "/delivery-curbside.png",
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
                          image: "/delivery-sameday.png",
                          type: "delivery",
                        },
                        {
                          id: "ShipmentDelivery",
                          title: t("Shipping"),
                          subtitle: t("Delivery in 3 to 5 business days"),
                          image: "/delivery-shipping.png",
                          type: "delivery",
                        },
                      ].map((opt) => {
                        const selected = pickupOption === opt.id;

                        return (
                          <label
                            key={opt.id}
                            className={`flex flex-col border-gray-300 shadow-md border-2 items-start md:p-4 p-2 rounded-lg  ${selected
                              ? "border-green-400 shadow-md border-3"
                              : "border-gray-200 border"
                              } cursor-pointer bg-white`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <img
                                  src={opt.image}
                                  alt={opt.title}
                                  className="h-10 w-14 md:h-12 md:w-16 object-contain shrink-0"
                                />
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
                                  {!(selected && opt.id === "ShipmentDelivery") && (
                                    <div className="text-gray-500 text-sm ">
                                      {opt.subtitle}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "border-green-600" : "border-black"
                                  }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${selected ? "bg-green-600" : "bg-white"
                                    }`}
                                />
                              </div>
                            </div>

                            {selected && opt.type === "pickup" && (
                              <div className="bg-white pt-3 w-full">
                                <div className="flex flex-col gap-3 w-full">
                                  <div className="w-full relative">
                                    <input
                                      type="text"
                                      value={
                                        date
                                          ? formatDate(date)
                                          : t("Select date")
                                      }
                                      readOnly
                                      onClick={handleIconClick}
                                      className="w-full border-2 border-gray-200 rounded-xl py-2.5 px-4 pr-10 text-[15px] md:text-base text-[#1f2a5c] cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400"
                                    />

                                    <span
                                      onClick={handleIconClick}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-custom-green cursor-pointer"
                                    >
                                      <FaRegCalendarAlt size={20} />
                                    </span>

                                    {isOpen && DatePicker && (
                                      <div className="absolute z-40 mt-2">
                                        <DatePicker
                                          selected={date}
                                          onChange={handleDateChange}
                                          inline
                                          minDate={minDate}
                                          excludeDates={closureDates}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {date && (
                                  <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-3 md:p-4">
                                    <FaRegCalendarCheck
                                      size={30}
                                      className="text-green-600 shrink-0 mt-0.5"
                                    />
                                    <div className="text-start">
                                      <p className="font-semibold text-[14px] md:text-[15px] text-green-800">
                                        {opt.id === "driveUp"
                                          ? t("Your Scheduled Curbside Pickup")
                                          : t("Your Scheduled Pickup")}
                                      </p>
                                      <p className="text-[13px] md:text-[14px] text-green-800 leading-snug">
                                        {opt.id === "driveUp"
                                          ? t(
                                            "Ready for pickup about 2 hours after you order. Please wait for an email confirming your order is ready. When you arrive, we’ll bring it to your car.",
                                          )
                                          : t(
                                            "Ready for pickup about 2 hours after you order. Please wait for an email confirming your order is ready before coming to the store.",
                                          )}
                                      </p>
                                    </div>
                                  </div>
                                  )}

                                  <p className="text-[12px] md:text-[13px] text-[#3b4a8c] text-start">
                                    {t(
                                      "*Note: Bach Hoa Houston will hold your order until close of the next business day if your order isn’t picked up within your scheduled pick up date, after that your order will be cancelled and refunded less 5% restocking fee",
                                    )}
                                  </p>
                                  <p className="text-[12px] md:text-[13px] text-[#3b4a8c] text-start">
                                    {t(
                                      "*Note: Orders placed before 5 PM can be picked up the same day. Orders placed after 5 PM will be ready for pickup the next day.",
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
                                              localAddress.dateOfDelivery,
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
                                            selected={
                                              localAddress.dateOfDelivery
                                            }
                                            onChange={handleDateChange1}
                                            inline
                                            minDate={minDate1}
                                            excludeDates={closureDates}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {opt.id === "localDelivery" &&
                                    localAddress.dateOfDelivery && (
                                      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-3 md:p-4">
                                        <FaRegCalendarCheck
                                          size={30}
                                          className="text-green-600 shrink-0 mt-0.5"
                                        />
                                        <div className="text-start">
                                          <p className="font-semibold text-[14px] md:text-[15px] text-green-800">
                                            {t("Your Scheduled Delivery")}
                                          </p>
                                          <p className="text-[13px] md:text-[14px] text-green-800 leading-snug">
                                            {new Date(
                                              localAddress.dateOfDelivery,
                                            ).toLocaleDateString(
                                              i18n.language?.startsWith("vi")
                                                ? "vi-VN"
                                                : "en-US",
                                              {
                                                weekday: "long",
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                              },
                                            )}
                                          </p>
                                          <p className="text-[13px] md:text-[14px] text-green-800 leading-snug">
                                            {t("Delivery by 8 PM")}
                                          </p>
                                        </div>
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
                                        "Note: We currently deliver only to selected ZIP codes. Orders placed before 12pm noon are eligible for same day delivery. Orders placed after 12pm will be available for delivery the next business day",
                                      )}
                                    </p>
                                  )}
                                  {opt.id === "ShipmentDelivery" && (
                                    <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-3 md:p-4">
                                      <Mail
                                        size={30}
                                        className="text-green-600 shrink-0 mt-0.5"
                                      />
                                      <div className="text-start">
                                        <p className="font-semibold text-[14px] md:text-[15px] text-green-800">
                                          {t(
                                            "Packed within 24 hours • Arrives in 3–5 business days.",
                                          )}
                                        </p>
                                        <p className="text-[13px] md:text-[14px] text-green-800 leading-snug">
                                          {t(
                                            "Please check your email for tracking information.",
                                          )}
                                        </p>
                                        <p className="text-[13px] md:text-[14px] text-green-800 leading-snug">
                                          {t(
                                            "Note: We currently ship to the 48 contiguous U.S. states. We do not ship to Alaska or Hawaii.",
                                          )}
                                        </p>
                                      </div>
                                    </div>
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
                    {pickupOption && (
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
                    )}
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
                            CartTotal <
                              shipcCost?.minShipmentCostForShipment ? (
                              <span className="text-base font-medium">
                                {constant.currency} {currentShipmentCost}
                              </span>
                            ) : (
                              <span className="text-base">{t("$0.00")}</span>
                            )
                          ) : null}
                        </div>
                      </div>

                      {extraFees > 0 && (
                        <div className="flex text-black justify-between items-center">
                          <p className="text-base">
                            {t("Extended Zone Delivery Fee")}
                          </p>

                          <div className="text-base font-medium">
                            {constant.currency} {extraFees}
                          </div>
                        </div>
                      )}

                      <div className="flex text-black justify-between items-center">
                        {pickupOption === "localDelivery" && (
                          <>
                            <p className="text-base">{t("Service Fee")}</p>

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
                            onClick={proceedToCheckout}
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
                  Your payment has been completed successfully. Your order is
                  now placed and being processed.
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
    </div>
  );
}

export default Cart;
