import { Api, ApiFormData } from "@/services/service";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { languageContext } from "./_app";
import { RxCross2 } from "react-icons/rx";
import { useTranslation } from "react-i18next";
import Compressor from "compressorjs";
import Image from "next/image";

function Myhistory(props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [bookingsData, setBookingsData] = useState([]);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [reviewsData, setReviewsData] = useState({
    description: "",
  });
  const [productId, setProductId] = useState("");
  const [images, setImages] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [token, setToken] = useState("");
  const { lang } = useContext(languageContext);
  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  });

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      getHistoryByUser();
    } else {
      router.push("signIn");
    }
  }, []);

  const getHistoryByUser = async () => {
    props.loader(true);
    Api("get", "getStatusCompletedProducts", "", router).then(
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
    setExpandedHistoryId(expandedHistoryId === id ? null : id);
  };

  const createProductRquest = (e) => {
    e.preventDefault();

    if (!reviewsData.description || reviewsData.description.length < 20) {
      props.toaster({
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

    props.loader(true);

    Api("post", "giverate", data, router).then(
      (res) => {
        props.loader(false);
        if (res.status) {
          setShowReviews(false);
          setReviewsData({
            description: "",
          });
          setProductId("");
          setImages([]);
          setSelectedProduct(null);

          props.toaster({
            type: "success",
            message: "Reviews Submitted Successfully",
          });
        } else {
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  function formatDate(date) {
    if (!date) return null;
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(date).toLocaleDateString("en-US", options);
  }

  const groupedBookings = bookingsData.reduce((acc, booking) => {
    if (!acc[booking._id]) {
      acc[booking._id] = {
        ...booking,
        products: [],
      };
    }
    acc[booking._id].products.push(booking.productDetail);
    return acc;
  }, {});

  const groupedBookingsArray = Object.values(groupedBookings);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    // Check if total images would exceed 6
    if (images.length + files.length > 6) {
      props.toaster({
        type: "error",
        message: "Maximum 6 images allowed",
      });
      return;
    }

    files.forEach((file) => {
      const fileSizeInMb = file.size / (1024 * 1024);
      if (fileSizeInMb > 1) {
        props.toaster({
          type: "error",
          message: "Too large file. Please upload a smaller image",
        });
        return;
      }

      new Compressor(file, {
        quality: 0.6,
        success: (compressedResult) => {

          const data = new FormData();
          data.append("file", compressedResult);
          props.loader(true);

          ApiFormData("post", "user/fileupload", data, router).then(
            (res) => {
              props.loader(false);
              if (res.status) {
                setImages((prev) => [...prev, res.data.file]);
                props.toaster({
                  type: "success",
                  message: "Image uploaded successfully",
                });
              }
            },
            (err) => {
              props.loader(false);
              props.toaster({ type: "error", message: err?.message });
            }
          );
        },
      });
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="mx-auto max-w-7xl py-12 min-h-screen mt-10 md:mt-4">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-center text-[35px] md:text-[45px] font-semibold text-black mb-2">
            {t("My")}
            <span className="ml-2 text-[35px] md:text-[45px] font-semibold mb-4 text-custom-green">
              {t("History")} !
            </span>
          </h1>
          <p className="md:px-0 px-12 text-center text-[16px] mb-6 w-full md:w-[40%] text-black">
            {t(
              "View all your order History in one place. Leave reviews for products you've purchased"
            )}
            .
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mx-3 md:mx-auto md:gap-12 gap-8 max-w-6xl">
          {groupedBookingsArray && groupedBookingsArray.length > 0 ? (
            groupedBookingsArray.map((booking, key) => (
              <div
                key={key}
                className="bg-white md:p-4 p-2.5 h-auto self-start rounded-lg shadow-lg border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleBooking(booking._id)}
                >
                  <div className="flex flex-col justify-start w-full">
                    <div className="flex flex-row justify-between items-center mb-4">
                      <div className="bg-custom-green text-white rounded-full md:h-[40px] h-[40px] md:w-[40px] w-[40px] flex items-center justify-center mr-3 md:text-[20px] text-[16px] font-bold shadow-md">
                        {key + 1}
                      </div>
                      <div className="flex items-center">
                        <p className="text-green-600 font-semibold m-1 bg-green-100 px-2 py-1 rounded-full text-sm">
                          Order {booking.status}
                        </p>
                        {expandedHistoryId === booking._id ? (
                          <IoIosArrowUp className="text-2xl text-gray-600 ml-2" />
                        ) : (
                          <IoIosArrowDown className="text-2xl text-gray-600 ml-2" />
                        )}
                      </div>
                    </div>
                    <p className="text-[16px] text-black md:text-[20px] font-medium">
                      {t("My History")} (
                      {formatDate(booking.createdAt) || "N/A"})
                    </p>
                    <div className="flex flex-col justify-start items-start mt-3 ">
                      <p className="text-gray-700 md:text-base text-[15px] font-bold">
                        {t("Total")}:{" "}
                        <span className="text-custom-green">
                          ${booking?.total || "0.00"}
                        </span>
                      </p>
                      <p className="text-gray-700 md:text-base text-[15px] font-bold">
                        {t("Order Id")}:{" "}
                        <span className="text-gray-600">
                          {booking?.orderId}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    expandedHistoryId === booking._id ? "hidden" : "block mt-4"
                  }
                >
                  <div className="grid md:grid-cols-3 grid-cols-1 w-full gap-5 bg-gray-50 md:p-3 p-1 rounded-[10px] border border-gray-200">
                    {booking.products.map((product, index) => (
                      <div
                        className="relative col-span-3 flex md:gap-5 gap-2 bg-white p-3 rounded-lg shadow-sm border border-gray-100"
                        key={index}
                      >
                        <Image
                          width={100}
                          height={100}
                          className="w-20 h-20 text-gray-600 rounded-[10px] object-cover border border-gray-200"
                          src={
                            product?.image?.[0] || "/api/placeholder/100/100"
                          }
                          alt="Product"
                        />
                        <div className="flex-grow">
                          <p className="text-black md:text-base text-[13px] font-bold">

                            {(() => {
                              const text = lang === "en" ? product?.product?.name : product?.product?.vietnamiesName;
                              return text?.length > 22 ? text.slice(0, 22) + "..." : text;
                            })()}

                          </p>
                          <p className="text-gray-600 text-xs font-medium pt-[6px]">
                            {t("Quantity")}: {product.qty || 1}
                          </p>
                          <p className="text-custom-green text-sm font-bold pt-1">
                            ${product?.price || "0.00"}
                          </p>
                        </div>
                        <div className="justify-start items-start">
                          <button
                            className="absolute md:right-3 right-2 top-3 bg-custom-green text-white px-4 py-2 rounded-md text-[14px] font-medium hover:shadow-md transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductId(product?.product?._id);
                              setSelectedProduct(product);
                              setShowReviews(true);
                            }}
                          >
                            {t("Review")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center md:mt-5 w-full md:h-[300px] h-[200px] col-span-2">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <p className="text-center text-gray-600 text-xl font-medium">
                  {t("No history available")}.
                </p>
              </div>
            </div>
          )}

          {showReviews && (
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
                        src={
                          selectedProduct?.image?.[0] ||
                          "/api/placeholder/100/100"
                        }
                        alt="Product"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  </div>

                  <h2 className="text-black font-bold text-xl mb-2 text-center">
                    {t("Review this item")}
                  </h2>
                  <p className="text-gray-600 text-sm mb-6 text-center">
                    {lang === "en" ? selectedProduct?.product?.name : selectedProduct?.product?.vietnamiesName}
                  </p>

                  <div className="w-full mb-4">
                    <label className="text-black font-medium text-base mb-2 block">
                      {t("Add a review")}{" "}
                      <span className="text-red-500">*</span>
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
                        <label
                          htmlFor="photo-upload"
                          className="cursor-pointer"
                        >
                          <div className="text-custom-gold text-3xl mb-2">
                            📷
                          </div>
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
          )}
        </div>
      </div>
    </>
  );
}

export default Myhistory;
