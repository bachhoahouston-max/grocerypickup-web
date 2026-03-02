
import React from "react";
import moment from "moment";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Navigation, Pagination } from "swiper/modules";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import Image from "next/image";

const ProductReviews = ({ productReviews, slug, setImages, setVisible }) => {
  const { t } = useTranslation()
  const router = useRouter()
  return (
    <>
      {productReviews.length > 0 && (
        <div className="max-w-7xl mx-auto mt-5 z-0">
          <div className="flex justify-between">
            <p className="text-[#2E7D32] text-xl font-bold mb-5">{t("Reviews")}</p>
            <p className="text-black text-lg font-bold mb-5 cursor-pointer"
              onClick={() => router.push(`/Reviews/${slug}`)}
            > View All</p>
          </div>
          <Swiper
            spaceBetween={20}
            slidesPerView={1}
            pagination={{ clickable: true }}
            navigation
            modules={[Pagination, Navigation]}
            breakpoints={{
              320: {
                slidesPerView: 2.5,
              },
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 2.5,
              },
            }}
          >
            {productReviews?.map((item, i) => (
              <SwiperSlide key={i}>
                <div className="border-2 black-border p-3  rounded-lg shadow-lg overflow-hidden">
                  <div className="md:pt-2 flex justify-start items-center">
                    <div className="md:w-[40px] md:h-[40px] w-7 h-7 bg-custom-gold rounded-full flex justify-center items-center">
                      <p className="text-white md:text-[18px] text-base font-bold">
                        {item?.posted_by?.username?.charAt(0).toUpperCase()}
                      </p>
                    </div>
                    <div className="md:ml-5 ml-2">
                      <div className="flex">
                        <p className="text-black font-normal md:text-[16px] text-[14px]">
                          {item?.posted_by?.username}
                        </p>
                      </div>
                      <p className="text-black font-normal text-xs">
                        {moment(item?.createdAt).format("MMM DD, YYYY")}
                      </p>
                    </div>
                  </div>

                  <p className="text-black font-normal md:text-base text-sm pt-5">
                    {item?.description}
                  </p>

                  {item?.images && item?.images?.length > 0 && (
                    <div className="pt-3" onClick={() => {
                      setImages(item?.images);
                      setVisible(true);
                    }}>
                      {item?.images?.length === 1 ? (
                        <div className="w-36 h-44  relative">
                          <Image
                            fill
                            src={item?.images[0]}
                            alt="Review image"
                            className="h-full w-full object-cover  rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {item?.images?.slice(0, 2).map((image, index) => (
                            <div key={index} className=" w-36 h-44  relative">
                              <Image
                                fill
                                src={image}
                                alt={`Review image ${index + 1}`}
                                className="w-full h-full object-contain rounded-lg"
                              />

                              {index === 1 && item?.images?.length > 2 && (
                                <div className="absolute inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center rounded-lg">
                                  <span className="text-white text-sm font-semibold">
                                    +{item?.images?.length - 2}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </>
  );
};

export default ProductReviews;

