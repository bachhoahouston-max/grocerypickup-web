import { RxCross2 } from "react-icons/rx";
import { useEffect, useState } from "react";
import { Api } from "@/services/service";
import { useRouter } from "next/router";

function AnnouncementBar({ announcementBar, setAnnouncementBar, loader, toaster }) {
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
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

.animate-marquee-mobile {
  animation: marquee 10s linear infinite;
}




`}
      </style>

      <div
        className={`transition-all duration-500 ease-in-out ${announcementBar ? "opacity-100 max-h-12" : "opacity-0 max-h-0 overflow-hidden"
          }`}
      >
        <div className="w-full py-2 bg-custom-green text-white text-center min-h-12 overflow-hidden">
          {shipmentCostMessage && (
            <div className="animate-marquee-mobile whitespace-nowrap mt-1">
              <span>{shipmentCostMessage}</span>
            </div>
          )}
        </div>

        {/* <div className="w-full py-2 bg-custom-green text-white text-center min-h-12 ">
          {shipmentCostMessage && <marquee scrollamount="10" ><p className="pt-1">{shipmentCostMessage}</p></marquee>}
        </div> */}



      </div>

    </>
  );
}

export default AnnouncementBar;
