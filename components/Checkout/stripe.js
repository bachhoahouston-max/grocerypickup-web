import {
  PaymentElement,
  useElements,
  useStripe,
  LinkAuthenticationElement
} from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import classes from "./stripe.module.css";

const CheckoutForm = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    props.loader(false);

    if (!stripe) return;

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);


  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `{"http://localhost:3000"}`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred.");
      }
    }

    setIsLoading(false);
  };

  return (
    <div className={classes.body}>
      <form id="payment-form" className={classes.form} onSubmit={handleSubmit}>
        <LinkAuthenticationElement />
        <PaymentElement
          id="payment-element"
          className={classes.payment_element}
        />
        <button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          type="submit" 
        >
          <span id="button-text">
            {isLoading ? (
              <div className={classes.spinner} id="spinner"></div>
            ) : (
              `Pay ${props.currency}${props.price}`
            )}
          </span>
        </button>

        {message && (
          <div id="payment-message" className={classes.payment_message}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CheckoutForm;
