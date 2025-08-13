import { Api } from "@/services/service";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import GroceryCategories from "@/components/GroceryCatories";
import ShopFasterTropicana from "@/components/ShopFasterMarketplace";
import { useTranslation } from "react-i18next";
import { userContext } from "./_app";
import Head from "next/head";
function Favourite(props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [favouriteList, setFavouriteList] = useState([]);
  const [user, setUser] = useContext(userContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getFavourite();
    }
  }, []);

  const getFavourite = async () => {
    props.loader(true);
    Api("get", "getFavourite", null, router, { id: user._id }).then(
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
      <Head>
        <title>Your Personalized Shopping List – Bachhoahouston</title>
        <meta name="description" content="Easily access your personalized shopping list of favorite groceries, beauty, and more at Bachhoahouston. Shop faster and smarter today!" />
      </Head>
      <div className="mx-auto max-w-7xl py-12">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-center text-[35px] md:text-[45px] font-semibold mb-2 text-black">
            {t("My")}
            <span className="ml-2 text-[35px] md:text-[45px] font-semibold mb-4 text-custom-green">
              {t("Favorite")}
            </span>
          </h1>
          <p className="md:px-0  px-12 text-center  text-[16px] mb-6  w-full md:w-[40%] text-black">
            {" "}
            {t("Quickly access your favorite items for easy reordering")}.
          </p>
        </div>
        <div className="grid xl:grid-cols-7 lg:grid-cols-6 grid-cols-2 md:px-0 px-4 w-full md:gap-4 gap-2">
          {favouriteList.length > 0 ? (
            favouriteList.map((item, i) => (
              <div key={i} className="w-full">
                <GroceryCategories
                  item={item?.product}
                  loader={props.loader}
                  toaster={props.toaster}
                  i={i}
                  url={`/product-details/${item?.product?.slug}`}
                />
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center col-span-10 h-[200px] md:h-[300px]">
              <p className="text-black font-semibold text-xl md:text-2xl text-center">
                {t("No favourites product available")}
              </p>
            </div>
          )}
        </div>
      </div>
      <section className="w-full md:pt-10 pt-5 pb-5">
        <ShopFasterTropicana />
      </section>
    </>
  );
}
export default Favourite;
