import {
  PaymentElement,
  useElements,
  useStripe,
  CardElement,
  LinkAuthenticationElement,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import classes from "./stripe.module.css";
import { useTranslation } from "react-i18next";

const CheckoutForm = (props) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    props.loader(false);
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }
    stripe.stripe
      ?.retrievePaymentIntent(clientSecret)
      .then(({ paymentIntent }) => {
        switch (paymentIntent.status) {
          case "succeeded":
            alert("Payment succeeded!");
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
  }, [props.price]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }
    setIsLoading(true);
    const { response, error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_STRIPE_API_PORT}/${props.url}?clientSecret=${props.clientSecret}&from=${router.query.from}`,
      },
    });
 

    alert(message);
    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occured.");
    }
    setIsLoading(false);
  };

  return (
    <div className={classes.body}>
      <form id="payment-form" className={classes.form}>
        <PaymentElement
          id="payment-element"
          className={classes.payment_element}
        />
        <button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          onClick={handleSubmit}
        >
          <span id="button-text">
            {isLoading ? (
              <div className={classes.spinner} id="spinner"></div>
            ) : (
              `${t("Pay")} ${props.currency}${props.price}`
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
