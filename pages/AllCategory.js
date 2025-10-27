import React, { useEffect, useState } from "react";
import { Api } from "@/services/service";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";

const Category = (props) => {
  const { t } = useTranslation();
  const [category, setCategory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    CategoryData();
  }, []);

  const CategoryData = () => {
    props.loader(true);

    Api("get", "getCategory", null).then(
      (res) => {
        props.loader(false);
        setCategory(res.data);
      },
      (err) => {
        props.loader(false);
        props.toaster({
          type: "error",
          message: err?.data?.message || "Failed to load profile",
        });
      }
    );
  };

  return (
    <>
      <Head>
        <title>Shop All Categories – Bachhoahouston Retail Store</title>
        <meta name="description" content="Explore and shop all categories from groceries to beauty, books, and home goods at Bachhoahouston. Delivery and pickup options available" />
        <link
          rel="canonical"
          href="https://www.bachhoahouston.com/AllCategory"
        />
      </Head>
      <div className="max-w-7xl md:mt-12 mt-12 md:px-4 px-4 mx-auto bg-white">
        <div className="flex justify-between">
          <h1 className="md:text-3xl text-xl font-semibold text-gray-800 md:mb-8 mb-4">
            {t("All Categories")}
          </h1>
          <p className="md:text-2xl cursor-pointer text-lg font-semibold text-gray-800 md:mb-8 mb-4"
            onClick={() =>
              router.push("/categories/all?category=all&sort_by=new")
            }
          >
            {t("View All")}
          </p>
        </div>
        <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-6 mb-4">
          {category.map((cat, index) => (
            <div
              key={index}
              className="bg-white  hover:shadow-lg transition-all duration-300 rounded-lg cursor-pointer flex flex-col items-center md:py-4"
              onClick={() => router.push(`/categories/${cat?.slug}`)}
            >
              <div className="relative w-full h-64 rounded-lg overflow-hidden mb-3">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-contain"
                />
              </div>

              <p className="text-center text-black text-lg md:text-xl font-medium md:mb-0 mb-4">
                {cat.name}
              </p>
            </div>
          ))}
        </div>
      </div>

    
    </>
  );
};

export default Category;
