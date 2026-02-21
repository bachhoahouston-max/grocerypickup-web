import GroceryCategories from "@/components/GroceryCatories";
import React, { useContext, useEffect, useState } from "react";
import { IoRemoveSharp } from "react-icons/io5";
import { IoAddSharp } from "react-icons/io5";
import { useRouter } from "next/router";
import {
  cartContext,
  userContext,
  favoriteProductContext,
  languageContext,
} from "../_app";
import { Api, ConstantsUrl } from "@/services/service";
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
  console.log(props, "deviceType");
  const { t } = useTranslation();
  const router = useRouter();
  const { lang } = useContext(languageContext);
  const [user, setUser] = useContext(userContext);

  const [productsId, setProductsId] = useState({});
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedImageList, setSelectedImageList] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [productReviews, setProductReviews] = useState([]);
  const [productList, setProductList] = useState([]);
  const [priceSlot, setPriceSlote] = useState([]);
  const [priceIndex, setPriceIndex] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [cartData, setCartData] = useContext(cartContext);
  const [Favorite, setFavorite] = useContext(favoriteProductContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = React.useState(false);
  const [availableQty, setAvailableQty] = React.useState(0);

  useEffect(() => {
    if (props?.notFoundProduct) {
      props?.toaster({
        type: "error",
        message: "Product not found or invalid slug",
      });
      router.push("/404")
    }
  }, [props?.notFoundProduct]);


  useEffect(() => {
    if (!props?.product) return;
    setProductsId(props.product);
    setSelectedColor(props.product.varients?.[0] || null);
    setSelectedImageList(props.product.varients?.[0]?.image || []);
    setSelectedImage("");

    setProductReviews(props.product.reviews || []);
    setProductList(props.relatedProducts || []);

    setPriceSlote(props.product.price_slot || []);
    setPriceIndex(0);
    setSelectedPrice(props.product.price_slot?.[0] || null);
  }, [props.product]);

  // useEffect(() => {
  //   if (router?.query?.id) {
  //     getProductById();
  //   }
  // }, [router?.query?.id]);

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
      items: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  console.log("productIds", productsId);

  useEffect(() => {
    if (cartData.length > 0) {
      const cartItem = cartData.find(
        (f) =>
          f._id === productsId?._id &&
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
        f._id === productsId._id &&
        f.price_slot?.our_price === selectedPrice.our_price
    );

    const price = parseFloat(selectedPrice?.our_price);

    const ourPrice = parseFloat(selectedPrice?.our_price);
    const percentageDifference =
      price && ourPrice ? ((price - ourPrice) / price) * 100 : 0;

    if (!existingItem) {
      const newProduct = {
        ...productsId,
        selectedColor:
          productsId.selectedColor || productsId.varients?.[0] || {},
        selectedImage:
          productsId.selectedImage ||
          productsId.varients?.[0]?.image?.[0] ||
          "",
        qty: 1,
        id: productsId._id,
        BarCode: productsId?.BarCode || "",
        total: Number(ourPrice || 0).toFixed(2),
        our_price: Number(ourPrice || 0),
        price: selectedPrice?.our_price || 0,
        price_slot: selectedPrice || {},
        productSource: "NORMAL",
        percentageDifference: Number(percentageDifference || 0).toFixed(2),
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
          item._id === productsId._id &&
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
          item._id === productsId._id &&
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
    // const productRes = await fetch(`${ConstantsUrl}getProductByslug/${router?.query?.id}`);
    // const product = await productRes.json();

    // const data = await Api("get", `getProductByslug/${router?.query?.id}`, "", '');
    // console.log("Product data:", data);
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
        setSelectedColor(res.data?.varients[0]);
        setSelectedImageList(res.data?.varients[0].image);
        setSelectedImage(res.data?.varients[0].image[0]);
        getproductByCategory(res.data.category?.slug, res.data._id);
        setProductReviews(res.data?.reviews);
        if (router.query.clientSecret) {
          setShowPayment(false);
          createProductRquest();
        }

        setPriceSlote(res?.data?.price_slot);
        setSelectedPrice(res?.data?.price_slot[0]);
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const getproductByCategory = async (category_id, product_id) => {
    props.loader(true);
    Api(
      "get",
      `getProductBycategoryId?category=${category_id}&product_id=${product_id}`,
      "",
      router
    ).then(
      (res) => {
        props.loader(false);
        const sameItem = res?.data?.filter((f) => f._id !== router?.query?.id);
        setProductList(sameItem);
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
              ); // Save to local storage
              return updatedFavorites;
            });
          } else {
            setFavorite((prevFavorites) => {
              const updatedFavorites = [...prevFavorites, productsId];
              localStorage.setItem(
                "favorites",
                JSON.stringify(updatedFavorites)
              ); // Save to local storage
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

  const cartItem = productsId?._id;
  const itemQuantity = cartItem ? cartItem?.qty : 0;

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
      <div className="bg-white">
        <div className="bg-white w-full max-w-7xl mx-auto md:pt-10 pt-14 md:pb-10 pb-5 md:px-0 px-3">
          <section className="bg-transparent w-full ">
            <div className="flex flex-wrap items-center text-gray-500 text-xs md:text-sm mt-2 mb-2 gap-1 md:ps-4">
              <p className="font-medium cursor-pointer" onClick={() => router.push('/')}>{t("Home")}</p>
              <SlArrowRight className="text-gray-400 w-3 h-3 md:w-4 md:h-4 cursor-pointer" onClick={() => router.push('/')} />

              <p className="font-medium cursor-pointer" onClick={() => router.push(`/categories/${productsId?.category?.slug}`)}>{productsId?.category?.name}</p>
              <SlArrowRight className="text-gray-400 w-3 h-3 md:w-4 md:h-4 cursor-pointer" onClick={() => router.push(`/categories/${productsId?.category?.slug}`)} />

              <p className="font-semibold truncate max-w-xs md:max-w-sm">
                {lang === "en" ? productsId?.name : productsId?.vietnamiesName}
              </p>
            </div>

            <div className="w-full ">
              <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-5">
                <div className="p-[10px] rounded-[15px]">
                  <Carousel
                    className="h-full w-full"
                    responsive={responsive}
                    autoPlay={false}
                    infinite={true}
                    arrows={true}
                    showDots={true}

                  >
                    {selectedImageList?.map((item, i) => (
                      <div
                        key={i}
                        className="bg-transparent w-full md:h-full relative flex justify-center"
                      >
                        <div className="md:flex hidden">
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
                                    height={300}
                                    className="md:h-[500px] w-full object-contain cursor-move"
                                    src={item}
                                    alt={
                                      productsId?.imageAltName || "Product image"
                                    }
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
                        <Image
                          width={500}
                          height={300}
                          className="md:h-[500px] w-full object-contain cursor-move bg-transparent md:hidden block"
                          src={item}
                          alt={
                            productsId?.imageAltName || "Product image"
                          }
                        />
                      </div>
                    ))}
                  </Carousel>
                </div>
                <div className="flex justify-start items-start w-full">
                  <div className="flex flex-col justify-start items-start w-full">
                    <div className="flex justify-between items-center w-full">
                      <h1 className="text-black md:text-[32px] text-2xl font-medium">
                        {lang === "en"
                          ? productsId?.name
                          : productsId?.vietnamiesName}
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

                    <div className="pt-7 md:pt-20 w-full md:w-[400px] grid md:grid-cols-3 grid-cols-2 gap-5">
                      {priceSlot &&
                        priceSlot.map((data, i) => {
                          const otherprice = parseFloat(data?.other_price);
                          const ourPrice = parseFloat(data?.our_price);
                          const percentageDifference =
                            otherprice && ourPrice
                              ? ((otherprice - ourPrice) / otherprice) * 100
                              : 0;
                          return (
                            <div key={i}>
                              <div
                                onClick={() => {
                                  setSelectedPrice(data);
                                  setPriceIndex(i);
                                }}
                                className={`cursor-pointer w-full rounded-[8px] border border-custom-darkPurple p-[10px] relative
                                        ${priceIndex == i
                                    ? "bg-[#2E7D321A]"
                                    : "bg-white"
                                  }
                            `}
                              >
                                {data?.other_price && (
                                  <>
                                    <Image
                                      width={60}
                                      height={60}
                                      className="w-[70px] h-[60px] object-contain absolute -top-[20px] -right-[18px] "
                                      src="/star.png"
                                    />
                                    <p className="text-white text-center text-[9px] font-medium absolute -top-[2px] right-[2px]">
                                      {percentageDifference?.toFixed(2)}%<br />
                                      {t("off")}
                                    </p>
                                  </>
                                )}
                                <p className="text-black font-normal text-base pt-1">
                                  {data.value} {data.unit}
                                </p>
                                <p className="text-black font-normal text-base pt-1">
                                  {constant.currency}
                                  {data?.our_price}
                                </p>
                                <p className="text-custom-black font-semibold text-sm pt-2">
                                  {data?.other_price && (
                                    <span className="text-black font-normal line-through">
                                      {constant.currency}
                                      {data?.other_price}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {isInCart ? (
                      <>
                        <div className="p-1 flex justify-between mt-7 md:mt-20 w-[250px] bg-gray-100 rounded-2xl">
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
                    ) : productsId.Quantity <= 0 ? (
                      <button className="bg-[#5CB447]/80 px-4 py-2 rounded-[8px] text-gray-200 font-semibold text-md md:mt-5 mt-4 cursor-not-allowed ">
                        {t("Out of Stock")}
                      </button>
                    ) : (
                      <button
                        className="bg-custom-green md:mt-20 px-4 py-2 w-[250px] rounded-[8px] text-white font-medium text-md  mt-4 cursor-pointer"
                        onClick={handleAddToCart}
                      >
                        {t("Add to Cart")}
                      </button>
                    )}
                    {productsId.isShipmentAvailable ? (
                      <p className="text-black font-normal text-[17px] md:mt-5 mt-2">
                        {t("Shipment Delivery is available")}
                      </p>
                    ) : (
                      <p className="text-black font-normal text-[17px] md:mt-5 mt-2">
                        {t("Shipment Delivery is not available")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="md:my-6 my-3 py-4 ">
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

                {/* Long Description */}
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
                      dangerouslySetInnerHTML={{
                        __html: productsId?.ReturnPolicy,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <ProductReviews
              productReviews={productReviews}
              slug={productsId.slug}
            />

            <div className="bg-transparent max-w-7xl mx-auto">
              <p className="text-black text-xl font-bold md:mb-10 mb-5 md:mt-4 mt-4 ">
                {t("You might also like")}
              </p>
              <div className="grid lg:grid-cols-4 grid-cols-2 md:gap-2 gap-3  ">
                {productList.map((item, i) => (
                  <div key={i} className="w-full md:mb-5">
                    <GroceryCategories
                      loader={props.loader}
                      toaster={props.toaster}
                      item={item}
                      i={i}
                      url={`/product-details/${item?.slug}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

    </>
  );
}

export default ProductDetails;

export async function getServerSideProps(context) {
  const { id } = context.params;

  console.log("h", context.params);

  const baseUrl = ConstantsUrl; // example: https://api.bachhoahouston.com

  try {
    // const productRes = await fetch(`${baseUrl}getProductByslug/${id}`);

    const productRes = await Api("get", `getProductByslug/${id}`, "", "");
    const product = productRes.data;

    const relatedRes = await fetch(
      `${baseUrl}getProductBycategoryId?category=${product.category.slug}&product_id=${product._id}`
    );

    const relatedProducts = await relatedRes.json();
    const sameItem = relatedProducts?.data?.filter(
      (f) => f._id !== product._id
    );
    console.log("sameItem 123", sameItem);

    return {
      props: {
        product,
        relatedProducts: sameItem,
        notFoundProduct: false,
      },
    };
  } catch (err) {
    return {
      props: {
        product: null,
        relatedProducts: [],
        notFoundProduct: true,
      },
    };
  }
}
