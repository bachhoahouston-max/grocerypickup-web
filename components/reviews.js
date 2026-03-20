import React, { useState } from "react";
import moment from "moment";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { useRouter } from "next/router";
import Image from "next/image";

const ProductReviews = ({ productReviews, slug }) => {
  const router = useRouter();

  const [selectedReview, setSelectedReview] = useState(null);

  return (
    <>
      {productReviews.length > 0 && (
        <div className="max-w-7xl mx-auto mt-8 px-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold text-gray-800">
              Customer Reviews
            </h2>

            <button
              onClick={() => router.push(`/Reviews/${slug}`)}
              className="text-green-600 underline font-medium hover:underline"
            >
              View All
            </button>
          </div>

          <Swiper
            spaceBetween={6}
            slidesPerView={1.2}
            navigation
            modules={[Navigation]}
            breakpoints={{
              640: { slidesPerView: 1 },
              1024: { slidesPerView: 2 },
            }}
          >
            {productReviews.map((item, i) => (
              <SwiperSlide key={i}>
                {/* Card */}
                <div
                  className="bg-white rounded-xl p-4 shadow-md border hover:shadow-lg transition cursor-pointer"
                  onClick={() => setSelectedReview(item)}
                >
                  {/* User */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 text-white flex items-center justify-center rounded-full font-bold">
                      {item?.posted_by?.username?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {item?.posted_by?.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {moment(item?.createdAt).format("MMM DD, YYYY")}
                      </p>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-sm text-gray-700 mt-3 line-clamp-3">
                    {item?.description}
                  </p>

                  {/* Images */}
                  {item?.images?.length > 0 && (
                    <div className="mt-3">
                      <div className="grid grid-cols-2 gap-2">
                        {item.images.slice(0, 2).map((img, index) => (
                          <div key={index} className="relative w-full h-32">
                            <Image
                              src={img}
                              fill
                              className="object-cover rounded-lg"
                              alt="review"
                            />

                            {index === 1 && item.images.length > 2 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold rounded-lg">
                                +{item.images.length - 2}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

    
      {selectedReview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl p-5 relative">
            {/* Close */}
            <button
              onClick={() => setSelectedReview(null)}
              className="absolute top-3 cursor-pointer right-3 text-gray-500 text-xl"
            >
              ✕
            </button>

            {/* ALL REVIEWS VIEW */}
            {selectedReview === "ALL" ? (
              <div className="max-h-[80vh] overflow-y-auto">
                {productReviews.map((item, i) => (
                  <div key={i} className="mb-6 border-b pb-4">
                    <p className="font-semibold text-black">
                      {item?.posted_by?.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {moment(item?.createdAt).format("MMM DD, YYYY")}
                    </p>

                    <p className="mt-2 text-sm text-black">
                      {item.description}
                    </p>
                    {item?.images?.length > 0 && (
                      <div className="mt-3">
                        <div className="grid grid-cols-2 gap-2">
                          {item.images.slice(0, 2).map((img, index) => (
                            <div key={index} className="relative w-full h-60">
                              <Image
                                src={img}
                                fill
                                className="object-cover rounded-lg"
                                alt="review"
                              />

                              {index === 1 && item.images.length > 2 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold rounded-lg">
                                  +{item.images.length - 2}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* USER */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-600 text-white flex items-center justify-center rounded-full">
                    {selectedReview?.posted_by?.username
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="font-semibold text-black">
                      {selectedReview?.posted_by?.username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {moment(selectedReview?.createdAt).format("MMM DD, YYYY")}
                    </p>
                  </div>
                </div>

                <p className="text-sm mb-4 text-black">
                  {selectedReview?.description}
                </p>

                {selectedReview?.images?.length > 0 && (
                  <Swiper navigation modules={[Navigation]}>
                    {selectedReview.images.map((img, i) => (
                      <SwiperSlide key={i}>
                        <div className="relative w-full h-[350px]">
                          <Image
                            src={img}
                            fill
                            className="object-contain rounded-lg"
                            alt="review"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductReviews;
