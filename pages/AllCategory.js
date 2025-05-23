import React, { useEffect, useState } from 'react';
import ShopFasterTropicana from '@/components/ShopFasterMarketplace';
import { Api } from '@/services/service';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

const Category = (props) => {
  const { t } = useTranslation()
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
        console.log("=>----", res.data);
        setCategory(res.data);
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.data?.message || "Failed to load profile" });
      }
    );
  };

  return (
    <>
      <div className="max-w-7xl md:mt-0 mt-8 md:px-4 px-4 mx-auto bg-white">
        <h2 className="md:text-3xl text-xl font-semibold text-gray-800 md:mb-8 mb-4">
          {t("All Categories")}
        </h2>

        <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-6">
          {category.map((cat, index) => (
            <div
              key={index}
              className="bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-lg cursor-pointer flex flex-col items-center md:py-4"
              onClick={() => router.push(`/categories/${cat?.slug}`)}
            >
              <div className="w-full h-36 md:h-48 rounded-lg overflow-hidden mb-3">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-center text-black text-sm md:text-lg font-medium md:mb-0 mb-4">
                {cat.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      <section className="w-full md:flex hidden md:pt-10 pt-5 pb-5">
        <ShopFasterTropicana />
      </section>
    </>
  );
};

export default Category;