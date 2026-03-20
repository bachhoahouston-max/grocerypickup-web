import { Api, ApiFormData, ApiGetPdf } from "@/services/service";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { useRef } from "react";
import { IoIosArrowDown, IoIosArrowUp, IoIosClose } from "react-icons/io"; // Import IoIosClose
import { userContext, languageContext } from "./_app";

import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import Image from "next/image";
import OrderCard from "@/components/OrderCard";
import { RxCross2 } from "react-icons/rx";
import Compressor from "compressorjs";

function Mybooking(props) {
  const ref = useRef();
  const { t } = useTranslation();
  const router = useRouter();
  const [bookingsData, setBookingsData] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [parkingNo, setParkingNo] = useState(1);
  const [carColor, setCarColor] = useState("");
  const [carBrand, setCarBrand] = useState("");
  const [productId, setProductId] = useState("");
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
      },
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
                carBrand={carBrand}
                setCarBrand={setCarBrand}
                carColor={carColor}
                setCarColor={setCarColor}
                parkingNo={parkingNo}
                setParkingNo={setParkingNo}
                handleSubmit={handleSubmit}
                onClose={onClose}
                setProductId={setProductId}
                setSelectedProduct={setSelectedProduct}
                setShowReviews={setShowReviews}
              />
            ))
          ) : (
            <div className="flex justify-center items-center md:mt-5 w-full md:h-[300px] h-[200px] col-span-2">
              <p className="text-center text-black text-2xl">
                {t("No bookings available")}.
              </p>
            </div>
          )}
        </div>

        {showReviews && (
          <AddReview
            loader={props.loader}
            toaster={props.toaster}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            setShowReviews={setShowReviews}
            productId={productId}
            setProductId={setProductId}
          />
        )}
      </div>
    </div>
  );
}

export default Mybooking;

function AddReview({
  loader,
  toaster,
  selectedProduct,
  setSelectedProduct,
  setShowReviews,
  productId,
  setProductId,
}) {
  const [reviewsData, setReviewsData] = useState({
    description: "",
  });
  const router = useRouter();
  const { t } = useTranslation();
  const { lang } = useContext(languageContext);
  const [images, setImages] = useState([]);

  const createProductRquest = (e) => {
    e.preventDefault();

    if (!reviewsData.description || reviewsData.description.length < 20) {
      toaster({
        type: "error",
        message: "Review description must be at least 20 characters",
      });
      return;
    }

    let data = {
      description: reviewsData?.description,
      product: productId,
      images: images,
    };

    loader(true);

    Api("post", "giverate", data, router).then(
      (res) => {
        loader(false);
        if (res.status) {
          setShowReviews(false);
          setReviewsData({
            description: "",
          });
          setProductId("");
          setImages([]);
          setSelectedProduct(null);

          toaster({
            type: "success",
            message: "Reviews Submitted Successfully",
          });
        } else {
          toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        loader(false);
        toaster({ type: "error", message: err?.message });
      },
    );
  };
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    if (images.length + files.length > 6) {
      toaster({
        type: "error",
        message: "Maximum 6 images allowed",
      });
      return;
    }

    files.forEach((file) => {
      new Compressor(file, {
        quality: 0.6,

        success: (compressedResult) => {
          const fileSizeInMb = compressedResult.size / (1024 * 1024);

          // 🔥 Check AFTER compression
          if (fileSizeInMb > 1) {
            toaster({
              type: "error",
              message: "Compressed image still too large (max 1MB)",
            });
            return;
          }

          const data = new FormData();
          data.append("file", compressedResult);

          loader(true);

          ApiFormData("post", "user/fileupload", data, router).then(
            (res) => {
              loader(false);

              if (res.status) {
                setImages((prev) => [...prev, res.data.file]);

                toaster({
                  type: "success",
                  message: "Image uploaded successfully",
                });
              }
            },
            (err) => {
              loader(false);
              toaster({ type: "error", message: err?.message });
            },
          );
        },

        error(err) {
          toaster({
            type: "error",
            message: "Image compression failed",
          });
        },
      });
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="relative w-full max-w-lg bg-white rounded-[20px] shadow-2xl max-h-[98vh] overflow-y-auto">
        <div
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 w-8 h-8 cursor-pointer rounded-full hover:bg-gray-100 transition-all duration-200"
          onClick={() => {
            setShowReviews(false);
            setReviewsData({
              description: "",
            });
            setImages([]);
            setSelectedProduct(null);
          }}
        >
          <RxCross2 className="h-full w-full font-semibold" />
        </div>

        <form className="px-6 py-6" onSubmit={createProductRquest}>
          {/* Product Image */}
          <div className="flex justify-center mt-4 mb-6">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center relative border border-gray-200 overflow-hidden">
              <Image
                fill
                src={selectedProduct?.image?.[0] || "/api/placeholder/100/100"}
                alt="Product"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          <h2 className="text-black font-bold text-xl mb-2 text-center">
            {t("Review this item")}
          </h2>
          <p className="text-gray-600 text-sm mb-6 text-center">
            {lang === "en"
              ? selectedProduct?.product?.name
              : selectedProduct?.product?.vietnamiesName}
          </p>

          <div className="w-full mb-4">
            <label className="text-black font-medium text-base mb-2 block">
              {t("Add a review")} <span className="text-red-500">*</span>
            </label>
            <p className="text-gray-500 text-sm mb-2">
              {t("At least 20 characters")}
            </p>
            <textarea
              className="bg-white w-full px-4 py-3 border border-gray-300 rounded-lg font-normal text-base text-black outline-none resize-none focus:border-custom-gold focus:ring-1 focus:ring-custom-gold transition-all duration-200"
              rows="4"
              placeholder={t("What did you like or dislike about it?")}
              value={reviewsData.description}
              onChange={(e) => {
                setReviewsData({
                  ...reviewsData,
                  description: e.target.value,
                });
              }}
              required
              minLength={20}
            />
          </div>

          <div className="w-full mb-6">
            <label className="text-black font-medium text-base mb-2 block">
              {t("Add photos")} ({t("optional")})
            </label>
            <p className="text-gray-500 text-sm mb-3">
              {t("Upload up to 6 photos")} ({images.length}/6)
            </p>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      width={100}
                      height={100}
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {images.length < 6 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-custom-gold transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="photo-upload"
                  onChange={handleImageChange}
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="text-custom-gold text-3xl mb-2">📷</div>
                  <p className="text-gray-600 text-sm font-medium">
                    {t("Tap to add photos")}
                  </p>
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              className="bg-custom-green w-full py-3 rounded-lg text-white font-semibold text-base hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              type="submit"
              disabled={reviewsData.description.length < 20}
            >
              {t("Submit Review")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
