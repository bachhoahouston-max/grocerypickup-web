import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { userContext } from "../_app";
import { Api } from "@/services/service";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const Stars = ({ rating = 5 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        className={`w-3.5 h-3.5 ${s <= rating ? "text-amber-400" : "text-gray-200"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

/* ─── Avatar ─────────────────────────────────────────────────────── */
const Avatar = ({ name = "?", size = "md", color = "amber" }) => {
  const sizeMap = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };
  const colorMap = {
    amber: "from-amber-400 to-orange-500",
    green: "from-emerald-400 to-teal-500",
    blue: "from-blue-400 to-indigo-500",
    rose: "from-rose-400 to-pink-500",
  };
  const colors = ["amber", "green", "blue", "rose"];
  const auto = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className={`${sizeMap[size]} bg-gradient-to-br ${colorMap[color] || colorMap[auto]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

const ReviewCard = ({ item, onClick }) => {
  const hasImages = item?.images?.length > 0;

  return (
    <div
      onClick={() => onClick(item)}
      className="group cursor-pointer bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar name={item?.posted_by?.username || "?"} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {item?.posted_by?.username}
          </p>
          <p className="text-xs text-gray-400">
            {moment(item?.createdAt).format("MMM DD, YYYY")}
          </p>
        </div>
        <Stars rating={item?.rating} />
      </div>

      {/* Body */}
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
        {item?.description}
      </p>

      {/* Images */}
      {hasImages && (
        <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
          {item.images.slice(0, 3).map((img, i) => (
            <div key={i} className="relative h-[80px]">
              <Image src={img} fill className="object-cover" alt="review img" />
              {i === 2 && item.images.length > 3 && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-sm font-bold">
                  +{item.images.length - 3}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <p className="text-xs text-amber-500 font-medium group-hover:text-amber-600 transition-colors mt-auto">
        Read full review →
      </p>
    </div>
  );
};

const ReviewModal = ({ review, onClose }) => {
  const [current, setCurrent] = useState(0);

  if (!review) return null;

  const images = review?.images || [];

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 w-[95%] max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden ">
        <div className="flex justify-between py-6 px-4">
          <p className="text-black text-xl"> Review Details</p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-black hover:bg-gray-200 flex cursor-pointer items-center justify-center"
          >
            <X />
          </button>
        </div>
        {/* 🔥 Carousel */}
        {images.length > 0 && (
          <div className="relative h-[280px] bg-gray-50 flex items-center justify-center">
            {/* Image */}
            <img
              src={images[current]}
              alt="review"
              className="h-full object-contain transition-all duration-300"
            />

            {/* Left Button */}
            {images.length > 1 && (
              <button
                onClick={prevSlide}
                className="absolute left-3 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-black"
              >
                <ChevronLeft />
              </button>
            )}

            {/* Right Button */}
            {images.length > 1 && (
              <button
                onClick={nextSlide}
                className="absolute right-3 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-black"
              >
                <ChevronRight />
              </button>
            )}

            {/* Dots */}
            <div className="absolute bottom-2 flex gap-1">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i === current ? "bg-black" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar name={review?.posted_by?.username || "?"} size="lg" />

            <div>
              <h2 className="font-semibold text-gray-900">
                {review?.posted_by?.username}
              </h2>
              <p className="text-xs text-gray-400">
                {moment(review?.createdAt).format("MMMM DD, YYYY")}
              </p>
            </div>

            <div className="ml-auto">
              <Stars rating={review?.rating} />
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <p className="text-sm text-gray-700 leading-relaxed">
            {review?.description}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─── Empty State ─────────────────────────────────────────────────── */
const EmptyReviews = ({ t }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
    <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
      <svg
        className="w-8 h-8 text-amber-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
    </div>
    <p className="text-sm text-gray-400">{t("No reviews yet")}</p>
  </div>
);

/* ─── Main Component ──────────────────────────────────────────────── */
const ProductReviews = (props) => {
  const router = useRouter();
  const [user] = useContext(userContext);
  const [productReviews, setProductReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (router?.query?.id) getProductById();
  }, [router?.query?.id]);

  const getProductById = async () => {
    let url = `getProductByslug/${router?.query?.id}`;
    if (user?.token) url += `?user=${user?._id}`;

    props.loader(true);
    try {
      const res = await Api("get", url, "", router);
      setProductReviews(res?.data?.reviews || []);
    } catch (err) {
      props.toaster({ type: "error", message: err?.message });
    }
    props.loader(false);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      <section className="max-w-7xl mx-auto mt-14 px-4 sm:px-6 min-h-[500px]">
        {/* Section header */}
        <div className="flex items-end gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-1">
              {t("Customer Feedback")}
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              {t("All Reviews")}
            </h2>
          </div>
          {productReviews.length > 0 && (
            <span className="mb-1 ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
              {productReviews.length}
            </span>
          )}
        </div>

        {productReviews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {productReviews.map((item, i) => (
              <ReviewCard key={i} item={item} onClick={setSelectedReview} />
            ))}
          </div>
        ) : (
          <EmptyReviews t={t} />
        )}
      </section>

      <ReviewModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
      />
    </>
  );
};

export default ProductReviews;
