
import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "react-loading-skeleton/dist/skeleton.css";
import Image from "next/image";
import { useRouter } from "next/router";
import { Api } from "@/services/service";

function MainHeader() {
  const router = useRouter();
  const [carouselImg, setCarouselImg] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const res = await Api("get", "getsetting", "", router);
      setCarouselImg(res?.setting[0]?.carousel);
    }
    fetchData();
  }, [router]);

  const responsive = {
    desktop: {
      breakpoint: { max: 4000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 768 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 767, min: 0 },
      items: 1,
    },
  };


  const CustomLeftArrow = ({ ...rest }) => (
    <div {...rest} className="hidden group-hover:flex absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full z-10 cursor-pointer transition">
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </div>
  );

  const CustomRightArrow = ({ ...rest }) => (
    <div {...rest} className="hidden group-hover:flex absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full z-10 cursor-pointer transition">
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
  const ratio = 1 / 1; // dynamic ratio
  return (
    <div className="group relative md:mt-7">
      <Carousel
        responsive={responsive}
        infinite
        autoPlay
        autoPlaySpeed={5000}
        arrows
        showDots
        className="w-full"
        customLeftArrow={<CustomLeftArrow />}
        customRightArrow={<CustomRightArrow />}
      >
        {carouselImg.map((img, idx) => (
          // <div
          //   key={idx}
          //   className="relative aspect-square w-full  flex items-center justify-center overflow-hidden 
          //     md:h-[305px] lg:h-[320px] xl:h-[410px] rounded-[28px]"
          // >
          //   <Image
          //     src={img.image || "/fallback.jpg"}
          //     alt={`Bachahoustan banner ${idx}`}
          //     fill
          //     priority={idx === 0}
          //     className="w-full h-full object-cover"
          //   />
          // </div>
          <div key={idx} className=" flex items-center justify-center overflow-hidden ">
            <div

              className=" flex items-center justify-center overflow-hidden rounded-[28px] w-full md:w-full"
              style={{
                position: "relative",
                aspectRatio: ratio,
              }}
            >
              <Image
                src={img.image || "/fallback.jpg"}
                alt={`Bachahoustan banner ${idx}`}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}


export default MainHeader;
