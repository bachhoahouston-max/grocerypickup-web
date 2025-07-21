import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { Api } from "@/services/service";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function MainHeader({ toaster, loader }) {
  const router = useRouter();

  const [carouselImg, setCarouselImg] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getsetting();
  }, []);

  const getsetting = async () => {
    loader(true);
    setLoading(true);
    try {
      const res = await Api("get", "getsetting", "", router);
      loader(false);
      setLoading(false);
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
      setLoading(false);
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

  const skeletonHeight =
    typeof window !== "undefined" ? window.innerHeight * 0.5 : 400;

  return (
    <>
      {loading || carouselImg.length === 0 ? (
        <div
          className=" overflow-hidden relative "
          style={{ height: `${skeletonHeight}px` }}
        >
          <Skeleton
            height="100%"
            width="100%"
            baseColor="#f0f0f0"
            highlightColor="#e0e0e0"
          />
        </div>
      ) : (
        <div className="mx-auto max-w-8xl overflow-hidden group relative md:mt-15 mt-7">
          <Carousel
            responsive={responsive}
            infinite
            autoPlay
            autoPlaySpeed={5000}
            arrows
            showDots
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
              <div className="hidden group-hover:flex absolute right-2 top-1/2 transform -translate-y-1/2  text-white p-2 rounded-full z-10 cursor-pointer transition">
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
                className="w-full h-[130px] flex items-center justify-center overflow-hidden 
                md:h-[355px] xl:h-[450px] 2xl:h-[490px]"
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
      )}
    </>
  );
}

export default MainHeader;
