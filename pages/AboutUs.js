import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import { LuBoomBox } from "react-icons/lu";

const AboutUs = () => {
    const router = useRouter();
    const teamMembers = [
        { name: 'John Peter', role: 'COO', imgSrc: '/Bill.png' },
        { name: 'Priya Mehra', role: 'Head of Product', imgSrc: '/Beverly.png' },
        { name: 'Rahul Sharma', role: 'Marketing Director', imgSrc: '/Claudia.png' },
        { name: 'John Sena', role: 'COO', imgSrc: '/Avatar.png' },
    ];

    const services = [
        { description: 'Online Payment' },
        { description: 'Maintenance Request Management' },
        { description: 'Stakeholder Communication' },
        { description: 'Document Management' },
    ];

    return (
        <>
            <div className="w-full bg-[#FFF5CB] mx-auto flex flex-col md:flex-row justify-center items-center">
                <div className="md:py-14 py-8 w-full md:w-[780px] h-auto ps-4 md:ps-24">
                    <nav className="mb-4 mt-8 md:mt-12 text-[12px] md:text-start text-center">
                        <span className="text-gray-600 mr-1">Home /</span>
                        <span className="text-[#F38529]">About us</span>
                    </nav>
                    <h1 className="md:mt-12 mt-4 md:text-start text-center text-[25px] md:text-3xl md:leading-[50px] leading-10 font-bold text-gray-800 mb-4">
                        Welcome to our online grocery store!
                    </h1>
                    <p className="text-gray-600 md:text-start text-center mb-6 text-[15px] leading-[32px]">
                        We provide fresh, high-quality groceries with a focus on convenience and customer satisfaction. From local produce to everyday essentials, we ensure fast and reliable delivery. Our mission is to bring the best products straight to your doorstep, making grocery shopping easier and hassle-free
                    </p>
                    <div className="flex justify-center md:justify-start mt-6">
                        <p className="bg-[#F38529] cursor-pointer text-white px-6 py-3 rounded-lg text-[15px] inline-flex items-center"
                            onClick={() => router.push("/categories/all")}
                        >
                            Shop Now
                            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                        </p>
                    </div>
                </div>
                <div className="md:flex hidden w-full md:w-auto">
                    <img
                        alt="A bowl of assorted fresh fruits including strawberries, kiwi, blueberries, and watermelon"
                        className="w-full h-auto"
                        src="./aboutus-1.png"
                    />
                </div>
            </div>
            <div className="bg-[#fbeeba]">
                <div className="container mx-auto py-12 px-4 md:px-20">
                    <h2 className="text-2xl font-bold mb-8 text-black">Why work with us</h2>
                    <div className="flex flex-col md:flex-row justify-center space-y-6 md:space-y-0 md:space-x-8">
                        <div className="mb-4">
                            <div className="bg-white md:px-8 px-4 py-6 md:py-12 rounded-lg shadow-lg">
                                <div className={`bg-red-100 text-purple-600 px-8 py-2 rounded-full inline-block mb-4`}>
                                    Quality You Can Trust
                                </div>
                                {/* <h3 className="text-xl font-semibold mb-4 text-black">Lorem Ipsum</h3> */}
                                <p className="text-gray-600 w-[90%]">We provide the freshest, most reliable groceries, ensuring every product meets high-quality standards. Our customers trust us for freshness and consistency.

                                   .</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="bg-white md:px-8 px-4 py-6 md:py-12 rounded-lg shadow-lg">
                                <div className={`bg-red-100 text-orange-800 px-8 py-2 rounded-full inline-block mb-4`}>
                                Customer-Centric Approach
                                </div>
                                {/* <h3 className="text-xl font-semibold mb-4 text-black">Lorem Ipsum</h3> */}
                                <p className="text-gray-600 w-[90%]">Our focus is on you. With easy ordering, quick delivery, and a commitment to customer satisfaction, we make grocery shopping simple and stress-free..</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="bg-white md:px-8 px-4 py-6 md:py-12 rounded-lg shadow-lg">
                                <div className={`bg-orange-200 text-orange-400 px-8 py-2 rounded-full inline-block mb-4`}>
                                Convenience at Your Doorstep
                                </div>
                                {/* <h3 className="text-xl font-semibold mb-4 text-black">Lorem Ipsum</h3> */}
                                <p className="text-gray-600 w-[90%]">From local produce to pantry essentials, we bring the best directly to you. Enjoy the convenience of a hassle-free, fast, and reliable shopping experience..</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-[#FFF5CB] mx-auto h-full">
                <div className="px-4 md:px-24 rounded-lg flex flex-col md:flex-row gap-4 md:gap-20">
                    <div className="md:w-1/3">
                        <img
                            alt="Sliced melon on a green background"
                            className="rounded-lg w-full h-auto"
                            src="/Rectangle25.png"
                        />
                    </div>
                    <div className="md:w-2/3 md:pl-6 mt-4 md:mt-0 flex flex-col justify-center gap-4">
                        <p className="text-[#F38529] font-semibold text-[16px]">Bringing Freshness & Convenience Together</p>
                        <h1 className="text-2xl md:text-[24px] font-bold mt-2 w-full text-black">
                        We combine quality products with hassle-free shopping to make your daily grocery experience smoother and smarter.
                        </h1>
                        <p className="text-gray-700 mt-4 md:mb-2 mb-8 text-[16px] w-full">
                        We are a modern grocery pickup and delivery service committed to making your daily shopping easier, faster, and more reliable. With a wide range of fresh produce, pantry staples, and household essentials, we bring convenience to your doorstep. Trusted by hundreds of families, we continue to grow by focusing on quality, customer satisfaction, and a seamless shopping experience.
                        </p>
                    </div>
                </div>
            </div>
            <div className="bg-white">
                {/* Our Team Section */}
                <div className="max-w-7xl container mx-auto">
                    <div className="mb-20 md:mx-0 mx-6">
                        <h2 className="text-xl font-semibold mb-16 mt-12 text-black">Our Team</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {teamMembers.map((member, index) => (
                                <div key={index} className="bg-[#F5F5F5] flex flex-col justify-center items-center px-4  md:py-4 py-2 rounded-[20px] w-full h-auto shadow">
                                    <img alt={`Avatar of ${member.name}`} className="mx-auto mb-2" height="100" src={member.imgSrc} width="100" />
                                    <h3 className="text-center font-semibold mb-2 text-black">{member.name}</h3>
                                    <p className="text-center text-gray-500">{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Our Services Section */}
                <div className="bg-[#F5F5F5]">
                    <div className="max-w-7xl container mx-auto ">
                        <h2 className="text-xl font-semibold mb-14 pt-14 text-black md:mx-0 mx-6">Our Services</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-20 md:mx-0 mx-6">
                            {services.map((service, index) => (
                                <div key={index} className="bg-custom-green rounded-[18px] w-full h-auto p-4 text-white text-center flex justify-center flex-col items-center">
                                    <LuBoomBox className='md:text-5xl text-4xl mb-2' />
                                    <p className="md:text-[19px] text-[16px]">{service.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AboutUs;