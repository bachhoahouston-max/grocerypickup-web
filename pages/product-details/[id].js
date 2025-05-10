import GroceryCategories from "@/components/GroceryCatories";
import ShopFasterMarketplace from "@/components/ShopFasterMarketplace";
import React, { useContext, useEffect, useState } from "react";
import { IoRemoveSharp } from "react-icons/io5";
import { IoAddSharp } from "react-icons/io5";
import { useRouter } from "next/router";
import { cartContext, openCartContext, userContext, favoriteProductContext } from "../_app";
import { Api } from "@/services/service";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { produce } from "immer";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
import { SlArrowRight } from "react-icons/sl";
import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import moment from 'moment';
import { useTranslation } from "react-i18next";
import constant from "@/services/constant";
import { RxCross2 } from "react-icons/rx";

function ProductDetails(props) {
  const { t } = useTranslation()
  const router = useRouter();
  // console.log(router);
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
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


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
      console.error("Invalid product data or price selection:", productsId, selectedPrice);
      return;
    }

    if (productsId.Quantity === 0) {
      props.toaster({ type: "error", message: "This item currently  out of stock. Please choose a different Item" });
      return;
     }

    const existingItem = cartData.find((f) =>
      f._id === productsId._id && f.price_slot?.value === selectedPrice.value
    );

    const price = parseFloat(selectedPrice?.our_price);

    const ourPrice = parseFloat(
      (selectedPrice?.our_price)
    );
    const percentageDifference = price && ourPrice ? ((price - ourPrice) / price) * 100 : 0;

    if (!existingItem) {
      const newProduct = {
        ...productsId,
        selectedColor: productsId.selectedColor || productsId.varients?.[0] || {},
        selectedImage: productsId.selectedImage || productsId.varients?.[0]?.image?.[0] || "",
        qty: 1,
        total: ourPrice.toFixed(2),
        our_price: ourPrice,
        price_slot: selectedPrice,
        percentageDifference: percentageDifference.toFixed(2),
      };

      const updatedCart = [...cartData, newProduct];
      setCartData(updatedCart);
      localStorage.setItem("addCartDetail", JSON.stringify(updatedCart));
      console.log("Product added to cart:", newProduct);
    } else {
      console.log("Product already in cart with this price slot:", existingItem);
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
      const existingItem = draft.find((item) =>
        item._id === productsId._id && item.price_slot.value === selectedPrice.value
      );

      if (existingItem) {
        if (existingItem.qty > 1) {
          existingItem.qty -= 1;
          existingItem.total = (parseFloat(existingItem.price_slot?.our_price) * existingItem.qty);
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


  const handleIndex = (index) => {
    setPriceIndex(index);
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
        console.log("res================>", res);
        res.data.qty = 1;
        res.data.total = (res.data?.our_price * res.data.qty).toFixed(2);
        setProductsId(res.data);
        console.log(res?.data?.minQuantity);

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
        setSelectedPrice(res?.data?.price_slot[0])
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const checkAvailability = async () => {
    if (!pincode) {
      setMessage("Please enter a pincode.");
      return;
    }
    // setLoading(true);
    setMessage("");
    props.loader(true);
    Api("post", "checkAvailable", { pincode }, router).then(
      (res) => {
        props.loader(false);
        console.log(res.data)
        console.log(res)
        if (res.available) {
          props.toaster({ type: "error", message: "Delivery is available!" });
          setMessage("✅ Delivery is available in this Zipcode.");
        } else {
          props.toaster({ type: "error", message: "Delivery is not available" });
          setMessage("❌ Delivery is not available in this Zipcode.");
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        setMessage('Error checking availability.');
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

    console.log(data);
    props.loader(true);
    Api("post", "addremovefavourite", data, router).then(
      (res) => {
        props.loader(false);
        if (res.status) {
          if (isFavorite) {
            props.toaster({ type: "success", message: res.data?.message });
            setFavorite((prevFavorites) => {
              const updatedFavorites = prevFavorites.filter(fav => fav._id !== productsId._id);
              localStorage.setItem('favorites', JSON.stringify(updatedFavorites)); // Save to local storage
              return updatedFavorites;
            });
          } else {
            setFavorite((prevFavorites) => {
              const updatedFavorites = [...prevFavorites, productsId];
              localStorage.setItem('favorites', JSON.stringify(updatedFavorites)); // Save to local storage
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
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorite(JSON.parse(storedFavorites));
    }
  }, []);

  const cartItem = productsId._id
  const itemQuantity = cartItem ? cartItem.qty : 0;
  console.log("", itemQuantity)

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

                <div className="flex text-gray-400 mt-1 mb-1 " >
                  <p className="md:text-[18px] text-[14px]">{t("Home")}</p>
                  <SlArrowRight className="font-bold text-sm md:mt-1.5 mt-1 mr-1 ml-1" />
                  <p className="md:text-[18px] text-[14px]">{productsId?.categoryName}</p>
                  <SlArrowRight className="font-bold text-sm md:mt-1.5 mt-1 mr-1 ml-1" />
                  <p className="md:text-[18px] text-[14px]"> {productsId?.name} </p>
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
                                        ${priceIndex == i
                                ? "bg-[#FFF5CB]"
                                : "bg-white"
                              }
                            `}
                          >
                            <img
                              className="w-[70px] h-[60px] object-contain absolute -top-[20px] -right-[18px] "
                              src="/Star.png"
                            />
                            <p className="text-white text-center text-[9px] font-medium absolute -top-[2px] right-[2px]">
                              {percentageDifference?.toFixed(2)}%<br />
                              {t("off")}
                            </p>
                            <p className="text-black font-normal text-base pt-1">
                              {data.value} {data.unit}
                            </p>
                            <p className="text-black font-normal text-base pt-1">

                              {constant.currency}{(data?.our_price)}
                            </p>
                            <p className="text-custom-black font-semibold text-sm pt-2">

                              <span className="text-black font-normal line-through">
                                {constant.currency}{(data?.other_price)}
                              </span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="pt-3 mt-2 px-4  border-custom-darkPurple">
                  <p className="text-custom-gold font-semibold text-lg">
                    {constant.currency}{(selectedPrice?.our_price)}{" "}
                    <span className="text-custom-black text-sm font-normal line-through">
                      {constant.currency}{(selectedPrice?.other_price)}{" "}
                    </span>{" "}
                    <span className="text-sm text-custom-black">

                      {(((selectedPrice?.other_price - selectedPrice?.our_price) / selectedPrice?.other_price) * 100).toFixed(2)}%
                    </span>
                  </p>
                </div>

                {isInCart ? (
                  <>
                    <div className="flex mt-5">
                      <div
                        className="h-[42px] w-[44px] bg-custom-gold cursor-pointer rounded-[8px] rounded-r-none flex justify-center items-center"
                        onClick={handleDecreaseQty}
                      >
                        <IoRemoveSharp className="h-[24px] w-[24px] text-white" />
                      </div>
                      <p className="text-black md:text-xl text-lg font-medium text-center px-3 border-y-2 border-y-gray-200 py-1">
                        {availableQty}
                      </p>
                      <div
                        className="h-[42px] w-[44px] bg-custom-gold cursor-pointer rounded-[8px] rounded-l-none flex justify-center items-center"
                        onClick={handleIncreaseQty}
                      >
                        <IoAddSharp className="h-[24px] w-[24px] text-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <button
                    className="bg-custom-gold w-[136px] h-[42px] rounded-[8px] text-white font-semibold text-xl md:mt-5 mt-4 py-1"
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
                <h3 className="text-black font-normal text-[17px] mt-4 mb-1">
                  {t("Check Delivery Availability")}</h3>

                <div className="grid md:grid-cols-3 grid-cols-3 gap-2 relative w-full md:min-w-sm">
                  <input
                    type="number"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder={t("Enter Zipcode")}
                    className="p-2 border border-gray-300 rounded w-full mb-4 text-black focus:outline-none focus:ring-2 focus:ring-custom-green text-bold md:col-span-2 col-span-2"
                  />
                  {pincode && (
                    <RxCross2 className="absolute right-[155px] top-3 text-black"
                      onClick={() => {
                        setPincode("");
                        setMessage("")
                      }}
                    />
                  )}


                  <button
                    onClick={checkAvailability}
                    // disabled={loading}
                    className='w-full p-2 text-white rounded bg-custom-gold hover:bg-custom-gold  transition duration-200 col-span-1 h-10.5'
                  >
                    {t("Check")}
                  </button>
                </div>
                <div className="mt-1 text-gray-700">{t(message)}</div>

              </div>
            </div>
          </div>
        </div>
        <div className="w-full bg-[#FFF5CB] md:my-10 my-5 md:px-16 py-5 px-4">
          <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-5">
            <div className="flex flex-col justify-start items-start">
              <p className="text-black md:text-2xl text-xl font-bold">
                {t("About Product")}
              </p>
              <p className="text-black font-medium md:text-xl text-base pt-2">
                {t("Short Description")} :{" "}
                <span className="text-custom-newGray font-normal md:text-xl text-base">
                  {productsId?.long_description}
                </span>
              </p>

            </div>
            <div className="flex flex-col justify-start items-start">
              <p className="text-black font-medium md:text-xl text-base">
                {t("Country of Origin")} :{" "}
                <span className="text-custom-newGray font-normal md:text-xl text-base">
                  {productsId?.origin}
                </span>
              </p>

              <p className="text-black font-medium md:text-xl text-base pt-2">
                {t("Manufacturer Name")} :{" "}
                <span className="text-custom-newGray font-normal md:text-xl text-base">
                  {productsId?.manufacturername}
                </span>
              </p>
              <p className="text-black font-medium md:text-xl text-base pt-2">
                {t("Manufacturer Address")} :{" "}
                <span className="text-custom-newGray font-normal md:text-xl text-base">
                  {productsId?.manufactureradd}
                </span>
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-black font-semibold md:text-xl text-base pt-1">
                {t("Long Description")} :
              </p>
              <span
                className="text-black font-normal md:text-xl text-base">
                {productsId?.long_description}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-black font-semibold md:text-xl text-base pt-1">
                {t("Disclaimer")} :
              </p>
              <span
                className="text-black font-normal md:text-xl text-base"
                dangerouslySetInnerHTML={{ __html: productsId?.disclaimer }}
              />
            </div>
            <div className="col-span-2">
              <p className="text-black font-semibold md:text-xl text-base pt-1">
                {t("Warning")} :
              </p>
              <span
                className="text-black font-normal md:text-xl text-base"
                dangerouslySetInnerHTML={{ __html: productsId?.Warning }}
              />
            </div>
            <div className="col-span-2">
              <p className="text-black font-semibold md:text-xl text-base pt-1">
                {t("Return Policy")} :
              </p>
              <span
                className="text-black font-normal md:text-xl text-base"
                dangerouslySetInnerHTML={{ __html: productsId?.ReturnPolicy }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white w-full md:pt-10 md:pb-10 pb-5 max-w-7xl md:ms-12 ms-4">
          <p className="text-black text-xl font-bold md:mb-10 mb-5">
            {t("Similar Products")}
          </p>
          <div className="grid md:grid-cols-5 grid-cols-2 md:gap-2 gap-5">
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

        <div className="bg-white  max-w-7xl">
          <p className="text-black text-xl font-bold md:mb-10 mb-5 md:mt-0 mt-4 md:ms-12 ms-4">
            {t("You might also like")}
          </p>
          <div className="grid md:grid-cols-5 grid-cols-2 md:gap-2 gap-5 md:ms-14 ms-4">
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

        {productsId?.reviews && (
          <div className='pt-5 max-w-7xl md:ms-14 ms-4'>
            <p className='text-black text-xl font-bold'>{t("Ratings & Reviews")}</p>
            <div className='w-full'>

              <p className='text-black  mb-2 mt-2 font-bold md:text-2xl text-base'>
                {productsId?.rating || "4"}
                <span className='text-black font-normal md:text-base text-xs'>{" / 5 "}</span>
              </p>

              {/* Reviews Grid Layout */}

              <div className="grid sm:grid-cols-2 grid-cols-1 md:grid-cols-4 gap-4 md:w-full w-[320px] ">
                {productReviews?.map((item, i) => (
                  <div key={i} className='border-2 black-border p-3 rounded-lg shadow-lg'>
                    <div className='pt-2 flex justify-start items-center'>
                      <div className='w-[40px] h-[40px] bg-custom-gold rounded-full flex justify-center items-center'>
                        <p className='text-white text-[18px] font-bold'>{item?.posted_by?.username?.charAt(0).toUpperCase()}</p>
                      </div>
                      <div className='ml-5'>
                        <div className='flex'>
                          <p className='text-black font-normal text-[16px]'>{item?.posted_by?.username}</p>
                        </div>
                        <p className='text-black font-normal text-xs'>
                          {moment(item?.createdAt).format("MMM DD, YYYY")}
                        </p>
                      </div>
                    </div>

                    <p className='text-black font-normal text-base pt-5'>{item?.description}</p>

                    <div className='pt-5 flex gap-2'>
                      <Box sx={{ width: 200, display: 'flex', alignItems: 'center' }}>
                        <Rating
                          name="text-feedback"
                          value={item?.rating}
                          readOnly
                          precision={0.5}
                          emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                        />
                        <Box className='text-black' sx={{ ml: 2 }}>{item?.rating}</Box>
                      </Box>
                    </div>
                  </div>
                ))}
              </div>




            </div>
          </div>
        )}

      </section>

      <section className="w-full ">
        {/* md:pt-10 pt-5 */}
        <ShopFasterMarketplace />
      </section>
    </div>
  );
}

export default ProductDetails;
