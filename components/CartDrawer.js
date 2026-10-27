// import Image from "next/image";
// import { IoRemoveSharp, IoAddSharp } from "react-icons/io5";
// import { IoMdClose } from "react-icons/io";
// import { produce } from "immer";
// import { useContext } from "react";
// import { cartContext, languageContext } from "@/pages/_app";
// import constant from "@/services/constant";
// import { useTranslation } from "react-i18next";
// import { useRouter } from "next/router";
// import { Api } from "@/services/service";

// export default function CartDrawer({ pickupOption, toaster, cartClose, loader }) {
//   const { t } = useTranslation();
//   const [cartData, setCartData] = useContext(cartContext);
//   const { lang } = useContext(languageContext);
//   const router = useRouter();

//   const formatPrice = (value) => {
//     const num = Number(value);
//     return isNaN(num) ? "0.00" : num.toFixed(2);
//   };

//   const isAfter12PM = () => {
//     const now = new Date(); // local timezone
//     const hours = now.getHours();
//     const minutes = now.getMinutes();

//     return hours > 12 || (hours === 12 && minutes > 0);
//   };

//   const isAfterNoon = isAfter12PM();

//   const getPickupConfig = (item) => ({
//     ShipmentDelivery: {
//       available: !!item.isShipmentAvailable,
//       yes: t("Product is available for Shipment Delivery"),
//       no: t("Product is Not available for Shipment Delivery"),
//     },
//     driveUp: {
//       available: !!item.isCurbSidePickupAvailable,
//       yes: t("Product is available for CurbSide Pickup"),
//       no: t("Product is Not available for CurbSide Pickup"),
//     },
//     orderPickup: {
//       available: !!item.isInStoreAvailable,
//       yes: t("Product is available for In Store Pickup"),
//       no: t("Product is Not available for In Store Pickup"),
//     },
//     localDelivery: {
//       available: !!item.isNextDayDeliveryAvailable,
//       yes: isAfterNoon
//         ? t("Product is available for Next Day Delivery")
//         : t("Product is available for Same Day Delivery"),
//       no: isAfterNoon
//         ? t("Product is Not available for Next Day Delivery")
//         : t("Product is Not available for Same Day Delivery"),
//     },
//   });

//   const persistCart = (nextState) => {
//     setCartData(nextState);
//     try {
//       localStorage.setItem("addCartDetail", JSON.stringify(nextState));
//     } catch (e) {
//       console.warn("Failed to persist cart:", e);
//     }
//   };
//   const decreaseQty = (index, item) => {
//     if (item.qty > 1) {
//       const nextState = produce(cartData, (draft) => {
//         draft[index].qty -= 1;
//         const price = parseFloat(draft[index]?.price) || 0;
//         draft[index].total = price * draft[index].qty;
//       });
//       persistCart(nextState);
//     }
//   };

//   const handleQuantity = async (items) => {
//     try {
//       loader(true);

//       const res = await Api(
//         "get",
//         `checkQuantity/${items?._id}`,
//         "",
//         router
//       );

//       loader(false);

//       return res.status ? res.data.qty : 0;
//     } catch (err) {
//       loader(false);
//       toaster({ type: "error", message: err?.message });
//       return 0;
//     }
//   };

//   const increaseQty = async (index, item) => {
//     const itemQuantity = await handleQuantity(item);

//     const nextState = produce(cartData, (draft) => {
//       const maxQty = itemQuantity ?? Infinity;

//       if (draft[index].qty + 1 > maxQty) {
//         toaster?.({
//           type: "error",
//           message:
//             "Item is not available in this quantity in stock. Please choose a different item.",
//         });
//         return;
//       }

//       draft[index].qty += 1;
//       const price = parseFloat(draft[index]?.price) || 0;
//       draft[index].total = price * draft[index].qty;
//     });

//     persistCart(nextState);
//   };

//   return (
//     <div className="bg-white w-full md:w-3/5 rounded-[5px]">
//       {cartData && cartData.length > 0 && (
//         <div className="mt-3 space-y-3">
//           {cartData?.map((item, i) => {
//             const pickupConfig = getPickupConfig(item);
//             return (
//               <>
//                 <div
//                   key={i}
//                   className="w-full bg-white rounded-xl shadow-md p-3 "
//                 >
//                   <div className="flex flex-row items-start md:items-center justify-between gap-4">
//                     <div
//                       className="relative w-[80px] h-[80px] md:w-[120px] md:h-[120px] flex-shrink-0 rounded-lg overflow-hidden"
//                       onClick={() =>
//                         router.push(`/product-details/${item?.slug || item?.product?.slug}`)
//                       }
//                     >
//                       <Image
//                         src={
//                           item?.selectedImage ||
//                           item?.image ||
//                           "/placeholder.png"
//                         }
//                         alt={item?.name || "item"}
//                         fill
//                         className="object-contain"
//                         sizes="(max-width: 768px) 80px, 120px"
//                       />
//                     </div>

//                     <div className="flex flex-col flex-1 p-1 min-w-0">
//                       <p className="text-black font-medium md:text-base text-sm ">
//                         {lang === "en" ? item?.name : item?.vietnamiesName}
//                       </p>

//                       <div className="text-sm text-black mt-1 flex gap-3 items-center flex-wrap">
//                         <span className="text-xs md:text-sm">
//                           {item?.price_slot?.value ?? 1}{" "}
//                           {item?.price_slot?.unit ?? "unit"}
//                         </span>
//                         <span className="font-medium">
//                           {constant.currency}
//                           {item?.price}
//                         </span>
//                         {item?.price_slot?.other_price && (
//                           <span className="line-through text-xs">
//                             {constant.currency}
//                             {item?.price_slot?.other_price}
//                           </span>
//                         )}
//                       </div>

//                       <div className="mt-2">
//                         {pickupConfig[pickupOption] && (
//                           <p
//                             className={`${pickupConfig[pickupOption].available
//                               ? "text-green-500"
//                               : "text-red-500"
//                               } text-xs md:text-sm`}
//                           >
//                             {pickupConfig[pickupOption].available
//                               ? pickupConfig[pickupOption].yes
//                               : pickupConfig[pickupOption].no}
//                           </p>
//                         )}
//                       </div>
//                     </div>

//                     <div className="md:flex hidden flex-col items-end md:flex-row md:items-center gap-3 mt-2 md:mt-0">
//                       <div className="flex items-center justify-center bg-custom-green rounded-full px-3 py-1 w-28">
//                         <button onClick={() => decreaseQty(i, item)}>
//                           <IoRemoveSharp className="!text-white text-xl" />
//                         </button>
//                         <span className="mx-4 text-white font-medium text-base">
//                           {item?.qty}
//                         </span>

//                         <button onClick={() => increaseQty(i, item)}>
//                           <IoAddSharp className="!text-white text-xl" />
//                         </button>
//                       </div>

//                       <div className="flex items-center justify-center gap-3 w-30">
//                         <p className="text-black font-semibold text-base">
//                           {constant.currency}
//                           {formatPrice(item?.total)}
//                         </p>
//                         <IoMdClose
//                           className="w-5 h-5 text-black cursor-pointer"
//                           onClick={() => cartClose(item, i)}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                   <div className="md:hidden flex flex-row items-center justify-center gap-3 mt-2 md:mt-0">
//                     <div className="flex items-center justify-center bg-custom-green rounded-full px-3 py-1 w-28">
//                       <button onClick={() => decreaseQty(i, item)}>
//                         <IoRemoveSharp className="!text-white" />
//                       </button>
//                       <span className="mx-4 text-white font-medium text-base">
//                         {item?.qty}
//                       </span>

//                       <button onClick={() => increaseQty(i, item)}>
//                         <IoAddSharp className="!text-white" />
//                       </button>
//                     </div>

//                     <div className="flex items-center justify-center gap-3 w-30">
//                       <p className="text-black font-semibold text-base">
//                         {constant.currency}
//                         {formatPrice(item?.total)}
//                       </p>
//                       <IoMdClose
//                         className="w-5 h-5 text-black cursor-pointer"
//                         onClick={() => cartClose(item, i)}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

import Image from "next/image";
import { IoRemoveSharp, IoAddSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { produce } from "immer";
import Swal from "sweetalert2";
import { useContext, useEffect, useState } from "react";
import { cartContext, languageContext, userContext } from "@/pages/_app";
import constant from "@/services/constant";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { Api } from "@/services/service";
import { getProductReferralCode } from "@/services/affiliateReferral";
import {
  buildRewardCartItem,
  cartLineProductId,
  cartQtyForProduct,
  getAvailableStock,
  rewardLimitError,
} from "@/services/rewardCart";

const isNormalItem = (item) => item?.productSource === "NORMAL";
const isSaleItem = (item) => item?.productSource === "SALE";
const isComboItem = (item) => item?.productSource === "COMBO";
const isRewardItem = (item) => item?.productSource === "REWARD";
const hasStockIssue = (item) =>
  item?.stockStatus === "UNAVAILABLE" ||
  item?.stockStatus === "OUT_OF_STOCK" ||
  item?.stockStatus === "LIMITED";
const hasPriceUpdate = (item) =>
  item?.previousPrice !== undefined &&
  item?.previousPrice !== null &&
  Number(item.previousPrice) !== Number(item?.price);

// ─── Out-of-stock Row (set by the cart's stock check) ─────────────────────────
const StockIssueRow = ({ item, i, lang, cartClose, setLineQty, otherLinesQty, formatPrice }) => {
  const { t } = useTranslation();
  const isLimited = item?.stockStatus === "LIMITED";
  // Most of this line the customer can still keep (stock is shared with other lines)
  const keepableQty = Number(item?.availableQty || 0) - otherLinesQty;

  return (
    <div className="flex flex-row items-center gap-4 py-3 border-b border-red-100 last:border-b-0">
      <CartImage item={item} />
      <div className="flex flex-col flex-1 min-w-0">
        <p className="text-black font-medium md:text-base text-sm">
          {lang === "en" ? item?.name : item?.vietnamiesName || item?.name}
        </p>
        <div className="text-sm text-black mt-1 flex gap-3 items-center flex-wrap">
          <span className="text-xs md:text-sm">
            {item?.qty} {item?.price_slot?.unit ?? "unit"}
          </span>
          <span className="font-medium">
            {isRewardItem(item)
              ? "FREE"
              : `${constant.currency}${formatPrice(item?.price)}`}
          </span>
        </div>
        <span className="mt-1 self-start bg-red-100 text-red-600 text-xs font-medium px-3 py-0.5 rounded-full">
          {item?.productUnavailable || item?.stockStatus === "UNAVAILABLE"
            ? t("Product Unavailable")
            : isLimited
            ? `${t("Available quantity")}: ${item?.availableQty}`
            : t("Out of stock")}
        </span>
        {isLimited && keepableQty >= 1 && (
          <button
            type="button"
            className="mt-2 self-start text-xs font-semibold text-custom-green underline"
            onClick={() => setLineQty(i, keepableQty)}
          >
            {t("Set quantity to")} {keepableQty}
          </button>
        )}
      </div>
      <button
        type="button"
        className="flex items-center gap-1 text-red-600 font-medium text-sm flex-shrink-0"
        onClick={() => cartClose(item, i)}
      >
        <Trash2 size={18} />
        {t("Remove")}
      </button>
    </div>
  );
};

// ─── Reward Cart Row (redeemed with points, always $0) ────────────────────────
const RewardCartRow = ({ item, i, lang, pickupOption, pickupConfig, decreaseQty, increaseQty, cartClose }) => {
  const { t } = useTranslation();
  const totalPoints = (Number(item?.points || 0) * Number(item?.qty || 1)).toLocaleString();

  const stepper = (
    <div className="flex items-center justify-center bg-[#0B4F8A] rounded-full px-3 py-1 w-28">
      <button type="button" aria-label={t("Decrease quantity")} onClick={() => decreaseQty(i, item)}>
        <IoRemoveSharp className="!text-white md:text-xl" />
      </button>
      <span className="mx-4 text-white font-medium text-base">{item?.qty || 1}</span>
      <button type="button" aria-label={t("Increase quantity")} onClick={() => increaseQty(i, item)}>
        <IoAddSharp className="!text-white md:text-xl" />
      </button>
    </div>
  );

  const pointsAndClose = (
    <div className="flex items-center gap-3">
      <p className="text-[#0B4F8A] font-semibold text-base whitespace-nowrap">
        −{totalPoints} {t("pts")}
      </p>
      <IoMdClose
        className="w-5 h-5 text-black cursor-pointer"
        onClick={() => cartClose(item, i)}
      />
    </div>
  );

  return (
    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0B4F8A]">
        <span className="text-white text-xs">🏆</span>
        <span className="text-white text-xs font-bold uppercase tracking-wide">
          {t("Reward")}
        </span>
        <span className="ml-2 text-blue-100 text-xs">
          · {totalPoints} {t("points")}
        </span>
      </div>
      <div className="p-3">
        <div className="flex flex-row items-start md:items-center justify-between gap-4">
          <CartImage item={item} />
          <div className="flex flex-col flex-1 p-1 min-w-0">
            <p className="text-black font-medium md:text-base text-sm">
              {lang === "en" ? item?.name : item?.vietnamiesName || item?.name}
            </p>
            <div className="text-sm text-black mt-1 flex gap-3 items-center flex-wrap">
              <span className="text-xs md:text-sm">
                {item?.price_slot?.value ?? 1} {item?.price_slot?.unit ?? "unit"}
              </span>
              {item?.price_slot?.other_price && (
                <span className="line-through text-xs text-gray-400">
                  {constant.currency}
                  {item.price_slot.other_price}
                </span>
              )}
              <span className="font-black text-green-700 text-xs">FREE</span>
            </div>
            <PickupAvailability pickupConfig={pickupConfig} pickupOption={pickupOption} />
          </div>

          {/* Desktop controls */}
          <div className="hidden md:flex flex-row items-center gap-3 flex-shrink-0">
            {stepper}
            {pointsAndClose}
          </div>
        </div>

        {/* Mobile controls — same placement as CartControls (indented past image) */}
        <div className="md:hidden flex flex-row items-center justify-between gap-3 mt-2 pl-[100px]">
          {stepper}
          {pointsAndClose}
        </div>
      </div>
    </div>
  );
};



const NormalCartRow = ({
  item,
  i,
  lang,
  pickupOption,
  pickupConfig,
  decreaseQty,
  increaseQty,
  cartClose,
  formatPrice,
  saleExpired,
  onRedeemReward,
  rewardPoints,
  referralApplied,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-3">
      <div className="flex flex-row items-start md:items-center justify-between gap-4">
        {/* Image */}
        <CartImage item={item} />

        {/* Info */}
        <div className="flex flex-col flex-1 p-1 min-w-0">
          <p className="text-black font-medium md:text-base text-sm">
            {lang === "en" ? item?.name : item?.vietnamiesName}
          </p>
          <div className="text-sm text-black mt-1 flex gap-3 items-center flex-wrap">
            <span className="text-xs md:text-sm">
              {item?.price_slot?.value ?? 1} {item?.price_slot?.unit ?? "unit"}
            </span>
            <span className="font-medium">
              {constant.currency}
              {item?.price}
            </span>
            {hasPriceUpdate(item) ? (
              <span className="line-through text-xs text-gray-400">
                {constant.currency}
                {item.previousPrice}
              </span>
            ) : (
              item?.price_slot?.other_price &&
              Number(item.price_slot.other_price) !== Number(item?.price) && (
                <span className="line-through text-xs text-gray-400">
                  {constant.currency}
                  {item?.price_slot?.other_price}
                </span>
              )
            )}
            {hasPriceUpdate(item) && !item?.endDateTime && (
              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
                {t("Price updated")}
              </span>
            )}
            {item?.endDateTime &&
              (saleExpired || item.productSource === "NORMAL" ? (
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
                  {t("Sale Ended - Price changed to regular price")}
                </span>
              ) : (
                <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">
                  🔥 SALE
                </span>
              ))}
          </div>
          {referralApplied && (
            <span className="mt-1 self-start bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
              {t("Referral code applied")}
            </span>
          )}
          <PickupAvailability
            pickupConfig={pickupConfig}
            pickupOption={pickupOption}
          />
          {onRedeemReward && (
            <button
              type="button"
              className="mt-2 self-start rounded-full border border-[#F5B82E] bg-[#FFF1C2] px-3 py-1 text-xs font-semibold text-[#6B4300] hover:bg-[#FFE9A3]"
              onClick={() => onRedeemReward(item, i)}
            >
              🎁{" "}
              <span className="font-bold text-[#E87500]">
                {(Number(rewardPoints || 0) * Number(item?.qty || 1)).toLocaleString()} {t("points")}
              </span>{" "}
              · {t("Redeem with points")}
            </button>
          )}
        </div>

        {/* Desktop controls */}
        <CartControls
          item={item}
          i={i}
          decreaseQty={decreaseQty}
          increaseQty={increaseQty}
          cartClose={cartClose}
          formatPrice={formatPrice}
          saleExpired={saleExpired}
          device="desktop"
        />
      </div>

      {/* Mobile controls */}
      <CartControls
        item={item}
        i={i}
        decreaseQty={decreaseQty}
        increaseQty={increaseQty}
        cartClose={cartClose}
        formatPrice={formatPrice}
        saleExpired={saleExpired}
        device="mobile"
      />
    </div>
  );
}

// ─── Combo Cart Row ───────────────────────────────────────────────────────────
const ComboCartRow = ({
  item,
  i,
  lang,
  pickupOption,
  pickupConfig,
  decreaseQty,
  increaseQty,
  cartClose,
  formatPrice,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-white rounded-xl shadow-md overflow-hidden">
      {/* Combo deal banner */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-700">
        <span className="text-white text-xs">🎁</span>
        <span className="text-white text-xs font-bold uppercase tracking-wide">
          {t("Combo Deal")}
        </span>
        {item?.promo_text && (
          <span className="ml-2 text-green-200 text-xs truncate">
            · {item.promo_text}
          </span>
        )}
      </div>

      <div className="p-3">
        {/* ── Main product row ── */}
        <div className="flex flex-row items-start md:items-center justify-between gap-4">
          <CartImage item={item} />

          <div className="flex flex-col flex-1 p-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 flex-shrink-0">
                Main
              </span>
            </div>
            <p className="text-black font-medium md:text-base text-sm mt-1">
              {lang === "en" ? item?.name : item?.vietnamiesName}
            </p>
            <div className="text-sm text-black mt-1 flex gap-3 items-center flex-wrap">
              <span className="text-xs md:text-sm">
                {item?.price_slot?.value ?? 1}{" "}
                {item?.price_slot?.unit ?? "unit"}
              </span>
              <span className="font-semibold text-green-700">
                {constant.currency}
                {formatPrice(item?.price)}
              </span>
              {/* Show original price if we have it */}
              {item?.main_price_slot?.our_price &&
                item.main_price_slot.our_price !== item.price && (
                  <span className="line-through text-xs text-gray-400">
                    {constant.currency}
                    {item.main_price_slot.our_price}
                  </span>
                )}
            </div>
            <PickupAvailability
              pickupConfig={pickupConfig}
              pickupOption={pickupOption}
            />
          </div>

          {/* Desktop controls */}
          <CartControls
            item={item}
            i={i}
            decreaseQty={decreaseQty}
            increaseQty={increaseQty}
            cartClose={cartClose}
            formatPrice={formatPrice}
            device="desktop"
          />
        </div>

        {/* Mobile controls */}
        <CartControls
          item={item}
          i={i}
          decreaseQty={decreaseQty}
          increaseQty={increaseQty}
          cartClose={cartClose}
          formatPrice={formatPrice}
          device="mobile"
        />

        {/* ── Free product row ── */}
        <FreeGiftRow item={item} lang={lang} t={t} />
      </div>
    </div>
  );
};

// ─── Free Gift Row (shown inside combo card) ──────────────────────────────────
const FreeGiftRow = ({ item, lang, t }) => {
  const router = useRouter();

  const freeProducts = item?.free_product || item?.combo_id?.free_product || [];

  if (!freeProducts.length) {
    return (
      <div className="mt-2 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
        <div className="w-12 h-12 rounded-md border border-green-200 bg-green-100 flex items-center justify-center flex-shrink-0">
          <span className="text-xl">🎁</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
            🎁 FREE
          </span>
          <p className="text-xs text-gray-600 mt-1 truncate">
            {item?.promo_text || t("Free gift included")}
          </p>
        </div>
        <p className="text-xs font-black text-green-700 flex-shrink-0">FREE</p>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-1.5">
      {freeProducts.map((fp, idx) => {
        const prod = fp?.product;
        const slot = fp?.slot;
        const image = prod?.varients?.[0]?.image?.[0];
        const name =
          lang === "en" ? prod?.name : prod?.vietnamiesName || prod?.name;

        return (
          <div
            key={idx}
            className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2"
          >
            {/* Image */}
            <div
              className="flex-shrink-0 w-12 h-12 rounded-md border border-green-100 bg-white overflow-hidden cursor-pointer "
              onClick={() => router.push(`/product-details/${prod.slug}`)}
            >
              {image ? (
                <Image
                  width={48}
                  height={48}
                  src={image}
                  alt={name || "Free item"}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-green-100">
                  <span className="text-xl">🎁</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                🎁 FREE
              </span>
              <p className="text-xs text-gray-700 font-medium mt-0.5 truncate">
                {name}
              </p>
              {slot && (
                <p className="text-[10px] text-gray-400">
                  {slot.value} {slot.unit}
                </p>
              )}
            </div>

            <div className="text-right flex-shrink-0">
              {slot?.our_price && (
                <p className="text-[10px] text-gray-400 line-through">
                  {constant.currency}
                  {parseFloat(slot.our_price).toFixed(2)}
                </p>
              )}
              <p className="text-xs font-black text-green-700">FREE</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Shared sub-components ────────────────────────────────────────────────────
const CartImage = ({ item }) => {
  const router = useRouter();
  let slug = item?.slug || item?.product?.slug;
  // if(item. productSource === 'COMBO'){
  //   slug = item.main_product.
  // }

  return (
    <div
      className="relative w-[80px] h-[80px] md:w-[120px] md:h-[120px] flex-shrink-0 rounded-lg overflow-hidden cursor-pointer"
      onClick={() => router.push(`/product-details/${slug}`)}
    >
      <Image
        src={item?.selectedImage || item?.image || "/placeholder.png"}
        alt={item?.name || "item"}
        fill
        className="object-contain"
        sizes="(max-width: 768px) 80px, 120px"
      />
    </div>
  );
};

const PickupAvailability = ({ pickupConfig, pickupOption }) => {
  if (!pickupConfig?.[pickupOption]) return null;
  const cfg = pickupConfig[pickupOption];
  return (
    <div className="mt-2">
      <p
        className={`${cfg.available ? "text-green-500" : "text-red-500"} text-xs md:text-sm`}
      >
        {cfg.available ? cfg.yes : cfg.no}
      </p>
    </div>
  );
};

const CartControls = ({
  item,
  i,
  decreaseQty,
  increaseQty,
  cartClose,
  formatPrice,
  device,
  saleExpired,
}) => {
  const isDesktop = device === "desktop";

  return (
    // Mobile: indent past the 80px image + gap-4 + p-1 so controls line up with the item text
    <div
      className={`${isDesktop ? "md:flex hidden flex-col md:flex-row justify-center" : "md:hidden flex pl-[100px] justify-between"} flex-row items-center gap-3 mt-2 md:mt-0`}
    >
      <div className="flex items-center justify-center bg-custom-green rounded-full px-3 py-1 w-28">
        <button onClick={() => decreaseQty(i, item)}>
          <IoRemoveSharp
            className={`!text-white ${isDesktop ? "text-xl" : ""}`}
          />
        </button>
        <span className="mx-4 text-white font-medium text-base">
          {item?.qty}
        </span>
        <button onClick={() => increaseQty(i, item)}>
          <IoAddSharp className={`!text-white ${isDesktop ? "text-xl" : ""}`} />
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
  );
};

export default function CartDrawer({
  pickupOption,
  toaster,
  cartClose,
  removeOutOfStock,
  loader,
  appliedReferralCode,
}) {
  const { t } = useTranslation();
  const [cartData, setCartData] = useContext(cartContext);
  const { lang } = useContext(languageContext);
  const [user] = useContext(userContext);
  const [rewardCatalog, setRewardCatalog] = useState([]);
  const [data, setData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (!user?._id || !user?.token) {
      setRewardCatalog([]);
      return;
    }

    Api("get", "rewards/catalog", "", router)
      .then((res) => setRewardCatalog(Array.isArray(res?.data) ? res.data : []))
      .catch((err) => toaster?.({ type: "error", message: err?.message }));
  }, [router, user?._id, user?.token]);

  const formatPrice = (value) => {
    const num = Number(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const isAfter12PM = () => {
    const now = new Date();
    return (
      now.getHours() > 12 || (now.getHours() === 12 && now.getMinutes() > 0)
    );
  };

  const isAfterNoon = isAfter12PM();
  const isSaleExpired = (item) => {
    const now = new Date();

    return item?.endDateTime && new Date(item.endDateTime) < now;
  };

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

  // Used by the out-of-stock panel to drop a line to what's in stock
  const setLineQty = (index, qty) => {
    const nextState = produce(cartData, (draft) => {
      draft[index].qty = qty;
      draft[index].total = (parseFloat(draft[index]?.price) || 0) * qty;
      draft[index].stockStatus = "AVAILABLE";
    });
    persistCart(nextState);
  };

  const handleQuantity = async (items) => {
    try {
      loader(true);
      const res = await Api("get", `checkQuantity/${items}`, "", router);
      loader(false);
      return res.status ? res.data.qty : 0;
    } catch (err) {
      loader(false);
      toaster({ type: "error", message: err?.message });
      return 0;
    }
  };

  const increaseQty = async (index, item) => {
    // Reward lines carry a reward_<id> cart id; stock is checked on the real product
    const productId = cartLineProductId(item);
    const itemQuantity = await handleQuantity(productId);

    if (isRewardItem(item)) {
      try {
        loader(true);
        const res = await Api("get", "rewards/summary", "", router);
        const limitError = rewardLimitError(
          { ...item, qtyInCart: item.qty },
          res?.data,
          cartData,
          t,
        );
        if (limitError) {
          toaster?.({ type: "error", message: limitError });
          return;
        }
      } catch (err) {
        toaster?.({ type: "error", message: err?.message });
        return;
      } finally {
        loader(false);
      }
    }

    let itemFreeQuantity = 0;
    if (item.productSource === "COMBO") {
      itemFreeQuantity = await handleQuantity(item.free_product[0].product._id);
    }

    const nextState = produce(cartData, (draft) => {
      const maxQty = itemQuantity ?? Infinity;

      // Count every line of this product (e.g. bought + redeemed as a reward)
      if (cartQtyForProduct(draft, productId) + 1 > maxQty) {
        toaster?.({
          type: "error",
          message:
            "Item is not available in this quantity in stock. Please choose a different item.",
        });
        return;
      }
      if (item.productSource === "COMBO") {
        const maxFreeQty = itemFreeQuantity ?? Infinity;
        if (draft[index].qty + 1 > maxFreeQty) {
          toaster?.({
            type: "error",
            message:
              "Free Item is not available in this quantity in stock. Please choose a different item.",
          });
          return;
        }
      }
      draft[index].qty += 1;
      const price = parseFloat(draft[index]?.price) || 0;
      draft[index].total = price * draft[index].qty;
    });
    persistCart(nextState);
  };

  const redeemReward = async (item, index) => {
    const productId = item?.id || item?._id;
    const reward = rewardCatalog.find(
      (candidate) => String(candidate?.product?._id) === String(productId),
    );

    if (!reward) return;
    const { isConfirmed } = await Swal.fire({
      text: `${t("Redeem this item for")} ${Number(reward.points).toLocaleString()} ${t("points")}?`,
      showCancelButton: true,
      confirmButtonText: t("Yes"),
      cancelButtonText: t("No"),
      confirmButtonColor: "#2e7d32",
      cancelButtonColor: "#2e7d32",
      customClass: {
        confirmButton: "px-12 rounded-xl",
        cancelButton:
          "px-12 py-2 rounded-lg text-white border-[12px] border-custom-green hover:none",
        text: "text-[20px] text-black",
        actions: "swal2-actions-no-hover",
        popup: "rounded-[15px] shadow-custom-green",
      },
      buttonsStyling: true,
      reverseButtons: true,
      width: "320px",
    });
    if (!isConfirmed) return;

    try {
      loader(true);
      const [summaryResponse, stock] = await Promise.all([
        Api("get", "rewards/summary", "", router),
        getAvailableStock(productId, router),
      ]);
      const limitError = rewardLimitError(
        { ...reward, qtyInCart: 0 },
        summaryResponse?.data,
        cartData,
        t,
      );

      if (stock < 1) {
        toaster?.({ type: "error", message: t("This item is currently out of stock.") });
        return;
      }
      if (limitError) {
        toaster?.({ type: "error", message: limitError });
        return;
      }

      const nextState = produce(cartData, (draft) => {
        const current = draft[index];
        if (Number(current?.qty || 1) > 1) {
          current.qty -= 1;
          current.total = (Number(current.price) || 0) * current.qty;
          draft.push(buildRewardCartItem(reward));
        } else {
          draft[index] = buildRewardCartItem(reward);
        }
      });
      persistCart(nextState);
      toaster?.({ type: "success", message: t("Reward added to cart") });
    } catch (err) {
      toaster?.({
        type: "error",
        message: err?.message || t("Unable to redeem this reward."),
      });
    } finally {
      loader(false);
    }
  };

  const stockIssueLines = (cartData || [])
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => hasStockIssue(item));

  return (
    <div className="bg-white w-full md:w-3/5 rounded-[5px]">
      {stockIssueLines.length > 0 && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
            <p className="flex-1 min-w-0 text-red-600 font-bold text-lg">
              {stockIssueLines.some(
                ({ item }) =>
                  item?.productUnavailable || item?.stockStatus === "UNAVAILABLE",
              )
                ? t("Product Unavailable")
                : t("Out of Stock")}{" "}
              ({stockIssueLines.length})
            </p>
            {removeOutOfStock && (
              <button
                type="button"
                className="flex items-center gap-1 flex-shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                onClick={removeOutOfStock}
              >
                <Trash2 size={16} />
                {t("Remove all")}
              </button>
            )}
          </div>
          <p className="mt-1 text-gray-700 text-sm">
            {t("These items are unavailable. Remove them to continue.")}
          </p>
          <div className="mt-2 bg-white rounded-lg px-3">
            {stockIssueLines.map(({ item, i }) => (
              <StockIssueRow
                key={i}
                item={item}
                i={i}
                lang={lang}
                cartClose={cartClose}
                setLineQty={setLineQty}
                otherLinesQty={
                  cartQtyForProduct(cartData, cartLineProductId(item)) -
                  Number(item?.qty || 0)
                }
                formatPrice={formatPrice}
              />
            ))}
          </div>
        </div>
      )}

      {stockIssueLines.length > 0 && stockIssueLines.length < cartData.length && (
        <div className="mt-4 flex items-center gap-2">
          <CheckCircle2 className="text-custom-green" size={24} />
          <p className="text-custom-green font-bold text-lg">
            {t("Available Items")}
          </p>
        </div>
      )}

      {cartData && cartData.length > 0 && (
        <div className="mt-3 space-y-3">
          {cartData.map((item, i) => {
            if (hasStockIssue(item)) return null;
            const pickupConfig = getPickupConfig(item);
            const saleExpired = isSaleExpired(item);

            const sharedProps = {
              item,
              i,
              lang,
              pickupOption,
              pickupConfig,
              decreaseQty,
              increaseQty,
              cartClose,
              formatPrice,
              saleExpired,
            };

            const hasRewardOffer = rewardCatalog.some(
              (reward) =>
                String(reward?.product?._id) ===
                String(item?.id || item?._id),
            );
            const reward = hasRewardOffer
              ? rewardCatalog.find(
                (candidate) =>
                  String(candidate?.product?._id) ===
                  String(item?.id || item?._id),
              )
              : null;

            if (!isRewardItem(item) && !isComboItem(item) && hasRewardOffer) {
              sharedProps.onRedeemReward = redeemReward;
              sharedProps.rewardPoints = reward?.points;
            }

            if (isComboItem(item)) {
              return <ComboCartRow key={i} {...sharedProps} />;
            }

            if (isRewardItem(item)) {
              return <RewardCartRow key={i} {...sharedProps} />;
            }

            return (
              <NormalCartRow
                key={i}
                {...sharedProps}
                referralApplied={
                  !!appliedReferralCode ||
                  !!(item?.referralCode || getProductReferralCode(item?.slug))
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
