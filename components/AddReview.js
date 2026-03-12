import Image from "next/image";
import { RxCross2 } from "react-icons/rx";
import Compressor from "compressorjs";
import { Api, ApiFormData } from "@/services/service"; // apne path ke hisab se
import { useTranslation } from "react-i18next";
import { useContext, useState } from "react";
import { languageContext } from "../pages/_app";
import { useRouter } from "next/router";

function AddReview(
  loader,
  toaster,
  selectedProduct,
  setSelectedProduct,
  setShowReviews,
  productId,
  setProductId,
) {
  const [reviewsData, setReviewsData] = useState({
    description: "",
  });
  const router = useRouter();
  const { t } = useTranslation();
  const { lang } = useContext(languageContext);
  const [images, setImages] = useState([]);

  console.log(setShowReviews);
   console.log(selectedProduct);
   
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

    // Check if total images would exceed 6
    if (images.length + files.length > 6) {
      toaster({
        type: "error",
        message: "Maximum 6 images allowed",
      });
      return;
    }

    files.forEach((file) => {
      const fileSizeInMb = file.size / (1024 * 1024);
      if (fileSizeInMb > 1) {
        toaster({
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

export default AddReview;
