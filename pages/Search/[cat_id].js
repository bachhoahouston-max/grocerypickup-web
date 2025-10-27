import GroceryCatories from '@/components/GroceryCatories';
import React, { useEffect, useState } from 'react'
import { Api } from '@/services/service';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { SearchX } from 'lucide-react';

function Search(props) {
    const router = useRouter()
    const { t } = useTranslation()
    const [productList, SetProductList] = useState([])
    const [category, setCategory] = useState({})
    const [categoryList, SetCategoryList] = useState([])
    const [selectedCategories, setSelectedCategories] = useState('')
    const [selectedSortBy, setSelectedSortBy] = useState('')

    useEffect(() => {
        if (router?.query?.cat_id) {
            productsearch(router?.query?.cat_id)
        }
    }, [router])

    useEffect(() => {
        getCategory()
    }, [])


    useEffect(() => {
        if (selectedCategories) {
            productsearch(router?.query?.cat_id, selectedCategories)
        }
    }, [selectedSortBy, selectedCategories])

    const productsearch = async (text, cat) => {
        let parmas = {}
        let url = `productsearch?key=${text}`

        if (cat) {
            parmas.category = cat
        }
        if (selectedSortBy) {
            parmas.sort_by = selectedSortBy
        }

        Api("get", url, "", router, parmas).then(
            (res) => {
                props.loader(false);
                SetProductList(res.data)
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    const getCategory = async (cat) => {
        props.loader(true);
        Api("get", "getCategory", "", router).then(
            (res) => {
                props.loader(false);
                res.data.push({
                    name: 'All',
                    slug: 'all'
                })
                SetCategoryList(res.data);

            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    return (
        <div className="bg-white w-full min-h-screen">
            <section className="bg-white w-full flex flex-col justify-center items-center">
                <div className="md:px-16 mx-auto w-full px-2 md:mt-10 mt-10 md:pb-10 pb-5">
                    <p className='text-black font-bold text-[20px] md:text-[24px] mb-5 md:mt-0 mt-2'>{t("Search Result")} </p>
                    <div className='grid sm:grid-cols-3 lg:grid-cols-4 grid-cols-2 w-full md:gap-2 gap-2'>
                        {productList.map((item, i) => (
                            <div key={i} className='w-full'>
                                <GroceryCatories
                                    {...props}
                                    item={item}
                                    i={i}
                                    url={`/product-details/${item?.slug}`} />
                            </div>))}
                    </div>
           
                    {productList?.length === 0 && (
                        <div className="flex flex-col justify-center items-center h-[500px] space-y-4 text-center">
                            <div className="bg-gray-100 p-6 rounded-full flex items-center justify-center">
                                <SearchX className="w-12 h-12 text-gray-500" />
                            </div>

                            <h2 className="text-2xl font-semibold text-gray-800">
                                {t("No Products Found")}
                            </h2>

                            <p className="text-gray-500 max-w-md">
                                {t("Try searching with different keywords or explore other categories")}
                            </p>

                            <button
                                onClick={() => router.push("/categories/all")} // replace with your desired route
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                            >
                                {t("Browse Products")}
                            </button>
                        </div>
                    )}


                </div>
            </section>

        </div>
    )
}

export default Search
