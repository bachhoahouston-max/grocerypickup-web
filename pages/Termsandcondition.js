import React from "react";
import { useTranslation } from "react-i18next";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function Termsandcondition(props) {
  const { t } = useTranslation();
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getTermsAndConditions = () => {
    props.loader(true);
    Api("get", "/content", router).then(
      (res) => {
        props.loader(false);
        console.log("API Response =>", res.data);

        if (res?.data?.length > 0 && res?.data[0]?.termsAndConditions) {
          setTermsAndConditions(res?.data[0]?.termsAndConditions);
          setLoading(false);
        } else {
          props.toaster({
            type: "error",
            message: "Terms and Conditions not found",
          });
          setLoading(false);
        }
      },
      (err) => {
        props.loader(false);
        console.log("API Error =>", err);
        props.toaster({ type: "error", message: err?.data?.message });
        props.toaster({ type: "error", message: err?.message });
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    getTermsAndConditions();
  }, []);

  return (
    <div className="relative md:mt-12 mt-9">
      <p className="text-black font-bold text-center text-[20px] md:text-[24px] p-2 bg-opacity-75 rounded lg:mt-3 ">
        {t("Terms and Conditions")}
      </p>

      <section className="bg-white w-full flex flex-col justify-center items-center">
        <div className="max-w-6xl mx-auto w-full md:px-5 px-5 md:pt-5 pt-2 md:pb-10 pb-5 md:min-h-screen">
          {loading ? (
            <p className="text-base text-black font-normal md:pb-5 animate-spin">
              Loading...
            </p>
          ) : (
            <div
              className="text-[18px] text-black font-normal md:pb-5"
              dangerouslySetInnerHTML={{ __html: termsAndConditions }}
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default Termsandcondition;
