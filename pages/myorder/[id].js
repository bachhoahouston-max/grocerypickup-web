import React, { useEffect, useState } from 'react';
import { MdOutlineShoppingCart } from "react-icons/md";
import { useRouter } from "next/router";
import { Api } from '@/services/service';
import "react-multi-carousel/lib/styles.css";
import moment from 'moment';
import Carousel from "react-multi-carousel";

export default function MyOrder(props) {
    const router = useRouter();
    const [productsId, setProductsId] = useState({});
    const [ordersData, setOrdersData] = useState([]);
    const [selectedImageList, setSelectedImageList] = useState([]);
    const { id, productDetailId } = router.query;
    const[userAddress,setUserAddress] = useState([]);

    useEffect(() => {
        if (router.isReady && id) {
            getProductById(id);
        }
    }, [router.isReady, id]);

    const responsive = {
        superLargeDesktop: {
            // the naming can be any, depends on you.
            breakpoint: { max: 4000, min: 3000 },
            items: 1
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 1
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1
        }
    };


    const getProductById = async (productId) => {
        try {
            props.loader(true);
            const res = await Api("get", `/getProductRequest/${productId}`, "", router);
            props.loader(false);
            setOrdersData(res.data)
           
            const d = res.data.productDetail.find(f => f._id === router?.query?.product_id)
            setProductsId(d);
            setSelectedImageList(d?.image)
            const address = res.data.shipping_address
            console.log("addresss=>-----------",address);
            
            setUserAddress(address)  

        } catch (err) {
            props.loader(false);
            props.toaster({ type: "error", message: err?.message });
        }
    };


    const imageOnError = (event) => {
        event.currentTarget.src = '/default-product-image.png';
    };

    return (
        <div className="bg-white w-full">
                <section className="bg-white w-full  relative flex flex-col justify-center items-center">
                    <div className="md:px-10 mx-auto w-full  px-5 md:pt-10 pt-5 md:pb-10 pb-5 mb-6">

                        <div className="grid md:grid-cols-2 grid-cols-1 w-full md:gap-0 gap-5">
                            <div className='w-full'>
                                <div className='border border-black p-[10px] rounded-[15px]'>
                                <Carousel className="h-full w-full"
                                responsive={responsive}
                                autoPlay={false}
                                infinite={true}
                                arrows={true}>
                                {selectedImageList?.map((item, i) => (<div key={i} className='bg-white w-full md:h-[446px]'>
                                <img className='h-full w-full object-contain' src={item} />
                                </div>))}
                            </Carousel>
                    </div>
                                 
                            </div>
                            <div className='flex flex-col justify-start items-start md:px-20 px-0 md:pt-5 md:pb-5'>
                                <p className='text-black md:text-3xl md:leading-[40px] text-base font-normal md:pt-0 pt-0'>{productsId?.product?.name}</p>
                                <p className='text-black text-xl font-normal md:pt-5 pt-3'>€{ productsId?.price}</p>
                                {productsId?.color && <div className='flex justify-start items-center pt-[6px] mt-2'>
                                    <p className='text-black text-base font-normal'>{("Colour")}: <span className='font-bold'>{productsId?.color}</span></p>
                                </div>}
                                <div className='flex flex-col justify-start items-start'>
                                    <p className='text-black text-base font-normal md:mt-5 mt-3 '>{("Qty")}: <span className='font-bold'>{productsId?.qty || 0}</span></p>
                                    {productsId?.vat && <p className='text-black text-base font-normal md:mt-5 mt-3 '>{("VAT")}: <span className='font-bold'>{productsId?.vat}</span></p>}
                                    
                                    <p className='text-black text-base font-normal md:pt-5 pt-3'>{("Order Date")}: <span className='font-bold'>{moment(new Date(ordersData?.createdAt)).format('DD MMM YYYY')}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className='w-full mt-8
                        '>
                            <p className='text-black font-bold text-2xl md:mb-0 mb-2 md:mt-0 mt-5'>{("Shipping Address")}</p>
                            <div className='grid grid-cols-2 w-full  justify-center items-center'>
                                <p className='text-black text-base font-normal md:pt-5 pt-3'>{("First Name")}</p>
                                <p className='text-black text-base font-normal md:pt-5 pt-3'>{userAddress?.firstName}</p>
                                <p className='text-black text-base font-normal md:pt-5 pt-3'>{("Address")}</p>
                                <p className='text-black text-base font-normal md:pt-5 pt-3'>{userAddress?.address}</p>
                                <p className='text-black text-base font-normal md:pt-5 pt-3'>{("Pin Code")}</p>
                                <p className='text-black text-base font-normal md:pt-5 pt-3'>{userAddress?.pinCode}</p>
                                <p className='text-black text-base font-normal md:pt-5 pt-3'>{("Phone Number")}</p>
                                <p className='text-black text-base font-normal md:pt-5 pt-3'>{userAddress?.phoneNumber}</p>
                                <p className='text-black text-base font-normal md:pt-5 pt-3'>{("City")}</p>
                                <p className='text-black text-base font-normal md:pt-5 pt-3'>{userAddress?.city}</p>
                                <p className='text-black text-base font-normal md:pt-5 pt-3'>{("Country")}</p>
                                <p className='text-black text-base font-normal md:pt-5 pt-3'>{userAddress?.country}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
    )
}
