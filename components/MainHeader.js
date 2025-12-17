import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Image from "next/image";
import { useRouter } from "next/router";
import { Api } from "@/services/service";
import { useTranslation } from "react-i18next";

function MainHeader() {
  const router = useRouter();
  const [carouselImg, setCarouselImg] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchData() {
      const res = await Api("get", "getsetting", "", router);
      setCarouselImg(res?.setting?.[0]?.carousel || []);
    }
    fetchData();
  }, [router]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const groupedImages = chunkArray(carouselImg, 3);
  const carouselData = isMobile ? carouselImg : groupedImages;

  const responsive = {
    desktop: { breakpoint: { max: 4000, min: 1024 }, items: 1 },
    tablet: { breakpoint: { max: 1024, min: 768 }, items: 1 },
    mobile: { breakpoint: { max: 767, min: 0 }, items: 1 },
  };

  const services = [
    {
      title: "In Store Pickup",
      description: "Pick it up inside the store",
      image: "/image19.png",
    },
    {
      title: "Curbside Pickup",
      description: "We bring it out to your car",
      image: "/image19.png",
    },
    {
      title: "Next Day Local Delivery",
      description: "Cut off time 8 pm",
      image: "/image19.png",
    },
    {
      title: "Shipping",
      description: "Delivery in 3 to 5 business days",
      image: "/image19.png",
    },
  ];

  return (
    <div className="relative md:mt-7 ">
      <Carousel
        responsive={responsive}
        infinite
        autoPlay
        autoPlaySpeed={5000}
        showDots
      >
        {carouselData.map((item, idx) =>
          isMobile ? (
            <div key={idx} className="md:px-2 pt-2 md:pt-0">
              <div
                className="relative w-full overflow-hidden"
                style={{
                  position: "relative",
                  aspectRatio: 2 / 1,
                }}
              >
                <Image
                  src={item?.image || "/fallback.jpg"}
                  alt="Banner"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            <div key={idx} className="px-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div
                    className="relative w-full overflow-hidden "
                    style={{
                      position: "relative",
                      aspectRatio: 2 / 1,
                    }}
                  >
                    <Image
                      src={item[0]?.image || "/fallback.jpg"}
                      alt="Banner"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="col-span-1 flex flex-col gap-4">
                  <div
                    className="relative w-full h-1/2 overflow-hidden"
                    style={{
                      position: "relative",
                      aspectRatio: 2 / 1,
                    }}
                  >
                    <Image
                      src={item[1]?.image || "/fallback.jpg"}
                      alt="Banner"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div
                    className="relative w-full h-1/2 overflow-hidden"
                    style={{
                      position: "relative",
                      aspectRatio: 2 / 1,
                    }}
                  >
                    <Image
                      src={item[2]?.image || "/fallback.jpg"}
                      alt="Banner"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </Carousel>

      <div className="hidden md:grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-8 pt-4">
        {services.map((service, index) => (
          <div
            key={index}
            className="transition-all duration-300 rounded-2xl px-4 py-8 text-center flex flex-col items-center cursor-pointer hover:shadow-lg"
          >
            <img src={service?.image} />
            <p className="text-[18px] md:text-[20px] font-semibold text-gray-900">
              {t(service.title)}
            </p>
            <p className="text-[14px] md:text-[15px] text-gray-700 mt-2">
              {t(service.description)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainHeader;
