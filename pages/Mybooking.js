import { Api, ApiGetPdf } from "@/services/service";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { useRef } from "react";
import { IoIosArrowDown, IoIosArrowUp, IoIosClose } from "react-icons/io"; // Import IoIosClose
import { userContext, languageContext } from "./_app";

import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { MdFileDownload } from "react-icons/md";
import Barcode from "react-barcode";
import Image from "next/image";
import OrderCard from "@/components/OrderCard";

function Mybooking(props) {
  const ref = useRef();
  const { t } = useTranslation();
  const router = useRouter();
  const [bookingsData, setBookingsData] = useState([]);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [parkingNo, setParkingNo] = useState(1);
  const [carColor, setCarColor] = useState("");
  const [carBrand, setCarBrand] = useState("");
  const [Id, setId] = useState("");
  const { lang } = useContext(languageContext);

  const toggleModal = (id) => {
    setId(id);
    setIsOpen(!isOpen);
  };

  let secretCode = Math.floor(1000 + Math.random() * 9000);
  const onClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      parkingNo: parkingNo,
      carColor: carColor,
      carBrand: carBrand,
      id: Id,
      SecretCode: secretCode,
    };

    props.loader(true);

    Api("post", "updateProductRequest", data, router)
      .then((res) => {
        props.loader(false);

        if (res.status) {
          props.toaster({
            type: "success",
            message: "Delivery Details Added Successfully",
          });
          getBookingsByUser();
          setIsOpen(false);
          setParkingNo("");
          setCarBrand("");
          setCarColor("");
        } else {
          props.toaster({
            type: "error",
            message: "Failed to Add Parking No.",
          });
        }
      })
      .catch((err) => {
        props.loader(false);

        props.toaster({ type: "error", message: err?.message });
      });
  };

  const cancelOrder = (id) => {
    Swal.fire({
      text: "Are you sure? Do you really want to cancel your order?",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
      confirmButtonColor: "#F38529",
      cancelButtonColor: "#F38529",
    }).then((result) => {
      if (result.isConfirmed) {
        const data = { id };
        props.loader(true);
        Api("post", "cancalOrder", data, router)
          .then((res) => {
            props.loader(false);
            if (res.status) {
              props.toaster({
                type: "success",
                message: "Order canceled successfully",
              });
              getBookingsByUser();
            } else {
              props.toaster({
                type: "error",
                message: res.message || "Failed to cancel order",
              });
            }
          })
          .catch((err) => {
            props.loader(false);
            props.toaster({
              type: "error",
              message: err?.message || "Something went wrong",
            });
          });
      }
    });
  };

  const ReturnOrder = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to Return your order?",
      showCancelButton: true,
      confirmButtonText: "Yes, Return it!",
      cancelButtonText: "No, keep it",
      confirmButtonColor: "#F38529",
      cancelButtonColor: "#F38529",
    }).then((result) => {
      if (result.isConfirmed) {
        const data = { id };
        props.loader(true);
        Api("post", "RequestForReturn", data, router)
          .then((res) => {
            props.loader(false);
            if (res.status) {
              props.toaster({ type: "success", message: res.message });
              getBookingsByUser();
            } else {
              props.toaster({
                type: "error",
                message: res.message || "Failed to cancel order",
              });
            }
          })
          .catch((err) => {
            props.loader(false);

            props.toaster({
              type: "error",
              message: err?.message || "Something went wrong",
            });
          });
      }
    });
  };

  let secretCode1 = Math.floor(1000 + Math.random() * 9000);

  const getSecrectCode = (id) => {
    const data = {
      id: id,
      SecretCode: secretCode1,
    };

    props.loader(true);

    Api("post", "getSecrectCode", data, router)
      .then((res) => {
        props.loader(false);

        if (res.status) {
          props.toaster({
            type: "success",
            message: "Secret Code Send Successfully",
          });
          getBookingsByUser();
          setIsOpen(false);
          setParkingNo("");
        } else {
          props.toaster({
            type: "error",
            message: "Failed to Send Secret Code",
          });
        }
      })
      .catch((err) => {
        props.loader(false);

        props.toaster({ type: "error", message: err?.message });
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getBookingsByUser();
    } else {
      router.push("/signIn");
    }
  }, []);

  const getBookingsByUser = async () => {
    props.loader(true);
    Api("get", "NewgetrequestProductbyuser ", "", router).then(
      (res) => {
        props.loader(false);
        setBookingsData(res.data);
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const toggleBooking = (id) => {
    setExpandedBookingId(expandedBookingId === id ? null : id);
  };

  function formatDate(date) {
    if (!date) return null; // Handle null or undefined dates
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(date).toLocaleDateString("en-US", options);
  }

  function formatDate2(dateInput) {
    const date = new Date(dateInput);
    const options = { day: "numeric", month: "short" }; // e.g., "21 Apr"
    return date.toLocaleDateString("en-GB", options);
  }

  const GeneratePDF = (orderId, id) => {
    props.loader(true);

    const data = {
      orderId: orderId,
      id: id,
      lang: lang,
    };

    ApiGetPdf("createinvoice", data, router)
      .then(() => {
        props.loader(false);
      })
      .catch((err) => {
        props.loader(false); // error case me bhi loader off hoga
        console.error("Failed to fetch PDF", err);
      });
  };

  const isWithin24Hours = (updatedAt) => {
    if (!updatedAt) return false;
    const updatedTime = new Date(updatedAt).getTime();
    const now = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return now - updatedTime <= twentyFourHours;
  };

  return (
    <div className="bg-[var(--theme-var)] md:bg-[var(--theme-dek)]">
      <div className="mx-auto max-w-7xl md:py-5 py-12 min-h-screen md:mt-2">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-center text-[35px] md:text-[45px] font-semibold text-black mb-2">
            {t("My")}
            <span className="ml-2 text-[35px] md:text-[45px] font-semibold mb-4 text-custom-green">
              {t("Order")}
            </span>
          </h1>
          <p className="md:px-0 px-12 text-center text-[16px] mb-6 w-full md:w-[40%] text-black">
            {t("View and manage all your order in one place")}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mx-2 md:mx-auto md:gap-4 gap-4 max-w-7xl">
          {bookingsData && bookingsData.length > 0 ? (
            bookingsData.map((booking, key) => (
              <OrderCard
                key={key}
                booking={booking}
                index={key}
                lang={lang}
                expandedBookingId={expandedBookingId}
                toggleBooking={toggleBooking}
                GeneratePDF={GeneratePDF}
                cancelOrder={cancelOrder}
                ReturnOrder={ReturnOrder}
                isWithin24Hours={isWithin24Hours}
                formatDate={formatDate}
                formatDate2={formatDate2}
                toggleModal={toggleModal}
                getSecrectCode={getSecrectCode}
                isOpen={isOpen}
                carBrand={carBrand} setCarBrand={setCarBrand}
                carColor={carColor} setCarColor={setCarColor}
                parkingNo={parkingNo} setParkingNo={setParkingNo}
                handleSubmit={handleSubmit}
                onClose={onClose}
              />
            ))
          )
            : (
              <div className="flex justify-center items-center md:mt-5 w-full md:h-[300px] h-[200px] col-span-2">
                <p className="text-center text-black text-2xl">
                  {t("No bookings available")}.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default Mybooking;
