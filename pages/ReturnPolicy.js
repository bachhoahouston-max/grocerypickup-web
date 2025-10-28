import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import Head from "next/head";
function ReturnPolicy(props) {
  const [returnPolicyData, setReturnPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getReturnPolicy = () => {
    props.loader(true);
    Api("get", "/content", router).then(
      (res) => {
        props.loader(false);
        if (res?.data?.length > 0 && res?.data[0]?.returnPolicy) {
          setReturnPolicyData(res.data[0]);
          setLoading(false);
        } else {
          props.toaster({ type: "error", message: "Return policy not found" });
          setLoading(false);
        }
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.data?.message });
        props.toaster({ type: "error", message: err?.message });
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    getReturnPolicy();
  }, []);

  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>
          Return Policy – Shop Confidently at Bachhoahouston</title>
        <meta name="description" content="Learn about our flexible retail return policy for groceries, beauty, and more. Bachhoahouston ensures a smooth and worry-free experience" />
         <link
          rel="canonical"
          href="https://www.bachhoahouston.com/ReturnPolicy"
        />
      </Head>
      <div className="relative min-h-screen md:mt-12 mt-9">
        <h1 className="text-black font-bold text-center text-[20px] md:text-[24px] p-2 bg-opacity-75 rounded ">
          {t("Return Policy")}
        </h1>

        <section className="bg-white w-full flex flex-col justify-center items-center">
          <div className="max-w-7xl mx-auto w-full md:px-5 px-5 md:pt-5 pt-2 md:pb-10 pb-5 md:min-h-screen">
            {loading ? (
              <p className="text-base text-black font-normal md:pb-5">
                Loading...
              </p>
            ) : (
              <div
                className="text-[18px] text-black font-normal md:pb-5 store-content"
                dangerouslySetInnerHTML={{
                  __html: returnPolicyData?.returnPolicy,
                }}
              />
            )}
          </div>
        </section>
      </div>

    </>
  )
}

export default ReturnPolicy;
