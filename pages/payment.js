import { Api } from "@/services/service";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "@/components/Checkout/stripe";
import { cartContext, openCartContext, userContext } from "./_app";
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY);
import constant from "@/services/constant";
import { useTranslation } from "react-i18next";
import { TbCoinTaka } from "react-icons/tb";

function Payment(props) {
  const router = useRouter();
  const [profileData, setProfileData] = useState({});
  const [clientSecret, setClientSecret] = useState("");
  const [CartTotal, setCartTotal] = useState(0);
  const [cartData, setCartData] = useContext(cartContext);
  const [CartItem, setCartItem] = useState(0);
  const [openCart, setOpenCart] = useContext(openCartContext);
  const [showcart, setShowcart] = useState(false);
  const [user, setUser] = useContext(userContext); // Added missing user context
  const [date, setDate] = useState(""); // Added missing date state

  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [mainTotal, setMainTotal] = useState(0);

  const { t } = useTranslation();

  // // Load user profile data from local storage
  // useEffect(() => {
  //   const getUserProfile = () => {
  //     try {
  //       const profileStr = localStorage.getItem("userProfile");
  //       if (profileStr) {
  //         const profile = JSON.parse(profileStr);
  //         setProfileData(profile);
  //       }
  //     } catch (err) {
  //       console.error("Error loading profile data:", err);
  //     }
  //   };

  //   getUserProfile();
  // }, []);

  // // Load pickup option from local storage
  useEffect(() => {
    try {
      const total = localStorage.getItem("checkoutData");
      const parsedData = JSON.parse(total);

      if (parsedData) {
        setProfileData(parsedData);
        setMainTotal(parsedData.total);
      }
    } catch (err) {
      console.error("Error loading pickup option:", err);
    }
  }, []);

  useEffect(() => {
    if (router.query.clientSecret) {
      createProductRquest();
    }
  }, [router]);

  useEffect(() => {
    const totalData = localStorage.getItem("checkoutData");
    const parsedData = JSON.parse(totalData);

    if (router.query.from === "cart") {
      let cart = localStorage.getItem("addCartDetail");
      if (cart) {
        try {
          setCartData(JSON.parse(cart));
          setCartTotal(parsedData?.total || 0); // Safely setting the total
        } catch (err) {
          console.error("Error parsing cart data:", err);
          props.toaster({ type: "error", message: "Failed to load cart data" });
        }
      }
    } else {
      let cart = localStorage.getItem("singleCartDetail");
      if (cart) {
        try {
          setCartData(JSON.parse(cart));
          setCartTotal(parsedData?.total || 0); // Use the same total here too
        } catch (err) {
          console.error("Error parsing single cart data:", err);
          props.toaster({
            type: "error",
            message: "Failed to load product data",
          });
        }
      }
    }
  }, [router.query.from]);

  useEffect(() => {
    if (CartTotal > 0 && !router.query.clientSecret && router.query.from) {
      payment();
    }
  }, [CartTotal]);

  const createProductRquest = () => {
    const total = localStorage.getItem("checkoutData");
    const parsedData = JSON.parse(total);

    props.loader && props.loader(true);
    Api("post", "createProductRquest", parsedData, router).then(
      (res) => {
        props.loader && props.loader(false);
        if (res.status) {
          setCartData([]);
          router.push("/Mybooking");
          localStorage.removeItem("addCartDetail");
          localStorage.removeItem("checkoutData");
          props.toaster({
            type: "success",
            message:
              "Thank you for your order! Your item will be processed shortly.",
          });
        } else {
          props.toaster &&
            props.toaster({
              type: "error",
              message: res?.data?.message || "Order creation failed",
            });
        }
      },
      (err) => {
        props.loader && props.loader(false);
        props.toaster &&
          props.toaster({
            type: "error",
            message: err?.message || "Failed to create order",
          });
      }
    );
  };

  const appearance = {
    theme: "stripe",
  };

  const options = {
    clientSecret,
    appearance,
  };

  const payment = () => {
    const data = {
      price: mainTotal, // Using mainTotal instead of CartTotal to include tax and shipping
      currency: "usd", // Consider making this dynamic
    };

    props.loader(true);
    Api("post", `poststripe`, data, router).then(
      (res) => {
        props.loader(false);
        if (res && res.clientSecret) {
          setClientSecret(res.clientSecret);
          // Save client secret to local storage for potential retrieval after page refresh
          localStorage.setItem("stripeClientSecret", res.clientSecret);
        } else {
          props.toaster({
            type: "error",
            message: "Failed to initialize payment",
          });
        }
      },
      (err) => {
        console.error("Payment initialization error:", err);
        props.loader(false);
        props.toaster({
          type: "error",
          message: err?.message || "Failed to initialize payment",
        });
      }
    );
  };

  // Retrieve client secret from localStorage if it's not set but should be
  useEffect(() => {
    if (!clientSecret && router.query.from) {
      const savedSecret = localStorage.getItem("stripeClientSecret");
      if (savedSecret) {
        setClientSecret(savedSecret);
      }
    }
  }, [router.query]);

  return (
    <div className="bg-white w-full">
      <section className="bg-white w-full relative flex flex-col justify-center items-center md:min-h-screen">
        <div className="mx-auto w-full md:px-10 px-5 md:pt-10 pt-5 md:pb-10 pb-5">
          {/* Address display section - uncomment if needed
          <div className='w-full'>
            <p className='text-black text-2xl font-bold pb-5'>{t("Shipping")}</p>
            <div className='md:flex justify-between items-center w-full'>
              <div>
                {profileData?.address && <p className='text-black text-base font-normal'>{profileData?.address}, {profileData?.city}, {profileData?.country}, {profileData?.pinCode} </p>}
              </div>
              <button className='bg-custom-newDarkBlack w-[180px] md:h-[50px] h-[40px] rounded-[24px] text-white font-semibold text-sm md:mt-0 mt-5' onClick={() => { router.push('/shipping-address') }}>{profileData?.address ? t('Change Address') : t("Add Address")}</button>
            </div>
          </div> */}

          {clientSecret ? (
            <div className="w-full mt-5">
              <Elements
                options={options}
                stripe={stripePromise}
                key={clientSecret}
              >
                <CheckoutForm
                  price={mainTotal}
                  loader={props.loader}
                  clientSecret={clientSecret}
                  currency={constant.currency}
                  url={`payment`}
                  toaster={props.toaster}
                  address={profileData?.Local_address?.address}
                />
              </Elements>
            </div>
          ) : (
            <div className="w-full flex justify-center items-center py-10">
              <p className="text-gray-600">{t("Loading payment details...")}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Payment;
