import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { cartContext, userContext } from "./_app";
import { Api } from "@/services/service";
import { useTranslation } from "react-i18next";
import { faSliders } from "@fortawesome/free-solid-svg-icons";

function Payment(props) {
  const router = useRouter();
  const [profileData, setProfileData] = useState({});
  const [user, setUser] = useContext(userContext);
  const [mainTotal, setMainTotal] = useState(0);
  const [cartData, setCartData] = useContext(cartContext);
  const [sessionInitiated, setSessionInitiated] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    try {
      const total = localStorage.getItem("checkoutData");
      const parsedData = JSON.parse(total);

      if (parsedData) {
        setProfileData(parsedData);
        setMainTotal(parsedData.total);
      }
    } catch (err) {
      console.error("Error loading checkout data:", err);
    }
  }, []);

  useEffect(() => {
    props.loader(true);
    if (router.query.session_id) {
      handlePaymentSuccess();

    }
    props.loader(false);
  }, [router.query.session_id]);

  const handlePaymentSuccess = async () => {
    const session_id = router.query.session_id;
    const localCheckoutData = JSON.parse(localStorage.getItem("checkoutData"));
    const cartDetails = JSON.parse(localStorage.getItem("addCartDetail"));

    let data = [];

    cartDetails.forEach((element) => {
      data.push({
        product: element?.id,
        image: element.selectedColor?.image,
        BarCode: element.BarCode,
        color: element.selectedColor?.color || "",
        total: element.total,
        price: element.price,
        qty: element.qty,
        seller_id: element.userid,
      });
    });
    
    if (!session_id || !localCheckoutData || !cartDetails) return;

    props.loader(true);

    const stripeRes = await Api(
      "post",
      "retrieve-checkout-session",
      { session_id },
      router
    );

    props.loader(false);

    const orderData = {
      user: user?._id,
      Email: user?.email,
      productDetail: data,
      total: (stripeRes.amount_total / 100).toFixed(2),
      subtotal: (stripeRes.amount_subtotal / 100).toFixed(2),
      total_details: stripeRes.total_details,
      currency: stripeRes.currency,
      Deliverytip: localCheckoutData.delivery_tip,
      discount:
        (stripeRes.total_details?.amount_discount / 100).toFixed(2) || 0,
      totalTax: (stripeRes.total_details?.amount_tax / 100).toFixed(2) || 0,
      dateOfDelivery: localCheckoutData.dateOfDelivery,
      deliveryfee: localCheckoutData.deliveryfee,
      Local_address: localCheckoutData.Local_address || {},
      stripeSessionId: session_id,
      isDriveUp: localCheckoutData.isDriveUp,
      isLocalDelivery: localCheckoutData.isLocalDelivery,
      isOrderPickup: localCheckoutData.isOrderPickup,
      isShipmentDelivery: localCheckoutData.isShipmentDelivery,
      paymentStatus: stripeRes.payment_status,
      customerDetails: stripeRes.customer_details || {},
      isOnce: localCheckoutData.isOnce,
      discountCode: localCheckoutData.discountCode,
      from: "website"
    };

    const createRes = await Api(
      "post",
      "createProductRquest",
      orderData,
      router
    );

    if (createRes.status) {
      localStorage.removeItem("addCartDetail");
      localStorage.removeItem("checkoutData");
      setCartData([]);
      router.push("/Mybooking");
      props.toaster({
        type: "success",
        message: "Thank you! Your order was placed successfully.",
      });
      props.loader(false);
    } else {
      props.toaster({ type: "error", message: "Order save failed" });
    }
  };

  const createCheckoutSession = async () => {
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
    const deliveryCharge = parseFloat(checkoutData.deliveryfee || 0);

    const metadata = {
      userId: user?._id,
      deliveryTip: deliveryTip.toString(),
      deliveryCharge: deliveryCharge.toString(), // still passing to backend
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
      success_url: `${window.location.origin}/payment?session_id={CHECKOUT_SESSION_ID}&from=${router.query.from}`,
      cancel_url: `${window.location.origin}/cancel`,
    };

    props.loader(true);
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
    if (!router.isReady || sessionInitiated) return;
    if (!router.query.session_id && mainTotal > 0 && router.query.from) {
      setSessionInitiated(true);
      createCheckoutSession();
    }
  }, [mainTotal, router.query.from, router.query.session_id, router.isReady]);

  return (
    <div className="bg-white w-full">
      <section className="bg-white w-full relative flex flex-col justify-center items-center md:min-h-[550px] min-h-[680px]">
        <div className="mx-auto w-full md:px-10 px-5 md:pt-10 pt-5 md:pb-10 pb-5">
          <div className="w-full mt-5">
            <div className="w-full flex flex-col gap-2 justify-center items-center py-10">
              <p className="text-gray-600 mb-2">
                {t("Redirecting to payment page...")}
              </p>
              <button
                onClick={createCheckoutSession}
                className="text-white rounded-xl bg-custom-green px-4 py-2"
              >
                Retry Payment
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Payment;
