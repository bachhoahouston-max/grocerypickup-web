import GroceryCategories from "@/components/GroceryCatories";
import ShopFasterMarketplace from "@/components/ShopFasterMarketplace";
import React, { useContext, useEffect, useState } from "react";
import { IoRemoveSharp } from "react-icons/io5";
import { IoAddSharp } from "react-icons/io5";
import { useRouter } from "next/router";
import { cartContext, openCartContext, userContext } from "../_app";
import { Api } from "@/services/service";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { produce } from "immer";
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
import { SlArrowRight } from "react-icons/sl";

function ProductDetails(props) {
  const router = useRouter();
  console.log(router);
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
  console.log(selectedPrice)

  useEffect(() => {
    if (router?.query?.id) {
      getProductById();
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

  console.log("price slot ::", priceSlot);

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
        console.log("res================>", res);
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
        console.log("res================>", res);
        if (res.status) {
          props.toaster({ type: "success", message: res.data?.message });
          getProductById();
        } else {
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

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
                  <p className="text-[18px]">Home</p>
                  <SlArrowRight className="font-bold mt-1.5 ml-1" />
                  <p className="text-[18px]">{productsId?.categoryName}</p>
                  <SlArrowRight className="font-bold mt-1.5 mr-1 ml-1" />
                  <p className="text-[18px]"> {productsId?.name} </p>
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

                            onClick={() => { setSelectedPrice(data); setPriceIndex(i); }}
                            className={`bg-custom-lightPurple cursor-pointer w-full rounded-[8px] border border-custom-darkPurple p-[10px] relative
                                        ${priceIndex == i
                                ? "bg-[#FFF5CB]"
                                : "bg-white"
                              }
                            `}
                          >
                            <img
                              className="w-[70px] h-[60px] object-contain absolute -top-[20px] -right-[18px]"
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
                              ₹{data.our_price}
                            </p>
                            <p className="text-custom-black font-semibold text-sm pt-2">

                              <span className="text-black font-normal line-through">
                                {data?.other_price}
                              </span>
                            </p>
                          </div>


                        </div>
                      );
                    })}
                </div>

                <div className="pt-3 mt-2 px-4  border-custom-darkPurple">
                  <p className="text-custom-gold font-semibold text-lg">
                    ₹{selectedPrice?.our_price}{" "}
                    <span className="text-custom-black text-sm font-normal line-through">
                      {selectedPrice?.other_price}
                    </span>{" "}
                    <span className="text-sm text-custom-black">
                     
                      {(((selectedPrice?.other_price - selectedPrice?.our_price) / selectedPrice?.other_price) * 100).toFixed(2)}%
                    </span>
                  </p>
                </div>



                <div className="bg-custom-offWhite w-[100px] h-[32px] rounded-[8px] md:mt-5 mt-3 flex items-center">
                  <div
                    className="h-[32px] w-[32px] bg-custom-gold cursor-pointer rounded-[8px] rounded-r-none	 flex justify-center items-center"
                    onClick={() => {
                      if (productsId.qty > 1) {
                        productsId.qty = productsId.qty - 1;
                        productsId.total = (
                          priceSlot[priceIndex]?.our_price * productsId.qty
                        ).toFixed(2);
                        setProductsId({ ...productsId });
                      }
                    }}
                  >
                    <IoRemoveSharp className="h-[15px] w-[15px] text-white" />
                  </div>
                  <p className="text-black md:text-xl text-lg font-medium text-center mx-3">
                    {productsId?.qty || 0}
                  </p>
                  <div
                    className="h-[32px] w-[32px] bg-custom-gold cursor-pointer rounded-[8px] rounded-l-none flex justify-center items-center"
                    onClick={() => {
                      productsId.qty = productsId.qty + 1;
                      productsId.total = (
                        parseFloat(priceSlot[priceIndex]?.our_price) * productsId.qty
                      ).toFixed(2);

                      setProductsId({ ...productsId });
                    }}
                  >
                    <IoAddSharp className="h-[15px] w-[15px] text-white" />
                  </div>
                </div>

                {productsId.attributes?.some(
                  (attribute) => attribute.name === "color"
                ) && (
                    <div className="w-full">
                      <p className="text-custom-newBlacks font-semibold text-lg md:pt-5 pt-3 pb-3">
                        Select Colors
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {productsId?.varients?.map((item, i) => (
                          <div
                            key={i}
                            className="md:w-[37px] w-[19px] md:h-[37px] h-[19px] rounded-full flex justify-center items-center border border-black"
                            style={{ background: item?.color }}
                            onClick={() => {
                              item.selected.forEach((ele) => {
                                ele.request = 0;
                              });
                              setSelectedColor(item);
                              setSelectedImageList(item?.image);
                              setSelectedImage(item?.image[0]);
                            }}
                          >
                            {selectedColor?.color === item?.color && (
                              <FaCheck className="md:w-[18px] w-[11px] md:h-[15px] h-[8px] text-white" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <button
                  className="bg-custom-gold w-[96px] h-[32px] rounded-[8px] text-white font-semibold text-xl md:mt-5 mt-4"
                  onClick={() => {
                    const d = cartData?.length > 0 ? cartData : [];
                    // const c = d.find((f) => f._id === productsId?._id);
                    // const c = d.find((f) => f._id === productsId?._id && f.qty === productsId?.qty);
                    const c = d.find((f) => 
                      f._id === productsId?._id && 
                      f.our_price === productsId?.our_price
                  )
                    console.log(c);

                    const price = parseFloat(priceSlot[priceIndex]?.price);
                    const ourPrice = parseFloat(priceSlot[priceIndex]?.our_price);
                    const value = parseFloat(priceSlot[priceIndex]?.value);
                    const unit = parseFloat(priceSlot[priceIndex]?.unit);
                    const percentageDifference = price && ourPrice ? ((price - ourPrice) / price) * 100
                      : 0;

                    if (!c) {
                      const nextState = produce(cartData, (draft) => {
                        draft.push({
                          ...productsId,
                          selectedColor,
                          selectedImage,

                          qty: productsId.qty,
                          total: (parseFloat(ourPrice) * productsId.qty).toFixed(2),
                          our_price: ourPrice,
                          other_price: priceSlot[priceIndex]?.other_price,
                          value: priceSlot[priceIndex]?.value,
                          unit: priceSlot[priceIndex]?.unit,
                          percentageDifference: percentageDifference.toFixed(2),

                        });

                      });
                      console.log("next state ::", nextState);
                      setCartData(nextState);
                      localStorage.setItem("addCartDetail", JSON.stringify(nextState));
                    }
                    else {
                      const nextState = produce(cartData, (draft) => {
                        // const existingItem = draft.find((item) => item._id === c._id);
                        // const existingItem = draft.find((item) => item._id === c._id && item.qty === c.qty);
                        const existingItem = draft.find((item) => 
                          item._id === c._id && 
                          item.our_price === c.our_price
                      );
                      
                        existingItem.qty += productsId.qty;
                        
                        existingItem.total = (parseFloat(existingItem.our_price) * existingItem.qty).toFixed(2);
                      });
                      setCartData(nextState);
                      localStorage.setItem("addCartDetail", JSON.stringify(nextState));
                      // router.push('/cart')
                    }
                    setOpenCart(true);
                  }}
                >
                  ADD
                </button>
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
          <div className="grid md:grid-cols-5 grid-cols-1 md:gap-0 gap-5">
            {productList.map((item, i) => (
              <div key={i} className="w-full md:mb-5">
                <GroceryCategories
                  item={item}
                  i={i}
                  url={`/product-details/${item?.slug}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white  max-w-7xl">
          <p className="text-black text-xl font-bold md:mb-10 mb-5 md:ms-12 ms-4">
            You might also like
          </p>
          <div className="grid md:grid-cols-5 grid-cols-1 md:gap-0 gap-5">
            {productList.map((item, i) => (
              <div key={i} className="w-full md:mb-5">
                <GroceryCategories
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
