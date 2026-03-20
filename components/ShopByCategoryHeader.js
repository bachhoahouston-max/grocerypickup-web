import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { languageContext } from "@/pages/_app";


const CategoryCard = ({ item, url, router }) => {
  const { lang } = useContext(languageContext);


  return (
    <Link
      className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-1 "
      // onClick={() => router.push(url)}
      href={url}
    >
      <div className="relative md:block hidden">
        <div className="relative w-14 h-14 md:w-14 md:h-14 rounded-full group-hover:shadow-xl group-hover:scale-105 shadow-md transition-all duration-300">
          <Image
            src={item?.image}
            alt={item?.name || "Category"}
            fill
            className="object-cover rounded-full"
          // sizes="(max-width: 768px) 100px, 120px"
          />
        </div>
      </div>
      <p className="text-black text-[8px] md:text-[10px] font-medium text-center">
      {lang === "en" ? item?.name : item?.v_name || item?.name}
      </p>
    </Link>
  )
};

function ShopByCategoryHeader() {
  const [categorys, setCategory] = useState([]);
  const router = useRouter();
  const { t } = useTranslation();
  const { lang } = useContext(languageContext);

  const [width, setWidth] = useState(360);
  // useEffect(() => {
  //   const handleResize = () => {
  //     console.log("window", window);
  //     setWidth(window.innerWidth);
  //   };
  //   // if (typeof window !== 'undefined') {

  //   window.addEventListener('resize', handleResize);
  //   // }


  //   return () => window.removeEventListener('resize', handleResize);
  // }
  //   , []);

  useEffect(() => {
    async function fetchData() {
      const cat = await Api("get", "getCategory", null, router);
      setCategory(cat.data);
    }
    fetchData();

    const handleResize = () => {
      console.log("window", window);
      setWidth(window.innerWidth);
    };
    if (typeof window !== 'undefined') {
      handleResize();
    }


  }, [router]);

  return (
    <div className="bg-transparent px-4 mt-2  ">
      <div className="hidden md:block md:w-full mx-auto" >

        <div className="overflow-x-auto scrollbar-hides" style={{ maxWidth: width - 80 }}>
          <div className="sm:grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:flex gap-4 md:gap-4 justify-center">
            <Link
              className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-1"
              // onClick={() =>
              //   router.push("/categories/all?category=all&sort_by=new")
              // }
              href={"/categories/all?category=all&sort_by=new"}
            >
              <div className="relative hidden md:flex">
                <div className="relative w-14 h-14  rounded-full  group-hover:scale-105 transition-all duration-300">
                  <Image
                    src="/NewArrival.png"
                    alt="Category"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <p className="text-black text-[8px] sm:text-[10px] font-semibold text-center">
                {t("New Arrivals")}

              </p>
            </Link>

            {/* <div
            className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-1"
            onClick={() =>
              router.push("/categories/bulk-buy")
            }
          >
            <div className="relative mb-3">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full group-hover:shadow-xl group-hover:scale-105 shadow-md transition-all duration-300">
                <Image
                  // src={item?.image}
                  alt="Category"
                  fill
                  className="object-cover rounded-full"
                  sizes="(max-width: 768px) 100px, 120px"
                />
              </div>

            </div>
            <p className="text-black text-[14px] sm:text-[16px] font-semibold text-center">
              Best Bulk Buys
            </p>
          </div> */}

            {categorys.map((category, index) => (
              <CategoryCard
                key={index}
                item={category}
                url={`/categories/${category?.slug}`}
                router={router}
              />
            ))}

          </div>
        </div>


      </div>

      {/* Mobile Category Row */}
      <div className="md:hidden" style={{ maxWidth: width - 32 }}>
        <div className=" overflow-x-auto scrollbar-hide px-1 w-full">
          <div className="flex gap-2 w-full min-w-0">

            {/* New Arrival */}
            <div
              className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-1 min-w-[90px] flex-shrink-0"
              onClick={() =>
                router.push("/categories/all?category=all&sort_by=new")
              }
            >
              {/* <div className="relative mb-3 hidden">
                <div className="relative w-16 h-16 rounded-full group-hover:scale-105 transition-all duration-300">
                  <Image
                    src="/NewArrival.png"
                    alt="Category"
                    fill
                    className="object-contain"
                  />
                </div>
              </div> */}
              <p className="text-black text-[13px] font-semibold text-center max-w-[90px] break-words">
                {t("New Arrivals")}
              </p>
            </div>

            {/* Category Items */}
            {categorys.map((category, index) => (
              <div
                key={index}
                className="flex flex-col items-center group cursor-pointer transition-transform hover:-translate-y-1 min-w-[90px] flex-shrink-0"
                onClick={() => router.push(`/categories/${category?.slug}`)}
              >
                {/* <div className="relative mb-3 hidden">
                  <div className="relative w-16 h-16 rounded-full shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                    <Image
                      src={category?.image}
                      alt={category?.name || "Category"}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                </div> */}

                <p className="text-black text-[13px] font-semibold text-center max-w-[90px] break-words">
                  {/* {category?.name} */}
                   {lang === "en" ? category?.name : category?.v_name || category?.name}
                </p>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
}

export default ShopByCategoryHeader;
