
import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { userContext } from "../_app";
import { Api } from "@/services/service";
import Image from "next/image";

const ProductReviews = (props) => {
    const router = useRouter()
    const [user, setuser] = useContext(userContext)
    const [productReviews, setProductReviews] = useState([])
    const { t } = useTranslation()

    useEffect(() => {
        if (router?.query?.id) {
            getProductById()
        }

    }, [])

    const getProductById = async () => {
        let url = `getProductByslug/${router?.query?.id}`;
        if (user?.token) {
            url = `getProductByslug/${router?.query?.id}?user=${user?._id}`;
        }
        props.loader(true);
        Api("get", url, "", router).then(
            (res) => {
                props.loader(false);
                setProductReviews(res.data?.reviews)
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    return (
        <>
            {productReviews.length > 0 && (
                <div className="max-w-7xl mx-auto mt-10 min-h-screen">
                    <p className="text-black text-xl font-bold mb-5 ">{t("All Reviews")}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
                        {productReviews.map((item, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg shadow-md p-4 bg-white flex flex-col justify-between">
                                {/* User Info */}
                                <div className="flex items-center mb-4">
                                    <div className="w-[40px] h-[40px] bg-custom-gold rounded-full flex justify-center items-center">
                                        <p className="text-white text-[18px] font-bold">
                                            {item?.posted_by?.username?.charAt(0).toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-black font-medium text-[16px]">
                                            {item?.posted_by?.username}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                            {moment(item?.createdAt).format("MMM DD, YYYY")}
                                        </p>
                                    </div>
                                </div>

                                {/* Review Description */}
                                <p className="text-gray-800 text-sm mb-3 line-clamp-4">{item?.description}</p>

                                {/* Images */}
                                {item?.images && item?.images.length > 0 && (
                                    <div>
                                        {item.images.length === 1 ? (
                                            <div className="w-full">
                                                <Image
                                                    width={100}
                                                    height={100}
                                                    src={item.images[0]}
                                                    alt="Review image"
                                                    className="h-[180px] w-full object-contain rounded-lg"
                                                />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                {item.images.slice(0, 2).map((image, index) => (
                                                    <div key={index} className="relative">
                                                        <Image
                                                            width={100}
                                                            height={100}
                                                            src={image}
                                                            alt={`Review image ${index + 1}`}
                                                            className="w-full h-[180px] object-cover rounded-md"
                                                        />
                                                        {index === 1 && item.images.length > 2 && (
                                                            <div className="absolute inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center rounded-md">
                                                                <span className="text-white text-sm font-semibold">
                                                                    +{item.images.length - 2}
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
            )}

        </>
    );
};

export default ProductReviews;

