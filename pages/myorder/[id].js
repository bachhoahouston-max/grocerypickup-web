// import React, { useState, useEffect, useContext } from "react";
// import { useRouter } from "next/router";
// import Carousel from "react-multi-carousel";
// import "react-multi-carousel/lib/styles.css";
// import moment from "moment";
// import {
//   MdLocationOn,
//   MdCalendarToday,
//   MdLocalShipping,
//   MdColorLens,
//   MdProductionQuantityLimits,
// } from "react-icons/md";
// import { FaMoneyBillWave } from "react-icons/fa";
// import { useTranslation } from "react-i18next";
// import { Api } from "@/services/service";
// import { languageContext } from "../_app";
// import Image from "next/image";

// export default function OrderDetails(props) {
//   const router = useRouter();
//   const [productsId, setProductsId] = useState({});
//   const [ordersData, setOrdersData] = useState([]);
//   const [selectedImageList, setSelectedImageList] = useState([]);
//   const { id, productDetailId } = router.query;
//   const [userAddress, setUserAddress] = useState([]);
//   const { lang } = useContext(languageContext)
//   useEffect(() => {
//     if (router.isReady && id) {
//       getProductById(id);
//     }
//   }, [router.isReady, id]);

//   const responsive = {
//     superLargeDesktop: {
//       // the naming can be any, depends on you.
//       breakpoint: { max: 4000, min: 3000 },
//       items: 1,
//     },
//     desktop: {
//       breakpoint: { max: 3000, min: 1024 },
//       items: 1,
//     },
//     tablet: {
//       breakpoint: { max: 1024, min: 464 },
//       items: 2,
//     },
//     mobile: {
//       breakpoint: { max: 464, min: 0 },
//       items: 1,
//     },
//   };

//   const getProductById = async (productId) => {
//     try {
//       props?.loader(true);
//       const res = await Api(
//         "get",
//         `/getProductRequest/${productId}`,
//         "",
//         router
//       );
//       props?.loader(false);
//       setOrdersData(res.data);

//       const d = res.data.productDetail.find(
//         (f) => f._id === router?.query?.product_id
//       );
//       setProductsId(d);
//       setSelectedImageList(d?.image);
//       const address = res.data.shipping_address;

//       setUserAddress(address);
//     } catch (err) {
//       props?.loader(false);
//       props?.toaster({ type: "error", message: err?.message });
//     }
//   };

//   const imageOnError = (event) => {
//     event.currentTarget.src = "/default-product-image.png";
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen py-8">
//       <div className="max-w-6xl mx-auto px-4">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-8 mt-5">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
//             <p className="text-gray-500">
//               {ordersData.orderId || "Order Id Not Defined"}
//             </p>
//           </div>
//           <button
//             onClick={() => router.back()}
//             className="px-4 py-2 bg-custom-green cursor-pointer rounded-lg hover:bg-gray-300 transition-all text-white"
//           >
//             Back to Orders
//           </button>
//         </div>

//         {/* Order Status */}
//         <div className="bg-white rounded-xl shadow-md p-6 mb-8">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
//             <div>
//               <h2 className="text-lg font-semibold flex items-center text-black">
//                 <MdCalendarToday className="mr-2 text-[#F38529]" />
//                 Order Date:{" "}
//                 <span className="font-normal ml-2">
//                   {ordersData.createdAt
//                     ? moment(new Date(ordersData.createdAt)).format(
//                       "DD MMM YYYY"
//                     )
//                     : "-"}
//                 </span>
//               </h2>
//             </div>
//             <div className="mt-4 md:mt-0">
//               <span className="bg-[#F38529] text-white px-4 py-2 rounded-full font-medium">
//                 {ordersData.status || "Processing"}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
//           {/* Product Details */}
//           <div className="md:col-span-3 col-span-1">
//             <div className="bg-white rounded-xl shadow-md overflow-hidden">
//               {/* Product Image Carousel */}
//               <div className="border-b border-gray-100">
//                 <div className="p-4 bg-[#F38529]/5">
//                   <Carousel
//                     responsive={responsive}
//                     autoPlay={false}
//                     infinite={true}
//                     arrows={true}
//                     // showDots={true}
//                     className="product-carousel"
//                   >
//                     {selectedImageList.length > 0 ? (
//                       selectedImageList.map((img, index) => (
//                         <div
//                           key={index}
//                           className="h-60 sm:h-72 md:h-80 lg:h-[22rem] xl:h-[24rem] flex items-center justify-center p-4"
//                         >
//                           <Image
//                             fill
//                             src={img}
//                             alt={`Product image ${index + 1}`}
//                             className="max-h-full object-contain"
//                             onError={(e) =>
//                               (e.target.src = "/default-product-image.png")
//                             }
//                           />
//                         </div>
//                       ))
//                     ) : (
//                       <div className="h-60 sm:h-72 md:h-80 flex items-center justify-center p-4">
//                         <Image
//                           fill
//                           src="/default-product-image.png"
//                           alt="Default product image"
//                           className="max-h-full object-contain"
//                         />
//                       </div>
//                     )}
//                   </Carousel>
//                 </div>
//               </div>

//               {/* Product Info */}
//               <div className="p-4 sm:p-6">
//                 <h2 className="hidden md:block text-2xl font-bold text-gray-800 mb-4">
//                   {lang === "en" ? productsId?.product?.name : productsId?.product?.vietnamiesName}
//                 </h2>
//                 <h2 className="block md:hidden text-xl font-bold text-gray-800 mb-4 truncate">
//                   {productsId?.product?.name}
//                 </h2>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <div className="flex items-center mb-4">
//                       <FaMoneyBillWave className="text-[#F38529] mr-3 text-xl" />
//                       <div>
//                         <p className="text-gray-500 text-sm">Price</p>
//                         <p className="text-xl font-semibold text-gray-600">
//                           ${productsId?.price}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-center mb-4">
//                       <MdProductionQuantityLimits className="text-[#F38529] mr-3 text-xl" />
//                       <div>
//                         <p className="text-gray-500 text-sm">Quantity</p>
//                         <p className="font-bold text-gray-700">
//                           {productsId?.qty}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Order Summary & Shipping */}
//           <div className="md:col-span-2 col-span-1">
//             {/* Shipping Info */}
//             <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
//               <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-100 flex items-center text-gray-600">
//                 <MdLocalShipping className="text-[#F38529] mr-2" /> Shipping
//                 Information
//               </h3>

//               {ordersData?.Local_address?.address ? (
//                 <div className="flex items-start">
//                   <MdLocationOn className="text-[#F38529] text-xl mt-1 mr-3" />
//                   <div>
//                     <p className="font-medium mb-1 text-gray-600">
//                       Delivery Address
//                     </p>
//                     <p className="text-gray-600">
//                       {ordersData?.Local_address?.address}
//                     </p>
//                     {ordersData?.Local_address?.phoneNumber && (
//                       <p className="text-gray-600 mt-2">
//                         {ordersData?.Local_address?.phoneNumber}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               ) : (
//                 <p className="text-gray-500">No shipping address available</p>
//               )}
//             </div>

//             {/* Order Summary */}
//             {/* <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
//               <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-100 text-gray-600">
//                 Order Summary
//               </h3>

//               <div className="space-y-3">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Subtotal</span>
//                   <span className="text-[#F38529]">
//                     ${ordersData?.subtotal || 0}
//                   </span>
//                 </div>
//                  <div className="flex justify-between">
//                   <span className="text-gray-600">Discount</span>
//                   <span className="text-[#F38529]">
//                     ${ordersData?.discount || 0}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Tax</span>
//                   <span className="text-[#F38529]">
//                     ${ordersData?.totalTax || 0}
//                   </span>
//                 </div>

//                 <div className="border-t border-gray-100 pt-3 mt-3">
//                   <div className="text-gray-600 flex justify-between font-semibold text-lg">
//                     <span>Total</span>
//                     <span className="text-[#F38529]">
//                       ${ordersData?.total || 0}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div> */}
//           </div>
//         </div>
//       </div>

//       {/* Custom CSS for carousel buttons */}
//       <style jsx global>{`
//         .product-carousel .react-multiple-carousel__arrow {
//           background-color: #f38529;
//           min-width: 36px;
//           min-height: 36px;
//         }

//         .product-carousel .react-multiple-carousel__arrow:hover {
//           background-color: #e67a20;
//         }

//         .product-carousel .react-multi-carousel-dot button {
//           border-color: #f38529;
//         }

//         .product-carousel .react-multi-carousel-dot--active button {
//           background-color: #f38529;
//         }
//       `}</style>
//     </div>
//   );
// }


import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import moment from "moment";
import {
  MdLocationOn,
  MdCalendarToday,
  MdLocalShipping,
  MdProductionQuantityLimits,
} from "react-icons/md";
import { FaMoneyBillWave, FaGift, FaTag } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Api } from "@/services/service";
import { languageContext } from "../_app";
import Image from "next/image";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getCombo = (productDetail) =>
  productDetail?.combo_id && typeof productDetail.combo_id === "object"
    ? productDetail.combo_id
    : null;

// ─── Free Gift Card ───────────────────────────────────────────────────────────
const FreeGiftCard = ({ fp, lang }) => {
  const { t } = useTranslation();
  const prod = fp?.product;
  const slot = fp?.slot;
  const image = prod?.varients?.[0]?.image?.[0];
  const name = lang === "en"
    ? prod?.name
    : (prod?.vietnamiesName || prod?.name);

  return (
    <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl p-4">
      {/* Image */}
      <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-green-100 bg-white">
        {image ? (
          <Image
            src={image}
            alt={name || "Free gift"}
            fill
            className="object-contain"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-green-100">
            <span className="text-3xl">🎁</span>
          </div>
        )}
        {/* FREE overlay badge on image */}
        <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-[9px] font-black text-center py-0.5">
          FREE
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full mb-1">
          <FaGift className="text-[8px]" /> {t("Free Gift")}
        </span>
        <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
          {name}
        </p>
        {slot && (
          <p className="text-xs text-gray-500 mt-1">
            {slot.value} {slot.unit}
          </p>
        )}
      </div>

      {/* Price */}
      <div className="flex-shrink-0 text-right">
        {slot?.our_price && (
          <p className="text-xs text-gray-400 line-through">
            ${parseFloat(slot.our_price).toFixed(2)}
          </p>
        )}
        <p className="text-sm font-black text-green-700">FREE</p>
      </div>
    </div>
  );
};

// ─── Combo Info Panel ─────────────────────────────────────────────────────────
const ComboInfoPanel = ({ combo, lang }) => {
  const { t } = useTranslation();
  const freeValue = combo.free_product?.reduce(
    (s, fp) => s + parseFloat(fp?.slot?.our_price || 0), 0
  );
  const retailPrice = combo?.main_price_slot?.our_price || 0;
  const savings = (retailPrice + freeValue) - combo.price;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      {/* Green header */}
      <div className="flex items-center gap-2 px-5 py-3 bg-green-700">
        <FaGift className="text-white text-sm" />
        <span className="text-white font-bold text-sm uppercase tracking-wide">
          {t("Combo Deal")}
        </span>
        {savings > 0 && (
          <span className="ml-auto bg-white text-green-700 text-xs font-black px-3 py-1 rounded-full">
            {t("Save")} ${savings.toFixed(2)}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        {/* Promo text */}
        {combo.promo_text && (
          <div className="flex items-start gap-2 mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
            <FaTag className="text-green-600 mt-0.5 flex-shrink-0 text-xs" />
            <p className="text-sm text-green-800 font-medium">{combo.promo_text}</p>
          </div>
        )}

        {/* Price breakdown */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{t("Retail Price")}</span>
            <span className="text-gray-400 line-through">
              ${parseFloat(retailPrice).toFixed(2)}
            </span>
          </div>
          {freeValue > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                🎁 {t("Free item value")} ({combo.free_product?.length})
              </span>
              <span className="text-green-600 font-semibold">
                -${freeValue.toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold">
            <span className="text-gray-700">{t("Combo Price")}</span>
            <span className="text-green-700 text-lg">${parseFloat(combo.price).toFixed(2)}</span>
          </div>
        </div>

        {/* Free gift items */}
        {combo.free_product?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              {t("Included Free Items")}
            </p>
            {combo.free_product.map((fp, idx) => (
              <FreeGiftCard key={idx} fp={fp} lang={lang} />
            ))}
          </div>
        )}

        {/* Combo meta */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-3 text-xs text-gray-500">
          {combo.limit_per_user && (
            <span className="flex items-center gap-1">
              🔒 {t("Limit")}: {combo.limit_per_user} {t("per customer")}
            </span>
          )}
          {combo.accept_coupon && (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              🎟️ {t("Coupon accepted")}
            </span>
          )}
          {combo.endDateTime && (
            <span className="flex items-center gap-1">
              ⏰ {t("Ends")}: {moment(combo.endDateTime).format("MMM D, YYYY")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrderDetails(props) {
  const router = useRouter();
  const [productsId, setProductsId] = useState({});
  const [ordersData, setOrdersData] = useState([]);
  const [selectedImageList, setSelectedImageList] = useState([]);
  const { id } = router.query;
  const { lang } = useContext(languageContext);
  const { t } = useTranslation();

  useEffect(() => {
    if (router.isReady && id) {
      getProductById(id);
    }
  }, [router.isReady, id]);

  const responsive = {
    superLargeDesktop: { breakpoint: { max: 4000, min: 3000 }, items: 1 },
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 1 },
    tablet: { breakpoint: { max: 1024, min: 464 }, items: 1 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
  };

  const getProductById = async (productId) => {
    try {
      props?.loader(true);
      const res = await Api("get", `/getProductRequest/${productId}`, "", router);
      props?.loader(false);
      setOrdersData(res.data);

      const d = res.data.productDetail.find(
        (f) => f._id === router?.query?.product_id
      );
      setProductsId(d);
      setSelectedImageList(d?.image || []);
    } catch (err) {
      props?.loader(false);
      props?.toaster({ type: "error", message: err?.message });
    }
  };

  // ── Derived state ──────────────────────────────────────────────────────────
  const combo = getCombo(productsId);
  const isCombo = !!combo;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* ── Page Header ───────────────────────────────────────────────────── */}
        <div className="flex justify-between items-center mb-8 mt-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t("Order Details")}</h1>
            <p className="text-gray-500">{ordersData.orderId || "Order Id Not Defined"}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-custom-green cursor-pointer rounded-lg hover:bg-green-800 transition-all text-white"
          >
            {t("Back to Orders")}
          </button>
        </div>

        {/* ── Order Status Bar ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{t("Order Date")}</p>
                <p className="font-semibold text-gray-700 flex items-center gap-1">
                  <MdCalendarToday className="text-orange-400" />
                  {ordersData.createdAt
                    ? moment(new Date(ordersData.createdAt)).format("DD MMM YYYY")
                    : "-"}
                </p>
              </div>
              {/* Combo badge on status bar */}
              {isCombo && (
                <span className="flex items-center gap-1.5 bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <FaGift className="text-[10px]" />
                  {t("Combo Deal")}
                </span>
              )}
            </div>
            <span className="bg-orange-400 text-white px-4 py-2 rounded-full font-medium text-sm">
              {ordersData.status || "Processing"}
            </span>
          </div>
        </div>

        {/* ── Main Content ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">

          {/* ── Left: Product Details ─────────────────────────────────────────── */}
          <div className="md:col-span-3 col-span-1">

            {/* ── Combo Deal Panel (only for combo items) ── */}
            {isCombo && <ComboInfoPanel combo={combo} lang={lang} />}

            {/* ── Product Card ── */}
            <div className={`bg-white rounded-xl shadow-md overflow-hidden ${isCombo ? "border-2 border-blue-100" : ""}`}>

              {/* Combo: Main product label */}
              {isCombo && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                    Main Product
                  </span>
                  <span className="text-xs text-blue-500">{t("You bought this as part of a combo")}</span>
                </div>
              )}

              {/* Product Image Carousel */}
              <div className="border-b border-gray-100">
                <div className={`p-4 ${isCombo ? "bg-blue-50/30" : "bg-orange-50/30"}`}>
                  <Carousel
                    responsive={responsive}
                    autoPlay={false}
                    infinite={true}
                    arrows={true}
                    className="product-carousel"
                  >
                    {selectedImageList.length > 0 ? (
                      selectedImageList.map((img, index) => (
                        <div
                          key={index}
                          className="h-60 sm:h-72 md:h-80 lg:h-[22rem] xl:h-[24rem] flex items-center justify-center p-4 relative"
                        >
                          <Image
                            fill
                            src={img}
                            alt={`Product image ${index + 1}`}
                            className="object-contain"
                            onError={(e) => (e.target.src = "/default-product-image.png")}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="h-60 sm:h-72 md:h-80 flex items-center justify-center p-4 relative">
                        <Image
                          fill
                          src="/default-product-image.png"
                          alt="Default product image"
                          className="object-contain"
                        />
                      </div>
                    )}
                  </Carousel>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 sm:p-6">
                {/* Name */}
                <h2 className="hidden md:block text-2xl font-bold text-gray-800 mb-4">
                  {lang === "en"
                    ? productsId?.product?.name
                    : (productsId?.product?.vietnamiesName || productsId?.product?.name)}
                </h2>
                <h2 className="block md:hidden text-xl font-bold text-gray-800 mb-4">
                  {productsId?.product?.name}
                </h2>

                {/* Price + Qty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center mb-4">
                      <FaMoneyBillWave className="text-orange-400 mr-3 text-xl flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-sm">{t("Price")}</p>
                        <div className="flex items-center gap-2">
                          <p className={`text-xl font-semibold ${isCombo ? "text-green-700" : "text-gray-600"}`}>
                            ${parseFloat(productsId?.price || 0).toFixed(2)}
                          </p>
                          {/* Show original price strikethrough for combo */}
                          {isCombo && combo?.main_price_slot?.our_price && (
                            <p className="text-sm text-gray-400 line-through">
                              ${parseFloat(combo.main_price_slot.our_price).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center mb-4">
                      <MdProductionQuantityLimits className="text-orange-400 mr-3 text-xl flex-shrink-0" />
                      <div>
                        <p className="text-gray-500 text-sm">{t("Quantity")}</p>
                        <p className="font-bold text-gray-700">{productsId?.qty}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Shipping ───────────────────────────────────────────────── */}
          <div className="md:col-span-2 col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-100 flex items-center text-gray-600">
                <MdLocalShipping className="text-orange-400 mr-2" />
                {t("Shipping Information")}
              </h3>

              {ordersData?.Local_address?.address ? (
                <div className="flex items-start">
                  <MdLocationOn className="text-orange-400 text-xl mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1 text-gray-600">{t("Delivery Address")}</p>
                    <p className="text-gray-600">{ordersData?.Local_address?.address}</p>
                    {ordersData?.Local_address?.phoneNumber && (
                      <p className="text-gray-600 mt-2">{ordersData?.Local_address?.phoneNumber}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">{t("No shipping address available")}</p>
              )}
            </div>

            {/* ── Order Summary (combo-aware) ─────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-100 text-gray-600">
                {t("Order Summary")}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("Subtotal")}</span>
                  <span className="text-gray-700">${ordersData?.subtotal || "0.00"}</span>
                </div>
                {parseFloat(ordersData?.discount || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("Discount")}</span>
                    <span className="text-green-600">-${ordersData?.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("Tax")}</span>
                  <span className="text-gray-700">${ordersData?.totalTax || "0.00"}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base">
                  <span className="text-gray-700">{t("Total")}</span>
                  <span className="text-orange-500">${ordersData?.total || "0.00"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel styles */}
      <style jsx global>{`
        .product-carousel .react-multiple-carousel__arrow {
          background-color: #f38529;
          min-width: 36px;
          min-height: 36px;
        }
        .product-carousel .react-multiple-carousel__arrow:hover {
          background-color: #e67a20;
        }
        .product-carousel .react-multi-carousel-dot button {
          border-color: #f38529;
        }
        .product-carousel .react-multi-carousel-dot--active button {
          background-color: #f38529;
        }
      `}</style>
    </div>
  );
}
