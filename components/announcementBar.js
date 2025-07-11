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
    loader(true);
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
            0%   { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }

          .animate-marquee {
            display: inline-block;
            white-space: nowrap;
            animation: marquee 15s linear infinite;
          }
        `}
      </style>

      <div
        className={`transition-all duration-500 ease-in-out ${
          announcementBar
            ? "opacity-100 max-h-12"
            : "opacity-0 max-h-0 overflow-hidden"
        } bg-custom-green text-white`}
      >
        <div className="relative h-12 w-full flex items-center justify-center px-4 overflow-hidden">
          <div className="w-full overflow-hidden">
            <p className="animate-marquee text-sm sm:text-base">
               {shipmentCostMessage}
            </p>
          </div>

          {/* <button
            onClick={() => setAnnouncementBar(false)}
            className="absolute right-4 text-white hover:text-red-200 transition duration-300"
          >
            <RxCross2 className="w-5 h-5" />
          </button> */}
        </div>
      </div>
    </>
  );
}

export default announcementBar;
