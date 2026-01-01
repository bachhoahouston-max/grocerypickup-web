import Image from "next/image";
import { IoRemoveSharp, IoAddSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { produce } from "immer";
import { useContext } from "react";
import { cartContext, languageContext } from "@/pages/_app";
import constant from "@/services/constant";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

export default function CartDrawer({ pickupOption, toaster, cartClose }) {
  const { t } = useTranslation();
  const [cartData, setCartData] = useContext(cartContext);
  const { lang } = useContext(languageContext);
  const router = useRouter();

  const formatPrice = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const isAfter12PM = () => {
    const now = new Date(); // local timezone
    const hours = now.getHours();
    const minutes = now.getMinutes();

    return hours > 12 || (hours === 12 && minutes > 0);
  };

  const isAfterNoon = isAfter12PM();

  const getPickupConfig = (item) => ({
    ShipmentDelivery: {
      available: !!item.isShipmentAvailable,
      yes: t("Product is available for Shipment Delivery"),
      no: t("Product is Not available for Shipment Delivery"),
    },
    driveUp: {
      available: !!item.isCurbSidePickupAvailable,
      yes: t("Product is available for CurbSide Pickup"),
      no: t("Product is Not available for CurbSide Pickup"),
    },
    orderPickup: {
      available: !!item.isInStoreAvailable,
      yes: t("Product is available for In Store Pickup"),
      no: t("Product is Not available for In Store Pickup"),
    },
    localDelivery: {
      available: !!item.isNextDayDeliveryAvailable,
      yes: isAfterNoon
        ? t("Product is available for Next Day Delivery")
        : t("Product is available for Same Day Delivery"),
      no: isAfterNoon
        ? t("Product is Not available for Next Day Delivery")
        : t("Product is Not available for Same Day Delivery"),
    },
  });

  const persistCart = (nextState) => {
    setCartData(nextState);
    try {
      localStorage.setItem("addCartDetail", JSON.stringify(nextState));
    } catch (e) {
      console.warn("Failed to persist cart:", e);
    }
  };
  const decreaseQty = (index, item) => {
    if (item.qty > 1) {
      const nextState = produce(cartData, (draft) => {
        draft[index].qty -= 1;
        const price = parseFloat(draft[index]?.price) || 0;
        draft[index].total = price * draft[index].qty;
      });
      persistCart(nextState);
    }
  };

  const increaseQty = (index, item) => {
    const nextState = produce(cartData, (draft) => {
      const maxQty = item?.Quantity ?? Infinity;

      if (draft[index].qty + 1 > maxQty) {
        toaster?.({
          type: "error",
          message:
            "Item is not available in this quantity in stock. Please choose a different item.",
        });
        return;
      }

      draft[index].qty += 1;
      const price = parseFloat(draft[index]?.price) || 0;
      draft[index].total = price * draft[index].qty;
    });

    persistCart(nextState);
  };

  return (
    <div className="bg-white w-full md:w-3/5 rounded-[5px]">
      {cartData && cartData.length > 0 && (
        <div className="mt-3 space-y-3">
          {cartData?.map((item, i) => {
            const pickupConfig = getPickupConfig(item);
            return (
              <>
                <div
                  key={i}
                  className="w-full bg-white rounded-xl shadow-md p-3 "
                >
                  <div className="flex flex-row items-start md:items-center justify-between gap-4">
                    <div
                      className="relative w-[80px] h-[80px] md:w-[120px] md:h-[120px] flex-shrink-0 rounded-lg overflow-hidden"
                      onClick={() =>
                        router.push(`/product-details/${item?.slug || item?.product?.slug}`)
                      }
                    >
                      <Image
                        src={
                          item?.selectedImage ||
                          item?.image ||
                          "/placeholder.png"
                        }
                        alt={item?.name || "item"}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 80px, 120px"
                      />
                    </div>

                    <div className="flex flex-col flex-1 p-1 min-w-0">
                      <p className="text-black font-medium md:text-base text-sm ">
                        {lang === "en" ? item?.name : item?.vietnamiesName}
                      </p>

                      <div className="text-sm text-black mt-1 flex gap-3 items-center flex-wrap">
                        <span className="text-xs md:text-sm">
                          {item?.price_slot?.value ?? 1}{" "}
                          {item?.price_slot?.unit ?? "unit"}
                        </span>
                        <span className="font-medium">
                          {constant.currency}
                          {item?.price}
                        </span>
                        {item?.price_slot?.other_price && (
                          <span className="line-through text-xs">
                            {constant.currency}
                            {item?.price_slot?.other_price}
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        {pickupConfig[pickupOption] && (
                          <p
                            className={`${
                              pickupConfig[pickupOption].available
                                ? "text-green-500"
                                : "text-red-500"
                            } text-xs md:text-sm`}
                          >
                            {pickupConfig[pickupOption].available
                              ? pickupConfig[pickupOption].yes
                              : pickupConfig[pickupOption].no}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="md:flex hidden flex-col items-end md:flex-row md:items-center gap-3 mt-2 md:mt-0">
                      <div className="flex items-center justify-center bg-custom-green rounded-full px-3 py-1 w-28">
                        <button onClick={() => decreaseQty(i, item)}>
                          <IoRemoveSharp className="text-white text-xl" />
                        </button>
                        <span className="mx-4 text-white font-medium text-base">
                          {item?.qty}
                        </span>

                        <button onClick={() => increaseQty(i, item)}>
                          <IoAddSharp className="text-white text-xl" />
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-3 w-30">
                        <p className="text-black font-semibold text-base">
                          {constant.currency}
                          {formatPrice(item?.total)}
                        </p>
                        <IoMdClose
                          className="w-5 h-5 text-black cursor-pointer"
                          onClick={() => cartClose(item, i)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="md:hidden flex flex-row items-center justify-center gap-3 mt-2 md:mt-0">
                    <div className="flex items-center justify-center bg-custom-green rounded-full px-3 py-1 w-28">
                      <button onClick={() => decreaseQty(i, item)}>
                        <IoRemoveSharp />
                      </button>
                      <span className="mx-4 text-white font-medium text-base">
                        {item?.qty}
                      </span>

                      <button onClick={() => increaseQty(i, item)}>
                        <IoAddSharp />
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-3 w-30">
                      <p className="text-black font-semibold text-base">
                        {constant.currency}
                        {formatPrice(item?.total)}
                      </p>
                      <IoMdClose
                        className="w-5 h-5 text-black cursor-pointer"
                        onClick={() => cartClose(item, i)}
                      />
                    </div>
                  </div>
                </div>
              </>
            );
          })}
        </div>
      )}
    </div>
  );
}
