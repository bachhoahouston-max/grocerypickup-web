import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

function ProductCategory({ item, i, url }) {
  const router = useRouter();

  return (
    <div
      key={i}
      className="bg-custom-lightGrayColor cursor-pointer overflow-hidden hover:scale-105 transition-all duration-200 ease-in-out md:p-1 p-4 flex flex-col justify-center items-center rounded-[3px] mr-0 md:mr-5 md:mt-2 mt-5"
      onClick={() => {
        router.push(url);
      }}
    >
      {/* Image wrapper with relative + fixed height */}
      <div className="relative w-full md:h-[158px] h-[150px] rounded-[12px] overflow-hidden">
        <Image
          src={item?.image}
          alt={item?.name || "Item"}
          fill
          className="object-contain rounded-[12px]"
          sizes="(max-width: 768px) 150px, 158px"
        />
      </div>

      <p className="text-black 2xl:text-[20px] xl:text-[18px] lg:text-[15px] text-[14px] font-semibold text-center md:pt-5 pt-3 md:pb-0 pb-4">
        {item?.name}
      </p>
    </div>

  );
}

export default ProductCategory;
