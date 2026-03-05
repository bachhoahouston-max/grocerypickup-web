import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import GroceryCatories from "./GroceryCatories";

const { Api } = require("@/services/service");
const { useEffect, useState } = require("react");

const BestSeller = (props) => {
    const router = useRouter();
    const { t } = useTranslation();

    const [category, setCategory] = useState([]);
    const [productList, setProductList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true); // ✅ New state
    const dataLenght = 6

    useEffect(() => {
        // async function fetchData() {
        //     const cat = await Api("get", "getCategory", null, router);
        //     setCategory(cat.data || []);
        //     fetchProductsByCategory(1, true);
        // }
        // fetchData();
        fetchProductsByCategory()
    }, []);

    const fetchProducts = async (pageNum, reset = false) => {
        try {
            setLoadingMore(true);
            const res = await Api(
                "get",
                `getBestSoldProduct`,
                null,
                router
            );

            if (res?.data) {
                if (res.data.length === 0 || res.data.length < dataLenght) {
                    setHasMore(false);
                }
                setPage(pageNum);
                setProductList((prev) => (reset ? res.data : [...prev, ...res.data]));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMore(false);
        }
    };

    const fetchProductsByCategory = async (
        categoryId,
        pageNum = 1,
        limit = 7
    ) => {
        try {
            setLoadingMore(true);
            const res = await Api(
                "get",
                `getBestSoldProduct?page=${pageNum}&limit=${dataLenght}`,
                "",
                router
            );

            if (res?.data && Array.isArray(res.data)) {
                if (res.data.length === 0 || res.data.length < dataLenght) {
                    setHasMore(false);
                }

                setProductList((prev) =>
                    pageNum === 1 ? res.data : [...prev, ...res.data]
                );
            }
        } catch (err) {
            console.error(err);
            props.toaster({ type: "error", message: err?.message });
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loadingMore && hasMore) {
                setPage((prev) => prev + 1);
            }
        });

        const loader = document.querySelector("#infinite-loader");
        if (loader) observer.observe(loader);

        return () => observer.disconnect();
    }, [hasMore, loadingMore]);

    // useEffect(() => {
    //     if (page > 1) {
    //         if (selectedCategory === "all") {
    //             fetchProducts(page);
    //         } else {
    //             fetchProductsByCategory(selectedCategory, page);
    //         }
    //     }
    // }, [page]);

    const handleCategoryClickAll = () => {
        setSelectedCategory("all");
        setPage(1);
        setHasMore(true);
        fetchProducts(1, true);
    };

    const handleCategoryClick = (id) => {
        setSelectedCategory(id);
        setPage(1);
        setHasMore(true);
        fetchProductsByCategory(id, 1);
    };



    return (
        <div className="flex flex-col relative">

            <div className="flex justify-between md:mt-10 ">
                <h1 className="text-[20px] md:text-2xl font-bold mb-4  text-[#2E7D32]">
                    {/* {t("Best Sellers")} */}
                    ⭐ {t("BHH Favorites")}
                </h1>

            </div>


            <div className="grid md:grid-cols-6 lg:grid-cols-6 grid-cols-2 gap-2 mx-auto w-full">
                {productList.length > 0 ? (
                    productList.map((item, i) => (
                        <GroceryCatories
                            loader={props.loader}
                            toaster={props.toaster}
                            key={i}
                            item={item}
                            i={i}
                            url={`/product-details/${item?.slug}`}
                        />
                    ))
                ) : (
                    <div className="col-span-6 flex justify-center text-[16px] text-gray-500 min-h-[200px]">
                        {t("No products available")}.
                    </div>
                )}
            </div>

            {/* <div
                id="infinite-loader"
                className="text-center py-6 flex justify-center"
            >
                {loadingMore && (
                    <Loader2 className="text-custom-green animate-spin w-8 h-8" />
                )}
            </div> */}
        </div>
    );
}

export default BestSeller;