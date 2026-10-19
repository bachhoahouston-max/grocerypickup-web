import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import GroceryCatories from "@/components/GroceryCatories";
import { getBuyItAgainCategoryProducts } from "@/services/buyItAgain";

function BuyItAgain(props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const loadProducts = (pageToLoad) => {
    props.loader(true);
    getBuyItAgainCategoryProducts(router, pageToLoad)
      .then((res) => {
        setProducts((prev) =>
          pageToLoad === 1 ? res.products : [...prev, ...res.products]
        );
        setTotalPages(res.totalPages);
        setPage(pageToLoad);
      })
      .catch((error) => {
        props.toaster({
          type: "error",
          message: error?.message || "Failed to load buy it again products",
        });
      })
      .finally(() => props.loader(false));
  };

  useEffect(() => {
    if (!router.isReady) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signIn");
      return;
    }

    loadProducts(1);
  }, [router.isReady]);

  /*
  {products.map((item, index) => (
    <div key={`${item._id}-${index}`} className="p-1 w-full md:mb-5 mb-2">
      <GroceryCatories
        loader={props.loader}
        toaster={props.toaster}
        item={item}
        i={index}
        url={`/product-details/${item?.slug}`}
      />
    </div>
  ))}
  */
  return (
    <>
      <Head>
        <title>{t("Buy it again")} | Bach Hoa Houston</title>
        <meta
          name="description"
          content={t("Products purchased previously and available to buy again")}
        />
      </Head>
      <div className="bg-[var(--theme-var)] md:bg-[var(--theme-dek)] min-h-screen">
        <div className="mx-auto w-full px-2 md:px-10 pt-8 pb-10">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-5">
            {t("Buy it again")}
          </h1>
          {products.length > 0 ? (
            <>
            <div className="grid lg:grid-cols-5 xl:grid-cols-6 md:grid-cols-6 grid-cols-2 mb-6 space-x-2">
              {products.map((item, index) => (
                <div key={`${item._id}-${index}`} className="p-1 w-full md:mb-5 mb-2">
                  <GroceryCatories
                    loader={props.loader}
                    toaster={props.toaster}
                    item={item}
                    i={index}
                    url={`/product-details/${item?.slug}`}
                  />
                </div>
              ))}
            </div>
            {page < totalPages && (
              <div className="flex justify-center">
                <button
                  className="bg-custom-green text-white font-semibold px-6 py-2 rounded-md"
                  onClick={() => loadProducts(page + 1)}
                >
                  {t("Load more")}
                </button>
              </div>
            )}
            </>
          ) : (
            <div className="flex justify-center items-center h-[400px]">
              <p className="text-black text-center font-semibold text-xl">
                {t("No previously purchased products available")}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BuyItAgain;
