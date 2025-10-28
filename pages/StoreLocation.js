import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import Head from "next/head";

function StoreLocation(props) {
  const { t } = useTranslation();
  const [StoreLocation, setStoreLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getStoreLocation = () => {
    props.loader(true); 
    Api("get", "/content", router).then(
      (res) => {
        props.loader(false); 

        if (res?.status) {
          setStoreLocation(res?.data[0]?.StoreLocation);
          setLoading(false); 
        } else {
          props.toaster({ type: "error", message: res?.data?.message });
          setLoading(false); 
        }
      },
      (err) => {
        props.loader(false); 
        props.toaster({ type: "error", message: err?.data?.message|| err?.message });
        setLoading(false); 
      }
    );
  };

  useEffect(() => {
    getStoreLocation();
  }, []);

  return (
    <>
      <Head>
        <title>
          Find a Bachhoahouston Vietnamese Grocery Store Near You</title>
        <meta name="description" content="Visit your nearest Bachhoahouston Vietnamese grocery store for fresh foods, beauty, books & more. Curbside pickup & delivery available!" />
         <link
          rel="canonical"
          href="https://www.bachhoahouston.com/StoreLocation"
        />
      </Head>
      <div className="relative min-h-screen md:mt-10 mt-10">
        <h1 className="text-black font-bold text-center text-[20px] md:text-[24px] p-2 bg-opacity-75 rounded lg:mt-3 ">
          {t("Store Location")}
        </h1>
        <section className="bg-white w-full flex flex-col justify-center items-center">
          <div className="max-w-7xl mx-auto w-full md:px-5 px-5 md:pt-10 md:pb-10 pb-5 md:min-h-screen">
            {loading ? (
              <p className="text-base text-black font-normal md:pb-5">
                Loading...
              </p>
            ) : (
              <div
                className="md:text-[18px] text-[14px] text-black font-normal md:pb-5 store-content"
                dangerouslySetInnerHTML={{ __html: StoreLocation }}
              />
            )}
          </div>
        </section>
      </div>
    </>

  );
}

export default StoreLocation;
