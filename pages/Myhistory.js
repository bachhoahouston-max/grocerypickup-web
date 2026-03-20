import { Api, ApiFormData } from "@/services/service";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { languageContext } from "./_app";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { RxCross2 } from "react-icons/rx";
import Compressor from "compressorjs";
// import AddReview from "@/components/AddReview";
// import AddReview from "../components/AddReview";

function Myhistory(props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [bookingsData, setBookingsData] = useState([]);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [productId, setProductId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [token, setToken] = useState("");
  const { lang } = useContext(languageContext);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
  });

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      getHistoryByUser();
    } else {
      router.push("signIn");
    }
  }, []);

  const getHistoryByUser = async () => {
    props.loader(true);
    Api("get", "getStatusCompletedProducts", "", router).then(
      (res) => {
        props.loader(false);
        setBookingsData(res.data);
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.message });
      },
    );
  };

  const toggleBooking = (id) => {
    setExpandedHistoryId(expandedHistoryId === id ? null : id);
  };

  function formatDate(date) {
    if (!date) return null;
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(date).toLocaleDateString("en-US", options);
  }

  // ─── FIX: Group by orderId. productDetail is already an array of products ────
  // API returns one booking doc per item but productDetail[] contains all items.
  // We pick the first occurrence per orderId and read its productDetail array.
  const groupedBookings = bookingsData.reduce((acc, booking) => {
    const key = booking.orderId;
    if (!acc[key]) {
      // productDetail is the full array of ordered product objects
      const products = Array.isArray(booking.productDetail)
        ? booking.productDetail
        : booking.productDetail
          ? [booking.productDetail]
          : [];

      acc[key] = {
        ...booking,
        products,
      };
    } else {
      // Merge any extra productDetail items in case of duplicate orderId entries
      const incoming = Array.isArray(booking.productDetail)
        ? booking.productDetail
        : booking.productDetail
          ? [booking.productDetail]
          : [];

      // Avoid duplicates by checking _id
      const existingIds = new Set(acc[key].products.map((p) => p._id));
      incoming.forEach((p) => {
        if (!existingIds.has(p._id)) {
          acc[key].products.push(p);
        }
      });
    }
    return acc;
  }, {});

  const groupedBookingsArray = Object.values(groupedBookings);

  // ─── combo_id is already a fully populated object from the API ───────────────
  // Structure: product.combo_id = { _id, name, price, free_product: [...], main_product, ... }
  const getProductCombo = (product) => {
    if (!product?.combo_id) return null;
    // Fully populated object
    if (typeof product.combo_id === "object" && product.combo_id !== null) {
      return product.combo_id;
    }
    return null;
  };

  const isComboOrder = (booking) =>
    booking?.products?.some((p) => !!getProductCombo(p));

  // ─── Normal Product Row ───────────────────────────────────────────────────────
  const NormalProductRow = ({
    product,
    index,
    total,
    booking,
    lang,
    router,
    setProductId,
    setSelectedProduct,
    setShowReviews,
  }) => (
    <div
      className={`flex items-center p-2 hover:bg-gray-50 cursor-pointer ${
        index !== total - 1 ? "border-b border-gray-200" : ""
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
      <div className="text-right flex-shrink-0 pr-1 flex flex-col items-end gap-2">
        <p className="text-sm font-bold text-gray-800">
          ${parseFloat(product.price || 0).toFixed(2)}
        </p>
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
      </div>
    </div>
  );

  // ─── Combo Main Product Row ───────────────────────────────────────────────────
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
  }) => (
    <div
      className={`flex items-center p-2 hover:bg-blue-50 cursor-pointer relative bg-blue-50/40 ${
        index !== total - 1 ? "border-b border-gray-200" : ""
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
      <div className="text-right flex-shrink-0 pr-1 flex flex-col items-end gap-2">
        <p className="text-sm font-bold text-gray-800">
          ${parseFloat(product.price || 0).toFixed(2)}
        </p>
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
      </div>
    </div>
  );

  // ─── Combo Price Summary ──────────────────────────────────────────────────────
  const ComboPriceSummary = ({ booking }) => {
    const { t } = useTranslation();

    const normalProducts = booking.products.filter((p) => !getProductCombo(p));
    const comboProducts = booking.products.filter((p) => getProductCombo(p));

    // Collect unique combo objects from the populated combo_id fields
    const combos = [];
    const seen = new Set();
    comboProducts.forEach((p) => {
      const combo = getProductCombo(p);
      if (combo && combo._id && !seen.has(combo._id)) {
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
    // Free items retail value comes from combo.free_product[].slot.our_price
    const freeRetail = combos.reduce(
      (s, c) =>
        s +
        (c.free_product || []).reduce(
          (fs, fp) => fs + parseFloat(fp?.slot?.our_price || 0),
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
            <span className="text-gray-600 font-medium">
              {t("Combo price")}
            </span>
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

  // ─── Free Item Row ────────────────────────────────────────────────────────────
  // API: combo.free_product[] = [{ product: { _id, name, vietnamiesName, varients: [{image:[]}] }, slot: { value, unit, our_price } }]
  const FreeItemRow = ({ fp, lang, isLast }) => {
    const { t } = useTranslation();
    const product = fp?.product;
    const slot = fp?.slot;

    // Image: from product.varients[0].image[0]
    const image =
      product?.varients?.[0]?.image?.[0] || product?.image?.[0] || null;

    const name =
      lang === "en" ? product?.name : product?.vietnamiesName || product?.name;

    const price = parseFloat(slot?.our_price || 0);
    const qty = slot?.value || 1;
    const unit = slot?.unit || "";

    return (
      <div
        className={`flex items-center p-2 relative bg-green-50/50 ${
          !isLast ? "border-b border-gray-200" : ""
        }`}
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
            {t("Qty")}: {qty} {unit && `· ${unit}`}
          </p>
          <span className="inline-block mt-1 text-[10px] font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
            {t("Free Gift")}
          </span>
        </div>

        <div className="text-right flex-shrink-0 pr-1">
          {price > 0 && (
            <p className="text-xs text-gray-400 line-through">
              ${price.toFixed(2)}
            </p>
          )}
          <p className="text-xs font-black text-green-700">FREE</p>
        </div>
      </div>
    );
  };

  // ─── Combo Banner ─────────────────────────────────────────────────────────────
  const ComboBanner = ({ combo }) => {
    const { t } = useTranslation();
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-700 to-green-600 rounded-lg mb-2">
        <span className="text-white text-xs font-bold">
          🎁 {combo.name || t("Combo Deal")}
        </span>
        {combo.price && (
          <span className="ml-auto text-green-100 text-xs font-semibold">
            ${parseFloat(combo.price).toFixed(2)}
          </span>
        )}
      </div>
    );
  };

  // ─── Product List (Expanded) ──────────────────────────────────────────────────
  // For each product in booking.products:
  //   - If product.combo_id is null/undefined → NormalProductRow
  //   - If product.combo_id is a populated object → MainProductRow
  //     → Then render free items from combo_id.free_product[] after it
  const ProductList = ({
    booking,
    lang,
    router,
    setProductId,
    setSelectedProduct,
    setShowReviews,
  }) => {
    const products = booking.products;

    const normalProducts = products.filter((p) => !getProductCombo(p));
    const comboProducts = products.filter((p) => !!getProductCombo(p));

    const isMixedOrder = normalProducts.length > 0 && comboProducts.length > 0;

    const rendered = [];
    const seenBanners = new Set();
    const seenFreeItems = new Set();

    // ── Normal products section ──
    if (normalProducts.length > 0) {
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
            setProductId={setProductId}
            setSelectedProduct={setSelectedProduct}
            setShowReviews={setShowReviews}
          />,
        );
      });
    }

    // ── Combo products section ──
    if (comboProducts.length > 0) {
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

        // Show combo banner once per unique combo
        if (combo && combo._id && !seenBanners.has(combo._id)) {
          seenBanners.add(combo._id);
          rendered.push(
            <div key={`banner-${combo._id}`} className="px-2 pt-2 bg-white">
              <ComboBanner combo={combo} />
            </div>,
          );
        }

        // Main product row (the purchased combo item)
        rendered.push(
          <MainProductRow
            key={product._id || `combo-main-${idx}`}
            product={product}
            index={idx}
            total={comboProducts.length}
            booking={booking}
            lang={lang}
            router={router}
            setProductId={setProductId}
            setSelectedProduct={setSelectedProduct}
            setShowReviews={setShowReviews}
          />,
        );

        // Free items from combo_id.free_product[] — shown once per combo
        if (combo && combo._id && !seenFreeItems.has(combo._id)) {
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

  return (
    <div className="bg-[var(--theme-var)] md:bg-[var(--theme-dek)]">
      <div className="mx-auto max-w-7xl py-4 min-h-screen mt-10 md:mt-0">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-center text-[35px] md:text-[45px] font-semibold text-black mb-2">
            {t("My")}
            <span className="ml-2 text-[35px] md:text-[45px] font-semibold mb-4 text-custom-green">
              {t("History")} !
            </span>
          </h1>
          <p className="md:px-0 px-12 text-center text-[16px] mb-6 w-full md:w-[40%] text-black">
            {t(
              "View all your order History in one place. Leave reviews for products you've purchased",
            )}
            .
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mx-3 md:mx-auto md:gap-12 gap-8 max-w-7xl">
          {groupedBookingsArray && groupedBookingsArray.length > 0 ? (
            groupedBookingsArray.map((booking, key) => {
              const hasCombo = isComboOrder(booking);
              const isExpanded = expandedHistoryId === booking._id;

              return (
                <div
                  key={key}
                  className="bg-white md:p-4 p-2.5 h-auto self-start rounded-lg shadow-lg border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl"
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleBooking(booking._id)}
                  >
                    <div className="flex flex-col justify-start w-full">
                      <div className="flex flex-row justify-between items-center mb-4">
                        <div className="bg-custom-green text-white rounded-full md:h-[40px] h-[40px] md:w-[40px] w-[40px] flex items-center justify-center mr-3 md:text-[20px] text-[16px] font-bold shadow-md">
                          {key + 1}
                        </div>
                        <div className="flex items-center">
                          <p className="text-green-600 font-semibold m-1 bg-green-100 px-2 py-1 rounded-full text-sm">
                            Order {booking.status}
                          </p>
                          {isExpanded ? (
                            <IoIosArrowUp className="text-2xl text-gray-600 ml-2" />
                          ) : (
                            <IoIosArrowDown className="text-2xl text-gray-600 ml-2" />
                          )}
                        </div>
                      </div>
                      <p className="text-[16px] text-black md:text-[20px] font-medium">
                        {t("My History")} (
                        {formatDate(booking.createdAt) || "N/A"})
                      </p>
                      <div className="flex flex-col justify-start items-start mt-3">
                        <p className="text-gray-700 md:text-base text-[15px] font-bold">
                          {t("Total")}:{" "}
                          <span className="text-custom-green">
                            ${booking?.total || "0.00"}
                          </span>
                        </p>
                        <p className="text-gray-700 md:text-base text-[15px] font-bold">
                          {t("Order Id")}:{" "}
                          <span className="text-gray-600">
                            {booking?.orderId}
                          </span>
                        </p>
                        {hasCombo && (
                          <span className="flex items-center gap-1 bg-green-700 text-white text-xs font-bold px-2.5 py-1 rounded-full mt-1">
                            🎁 {t("Combo Deal")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4">
                      <ProductList
                        booking={booking}
                        lang={lang}
                        router={router}
                        setProductId={setProductId}
                        setSelectedProduct={setSelectedProduct}
                        setShowReviews={setShowReviews}
                      />
                      <ComboPriceSummary booking={booking} />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex justify-center items-center md:mt-5 w-full md:h-[300px] h-[200px] col-span-2">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <p className="text-center text-gray-600 text-xl font-medium">
                  {t("No history available")}.
                </p>
              </div>
            </div>
          )}

          {showReviews && (
            <AddReview
              loader={props.loader}
              toaster={props.toaster}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              setShowReviews={setShowReviews}
              productId={productId}
              setProductId={setProductId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Myhistory;

function AddReview({
  loader,
  toaster,
  selectedProduct,
  setSelectedProduct,
  setShowReviews,
  productId,
  setProductId,}
) {
  const [reviewsData, setReviewsData] = useState({
    description: "",
  });
  const router = useRouter();
  const { t } = useTranslation();
  const { lang } = useContext(languageContext);
  const [images, setImages] = useState([]);

  console.log(setShowReviews);
  console.log(selectedProduct);

  const createProductRquest = (e) => {
    e.preventDefault();

    if (!reviewsData.description || reviewsData.description.length < 20) {
      toaster({
        type: "error",
        message: "Review description must be at least 20 characters",
      });
      return;
    }

    let data = {
      description: reviewsData?.description,
      product: productId,
      images: images,
    };

    loader(true);

    Api("post", "giverate", data, router).then(
      (res) => {
        loader(false);
        if (res.status) {
          setShowReviews(false);
          setReviewsData({
            description: "",
          });
          setProductId("");
          setImages([]);
          setSelectedProduct(null);

          toaster({
            type: "success",
            message: "Reviews Submitted Successfully",
          });
        } else {
          toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        loader(false);
        toaster({ type: "error", message: err?.message });
      },
    );
  };
  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    // Check if total images would exceed 6
    if (images.length + files.length > 6) {
      toaster({
        type: "error",
        message: "Maximum 6 images allowed",
      });
      return;
    }

    files.forEach((file) => {
      const fileSizeInMb = file.size / (1024 * 1024);
      if (fileSizeInMb > 1) {
        toaster({
          type: "error",
          message: "Too large file. Please upload a smaller image",
        });
        return;
      }

      new Compressor(file, {
        quality: 0.6,
        success: (compressedResult) => {
          const data = new FormData();
          data.append("file", compressedResult);
          loader(true);

          ApiFormData("post", "user/fileupload", data, router).then(
            (res) => {
              loader(false);
              if (res.status) {
                setImages((prev) => [...prev, res.data.file]);
                toaster({
                  type: "success",
                  message: "Image uploaded successfully",
                });
              }
            },
            (err) => {
              loader(false);
              toaster({ type: "error", message: err?.message });
            },
          );
        },
      });
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="relative w-full max-w-lg bg-white rounded-[20px] shadow-2xl max-h-[98vh] overflow-y-auto">
        <div
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 w-8 h-8 cursor-pointer rounded-full hover:bg-gray-100 transition-all duration-200"
          onClick={() => {
            setShowReviews(false);
            setReviewsData({
              description: "",
            });
            setImages([]);
            setSelectedProduct(null);
          }}
        >
          <RxCross2 className="h-full w-full font-semibold" />
        </div>

        <form className="px-6 py-6" onSubmit={createProductRquest}>
          {/* Product Image */}
          <div className="flex justify-center mt-4 mb-6">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center relative border border-gray-200 overflow-hidden">
              <Image
                fill
                src={selectedProduct?.image?.[0] || "/api/placeholder/100/100"}
                alt="Product"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          <h2 className="text-black font-bold text-xl mb-2 text-center">
            {t("Review this item")}
          </h2>
          <p className="text-gray-600 text-sm mb-6 text-center">
            {lang === "en"
              ? selectedProduct?.product?.name
              : selectedProduct?.product?.vietnamiesName}
          </p>

          <div className="w-full mb-4">
            <label className="text-black font-medium text-base mb-2 block">
              {t("Add a review")} <span className="text-red-500">*</span>
            </label>
            <p className="text-gray-500 text-sm mb-2">
              {t("At least 20 characters")}
            </p>
            <textarea
              className="bg-white w-full px-4 py-3 border border-gray-300 rounded-lg font-normal text-base text-black outline-none resize-none focus:border-custom-gold focus:ring-1 focus:ring-custom-gold transition-all duration-200"
              rows="4"
              placeholder={t("What did you like or dislike about it?")}
              value={reviewsData.description}
              onChange={(e) => {
                setReviewsData({
                  ...reviewsData,
                  description: e.target.value,
                });
              }}
              required
              minLength={20}
            />
          </div>

          <div className="w-full mb-6">
            <label className="text-black font-medium text-base mb-2 block">
              {t("Add photos")} ({t("optional")})
            </label>
            <p className="text-gray-500 text-sm mb-3">
              {t("Upload up to 6 photos")} ({images.length}/6)
            </p>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      width={100}
                      height={100}
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {images.length < 6 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-custom-gold transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="photo-upload"
                  onChange={handleImageChange}
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="text-custom-gold text-3xl mb-2">📷</div>
                  <p className="text-gray-600 text-sm font-medium">
                    {t("Tap to add photos")}
                  </p>
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              className="bg-custom-green w-full py-3 rounded-lg text-white font-semibold text-base hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              type="submit"
              disabled={reviewsData.description.length < 20}
            >
              {t("Submit Review")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
