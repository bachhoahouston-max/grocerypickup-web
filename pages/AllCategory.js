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
      <div className="max-w-7xl md:mt-0 mt-8 md:px-0 px-10 mx-auto bg-white">
        <h2 className="md:text-3xl text-xl font-semibold text-gray-800 md:mb-8 mb-4">All Categories</h2>
        <div className="mb-4 grid md:grid-cols-4 grid-cols-2 md:gap-0 gap-8">
          {category.map((cat, index) => (
            <div key={index} className="rounded-lg h-full flex flex-col items-center cursor-pointer "
            
            >
              <div className='bg-custom-green p-4 rounded-[12px] h-36 md:h-[207px] md:w-[241px] w-[145px] mr-4'
              onClick={() => { router.push(`/categories/${cat?.slug}`) }}
              >
                <img alt={cat.label} className="w-full md:h-36 h-24 object-cover mb-2 " src={cat.image} />
              </div>
              <p className="text-center text-black text-md md:text-[21px] font-semibold mt-4 md:w-[60%] w-full mb-4">{cat.name}</p>
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