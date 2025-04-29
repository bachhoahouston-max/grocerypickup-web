
import { useState } from "react";
import { Api } from "@/services/service";
import constant from "@/services/constant";
import { useRouter } from "next/router";
import {
  Elements,
  useElements,
  useStripe,
  ElementProps,
  PaymentElement,
  Ele,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutForm } from "@/components/Checkout/stripe"
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY);

// const inter = Inter({ subsets: ["latin"] });

export default function Payment(props) {
  const router = useRouter();
  const [res, setres] = useState(null);
  const [price, setPrice] = useState(Number(router.query.price));

  const planid = router.query.planid;
  const month = router.query.month;
  const currency = router.query.currency;
  const clientSecret = router.query.clientSecret;
  
  //   const payment = (id) => {
  //     const data = {
  //       price: id,
  //     };
  //     console.log(data);
  //     // console.log(storydata)
  //     props.loader(true);
  //     Api("post", `poststripe`, data, router).then(
  //       (res) => {
  //         props.loader(false);
  //         console.log("Payment called", res);
  //         setClientSecret(res.clientSecret);
  //         setPrice(res.price);
  //         // setratingno(res.data.newresponse.rating)
  //       },
  //       (err) => {
  //         console.log(err);
  //         props.loader(false);
  //         props.toaster({ type: "error", message: err?.message });
  //       }
  //     );
  //   };

  const appearance = {
    theme: "stripe",
    // theme: "default",
    // layout: "tabs",
    // paymentMethodOrder: ["apple_pay", "google_pay", "card"],
  };

  const options = {
    clientSecret,
    appearance,
  };

  console.log("price ::", price);

 
  return (
    <div className="w-full ">
      {clientSecret && (
        <div>
          <Elements options={options} stripe={stripePromise} key={clientSecret}>
            <CheckoutForm
              price={props.price.toFixed(2)}
              loader={props.loader}
              clientSecret={clientSecret}
              currency={constant.currency}
              // url={`cart`}
            />
          </Elements>
        </div>
      )}
    </div>
  );
}
