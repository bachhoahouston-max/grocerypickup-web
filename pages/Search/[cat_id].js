import GroceryCatories from '@/components/GroceryCatories';
import React, { useEffect, useState } from 'react'
import { Api } from '@/services/service';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

function Search(props) {
    const router = useRouter()
    const {t} = useTranslation()
    console.log(router)
    const [productList, SetProductList] = useState([])
    const [category, setCategory] = useState({})
    const [categoryList, SetCategoryList] = useState([])
    const [selectedCategories, setSelectedCategories] = useState('')
    const [selectedSortBy, setSelectedSortBy] = useState('')
    const [openData, setOpenData] = useState(false);
    const [openCategory, setOpenCategory] = useState(false)


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
                console.log("res================>", res);
                SetProductList(res.data)
            },
            (err) => {
                props.loader(false);
                console.log(err);
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    const getCategory = async (cat) => {
        props.loader(true);
        Api("get", "getCategory", "", router).then(
            (res) => {
                props.loader(false);
                console.log("res================>", res);
                res.data.push({
                    name: 'All',
                    slug: 'all'
                })
                SetCategoryList(res.data);

            },
            (err) => {
                props.loader(false);
                console.log(err);
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    return (
        <div className="bg-white w-full min-h-screen">
            <section className="bg-white w-full flex flex-col justify-center items-center">
                <div className="md:px-16 mx-auto w-full px-2 md:pt-10 pt-5 md:pb-10 pb-5">
                    <p className='text-black font-bold text-[16px] md:text-[24px]'>{t("Search Result")} </p>
                    <div className='grid md:grid-cols-5 grid-cols-2 w-full md:gap-2 gap-2'>
                        {productList.map((item, i) => (
                            <div key={i} className='w-full'>
                                <GroceryCatories 
                                {...props} 
                                item={item}
                                 i={i} 
                                 url={`/product-details/${item?.slug}`} />
                            </div>))}
                    </div>
                    {productList?.length === 0 && <p className="text-2xl text-black font-normal text-center flex justify-center items-center h-[500px]">{t("No Products")}</p>}
                   
                </div>
            </section>

        </div>
    )
}

export default Search
