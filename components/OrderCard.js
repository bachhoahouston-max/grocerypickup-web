"use client";

import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { MdFileDownload } from "react-icons/md";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import Barcode from "react-barcode";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * New data shape:
 *   booking.combo_id  → just a string ID (or absent)
 *   productDetail[n].combo_id → full combo object (if that product is part of a combo)
 *
 * A booking is a "combo order" if ANY productDetail item has a combo_id object.
 * Individual products are identified as main vs free using combo_id.main_product.
 */
const getProductCombo = (product) =>
  product?.combo_id && typeof product.combo_id === "object"
    ? product.combo_id
    : null;

const isComboOrder = (booking) =>
  booking?.productDetail?.some((p) => !!getProductCombo(p));

const isMainProduct = (product) => {
  const combo = getProductCombo(product);
  if (!combo) return false;
  return product?.product?._id === combo?.main_product;
};

const isFreeProduct = (product) => {
  const combo = getProductCombo(product);
  if (!combo) return false;
  return product?.product?._id !== combo?.main_product;
};

const StatusBadge = ({ booking }) => {
  const { t } = useTranslation();
  const map = {
    Completed: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: t("Order Delivered"),
    },
    Pending: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      label: booking?.isReady ? t("Order Ready") : t("Order Preparing"),
    },
    "Return Requested": {
      bg: "bg-blue-100",
      text: "text-blue-700",
      label: t("Order Return Requested"),
    },
    Return: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      label: t("Order Returned"),
    },
    Cancel: {
      bg: "bg-red-100",
      text: "text-red-700",
      label: t("Order Cancelled"),
    },
    Shipped: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: t("Order Shipped"),
    },
    Preparing: {
      bg: "bg-green-100",
      text: "text-green-500",
      label: booking?.isReady ? t("Order Ready") : t("Order Preparing"),
    },
    Driverassigned: {
      bg: "bg-green-100",
      text: "text-green-500",
      label: t("Driver Assigned"),
    },
    "Out for Delivery": {
      bg: "bg-green-100",
      text: "text-green-700",
      label: t("Out for Delivery"),
    },
  };
  const b = map[booking?.status];
  if (!b) return null;
  return (
    <span
      className={`px-3 py-1.5 ${b.bg} ${b.text} rounded-full text-xs font-medium whitespace-nowrap`}
    >
      {b.label}
    </span>
  );
};

const DeliveryTypeLabel = ({ booking }) => {
  const { t } = useTranslation();
  if (booking?.isShipmentDelivery)
    return (
      <p className="text-gray-700 font-medium text-sm">
        {t("Shipment Delivery")}
      </p>
    );
  if (booking?.isLocalDelivery)
    return (
      <p className="text-gray-700 font-medium text-sm">{t("Local Delivery")}</p>
    );
  if (booking?.isDriveUp)
    return (
      <p className="text-gray-700 font-medium text-sm">
        {t("Curbside Pickup")}
      </p>
    );
  if (booking?.isOrderPickup)
    return (
      <p className="text-gray-700 font-medium text-sm">
        {t("In-store Pickup")}
      </p>
    );
  return <p className="text-gray-500 italic text-sm">Not Found</p>;
};

// ─── Combo Group Banner (per combo_id group) ──────────────────────────────────
const ComboBanner = ({ combo }) => {
  const { t } = useTranslation();
  if (!combo) return null;
  const savings = combo.free_product?.reduce(
    (s, fp) => s + (fp?.slot?.our_price || 0),
    0,
  );
  return (
    <div className="rounded-xl overflow-hidden border border-green-200 mb-1">
      {/* Green title bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-green-700">
        <span className="text-white text-xs">🎁</span>
        <span className="text-white text-xs font-bold uppercase tracking-wide">
          {t("Combo Deal Applied")}
        </span>
        {savings > 0 && (
          <span className="ml-auto bg-white text-green-700 text-xs font-black px-2 py-0.5 rounded-full">
            Save ${savings.toFixed(2)}
          </span>
        )}
      </div>
      {/* Promo text */}
      <div className="px-3 py-2 bg-green-50">
        <p className="text-green-800 text-xs font-semibold">
          {combo.promo_text}
        </p>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {combo.free_product?.map((fp, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200"
            >
              🎁 FREE · {fp.slot?.unit}
              <span className="font-normal text-green-500">
                (${fp.slot?.our_price?.toFixed(2)} value)
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Product Row — Normal ─────────────────────────────────────────────────────
const NormalProductRow = ({
  product,
  index,
  total,
  booking,
  lang,
  router,
  t,
  setProductId,
  setSelectedProduct,
  setShowReviews,
}) => (
  <div
    className={`flex items-center p-2 hover:bg-gray-50 cursor-pointer ${index !== total - 1 ? "border-b border-gray-200" : ""
      }`}
    onClick={() =>
      router.push(`/myorder/${booking._id}?product_id=${product._id}`)
    }
  >
    <div className="flex-shrink-0">
      <Image
        width={100}
        height={100}
        className="w-20 h-20 rounded-md object-contain border border-gray-200 bg-white"
        src={product.image?.[0] || "/api/placeholder/100/100"}
        alt={product.product?.name || "Product"}
      />
    </div>
    <div className="ml-4 flex-grow">
      <p className="text-gray-800 font-medium text-sm">
        {(() => {
          const text =
            lang === "en"
              ? product.product?.name
              : product.product?.vietnamiesName;
          return text?.length > 95 ? text.slice(0, 95) + "..." : text;
        })()}
      </p>
      <p className="text-sm text-gray-500 mt-1">{`Qty: ${product.qty || 1}`}</p>
    </div>
    <div className="flex flex-col items-end gap-1 pr-1 mt-4">
      <p className="text-sm font-bold text-gray-800">
        ${parseFloat(product.price || 0).toFixed(2)}
      </p>

      {booking?.status === "Completed" && (
        <button
          className="bg-custom-green text-white px-3 py-1.5 rounded-md text-xs font-medium hover:shadow-md transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setProductId(product?.product?._id);
            setSelectedProduct(product);
            setShowReviews(true);
          }}
        >
          {t("Review")}
        </button>
      )}
    </div>
  </div>
);

// ─── Product Row — Combo (Main product) ───────────────────────────────────────
const MainProductRow = ({
  product,
  index,
  total,
  booking,
  lang,
  router,
  setProductId,
  setSelectedProduct,
  setShowReviews,
  t,
}) => (
  <div
    className={`flex items-center p-2 hover:bg-blue-50 cursor-pointer relative bg-blue-50/40 ${index !== total - 1 ? "border-b border-gray-200" : ""
      }`}
    onClick={() =>
      router.push(`/myorder/${booking._id}?product_id=${product._id}`)
    }
  >
    {/* Badge */}
    <span className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
      Main
    </span>

    <div className="flex-shrink-0">
      <Image
        width={100}
        height={100}
        className="w-20 h-20 rounded-md object-contain border border-gray-200 bg-white"
        src={product.image?.[0] || "/api/placeholder/100/100"}
        alt={product.product?.name || "Product"}
      />
    </div>
    <div className="ml-4 flex-grow pr-10">
      <p className="text-gray-800 font-medium text-sm">
        {(() => {
          const text =
            lang === "en"
              ? product.product?.name
              : product.product?.vietnamiesName;
          return text?.length > 95 ? text.slice(0, 95) + "..." : text;
        })()}
      </p>
      <p className="text-sm text-gray-500 mt-1">{`Qty: ${product.qty || 1}`}</p>
    </div>
    <div className="flex flex-col items-end gap-1 pr-1 mt-4">
      <p className="text-sm font-bold text-gray-800">
        ${parseFloat(product.price || 0).toFixed(2)}
      </p>
      {booking?.status === "Completed" && (
        <button
          className="bg-custom-green text-white px-3 py-1.5 rounded-md text-xs font-medium hover:shadow-md transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setProductId(product?.product?._id);
            setSelectedProduct(product);
            setShowReviews(true);
          }}
        >
          {t("Review")}
        </button>
      )}
    </div>
  </div>
);

// ─── Product Row — Combo (Free product) ──────────────────────────────────────
const FreeProductRow = ({ product, index, total, booking, lang, router }) => (
  <div
    className={`flex items-center p-2 hover:bg-green-50 cursor-pointer relative bg-green-50/40 ${index !== total - 1 ? "border-b border-gray-200" : ""
      }`}
    onClick={() =>
      router.push(`/myorder/${booking._id}?product_id=${product._id}`)
    }
  >
    {/* Badge */}
    <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
      🎁 FREE
    </span>

    <div className="flex-shrink-0">
      <Image
        width={100}
        height={100}
        className="w-20 h-20 rounded-md object-contain border border-gray-200 bg-white"
        src={product.image?.[0] || "/api/placeholder/100/100"}
        alt={product.product?.name || "Product"}
      />
    </div>
    <div className="ml-4 flex-grow pr-10">
      <p className="text-gray-800 font-medium text-sm">
        {(() => {
          const text =
            lang === "en"
              ? product.product?.name
              : product.product?.vietnamiesName;
          return text?.length > 95 ? text.slice(0, 95) + "..." : text;
        })()}
      </p>
      <p className="text-sm text-gray-500 mt-1">{`Qty: ${product.qty || 1}`}</p>
    </div>
    <div className="text-right flex-shrink-0 pr-1">
      <p className="text-xs text-gray-400 line-through">
        ${parseFloat(product.price || 0).toFixed(2)}
      </p>
      <span className="text-xs font-black text-green-700">FREE</span>
    </div>
  </div>
);

// ─── Combo Price Summary ──────────────────────────────────────────────────────
const ComboPriceSummary = ({ booking }) => {
  const { t } = useTranslation();

  // Separate normal vs combo products
  const normalProducts = booking.productDetail.filter(
    (p) => !getProductCombo(p),
  );
  const comboProducts = booking.productDetail.filter((p) => getProductCombo(p));

  // Collect unique combo objects
  const combos = [];
  const seen = new Set();
  comboProducts.forEach((p) => {
    const combo = getProductCombo(p);
    if (combo && !seen.has(combo._id)) {
      seen.add(combo._id);
      combos.push(combo);
    }
  });

  if (!combos.length) return null;

  const normalSubtotal = normalProducts.reduce(
    (s, p) => s + parseFloat(p.price || 0),
    0,
  );
  const comboRetail = comboProducts.reduce(
    (s, p) => s + parseFloat(p.price || 0),
    0,
  );
  const freeRetail = combos.reduce(
    (s, c) =>
      s +
      c.free_product.reduce(
        (fs, fp) => fs + parseFloat(fp.slot?.our_price || 0),
        0,
      ),
    0,
  );
  const comboPrice = combos.reduce((s, c) => s + parseFloat(c.price || 0), 0);
  const savings = comboRetail + freeRetail - comboPrice;

  return (
    <div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 space-y-1.5">
      <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">
        {t("Order Summary")}
      </p>

      {/* Normal items subtotal (only shown in mixed orders) */}
      {normalProducts.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {t("Items")} ({normalProducts.length})
          </span>
          <span className="text-gray-700 font-medium">
            ${normalSubtotal.toFixed(2)}
          </span>
        </div>
      )}

      {/* Combo section */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{t("Combo retail value")}</span>
        <span className="text-gray-400 line-through">
          ${(comboRetail + freeRetail).toFixed(2)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 flex items-center gap-1">
          🎁 {t("Free items value")}
        </span>
        <span className="text-green-600 font-semibold">
          -${freeRetail.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{t("Combo savings")}</span>
        <span className="text-green-700 font-semibold">
          -${savings.toFixed(2)}
        </span>
      </div>

      <div className="border-t border-green-200 pt-2 space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">{t("Combo price")}</span>
          <span className="font-bold text-green-700">
            ${comboPrice.toFixed(2)}
          </span>
        </div>
        {normalProducts.length > 0 && (
          <div className="flex items-center justify-between text-sm font-bold text-gray-800 pt-1 border-t border-green-200">
            <span>{t("Order Total")}</span>
            <span>${(normalSubtotal + comboPrice).toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const FreeItemRow = ({ fp, lang, isLast }) => {
  const { t } = useTranslation();
  const product = fp?.product;
  const slot = fp?.slot;
  const image = product?.varients?.[0]?.image?.[0];
  const name =
    lang === "en" ? product?.name : product?.vietnamiesName || product?.name;

  return (
    <div
      className={`flex items-center p-2 relative bg-green-50/50 ${!isLast ? "border-b border-gray-200" : ""}`}
    >
      <span className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
        🎁 FREE
      </span>

      <div className="flex-shrink-0">
        {image ? (
          <Image
            width={100}
            height={100}
            className="w-20 h-20 rounded-md object-contain border border-green-100 bg-white"
            src={image}
            alt={name || "Free product"}
          />
        ) : (
          <div className="w-20 h-20 rounded-md border border-green-200 bg-green-100 flex items-center justify-center">
            <span className="text-3xl">🎁</span>
          </div>
        )}
      </div>

      <div className="ml-4 flex-grow pr-14">
        <p className="text-gray-800 font-medium text-sm leading-snug">
          {name?.length > 95 ? name.slice(0, 95) + "..." : name}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {t("Qty")}: {slot?.value || 1} · {slot?.unit}
        </p>
        <span className="inline-block mt-1 text-[10px] font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
          {t("Free Gift")}
        </span>
      </div>

      <div className="text-right flex-shrink-0 pr-1">
        <p className="text-xs text-gray-400 line-through">
          ${parseFloat(slot?.our_price || 0).toFixed(2)}
        </p>
        <p className="text-xs font-black text-green-700">FREE</p>
      </div>
    </div>
  );
};

// ─── Product List ──────────────────────────────────────────────────────────────
// Handles 3 cases:
//   1. All normal items
//   2. All combo items
//   3. Mixed — normal + combo in same order
//
// productDetail item has combo_id as object  → it's a combo product (main product)
// productDetail item has no combo_id object  → it's a normal product
// Free items are NOT in productDetail — they come from combo_id.free_product[]
//   and are injected as virtual rows right after their main product row

const ProductList = ({
  booking,
  lang,
  router,
  t,
  setProductId,
  setSelectedProduct,
  setShowReviews,
}) => {
  const products = booking.productDetail;

  // Split into normal and combo buckets
  const normalProducts = products.filter((p) => !getProductCombo(p));
  const comboProducts = products.filter((p) => getProductCombo(p));
  const isMixedOrder = normalProducts.length > 0 && comboProducts.length > 0;

  const rendered = [];
  const seenBanners = new Set(); // combo banners shown once per combo._id
  const seenFreeItems = new Set(); // free item rows injected once per combo._id

  if (normalProducts.length > 0) {
    // Section divider — only shown in mixed orders
    if (isMixedOrder) {
      rendered.push(
        <div
          key="divider-normal"
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border-b border-gray-200"
        >
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            Regular Items
          </span>
          <span className="ml-auto text-xs text-gray-400">
            {normalProducts.length} item{normalProducts.length > 1 ? "s" : ""}
          </span>
        </div>,
      );
    }

    normalProducts.forEach((product, idx) => {
      rendered.push(
        <NormalProductRow
          key={product._id || `normal-${idx}`}
          product={product}
          index={idx}
          total={normalProducts.length}
          booking={booking}
          lang={lang}
          router={router}
          t={t}
          setProductId={setProductId}
          setSelectedProduct={setSelectedProduct}
          setShowReviews={setShowReviews}
        />,
      );
    });
  }

  // ── Section 2: Combo items ──────────────────────────────────────────────────
  if (comboProducts.length > 0) {
    // Section divider — only shown in mixed orders
    if (isMixedOrder) {
      rendered.push(
        <div
          key="divider-combo"
          className="flex items-center gap-2 px-3 py-1.5 bg-green-700 border-b border-green-600"
        >
          <span className="text-xs font-bold text-white uppercase tracking-wide">
            🎁 Combo Deal
          </span>
          <span className="ml-auto text-xs text-green-200">
            {comboProducts.length} item{comboProducts.length > 1 ? "s" : ""} +
            free gift{comboProducts.length > 1 ? "s" : ""}
          </span>
        </div>,
      );
    }

    comboProducts.forEach((product, idx) => {
      const combo = getProductCombo(product);

      // Combo promo banner — once per unique combo group
      if (combo && !seenBanners.has(combo._id)) {
        seenBanners.add(combo._id);
        rendered.push(
          <div key={`banner-${combo._id}`} className="px-2 pt-2 bg-white">
            <ComboBanner combo={combo} />
          </div>,
        );
      }

      // Main product row (blue tint)
      rendered.push(
        <MainProductRow
          key={product._id || `combo-main-${idx}`}
          product={product}
          index={idx}
          total={comboProducts.length}
          booking={booking}
          lang={lang}
          router={router}
          t={t}
          setProductId={setProductId}
          setSelectedProduct={setSelectedProduct}
          setShowReviews={setShowReviews}
        />,
      );

      // Free item rows — injected right after their main product, once per combo group
      if (combo && !seenFreeItems.has(combo._id)) {
        seenFreeItems.add(combo._id);
        const freeList = combo.free_product || [];
        freeList.forEach((fp, fpIdx) => {
          rendered.push(
            <FreeItemRow
              key={`free-${combo._id}-${fpIdx}`}
              fp={fp}
              lang={lang}
              isLast={fpIdx === freeList.length - 1}
            />,
          );
        });
      }
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      {rendered}
    </div>
  );
};

const OrderCard = ({
  booking,
  index,
  lang,
  expandedBookingId,
  toggleBooking,
  GeneratePDF,
  cancelOrder,
  ReturnOrder,
  isWithin24Hours,
  formatDate,
  formatDate2,
  toggleModal,
  getSecrectCode,
  isOpen,
  carBrand,
  setCarBrand,
  carColor,
  setCarColor,
  parkingNo,
  setParkingNo,
  handleSubmit,
  onClose,
  setProductId,
  setSelectedProduct,
  setShowReviews,
}) => {
  const router = useRouter();
  const { t } = useTranslation();

  const hasCombo = isComboOrder(booking);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:border-gray-300 transition-all mb-2 p-1">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className={`p-3 md:p-4 rounded-t-lg ${hasCombo ? "bg-green-50" : "bg-gray-50"}`}
      >
        <div className="space-y-3 md:space-y-0">
          {/* Mobile header */}
          <div className="block md:hidden space-y-3">
            <div className="flex justify-between items-center">
              <div
                className={`text-white rounded-full h-8 w-8 flex items-center justify-center font-semibold text-sm flex-shrink-0 ${hasCombo ? "bg-green-700" : "bg-[#2E7D32]"}`}
              >
                {index + 1}
              </div>
              <div className="flex items-center gap-1">
                <StatusBadge booking={booking} />
                <MdFileDownload
                  className="text-xl text-black cursor-pointer"
                  onClick={() => GeneratePDF(booking._id, booking.orderId)}
                />
                <button
                  onClick={() => toggleBooking(booking._id)}
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  {expandedBookingId === booking._id ? (
                    <IoIosArrowUp className="text-lg cursor-pointer text-gray-600" />
                  ) : (
                    <IoIosArrowDown className="text-lg cursor-pointer text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-0.5">
              <h3 className="text-sm font-medium text-gray-800">
                {t("My Order")} —{" "}
                <span className="text-gray-600">
                  {formatDate(booking.createdAt) || "N/A"}
                </span>
              </h3>
              <p className="text-sm font-medium text-gray-800">
                {t("Order Id")}: {booking.orderId || 1}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <DeliveryTypeLabel booking={booking} />
              {hasCombo && (
                <span className="flex items-center gap-1 bg-green-700 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  🎁 {t("Combo")}
                </span>
              )}
            </div>
          </div>

          <div className="hidden md:flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div
                className={`text-white rounded-full h-10 w-10 flex items-center justify-center font-semibold ${hasCombo ? "bg-green-700" : "bg-[#2E7D32]"}`}
              >
                {index + 1}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">
                  {t("My Order")} —{" "}
                  <span className="text-gray-600">
                    {formatDate(booking.createdAt) || "N/A"}
                  </span>
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm font-medium text-gray-800">
                    {t("Order Id")}: {booking.orderId || 1}
                  </p>
                  {hasCombo && (
                    <span className="flex items-center gap-1 bg-green-700 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      🎁 {t("Combo Deal")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <StatusBadge booking={booking} />
                <MdFileDownload
                  className="text-xl text-black cursor-pointer"
                  onClick={() => GeneratePDF(booking._id, booking.orderId)}
                />
                <button
                  onClick={() => toggleBooking(booking._id)}
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  {expandedBookingId === booking._id ? (
                    <IoIosArrowUp className="text-xl cursor-pointer text-gray-600" />
                  ) : (
                    <IoIosArrowDown className="text-xl cursor-pointer text-gray-600" />
                  )}
                </button>
              </div>
              <DeliveryTypeLabel booking={booking} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Secret code / Tracking / Shipment ──────────────────────────────── */}
      {(booking?.SecretCode ||
        booking?.isShipmentDelivery ||
        booking?.trackingNo) && (
          <div className="p-4 border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {booking?.SecretCode &&
                (booking?.status === "Pending" ||
                  booking?.status === "Preparing") && (
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-yellow-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t("Secret Code")}</p>
                      <p className="text-base font-medium text-gray-800">
                        {booking.SecretCode}
                      </p>
                    </div>
                  </div>
                )}

              {booking?.isShipmentDelivery &&
                (booking?.status === "Pending" ||
                  booking?.status === "Shipped") && (
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-blue-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H11a1 1 0 001-1v-1h2a1 1 0 001-1v-4a1 1 0 00-.293-.707l-2-2A1 1 0 0012 6h-1V5a1 1 0 00-1-1H3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        {t("Delivery Expected")}
                      </p>
                      <p className="text-base font-medium text-gray-800">
                        {formatDate2(
                          new Date(
                            new Date(booking.createdAt).setDate(
                              new Date(booking.createdAt).getDate() + 7,
                            ),
                          ),
                        )}{" "}
                        11 PM
                      </p>
                    </div>
                  </div>
                )}

              {booking?.trackingNo && booking?.trackingLink && (
                <div className="flex items-center md:col-span-2">
                  <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-indigo-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm text-gray-500">
                      {t("Tracking Number")}
                    </p>
                    <p className="text-[13px] font-medium text-gray-800">
                      {booking.trackingNo}
                    </p>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm text-gray-500">{t("Company Name")}</p>
                    <p className="text-[13px] font-medium text-gray-800">
                      {booking.trackingLink}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex flex-wrap gap-2 justify-end">
          {(() => {
            const diff =
              (new Date() - new Date(booking.createdAt)) / (1000 * 60);
            return booking?.status === "Pending" && diff <= 15;
          })() && (
              <div className="w-full border-t border-gray-200 pt-4 flex justify-end">
                <button
                  onClick={() => cancelOrder(booking._id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  {t("Cancel Order")}
                </button>
              </div>
            )}
        </div>

        {booking?.status === "Completed" &&
          (booking?.isShipmentDelivery || booking?.isLocalDelivery) &&
          isWithin24Hours(booking?.updatedAt) && (
            <div className="w-full border-t border-gray-200 pt-4 flex justify-end">
              <button
                onClick={() => ReturnOrder(booking._id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium cursor-pointer rounded-md transition-colors"
              >
                {t("Return Order")}
              </button>
            </div>
          )}
      </div>

      {(booking?.status === "Pending" || booking?.status === "Preparing") &&
        (booking?.isDriveUp || booking?.isOrderPickup) &&
        booking?.createdAt &&
        new Date() - new Date(booking.createdAt) >= 15 * 60 * 1000 && (
          <div className="px-4 py-3 bg-white border-b border-gray-200">
            <div className="flex flex-wrap gap-2 justify-end">
              {booking?.isDriveUp && (
                <button
                  onClick={() => toggleModal(booking._id)}
                  className="px-4 py-2 bg-[#F59E0B] text-white text-sm font-medium rounded-md cursor-pointer"
                >
                  {booking.parkingNo ? t("Update Parking Spot") : t("I'm here")}
                </button>
              )}
              {booking?.isOrderPickup && (
                <button
                  onClick={() => getSecrectCode(booking._id)}
                  className="px-4 py-2 bg-[#F59E0B] text-white text-sm font-medium rounded-md cursor-pointer"
                >
                  {t("I'm here")}
                </button>
              )}
            </div>
          </div>
        )}

      {/* ── Parking modal ───────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {t("Parking Information")}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  {t("Car Brand")}
                </label>
                <input
                  type="text"
                  value={carBrand}
                  onChange={(e) => setCarBrand(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-black"
                  placeholder={t("Enter Car brand")}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  {t("Car Color")}
                </label>
                <input
                  type="text"
                  value={carColor}
                  onChange={(e) => setCarColor(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-black"
                  placeholder={t("Enter Car color")}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  {t("Parking Pickup Spot")}
                </label>
                <select
                  value={parkingNo}
                  onChange={(e) => setParkingNo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-black"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md border border-amber-500 text-amber-500 hover:bg-amber-50 cursor-pointer"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#2E7D32] text-white hover:bg-green-800 cursor-pointer"
                >
                  {t("Submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div
        className={expandedBookingId === booking._id ? "hidden" : "block p-4"}
      >
        {/* Product rows — smart rendering per product */}
        <ProductList
          booking={booking}
          lang={lang}
          router={router}
          t={t}
          setProductId={setProductId}
          setSelectedProduct={setSelectedProduct}
          setShowReviews={setShowReviews}
        />

        {hasCombo && <ComboPriceSummary booking={booking} />}

        {/* Barcode + Order total */}
        <div className="mt-4 flex justify-between items-end">
          <Barcode
            value={booking?.orderId}
            className="-mt-2 md:w-[300px] w-[200px] h-[110px]"
          />
          <div className="bg-gray-50 px-6 py-3 rounded-lg border border-gray-200 h-20 flex flex-col justify-center">
            <p className="text-sm text-gray-500">{t("Total")}</p>
            <p className="text-xl font-semibold text-gray-800">
              $
              {(
                Number(booking.total || 0) + Number(booking.totalTax || 0)
              ).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
