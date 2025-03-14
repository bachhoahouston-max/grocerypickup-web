import React, { useEffect, useState } from 'react';
import ShopFasterTropicana from '@/components/ShopFasterMarketplace';
import { Api } from '@/services/service';

import { useRouter } from 'next/router';
const Category = (props) => {
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
      <div className="max-w-7xl md:mt-0 mt-8 md:px-0 px-6 mx-auto bg-white">
        <h2 className="md:text-3xl text-xl font-semibold text-gray-800 mb-8">All Categories</h2>
        <div className="mb-8 grid md:grid-cols-4 grid-cols-2">
          {category.map((cat, index) => (
            <div key={index} className="rounded-lg h-full flex flex-col justify-center cursor-pointer items-center"
            onClick={() => { router.push(`/categories/${cat?.slug}`) }}
            >
              <div className='bg-[#EFFAEC] p-4 rounded-[12px] h-36 md:h-[207px] md:w-[241px] w-[145px]'>
                <img alt={cat.label} className="w-full md:h-36 h-24 object-cover mb-2" src={cat.image} />
              </div>
              <p className="text-center text-black text-md md:text-[21px] font-semibold mt-4 w-[60%] mb-4">{cat.name}</p>
            </div>

          ))}
        </div>
      </div>
      <section className="w-full md:pt-10 pt-5 pb-5">
        <ShopFasterTropicana />
      </section>
    </>
  );
};

export default Category;