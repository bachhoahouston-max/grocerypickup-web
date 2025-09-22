import Image from "next/image";
import React from "react";
import { useTranslation } from "react-i18next";

function ShopFasterTropicana() {
  const { t } = useTranslation();

  return (
    <div className="relative w-full min-h-[400px] md:h-[666px] md:p-0 p-5">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/download2.png" // Make sure this file exists in /public folder
          alt="Grocery pickup"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Content Section */}
      <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-5 max-w-7xl mx-auto h-full relative">
        <div className="flex flex-col justify-center items-start">
          <p className="md:text-[55px] text-2xl font-bold text-custom-purple md:leading-[70px] text-[#35035C]">
            {t("Shop Faster With Grocery App")}
          </p>
          <p className="text-custom-purple font-medium md:text-[20px] text-[14px] text-[#35035C] pt-5 md:w-full w-[250px]">
            {t("Available on both IOS & Android")}
          </p>

          <div className="flex md:flex-row flex-col justify-start items-center gap-5 md:pt-10 mt-4">
            <Image
              src="/image13.png"
              alt="Brand Logo 1"
              width={219}
              height={63}
              className="md:h-[63px] h-[50px] md:w-[219px] w-full object-contain"
            />
            <Image
              src="/image14.png"
              alt="Brand Logo 2"
              width={219}
              height={63}
              className="md:h-[63px] h-[58px] md:w-[219px] w-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopFasterTropicana;
