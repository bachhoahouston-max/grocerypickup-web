import { RxCross2 } from "react-icons/rx";
import { useEffect, useState } from "react";
import { Api } from "@/services/service";
import { useRouter } from "next/router";

function announcementBar({
  announcementBar,
  setAnnouncementBar,
  loader,
  toaster,
}) {
  const [shipmentCostMessage, setShipmentCostMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnouncementBar(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    getShippingCosts();
  }, []);

  const getShippingCosts = async () => {
    try {
      const res = await Api("get", "getShippingCost", null, router);
      loader(false);
      if (res.shippingCosts && res.shippingCosts.length > 0) {
        const costs = res.shippingCosts[0];
        setShipmentCostMessage(costs.shipmentCostMessage || "");
      }
    } catch (err) {
      loader(false);
      toaster({
        type: "error",
        message: err?.message || "Failed to fetch shipping costs",
      });
    }
  };

  return (
    <>
      <style>
        {`
    @keyframes marquee {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }
    .marquee-animate {
      animation: marquee 15s linear infinite;
    }
  `}
      </style>

      <div
        className={`transition-all duration-500 ease-in-out ${announcementBar
          ? "opacity-100 max-h-12"
          : "opacity-0 max-h-0 overflow-hidden"
          }`}
      >
        <div className="relative w-full h-12 overflow-hidden flex  justify-center items-center bg-[#f38529] text-white">
          <div className="flex whitespace-nowrap 
                    sm:animate-none    /* desktop: no animation */
                    animate-[marquee_15s_linear_infinite] /* mobile: run */">
            <span className="pr-8">{shipmentCostMessage}</span>
            {/* <span className="pr-8">{shipmentCostMessage}</span> */}
          </div>
        </div>
      </div>



    </>
  );
}

export default announcementBar;
