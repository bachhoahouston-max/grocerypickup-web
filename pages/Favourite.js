import { Api } from "@/services/service";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import GroceryCategories from "@/components/GroceryCatories";
import ShopFasterTropicana from "@/components/ShopFasterMarketplace";
function Favourite(props) {
  const router = useRouter();
  const [favouriteList, setFavouriteList] = useState([]);

  useEffect(() => {
    getFavourite();
  }, []);

  const getFavourite = async () => {
    props.loader(true);
    Api("get", "getFavourite", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        setFavouriteList(res.data);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };
  return (
    <>
      <div className="mx-auto max-w-7xl py-12">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-center text-[35px] md:text-[45px] font-semibold mb-2 text-black">
            My
            <span className="ml-2 text-[35px] md:text-[45px] font-semibold mb-4 text-custom-green">
              Favorite
            </span>
          </h1>
          <p className="md:px-0  px-12 text-center  text-[16px] mb-6  w-full md:w-[40%] text-black">
            {" "}
            Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet
            sint. Velit officia consequat.
          </p>
        </div>
        <div className="grid md:grid-cols-5 grid-cols-1 md:px-0 px-20 w-full gap-4">
          {
            favouriteList.length > 0 ? (favouriteList.map((item, i) => (
              <div key={i} className='w-full'>
                <GroceryCategories item={item?.product} i={i} url={`/product-details/${item?.product?.slug}`} />
              </div>
            ))) : (
              <div className='flex justify-center items-center col-span-10 h-[200px] md:h-[300px]'>
                <p className='text-black font-semibold text-xl md:text-2xl text-center'>No favourites product available</p>
              </div>
            )
          }
        </div>
      </div>
      <section className="w-full md:pt-10 pt-5 pb-5">
        <ShopFasterTropicana />
      </section>
    </>
  );
}
export default Favourite;
