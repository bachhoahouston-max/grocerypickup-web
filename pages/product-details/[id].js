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

function ProductDetails(props) {
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
  // console.log(selectedPrice)

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

    const existingItem = cartData.find((f) =>
      f._id === productsId._id && f.price_slot?.value === selectedPrice.value
    );

    const price = parseFloat(selectedPrice?.our_price * (1 + (productsId?.tax ? productsId.tax / 100 : 0)).toFixed(0));

    const ourPrice = parseFloat(
      (selectedPrice?.our_price * (1 + (productsId?.tax ? productsId.tax / 100 : 0))).toFixed(2)
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
      // Find the existing item in the cart based on product ID and price slot
      const existingItem = draft.find((item) =>
        item._id === productsId._id && item.price_slot.value === selectedPrice.value
      );

      if (existingItem) {
        existingItem.qty += 1; // Increment quantity
        existingItem.total = (parseFloat(existingItem.price_slot?.our_price) * existingItem.qty * (1 + (existingItem.tax ? existingItem.tax / 100 : 0))).toFixed(2);
      } else {
        console.error("Item not found in cart for increasing quantity.");
      }
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
          existingItem.total = (parseFloat(existingItem.price_slot?.our_price) * existingItem.qty * (1 + (existingItem.tax ? existingItem.tax / 100 : 0))).toFixed(2);
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
        <div className="max-w-7xl  mx-auto w-full md:px-0 px-5">
          <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-5">
            <div className="border border-black p-[10px] rounded-[15px]">
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
                  <p className="md:text-[18px] text-[14px]">Home</p>
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
                              src="/Star-1.png"
                            />
                            <p className="text-black text-center text-[9px] font-medium absolute -top-[2px] right-[2px]">
                              {percentageDifference?.toFixed(2)}%<br />
                              off
                            </p>
                            <p className="text-black font-normal text-base pt-1">
                              {data.value} {data.unit}
                            </p>
                            <p className="text-black font-normal text-base pt-1">

                              ${(data?.our_price * (1 + (productsId?.tax ? productsId.tax / 100 : 0))).toFixed(0)}
                            </p>
                            <p className="text-custom-black font-semibold text-sm pt-2">

                              <span className="text-black font-normal line-through">
                                ${(data?.other_price * (1 + (productsId?.tax ? productsId.tax / 100 : 0))).toFixed(0)}
                              </span>
                            </p>
                          </div>


                        </div>
                      );
                    })}
                </div>

                <div className="pt-3 mt-2 px-4  border-custom-darkPurple">
                  <p className="text-custom-gold font-semibold text-lg">
                    ${(selectedPrice?.our_price * (1 + (productsId?.tax ? productsId.tax / 100 : 0))).toFixed(0)}{" "}
                    <span className="text-custom-black text-sm font-normal line-through">
                      {(selectedPrice?.other_price * (1 + (productsId?.tax ? productsId.tax / 100 : 0))).toFixed(0)}{" "}
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
                        className="h-[32px] w-[32px] bg-custom-gold cursor-pointer rounded-[8px] rounded-r-none flex justify-center items-center"
                        onClick={handleDecreaseQty}
                      >
                        <IoRemoveSharp className="h-[16px] w-[16px] text-white" />
                      </div>
                      <p className="text-black md:text-xl text-lg font-medium text-center px-3 border-y-2 border-y-gray-200">
                        {availableQty}
                      </p>
                      <div
                        className="h-[32px] w-[32px] bg-custom-gold cursor-pointer rounded-[8px] rounded-l-none flex justify-center items-center"
                        onClick={handleIncreaseQty}
                      >
                        <IoAddSharp className="h-[16px] w-[16px] text-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <button
                    className="bg-custom-gold w-[96px] h-[32px] rounded-[8px] text-white font-semibold text-xl md:mt-5 mt-4"
                    onClick={handleAddToCart}
                  >
                    ADD
                  </button>
                )}
                {productsId.isShipmentAvailable ? (
                  <p className="text-black font-normal text-[17px] mt-2">
                    Shipment Delivery is available
                  </p>
                ) : (
                  <p className="text-black font-normal text-[17px] mt-2">
                    Shipment Delivery is not available
                  </p>
                )}

                <p className="text-red-500 font-normal text-[17px] mt-1">
                  * Note : Tax is included in this price
                </p>

              </div>
            </div>
          </div>
        </div>
        <div className="w-full bg-[#FFF5CB] md:my-10 my-5 md:px-16 py-5 px-4">
          <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-5">
            <div className="flex flex-col justify-start items-start">
              <p className="text-black md:text-2xl text-xl font-bold">
                About Product
              </p>
              <p className="text-black font-medium md:text-xl text-base pt-2">
                Description :{" "}
                <span className="text-custom-newGray font-normal md:text-xl text-base">
                  {productsId?.long_description}
                </span>
              </p>
            </div>
            <div className="flex flex-col justify-start items-start">
              <p className="text-black font-medium md:text-xl text-base">
                Country of Origin :{" "}
                <span className="text-custom-newGray font-normal md:text-xl text-base">
                  {productsId?.origin}
                </span>
              </p>
              <p className="text-black font-medium md:text-xl text-base pt-2">
                Self Life :{" "}
                <span className="text-custom-newGray font-normal md:text-xl text-base">
                  {productsId?.selflife}
                </span>
              </p>
              <p className="text-black font-medium md:text-xl text-base pt-2">
                Manufacturer Name :{" "}
                <span className="text-custom-newGray font-normal md:text-xl text-base">
                  {productsId?.manufacturername}
                </span>
              </p>
              <p className="text-black font-medium md:text-xl text-base pt-2">
                Manufacturer Address :{" "}
                <span className="text-custom-newGray font-normal md:text-xl text-base">
                  {productsId?.manufactureradd}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white w-full md:pt-10 md:pb-10 pb-5 max-w-7xl md:ms-12 ms-4">
          <p className="text-black text-xl font-bold md:mb-10 mb-5">
            Similar Products
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
            You might also like
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

        {productsId?.rating && (
          <div className='pt-5 max-w-7xl md:ms-14 ms-4'>
            <p className='text-black text-xl font-bold'>{("Ratings & Reviews")}</p>
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
                        <p className='text-black text-[18px] font-bold'>{item?.posted_by?.username?.charAt(0).toUpperCase()}</p>
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
