import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { Api } from "@/services/service";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

function MainHeader({ toaster, loader }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [carouselImg, setCarouselImg] = useState([]);

  useEffect(() => {
    getsetting();
  }, []);

  const getsetting = async () => {
    loader(true);
    try {
      const res = await Api("get", "getsetting", "", router);
      loader(false);
      if (res?.success && res?.setting?.length > 0) {
        setCarouselImg(res?.setting[0]?.carousel || []);
      } else {
        toaster({
          type: "error",
          message: res?.data?.message || "Error fetching settings.",
        });
      }
    } catch (err) {
      loader(false);
      console.error(err);
      toaster({ type: "error", message: err?.message });
    }
  };

  const responsive = {
    all: {
      breakpoint: { max: 4000, min: 0 },
      items: 1,
    },
  };

  return (
    <>
      {carouselImg.length > 0 ? (
        <div className="w-screen overflow-hidden group relative md:mt-12 mt-4">
          <Carousel
            responsive={responsive}
            infinite
            autoPlay
            autoPlaySpeed={4000}
            arrows
            className="w-full"
            customLeftArrow={
              <div className="hidden group-hover:flex absolute left-4 top-1/2 transform -translate-y-1/2  text-white p-2 rounded-full z-10 cursor-pointer transition">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </div>
            }
            customRightArrow={
              <div className="hidden group-hover:flex absolute right-4 top-1/2 transform -translate-y-1/2  text-white p-2 rounded-full z-10 cursor-pointer transition">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            }
          >
            {carouselImg.map((img, idx) => (
              <div
                key={idx}
                className="w-full h-[320px] sm:h-[320px] md:h-[500px] lg:h-[720px] xl:h-[100vh]"
              >
                <img
                  src={img.image || "/fallback.jpg"}
                  alt={`Carousel ${idx}`}
                  className="w-full h-full md:object-cover object-contain"
                />
              </div>
            ))}
          </Carousel>
        </div>
      ) : (
        <div className="bg-[url('/image98.png')] bg-cover bg-no-repeat md:h-[620px] md:p-0">
          <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-5 max-w-7xl mx-auto h-full px-4 md:px-20 lg:px-32 xl:px-20 2xl:px-5">
            <div className="flex flex-col justify-center items-center md:items-start py-10 md:py-0">
              <p className="text-white mb-4 mt-6 md:mt-0 md:mb-12 font-semibold text-[13px] md:text-[15px] text-center md:text-start">
                <span className="text-white font-semibold">100%</span>{" "}
                {t("Organic Fruits")}
              </p>
              <h1 className="text-center md:text-start text-2xl md:text-4xl lg:text-[44px] xl:text-[55px] font-bold text-custom-purple leading-tight md:leading-[60px] text-white w-full">
                {t("Explore fresh")} <br /> {t("juicy Fruits")}.
              </h1>
              <p className="text-white text-center md:text-start font-medium text-[13px] md:text-[15px] mt-4 italic md:mt-12 max-w-md w-[90%]">
                {t(
                  "From garden-fresh fruits and crisp vegetables to dairy, snacks, and daily household needs — everything you need, all in one place. Easy pickup. Guaranteed freshness"
                )}
                .
              </p>
              <button
                className="flex justify-center md:justify-start bg-custom-gold text-white px-6 py-3 rounded-lg text-[13px] md:text-[15px] mt-6 md:mt-12 items-center"
                onClick={() => router.push("/categories/all")}
              >
                {t("Shop Now")}
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MainHeader;
