import { useTranslation } from "react-i18next";

function DealsOnOrganicFood() {
   const { t } = useTranslation()
    return (
      <>
        <div className="bg-[url('/download2.png')] bg-cover bg-no-repeat md:h-[580px] w-full md:p-0 p-5">
          <div className="flex items-center justify-start h-full w-full max-w-7xl mx-auto">
            <div className="flex flex-col justify-center items-start bg-[#F3DDCD] w-full md:w-[550px] h-auto md:h-[250px] px-8 py-12">
              {/* <div className="flex">
                <p className="text-red-500 text-[18px] md:text-[20px] mr-2 font-semibold">35%</p>
                <p className="text-[#3B3B3B] text-[18px] md:text-[20px]">{t("off")}</p>
              </div> */}
              <p className="text-[25px] md:text-[32px] text-black font-bold mb-4">
                {t("Great deal on Organic food")}</p>
              <p className="text-[#6B6B6B] text-[13px] md:text-[16px] italic">
              {t("Enjoy off on fresh, organic groceries – clean, healthy, and chemical-free, straight from trusted farms")}.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  export default DealsOnOrganicFood;