import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { cartContext, userContext } from "./_app";
import { Api } from "@/services/service";
import { useTranslation } from "react-i18next";

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
    if (router.query.session_id) {
      handlePaymentSuccess();
    }
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
        price: element.total,
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
      total: localCheckoutData.total,
      Deliverytip: localCheckoutData.Deliverytip,
      isDriveUp: localCheckoutData.isDriveUp,
      isLocalDelivery: localCheckoutData.isLocalDelivery,
      isOrderPickup: localCheckoutData.isOrderPickup,
      isShipmentDelivery: localCheckoutData.isShipmentDelivery,
      discount: localCheckoutData.discount || 0,
      dateOfDelivery: localCheckoutData.dateOfDelivery,
      deliveryfee: localCheckoutData.deliveryfee,
      Local_address: localCheckoutData.Local_address || {},
      stripeSessionId: session_id,
      paymentStatus: stripeRes.payment_status,
      customerDetails: stripeRes.customer_details || {},
      from: router.query.from,
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
    } else {
      props.toaster({ type: "error", message: "Order save failed" });
    }
  };

  const createCheckoutSession = async () => {
    const checkoutData = JSON.parse(localStorage.getItem("checkoutData"));
    const cartDetails = JSON.parse(localStorage.getItem("addCartDetail"));

    const lineItems = cartDetails.map((item) => ({
      quantity: item.quantity || 1,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
          tax_code: item.tax_code || "txcd_10000000",
        },
      },
    }));

    const deliveryTip = parseFloat(checkoutData.deliveryTip || 0);

    const metadata = {
      userId: user?._id,
      deliveryTip: deliveryTip.toString(),
      hasDiscount: "true",
      discountAmount: checkoutData?.discount?.toString() || "0",
      discountCode: checkoutData?.discountCode || "",
      isPickupOrder: checkoutData?.isOrderPickup?.toString() || "false",
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
      success_url: `${window.location.origin}/payment?session_id={CHECKOUT_SESSION_ID}&from=${router.query.from}`,
      cancel_url: `${window.location.origin}/cancel`,
    };

    console.log(body);

    try {
      props.loader(true);
      const res = await Api("post", "create-checkout-session", body, router);
      props.loader(false);

      if (res && res.url) {
        localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
        localStorage.setItem("sessionId", res.session_id);
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

    // Avoid looping when already on success page
    if (!router.query.session_id && mainTotal > 0 && router.query.from) {
      setSessionInitiated(true);
      createCheckoutSession();
    }
  }, [mainTotal, router.query.from, router.query.session_id, router.isReady]);

  return (
    <div className="bg-white w-full">
      <section className="bg-white w-full relative flex flex-col justify-center items-center md:min-h-screen">
        <div className="mx-auto w-full md:px-10 px-5 md:pt-10 pt-5 md:pb-10 pb-5">
          <div className="w-full mt-5">
            <div className="w-full flex flex-col gap-2 justify-center items-center py-10">
              <p className="text-gray-600">
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
