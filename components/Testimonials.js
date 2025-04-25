import React from 'react';
import { CiStar } from "react-icons/ci";
import { useTranslation } from "react-i18next";

const Testimonials = () => {
     const { t } = useTranslation()
    return (
        <div className="bg-white md:mt-4 mt-12 md:mb-6 mb-12">
            <div className="container mx-auto max-w-7xl md:py-12 py-0">
                <div className="text-center mb-12 flex flex-col items-center justify-center">
                    <h2 className="text-[20px] md:text-[24px] mb-2 font-bold text-black">
                        {t("Great Words From People")}</h2>
                    <p className="text-gray-500 w-11/12 md:w-1/2 text-sm md:text-base text-center italic">
                    {t("Here's what our customers and partners are saying about their experience — from the freshness of our products to the ease of grocery pickup")}.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 place-items-center xl:mx-auto md:mx-10 mx-auto xl:gap-10 md:gap-12 gap-16 pt-8 max-w-7xl">
                    
                    {/* First Testimonial */}
                    <div className="relative bg-[url('/backgound12.png')] bg-cover rounded-lg flex flex-col justify-center items-center h-64 md:h-80 w-80 md:w-[420px]">
                        <img
                            alt="Portrait of Ahmed Saeed"
                            className="absolute top-[-45px] md:left-40 left-32 w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-8"
                            src="https://storage.googleapis.com/a1aa/image/1MdlyNcbY16TApF_cHcFWQMQT3JO1HAK2iiV9QUhqNA.jpg"
                        />
                        <h3 className="text-lg md:text-2xl mt-6 text-black font-semibold">Ahmed Saeed</h3>
                        <p className="text-gray-500 mb-4 text-xs md:text-base">Co Founder</p>
                        <p className="text-gray-600 mb-4 px-6 text-xs md:text-base text-center">
                            {t("The quality and freshness of the groceries are top-notch. I love how easy it is to order and pick up a real time-saver for busy people like me")}
                        </p>
                        <div className="flex justify-center mb-4">
                            <CiStar className="text-yellow-500" />
                            <CiStar className="text-yellow-500" />
                            <CiStar className="text-yellow-500" />
                            <CiStar className="text-yellow-500" />
                            <CiStar className="text-yellow-500" />
                        </div>
                    </div>

                    {/* Second Testimonial */}
                    <div className="relative bg-[url('/backgound12.png')] bg-cover rounded-lg flex flex-col justify-center items-center h-64 md:h-80 w-80 md:w-[420px]">
                        <img
                            alt="Portrait of John Doe"
                            className="absolute top-[-45px] md:left-40 left-32 w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-8"
                            src="https://storage.googleapis.com/a1aa/image/8wI3Cv5Mv_0IebpC_sZ0kyGk6lNq-ZP4mrQHIhWcJZI.jpg"
                        />
                        <h3 className="text-lg md:text-2xl mt-6 text-black font-semibold">John Doe</h3>
                        <p className="text-gray-500 mb-4 text-xs md:text-base">Co Founder</p>
                        <p className="text-gray-600 mb-4 px-6 text-xs md:text-base text-center">
                            {t("This service has changed how I shop. Everything is well-organized, on time, and perfectly packed. Highly recommend to anyone looking for convenience and quality")}
                        </p>
                        <div className="flex justify-center mb-4">
                            <CiStar className="text-yellow-500" />
                            <CiStar className="text-yellow-500" />
                            <CiStar className="text-yellow-500" />
                            <CiStar className="text-yellow-500" />
                            <CiStar className="text-yellow-500" />
                        </div>
                    </div>

                    {/* Third Testimonial */}
                    <div className="relative bg-[url('/backgound12.png')] bg-cover rounded-lg flex flex-col justify-center items-center h-64 md:h-80 w-80 md:w-[420px]">
                        <img
                            alt="Portrait of Jane Smith"
                            className="absolute top-[-45px] md:left-40 left-32 w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-8"
                            src="https://storage.googleapis.com/a1aa/image/1MdlyNcbY16TApF_cHcFWQMQT3JO1HAK2iiV9QUhqNA.jpg"
                        />
                        <h3 className="text-lg md:text-2xl mt-6 text-black font-semibold">Jane Smith</h3>
                        <p className="text-gray-500 mb-4 text-xs md:text-base">Co Founder</p>
                        <p className="text-gray-600 mb-4 px-6 text-xs md:text-base text-center">
                            {t("From the intuitive website to the freshness of each item — every part of the experience feels premium. It's reliable, efficient, and customer-focused")}.
                        </p>
                        <div className="flex justify-center mb-4">
                            <CiStar className="text-yellow-500" />
                            <CiStar className="text-yellow-500" />
                            <CiStar className="text-yellow-500" />
                            <CiStar className="text-yellow-500" />
                            <CiStar className="text-yellow-500" />
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default Testimonials;