import Image from "next/image";
import React from "react";
import { useTranslation } from "react-i18next";

function ShopFasterGroceryStore() {
  const { t } = useTranslation();

  return (
    <div className="relative w-full min-h-[400px] md:h-[666px] md:p-0 p-5">
      <div className="absolute inset-0">
        <Image
          src="/download2.png"
          alt="Grocery pickup"
          fill
          priority
          className="object-cover"
        />
      </div>

      <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-5 max-w-7xl mx-auto h-full relative md:mt-0 mt-14">
        <div className="flex flex-col justify-center items-start ">
          <p className="md:text-[55px] text-2xl font-bold text-custom-purple md:leading-[70px] text-[#35035C] md:ps-0 ps-4">
            {t("Shop Faster With Grocery App")}
          </p>
          <p className="text-custom-purple font-medium md:text-[20px] text-[14px] text-[#35035C] pt-5 md:w-full w-[250px] md:ps-0 ps-4">
            {t("Available on both IOS & Android")}
          </p>

          <div className="flex md:flex-row flex-col justify-start items-center gap-5 md:pt-10 mt-4">
            {/* iOS App Store */}
            <a
              href="https://apps.apple.com/us/app/b%C3%A1ch-ho%C3%A1-houston/id6745395289"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/image13.png"
                alt="Download on the App Store"
                width={219}
                height={63}
                className="md:h-[63px] h-[50px] md:w-[219px] w-full object-contain"
              />
            </a>

            {/* Google Play Store */}
            <a
              href="https://play.google.com/store/apps/details?id=com.bachhoahouston"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/image14.png"
                alt="Get it on Google Play"
                width={239}
                height={73}
                className="md:h-[63px] h-[58px] md:w-[219px] w-full object-contain"
              />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ShopFasterGroceryStore;
