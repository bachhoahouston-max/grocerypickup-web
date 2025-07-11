import GroceryCategories from "@/components/GroceryCatories";
import ShopFasterMarketplace from "@/components/ShopFasterMarketplace";
import React, { useContext, useEffect, useState } from "react";
import { IoRemoveSharp } from "react-icons/io5";
import { IoAddSharp } from "react-icons/io5";
import { useRouter } from "next/router";
import {
  cartContext,
  openCartContext,
  userContext,
  favoriteProductContext,
} from "../_app";
import { Api } from "@/services/service";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { produce } from "immer";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
import { SlArrowRight } from "react-icons/sl";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import moment from "moment";
import { useTranslation } from "react-i18next";
import constant from "@/services/constant";
import { RxCross2 } from "react-icons/rx";

function ProductDetails(props) {
  const { t } = useTranslation();
  const router = useRouter();

  const [user, setUser] = useContext(userContext);
  const [productsId, setProductsId] = useState({});
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImageList, setSelectedImageList] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [productReviews, setProductReviews] = useState([]);
  const [productList, SetProductList] = useState([]);
  const [cartData, setCartData] = useContext(cartContext);
  const [openCart, setOpenCart] = useContext(openCartContext);
  const [priceSlot, setPriceSlote] = useState([]);
  const [priceIndex, setPriceIndex] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState({});
  const [Favorite, setFavorite] = useContext(favoriteProductContext);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = React.useState(false);
  const [availableQty, setAvailableQty] = React.useState(0);

  useEffect(() => {
    if (router?.query?.id) {
      getProductById();
      // getReview()
    }
  }, [router?.query?.id]);

  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
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
          f._id === productsId?._id &&
          f.price_slot?.value === selectedPrice?.value
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
    if (!productsId || !productsId._id || !selectedPrice?.value) {
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
        f._id === productsId._id && f.price_slot?.value === selectedPrice.value
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
        BarCode: productsId?.BarCode || "",
        total: ourPrice.toFixed(2),
        our_price: ourPrice,
        price_slot: selectedPrice,
        percentageDifference: percentageDifference.toFixed(2),
      };

      const updatedCart = [...cartData, newProduct];
      setCartData(updatedCart);
      localStorage.setItem("addCartDetail", JSON.stringify(updatedCart));
    } else {
      console.log(
        "Product already in cart with this price slot:",
        existingItem
      );
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
        console.log(res.data?.reviews);
        if (router.query.clientSecret) {
          setShowPayment(false);
          createProductRquest();
        }

        setPriceSlote(res?.data?.price_slot);
        setSelectedPrice(res?.data?.price_slot[0]);
      },
      (err) => {
        props.loader(false);
        console.log(err);
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
        console.log(sameItem);
        SetProductList(sameItem);
      },
      (err) => {
        props.loader(false);
        console.log(err);
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
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  // On component mount, retrieve favorites from local storage
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorite(JSON.parse(storedFavorites));
    }
  }, []);

  const cartItem = productsId._id;
  const itemQuantity = cartItem ? cartItem.qty : 0;

  return (
    <div className="bg-white w-full">
      <section className="bg-white w-full md:pt-10 pt-14 md:pb-5 pb-5 ">
        <div className="max-w-7xl  mx-auto w-full md:px-4 px-5">
          <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-5">
            <div className=" p-[10px] rounded-[15px]">
              <Carousel
                className="h-full w-full"
                responsive={responsive}
                autoPlay={false}
                infinite={true}
                arrows={true}
              >
                {selectedImageList?.map((item, i) => (
                  <div key={i} className="bg-white w-full md:h-[446px]">
                    <img className="h-full w-full object-contain" src={item} />
                  </div>
                ))}
              </Carousel>
            </div>
            <div className="flex justify-start items-center w-full">
              <div className="flex flex-col justify-start items-start w-full">
                <div className="flex justify-between items-center w-full">
                  <p className="text-black md:text-[32px] text-2xl font-semibold">
                    {productsId?.name}
                  </p>

                  <div
                    className="w-[46px] h-[46px] bg-custom-offWhite rounded-full flex justify-center items-center cursor-pointer"
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

                <div className="flex text-gray-400 mt-1 mb-1 ">
                  <p className="md:text-[18px] text-[14px]">{t("Home")}</p>
                  <SlArrowRight className="font-bold text-sm md:mt-1.5 mt-1 mr-1 ml-1" />
                  <p className="md:text-[18px] text-[14px]">
                    {productsId?.categoryName}
                  </p>
                  <SlArrowRight className="font-bold text-sm md:mt-1.5 mt-1 mr-1 ml-1" />
                  <p className="md:text-[18px] text-[14px] w-full">
                    {" "}
                    {productsId?.name}{" "}
                  </p>
                </div>
                <div className="pt-5 w-full md:w-[400px] grid md:grid-cols-3 grid-cols-2 gap-5">
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
                            className={`bg-custom-lightPurple cursor-pointer w-full rounded-[8px] border border-custom-darkPurple p-[10px] relative
                                        ${
                                          priceIndex == i
                                            ? "bg-[#FFF5CB]"
                                            : "bg-white"
                                        }
                            `}
                          >
                            {data?.other_price && (
                              <>
                                <img
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

                {/* <div className="pt-3 mt-2 px-4  border-custom-darkPurple">
                  <p className="text-custom-gold font-semibold text-lg">
                    {constant.currency}{(selectedPrice?.our_price)}{" "}
                    {selectedPrice?.other_price && (
                      <span className="text-custom-black text-sm font-normal line-through">
                        {constant.currency}{(selectedPrice?.other_price)}{" "}
                      </span>
                    )}
                    {selectedPrice?.other_price && (
                      <span className="text-sm text-custom-black">
                        {(((selectedPrice?.other_price - selectedPrice?.our_price) / selectedPrice?.other_price) * 100).toFixed(2)}%
                      </span>
                    )}
                  </p>
                </div> */}

                {isInCart ? (
                  <>
                    <div className="flex mt-5">
                      <div
                        className="h-[42px] w-[44px] bg-[#5CB447] cursor-pointer rounded-[8px] rounded-r-none flex justify-center items-center"
                        onClick={handleDecreaseQty}
                      >
                        <IoRemoveSharp className="h-[24px] w-[24px] text-white" />
                      </div>
                      <p className="text-black md:text-xl text-lg font-medium text-center px-3 border-y-2 border-y-gray-200 py-1">
                        {availableQty}
                      </p>
                      <div
                        className="h-[42px] w-[44px] bg-[#5CB447] cursor-pointer rounded-[8px] rounded-l-none flex justify-center items-center"
                        onClick={handleIncreaseQty}
                      >
                        <IoAddSharp className="h-[24px] w-[24px] text-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <button
                    className="bg-[#5CB447] w-[136px] h-[42px] rounded-[8px] text-white font-semibold text-xl md:mt-5 mt-4 py-1"
                    onClick={handleAddToCart}
                  >
                    {t("ADD")}
                  </button>
                )}
                {productsId.isShipmentAvailable ? (
                  <p className="text-black font-normal text-[17px] mt-2">
                    {t("Shipment Delivery is available")}
                  </p>
                ) : (
                  <p className="text-black font-normal text-[17px] mt-2">
                    {t("Shipment Delivery is not available")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full md:my-10 my-5 md:px-16 py-5 px-4">
          <p className="text-black text-xl md:text-2xl font-bold mb-4">
            {t("About Product")}
          </p>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-3 w-full">
            {/* About Product Section */}
            <div className="flex flex-col gap-2 col-span-2">
              <p className="text-black text-base md:text-xl font-medium col-span-2">
                {t("Short Description")}:{" "}
                <span
                  className="text-custom-newGray font-normal
                "
                >
                  {productsId?.short_description}
                </span>
              </p>
            </div>

       
            <div className="md:col-span-2 col-span-2">
              <p className="text-black text-base md:text-xl font-semibold">
                {t("Long Description")}:
              </p>
              <p className="text-black text-base md:text-xl font-normal leading-relaxed">
                {productsId?.long_description}
              </p>
            </div>

            {/* Disclaimer */}
            {productsId?.disclaimer && (
              <div className="md:col-span-2 col-span-2">
                <p className="text-black text-base md:text-xl font-semibold ">
                  {t("Disclaimer")}:
                </p>
                <div
                  className="text-black text-base md:text-xl font-normal leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: productsId?.disclaimer }}
                />
              </div>
            )}

            {/* Warning */}
            {productsId?.Warning && (
              <div className="md:col-span-2 col-span-2">
                <p className="text-black text-base md:text-xl font-semibold">
                  {t("Warning")}:
                </p>
                <div
                  className="text-black text-base md:text-xl font-normal leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: productsId?.Warning }}
                />
              </div>
            )}

            {/* Return Policy */}
            {productsId?.ReturnPolicy && (
              <div className="md:col-span-2 col-span-2">
                <p className="text-black text-base md:text-xl font-semibold">
                  {t("Return Policy")}:
                </p>
                <div
                  className="text-black text-base md:text-xl font-normal leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: productsId?.ReturnPolicy }}
                />
              </div>
            )}
          </div>
        </div>

        {productReviews && (
          <div className=" max-w-7xl md:ms-14 mx-4">
            <p className="text-black text-xl font-bold mb-5">{t("Reviews")}</p>
            <div className="w-full">
              <div className="grid sm:grid-cols-2 grid-cols-1 md:grid-cols-3 gap-4 w-[100%]">
                {productReviews?.map((item, i) => (
                  <div
                    key={i}
                    className="border-2 black-border p-3 rounded-lg shadow-lg"
                  >
                    <div className="pt-2 flex justify-start items-center">
                      <div className="w-[40px] h-[40px] bg-custom-gold rounded-full flex justify-center items-center">
                        <p className="text-white text-[18px] font-bold">
                          {item?.posted_by?.username?.charAt(0).toUpperCase()}
                        </p>
                      </div>
                      <div className="ml-5">
                        <div className="flex">
                          <p className="text-black font-normal text-[16px]">
                            {item?.posted_by?.username}
                          </p>
                          {/* Add verified buyer badge if needed */}
                          {item?.verified_buyer && (
                            <span className="ml-2 text-green-600 text-xs">
                              ✓ Verified Buyer
                            </span>
                          )}
                        </div>
                        <p className="text-black font-normal text-xs">
                          {moment(item?.createdAt).format("MMM DD, YYYY")}
                        </p>
                      </div>
                    </div>

                    <p className="text-black font-normal text-base pt-5">
                      {item?.description}
                    </p>

                    {/* Image display section */}
                    {item?.images && item?.images?.length > 0 && (
                      <div className="pt-3">
                        {item?.images?.length === 1 ? (
                        
                          <div className="w-full">
                            <img
                              src={item?.images[0]}
                              alt="Review image"
                              className="h-[120px] object-fit rounded-lg"
                            />
                          </div>
                        ) : (
                       
                          <div className="grid grid-cols-2 gap-2">
                            {item?.images?.slice(0, 4).map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={image}
                                  alt={`Review image ${index + 1}`}
                                  className="w-full h-full object-fit rounded-lg"
                                />
                                
                                {index === 3 && item?.images?.length > 4 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                    <span className="text-white text-sm font-semibold">
                                      +{item?.images?.length - 4}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white max-w-8xl mt-8">
          <p className="text-black text-xl font-bold md:mb-5 mb-5 md:mt-0 mt-4 md:ms-12 ms-4">
            {t("Similar Products")}
          </p>
          <div className="grid md:grid-cols-6 lg:grid-cols-7 grid-cols-2 md:gap-2 gap-5 md:mx-8 ms-4">
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

        <div className="bg-white max-w-8xl">
          <p className="text-black text-xl font-bold md:mb-10 mb-5 md:mt-4 mt-4 md:ms-12 ms-4">
            {t("You might also like")}
          </p>
          <div className="grid md:grid-cols-6 lg:grid-cols-7 grid-cols-2 md:gap-2 gap-5 md:mx-8 ms-4">
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

      <section className="w-full ">
        {/* md:pt-10 pt-5 */}
        <ShopFasterMarketplace />
      </section>
    </div>
  );
}

export default ProductDetails;
