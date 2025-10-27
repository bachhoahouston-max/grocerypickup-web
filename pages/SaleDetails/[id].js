import GroceryCategories from "@/components/GroceryCatories";
import React, { useContext, useEffect, useState } from "react";
import { IoRemoveSharp } from "react-icons/io5";
import { IoAddSharp } from "react-icons/io5";
import { useRouter } from "next/router";
import {
  cartContext,
  userContext,
  favoriteProductContext,
  languageContext
} from "../_app";
import { Api } from "@/services/service";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { produce } from "immer";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { SlArrowRight } from "react-icons/sl";
import { useTranslation } from "react-i18next";
import constant from "@/services/constant";
import "react-medium-image-zoom/dist/styles.css";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ProductReviews from "@/components/reviews";
import Head from "next/head";
import Image from "next/image";

function ProductDetails(props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { lang } = useContext(languageContext)
  const [saleData, setSaleData] = useState([]);
  const [user, setUser] = useContext(userContext);
  const [productsId, setProductsId] = useState({});
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImageList, setSelectedImageList] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [productReviews, setProductReviews] = useState([]);
  const [cartData, setCartData] = useContext(cartContext);
  const [priceIndex, setPriceIndex] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState({});
  const [Favorite, setFavorite] = useContext(favoriteProductContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [availableQty, setAvailableQty] = useState(0);
  const [salePrice, setSalePrice] = useState("");
  const [prizeSlot, setPrizeSlot] = useState({});
  const [saleEndTime, setSaleEndTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState({});
  const [isSaleActive, setIsSaleActive] = useState(false);

  useEffect(() => {
    if (router?.query?.id) {
      getProductById();
    }
  }, [router?.query?.id]);

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 1,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  useEffect(() => {
    if (cartData.length > 0) {
      const cartItem = cartData.find(
        (f) =>
          f.id === productsId?._id &&
          f.price_slot?.our_price === selectedPrice?.our_price
      );

      if (cartItem) {
        setIsInCart(true);
        setAvailableQty(cartItem.qty);
      } else {
        setIsInCart(false);
        setAvailableQty(0);
      }
    } else {
      setIsInCart(false);
      setAvailableQty(0);
    }
  }, [cartData, productsId, selectedPrice]);


  useEffect(() => {
    let timer;
    if (saleEndTime && isSaleActive) {
      timer = setInterval(() => {
        const now = new Date().getTime();
        const distance = saleEndTime - now;

        if (distance <= 0) {
          clearInterval(timer);
          setIsSaleActive(false);
          setTimeRemaining({});
          return;
        }


        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [saleEndTime, isSaleActive]);

  const handleAddToCart = () => {
    if (!productsId || !productsId._id || !selectedPrice?.our_price) {
      console.error(
        "Invalid product data or price selection:",
        productsId,
        selectedPrice
      );
      return;
    }

    if (productsId.Quantity <= 0) {
      props.toaster({
        type: "error",
        message:
          "This item is currently out of stock. Please choose a different item.",
      });
      return;
    }

    const existingItem = cartData.find(
      (f) =>
        f._id === productsId._id && f.price_slot?.our_price === selectedPrice.our_price
    );

    const price = parseFloat(selectedPrice?.our_price);

    const ourPrice = salePrice;
    const percentageDifference =
      price && ourPrice ? ((price - ourPrice) / price) * 100 : 0;

    if (!existingItem) {
      const newProduct = {
        ...productsId,
        selectedColor: productsId.selectedColor || productsId.varients?.[0] || {},
        selectedImage: productsId.selectedImage || productsId.varients?.[0]?.image?.[0] || "",
        qty: 1,
        id: productsId._id,
        BarCode: productsId?.BarCode || "",
        total: Number(ourPrice)?.toFixed(2) ?? "0.00",
        our_price: ourPrice ?? 0,
        price: selectedPrice?.our_price ?? 0,
        price_slot: selectedPrice ?? {},
        percentageDifference: percentageDifference?.toFixed(2) ?? "0.00",
      };


      const updatedCart = [...cartData, newProduct];
      setCartData(updatedCart);
      localStorage.setItem("addCartDetail", JSON.stringify(updatedCart));
    }
    props.toaster({
      type: "success",
      message: "Item added to cart",
    });
  };

  const handleIncreaseQty = () => {
    const nextState = produce(cartData, (draft) => {
      const existingItem = draft.find(
        (item) =>
          item.id === productsId._id &&
          item.price_slot.value === selectedPrice.value
      );

      if (!existingItem) {
        console.error("Item not found in cart for increasing quantity.");
        return;
      }

      if (existingItem.qty + 1 > productsId.Quantity) {
        props.toaster({
          type: "error",
          message:
            "Item is not available in this quantity in stock. Please choose a different item.",
        });
        return;
      }

      existingItem.qty += 1;
      existingItem.total = (
        parseFloat(existingItem.price_slot?.our_price || 0) * existingItem.qty
      ).toFixed(2);
    });

    setCartData(nextState);
    localStorage.setItem("addCartDetail", JSON.stringify(nextState));
  };

  const handleDecreaseQty = () => {
    const nextState = produce(cartData, (draft) => {
      const existingItem = draft.find(
        (item) =>
          item.id === productsId._id &&
          item.price_slot.value === selectedPrice.value
      );

      if (existingItem) {
        if (existingItem.qty > 1) {
          existingItem.qty -= 1;
          existingItem.total =
            parseFloat(existingItem.price_slot?.our_price) * existingItem.qty;
        } else {
          const index = draft.indexOf(existingItem);
          if (index > -1) {
            draft.splice(index, 1);
          }
        }
      } else {
        console.error("Item not found in cart for decreasing quantity.");
      }
    });

    setCartData(nextState);
    localStorage.setItem("addCartDetail", JSON.stringify(nextState));
  };

  const getProductById = async () => {
    let url = `getProductByslug/${router?.query?.id}`;
    if (user?.token) {
      url = `getProductByslug/${router?.query?.id}?user=${user?._id}`;
    }
    props.loader(true);
    Api("get", url, "", router).then(
      (res) => {
        props.loader(false);
        res.data.qty = 1;
        res.data.total = (res.data?.our_price * res.data.qty).toFixed(2);
        setProductsId(res.data);
        setSelectedImageList(res.data?.varients[0].image);
        setSelectedImage(res.data?.varients[0].image[0]);
        setProductReviews(res.data?.reviews);
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const addremovefavourite = () => {
    if (!user?.token) {
      props.toaster({ type: "success", message: "Login required" });
      return;
    }

    let data = {
      product: productsId?._id,
    };

    props.loader(true);
    Api("post", "addremovefavourite", data, router).then(
      (res) => {
        props.loader(false);
        if (res.status) {
          if (isFavorite) {
            props.toaster({ type: "success", message: res.data?.message });
            setFavorite((prevFavorites) => {
              const updatedFavorites = prevFavorites.filter(
                (fav) => fav._id !== productsId._id
              );
              localStorage.setItem(
                "favorites",
                JSON.stringify(updatedFavorites)
              );
              return updatedFavorites;
            });
          } else {
            setFavorite((prevFavorites) => {
              const updatedFavorites = [...prevFavorites, productsId];
              localStorage.setItem(
                "favorites",
                JSON.stringify(updatedFavorites)
              );
              return updatedFavorites;
            });
          }
          getProductById();
        } else {
          props.toaster({ type: "error", message: res.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorite(JSON.parse(storedFavorites));
    }
  }, []);

  const getSale = async (slug) => {
    props.loader(true);
    try {
      const res = await Api("get", "getActiveFlashSales", router);

      if (res.data && res.data.length > 0) {
        res.data.forEach((item) => {
          const product = item.product;
          if (product.slug === slug) {

            const now = new Date();
            const saleStart = new Date(item.startDateTime);
            const saleEnd = new Date(item.endDateTime);

            if (now >= saleStart && now <= saleEnd) {
              setSalePrice(item.price);
              setPrizeSlot({
                value: item?.price_slot?.value,
                unit: item?.price_slot?.unit,
                other_price: item?.price_slot?.our_price,
                our_price: item?.price,
              });

              setSelectedPrice({
                value: item?.price_slot?.value,
                unit: item?.price_slot?.unit,
                other_price: item?.price_slot?.our_price,
                our_price: item?.price,
              });
              setSaleData(item);
              setSaleEndTime(saleEnd.getTime());
              setIsSaleActive(true);
            } else {
              // Sale exists but not currently active
              setIsSaleActive(false);
            }
          }
        });
      }
    } catch (err) {
      console.error(err);
      props.toaster({ type: "error", message: err?.message });
    } finally {
      props.loader(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      getSale(router?.query?.id);
    }
  }, [router.isReady]);

  return (
    <>
      <Head>
        <title>{productsId?.metatitle}</title>
        <meta name="description" content={productsId?.metadescription} />
        <link
          rel="canonical"
          href={`https://www.bachhoahouston.com/product-details/${productsId?.slug}`}
        />
      </Head>
      <div className="bg-white w-full">
        <section className="bg-white w-full md:pt-10 pt-14 md:pb-5 pb-5 ">
          <div className="max-w-7xl  mx-auto w-full md:px-4 px-5">


            {isSaleActive && saleEndTime && (
              <div className="bg-custom-green text-white p-3 rounded-md mb-5 flex justify-between items-center">
                <div className="font-bold text-lg">
                  🎉 SALE ENDS IN:
                </div>
                <div className="flex space-x-4">
                  {timeRemaining.days > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold">{timeRemaining.days}</div>
                      <div className="text-sm">Days</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold">{timeRemaining.hours}</div>
                    <div className="text-sm">Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{timeRemaining.minutes}</div>
                    <div className="text-sm">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{timeRemaining.seconds}</div>
                    <div className="text-sm">Seconds</div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center text-gray-500 text-xs md:text-sm mt-2 mb-2 gap-1 md:ps-4">
              <p className="font-medium">{t("Home")}</p>
              <SlArrowRight className="text-gray-400 w-3 h-3 md:w-4 md:h-4" />

              <p className="font-medium">{productsId?.categoryName}</p>
              <SlArrowRight className="text-gray-400 w-3 h-3 md:w-4 md:h-4" />

              <p className="font-semibold truncate max-w-xs md:max-w-sm">
                {lang === "en" ? productsId?.name : productsId?.vietnamiesName}
              </p>
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-5">
              <div className="p-[10px] rounded-[15px]">
                <Carousel
                  className="h-full w-full"
                  responsive={responsive}
                  autoPlay={false}
                  infinite={true}
                  arrows={true}
                >
                  {selectedImageList?.map((item, i) => (
                    <div key={i} className="bg-white w-full md:h-full relative flex justify-center">
                      <TransformWrapper
                        initialScale={1}
                        minScale={1}
                        maxScale={8}
                        wheel={{ step: 0.1 }}
                        doubleClick={{ disabled: true }}
                      >
                        {({ zoomIn, zoomOut, resetTransform }) => (
                          <>
                            <TransformComponent>
                              <Image
                                width={500}
                                height={400}
                                className="h-[500px] w-full object-contain cursor-move"
                                src={item}
                                alt={productsId?.imageAltName || "bachahoustan image"}
                              />
                            </TransformComponent>
                            <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                              <button
                                onClick={() => zoomIn()}
                                className="bg-white p-2 rounded-full shadow-lg text-black"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="12" y1="5" x2="12" y2="19"></line>
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                              </button>
                              <button
                                onClick={() => zoomOut()}
                                className="bg-white p-2 rounded-full shadow-lg text-black"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                              </button>
                              <button
                                onClick={() => resetTransform()}
                                className="bg-white p-2 rounded-full shadow-lg text-black"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                                  <path d="M21 3v5h-5"></path>
                                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                                  <path d="M8 16H3v5"></path>
                                </svg>
                              </button>
                            </div>
                          </>
                        )}
                      </TransformWrapper>
                    </div>
                  ))}
                </Carousel>
              </div>
              <div className="flex justify-start items-start w-full">
                <div className="flex flex-col justify-start items-start w-full">
                  <div className=" flex justify-between items-center w-full">
                    <h1 className="text-black md:text-[32px] text-2xl font-semibold">
                      {lang === "en" ? productsId?.name : productsId?.vietnamiesName}
                    </h1>

                    <div
                      className="p-2 border-[3px] border-black rounded-full flex justify-center items-center cursor-pointer"
                      onClick={addremovefavourite}
                    >
                      {!productsId?.favourite && (
                        <FaRegHeart className="text-black w-[23px] h-[23px]" />
                      )}
                      {productsId?.favourite && (
                        <FaHeart className="text-red-700 w-[23px] h-[23px]" />
                      )}
                    </div>

                  </div>

                  <div className="md:pt-20 pt-5 w-full md:w-[400px] grid md:grid-cols-3 grid-cols-2 gap-5">
                    {prizeSlot && (
                      <div>
                        <div
                          onClick={() => {
                            setSelectedPrice(prizeSlot);
                            setPriceIndex(0);
                          }}
                          className={`bg-custom-lightPurple cursor-pointer w-full rounded-[8px] border border-custom-darkPurple p-[10px] relative
          ${priceIndex === 0 ? "bg-[#2E7D321A]" : "bg-white"}
        `}
                        >
                          {prizeSlot?.other_price && (
                            <>
                              <div className="bg-custom-green p-2 rounded-full absolute -top-4 -right-4">
                                <p className="text-white text-center text-[9px] font-medium ">
                                  {(
                                    ((parseFloat(prizeSlot.other_price) -
                                      parseFloat(prizeSlot.our_price)) /
                                      parseFloat(prizeSlot.other_price)) *
                                    100
                                  ).toFixed(2)}
                                  %<br />
                                  {t("off")}
                                </p>
                              </div>
                            </>
                          )}

                          <p className="text-black font-normal text-base pt-1">
                            {prizeSlot.value} {prizeSlot.unit}
                          </p>

                          <p className="text-black font-normal text-base pt-1">
                            {constant.currency}
                            {prizeSlot.our_price}
                          </p>

                          <p className="text-custom-black font-semibold text-sm pt-2">
                            {prizeSlot?.our_price && (
                              <span className="text-black font-normal line-through">
                                {constant.currency}
                                {prizeSlot?.other_price}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:pt-16 pt-5">
                    {isInCart ? (
                      <>
                        <div className="p-1 flex justify-between w-[250px] bg-gray-100 rounded-2xl">
                          <div
                            className="px-2.5 py-2 bg-custom-green cursor-pointer  rounded-full flex justify-center items-center"
                            onClick={handleDecreaseQty}
                          >
                            <IoRemoveSharp className="text-white text-lg" />
                          </div>
                          <p className="text-black md:text-xl text-lg font-medium text-center px-3  py-1">
                            {availableQty}
                          </p>
                          <div
                            className="rounded-full bg-custom-green cursor-pointer px-2.5 py-2 flex justify-center items-center"
                            onClick={handleIncreaseQty}
                          >
                            <IoAddSharp className=" text-white text-lg" />
                          </div>
                        </div>
                      </>
                    ) : (
                      productsId.Quantity <= 0 ? (
                        <button
                          className="bg-[#5CB447]/80 px-4 py-2 rounded-[8px] text-gray-200 font-semibold text-md w-[250px] md:mt-5 mt-4 cursor-not-allowed "
                        >
                          {t("Out of Stock")}
                        </button>
                      ) : (
                        <button
                          className="bg-custom-green px-4 py-2 w-[250px] rounded-[8px] text-white font-medium text-md md:mt-5 mt-4 cursor-pointer"
                          onClick={handleAddToCart}
                        >
                          {t("Add to Cart")}
                        </button>
                      )
                    )}

                  </div>
                  {productsId.isShipmentAvailable ? (
                    <p className="text-black font-normal text-[17px] mt-3 md:mt-7">
                      {t("Shipment Delivery is available")}
                    </p>
                  ) : (
                    <p className="text-black font-normal text-[17px] mt-3 md:mt-7">
                      {t("Shipment Delivery is not available")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto md:my-6 my-3 py-4 max-w-7xl md:px-6 xl:px-0 px-6">
            <p className="text-black text-xl md:text-2xl font-bold mb-3">
              {t("About Product")}
            </p>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-2">

              <div className="md:col-span-2">
                <p className="text-black text-base md:text-[18px] font-bold">
                  {t(" Description")}:
                  <span className="text-custom-newGray font-normal ml-1">
                    {productsId?.short_description}
                  </span>
                </p>
              </div>


              <div className="md:col-span-2">
                <p className="text-black text-base md:text-[18px] font-semibold mb-1">
                  {t("Long Description")}:{" "}
                  <span className="text-black text-base md:text-[18px] font-normal leading-relaxed">
                    {productsId?.long_description}
                  </span>
                </p>
              </div>

              {productsId?.disclaimer && (
                <div className="md:col-span-2">
                  <p className="text-black text-base md:text-[18px] font-semibold mb-1">
                    {t("Disclaimer")}:
                  </p>
                  <div
                    className="text-black text-base md:text-[18px] font-normal leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: productsId?.disclaimer }}
                  />
                </div>
              )}

              {productsId?.Warning && (
                <div className="md:col-span-2">
                  <p className="text-black text-base md:text-[18px] font-semibold mb-1">
                    {t("Warning")}:
                  </p>
                  <div
                    className="text-black text-base md:text-[18px] font-normal leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: productsId?.Warning }}
                  />
                </div>
              )}

              {productsId?.ReturnPolicy && (
                <div className="md:col-span-2">
                  <p className="text-black text-base md:text-[18px] font-semibold mb-1">
                    {t("Return Policy")}:
                  </p>
                  <div
                    className="text-black text-base md:text-[18px] font-normal leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: productsId?.ReturnPolicy }}
                  />
                </div>
              )}
            </div>
          </div>

          <ProductReviews productReviews={productReviews} slug={productsId.slug} />
        </section>

      </div>
    </>

  );
}

export default ProductDetails;