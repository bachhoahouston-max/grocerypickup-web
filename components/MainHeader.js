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

const chunkArray = (arr = [], size) => {
  if (!arr.length) return [];

  const chunks = [];

  for (let i = 0; i < arr.length; i += size) {
    let chunk = arr.slice(i, i + size);

    let fillIndex = 0;
    while (chunk.length < size) {
      chunk.push(arr[fillIndex % arr.length]);
      fillIndex++;
    }

    chunks.push(chunk);
  }

  return chunks;
};


  const groupedImages = chunkArray(carouselImg, 2);

  const carouselData = isMobile ? carouselImg : groupedImages;

  const responsive = {
    desktop: { breakpoint: { max: 4000, min: 1024 }, items: 1 },
    tablet: { breakpoint: { max: 1024, min: 768 }, items: 1 },
    mobile: { breakpoint: { max: 767, min: 0 }, items: 1 },
  };

  const isAfter12PM = () => {
    const now = new Date(); // local timezone
    const hours = now.getHours();
    const minutes = now.getMinutes();

    return hours > 12 || (hours === 12 && minutes > 0);
  };

  const isAfterNoon = isAfter12PM();

  const services = [
    {
      title: "In Store Pickup",
      description: "Pick it up inside the store",
      image: "/image19.png",
    },
    {
      title: "Curbside Pickup",
      description: "We bring it out to your car",
      image: "/image23.png",
    },
    {
      title: isAfterNoon
        ? "Next Day Local Delivery"
        : "Same Day Local Delivery",
      description: isAfterNoon ? "Cut off time 11:59 pm" : "Cut off time 12 pm",
      image: "/image24.png",
    },
    {
      title: "Shipping",
      description: "Delivery in 3 to 5 business days",
      image: "/image25.png",
    },
  ];

  return (
    <div className="relative md:mt-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="md:col-span-2">
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
                    aspectRatio: 1 / 1,
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                    <div
                      className="relative w-full overflow-hidden "
                      style={{
                        position: "relative",
                        aspectRatio: 1 / 1,
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

                  <div className="col-span-1 ">
                    <div
                      className="relative w-full overflow-hidden"
                      style={{
                        position: "relative",
                        aspectRatio: 1 / 1,
                      }}
                    >
                      <Image
                        src={item[1]?.image || "/fallback.jpg"}
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
      </div>
      <div className="hidden md:hidden lg:grid grid-cols-1 gap-0 pb-8 pt-2">
        {services.map((service, index) => (
          <div
            key={index}
            className="transition-all duration-300 rounded-2xl px-3 py-4 min-h-[90px] text-center flex items-center max-w-[400px] cursor-pointer gap-4 hover:shadow-lg border border-gray-200 mb-4"
          >
            <div>
              {" "}
              <img src={service?.image} className="h-10"/>{" "}
            </div>
            <div className="text-left">
              <p className="md:text-[17px] font-semibold text-gray-900">
                {t(service.title)}
              </p>
              <p className="md:text-[13px] text-gray-700 mt-2">
                {t(service.description)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainHeader;
