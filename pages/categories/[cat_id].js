import React, { useEffect, useState } from 'react'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Api } from '@/services/service';
import { useRouter } from 'next/router';
import FormControl from '@mui/material/FormControl';
import { FaCircleChevronDown } from "react-icons/fa6";
import { FaCircleChevronUp } from "react-icons/fa6";
import GroceryCatories from '@/components/GroceryCatories';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoFilterSharp } from "react-icons/io5";
import Drawer from '@mui/material/Drawer';

const sortByData = [
    {
        name: 'Featured',
        value: 'featured'
    },
    {
        name: 'Best selling',
        value: 'is_top'
    },
    {
        name: 'Alphabetically, A-Z',
        value: 'a_z'
    },
    {
        name: 'Alphabetically, Z-A',
        value: 'z_a'
    },
    {
        name: 'Price, low to high',
        value: 'low'
    },
    {
        name: 'Price, high to low',
        value: 'high'
    },
    {
        name: 'Date, old to new',
        value: 'old'
    },
    {
        name: 'Date, new to old',
        value: 'new'
    },
]

function Categories(props) {
    const router = useRouter()
    console.log(router)
    const [productList, SetProductList] = useState([])
    const [category, setCategory] = useState({})
    const [categoryList, SetCategoryList] = useState([])
    const [selectedCategories, setSelectedCategories] = useState('')
    const [selectedSortBy, setSelectedSortBy] = useState('')
    const [openData, setOpenData] = useState(true);
    const [openCategory, setOpenCategory] = useState(true)
    const [open, setOpen] = useState(false);

    const [paginationData, setPaginationData] = useState({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        itemsPerPage: 12
    });

    useEffect(() => {
        // if (category?._id) {
        getproductByCategory(router?.query?.cat_id)
        setSelectedCategories(router?.query?.cat_id)
        // }
    }, [router])

    useEffect(() => {
        getCategory()
    }, [])


    useEffect(() => {
        if (selectedCategories) {
            getproductByCategory(selectedCategories)
        }
    }, [selectedSortBy])

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

    const getproductByCategory = async (cat, page = 1, limit = 12) => {
        props.loader(true);
        // setCategoryLoading(true);
        let url = `getProductBycategoryId?page=${page}&limit=${limit}`;

        if (cat) {
            url += `&category=${cat}`;
        }

        if (selectedSortBy) {
            url += `&sort_by=${selectedSortBy}`;
        }

        Api("get", url, "", router).then((res) => {
            props.loader(false);
            //   setCategoryLoading(false);
            console.log("res================>", res);
            SetProductList(res.data);
            setPaginationData(res.pagination);
        }, (err) => {
            props.loader(false);
            setCategoryLoading(false);
            console.log(err);
            props.toaster({ type: "error", message: err?.message });
        });
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > paginationData.totalPages) return;
        getproductByCategory(selectedCategories, newPage, paginationData.itemsPerPage);
    };

    return (
        <div className="bg-white w-full min-h-screen">
            <section className="bg-white w-full  relative flex flex-col justify-center items-center">
                <div className="max-w-7xl mx-auto w-full md:px-0 px-5 md:pt-5 pt-5 md:pb-10 pb-0">
                    <div className="flex justify-center flex-col items-center mt-2" > <h1 className="text-center text-[20px] md:text-2xl font-bold mb-2 mt-2 text-black">Popular Products</h1>
                        <p className="text-center w-full text-[13px] md:text-[16px] md:w-[50%] text-gray-500 mb-6 mt-2 italic">
                            Loarn Ipsum is simply dummy text of the printing and typesetting industry. Loarn Ipsum has been the industry's standard dummy.
                        </p>
                    </div>

                    <div className='grid md:grid-cols-5 grid-cols-1 w-full md:gap-5'>

                        <div className='bg-custom-green md:flex hidden flex-col w-full px-5 py-5'>
                            <div className='border-b border-custom-gray'>
                                <div className='flex justify-between items-center w-full  pb-5'>
                                    <p className='text-white font-semibold text-lg'>Sort By</p>
                                    {!openData && <FaCircleChevronDown className='text-xl text-white'
                                        onClick={() => { setOpenData(true); }} />}
                                    {openData && < FaCircleChevronUp className='text-xl text-white'
                                        onClick={() => setOpenData(false)} />}
                                </div>
                                {openData && <FormControl className=''>
                                    <FormGroup className='flex flex-col' >
                                        {sortByData.map((item, i) => (<FormControlLabel className='text-white' key={i}
                                            control={
                                                <Checkbox onChange={() => {
                                                    if (selectedSortBy === item?.value) {
                                                        setSelectedSortBy('')
                                                    } else {
                                                        setSelectedSortBy(item?.value)
                                                    }
                                                }}
                                                    checked={item?.value === selectedSortBy}
                                                />}
                                            label={item?.name} />))}
                                    </FormGroup>
                                </FormControl>}
                            </div>

                            <div className='pt-5'>
                                <div className='flex justify-between items-center w-full  pb-5'>
                                    <p className='text-white font-semibold text-lg'>Categories</p>
                                    {!openCategory && <FaCircleChevronDown className='text-xl text-white cursor-pointer' onClick={() => { setOpenCategory(true); }} />}
                                    {openCategory && < FaCircleChevronUp className='text-xl text-white cursor-pointer' onClick={() => setOpenCategory(false)} />}
                                </div>

                                {openCategory && <FormGroup>
                                    {
                                        categoryList.map((item, i) => (
                                            <FormControlLabel className='text-white'
                                                key={i} control={<Checkbox
                                                    onChange={() => {
                                                        router.replace(`/categories/${item.slug}`)
                                                        setSelectedCategories(item?.slug)
                                                    }}
                                                    checked={item.slug === selectedCategories}
                                                />} label={item?.name} />
                                        ))}
                                </FormGroup>}
                            </div>
                        </div>

                        <div className="md:hidden col-span-1 flex -pt-8">
                            <button className="flex-row py-1 flex justify-between gap-48 mx-2">
                                <p className="text-black text-[20px]">
                                    Categories
                                </p>
                                <IoFilterSharp className="text-black text-3xl" onClick={() => setOpen(true)} />
                            </button>
                        </div>
                        <Drawer anchor='right' open={open} onClose={() => setOpen(false)}>
                            <div className='bg-custom-green w-[250px] h-full px-5 py-5 md:hidden block md:col-span-1'>
                                <div className='border-b border-custom-gray'>
                                    <div className='flex justify-between items-center w-full  pb-5'>
                                        <p className='text-black font-semibold text-lg'>Sort By</p>
                                        {!openData && <FaCircleChevronDown className='text-lg text-white'
                                            onClick={() => { setOpenData(true); }} />}
                                        {openData && < FaCircleChevronUp className='text-lg text-white'
                                            onClick={() => setOpenData(false)} />}
                                    </div>
                                    {openData && <FormControl className=''>
                                        <FormGroup className='flex flex-col' >
                                            {sortByData.map((item, i) => (<FormControlLabel className='text-white' key={i}
                                                control={
                                                    <Checkbox className="text-white" onChange={() => {
                                                        if (selectedSortBy === item?.value) {
                                                            setSelectedSortBy('')
                                                        } else {
                                                            setOpen(false)
                                                            setSelectedSortBy(item?.value)
                                                        }
                                                    }}
                                                        checked={item?.value === selectedSortBy}
                                                    />}
                                                label={item?.name} />))}
                                        </FormGroup>
                                    </FormControl>}
                                </div>

                                <div className='pt-5'>
                                    <div className='flex justify-between items-center w-full  pb-5'>
                                        <p className='text-white font-semibold text-lg'>Categories</p>
                                        {!openCategory && <FaCircleChevronDown className='text-lg text-white cursor-pointer' onClick={() => { setOpenCategory(true); }} />}
                                        {openCategory && < FaCircleChevronUp className='text-lg text-white  cursor-pointer' onClick={() => setOpenCategory(false)} />}
                                    </div>

                                    {openCategory && <FormGroup>
                                        {
                                            categoryList.map((item, i) => (
                                                <FormControlLabel className='text-white'
                                                    key={i} control={
                                                        <Checkbox className="text-white"
                                                            onChange={() => {
                                                                router.replace(`/categories/${item.slug}`)
                                                                setSelectedCategories(item?.slug)
                                                            }}
                                                            checked={item.slug === selectedCategories}
                                                        />} label={item?.name} />
                                            ))}
                                    </FormGroup>}
                                </div>
                            </div>
                        </Drawer>
                        <div className='col-span-4 md:mt-0 mt-8 '>
                            <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2  mb-6 space-x-2  justify-between">
                                {productList.length > 0 ? (
                                    productList.map((item, i) => (
                                        <div key={i} className='p-1 w-full md:mb-5 mb-2'>
                                            <GroceryCatories
                                                loader={props.loader}
                                                toaster={props.toaster}
                                                item={item} i={i} url={`/product-details/${item?.slug}`} />
                                        </div>
                                    ))
                                ) : (
                                    <div className='flex justify-center items-center h-[500px] md:h-[400px] col-span-4 '>
                                        <p className='text-black text-center font-semibold text-xl'>No products available in this category.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-span-5 w-full flex justify-center mt-8 mb-8">
                            {productList?.length > 0 && paginationData?.totalPages > 1 && (
                                <div className="flex items-center space-x-2">
                                    {/* Previous button */}
                                    <button
                                        onClick={() => handlePageChange(paginationData.currentPage - 1)}
                                        disabled={paginationData.currentPage === 1}
                                        className={`px-3.5 py-3 rounded-md ${paginationData.currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-custom-gold text-white '}`}
                                    >
                                        <FaChevronLeft />
                                    </button>


                                    {Array.from({ length: Math.min(5, paginationData.totalPages) }).map((_, idx) => {

                                        let pageNum;
                                        if (paginationData.totalPages <= 5) {
                                            pageNum = idx + 1;
                                        } else if (paginationData.currentPage <= 3) {
                                            pageNum = idx + 1;
                                        } else if (paginationData.currentPage >= paginationData.totalPages - 2) {
                                            pageNum = paginationData.totalPages - 4 + idx;
                                        } else {
                                            pageNum = paginationData.currentPage - 2 + idx;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-md ${pageNum === paginationData.currentPage ? 'bg-custom-gold text-black' : 'text-black bg-gray-200'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    {/* Next button */}
                                    <button
                                        onClick={() => handlePageChange(paginationData.currentPage + 1)}
                                        disabled={paginationData.currentPage === paginationData.totalPages}
                                        className={`px-3.5 py-3 rounded-md ${paginationData.currentPage === paginationData?.totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-custom-gold text-white'}`}
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </section>

        </div>
    )
}

export default Categories
