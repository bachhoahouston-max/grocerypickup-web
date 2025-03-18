import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

const AboutUs = () => {
    const teamMembers = [
        { name: 'John Peter', role: 'COO', imgSrc: '/Bill.png' },
        { name: 'John Peter', role: 'COO', imgSrc: '/Beverly.png' },
        { name: 'John Peter', role: 'COO', imgSrc: '/Claudia.png' },
        { name: 'John Peter', role: 'COO', imgSrc: '/Avatar.png' },
    ];

    const services = [
        { description: 'Online Payment' },
        { description: 'Maintenance Request Management' },
        { description: 'Stakeholder Communication' },
        { description: 'Document Management' },
    ];

    return (
        <>
            <div className="w-full bg-green-100 mx-auto flex flex-col md:flex-row justify-center items-center">
                <div className="md:py-14 py-8 w-full md:w-[780px] h-auto ps-4 md:ps-24">
                    <nav className="mb-4 mt-8 md:mt-12 text-[12px]">
                        <span className="text-gray-600 mr-1">Home /</span>
                        <span className="text-[#FEC200]">About us</span>
                    </nav>
                    <h1 className="md:mt-12 mt-4 text-[29px] md:text-3xl md:leading-[50px] leading-11 font-bold text-gray-800 mb-4">
                        Lorem Ipsum is simply dummy text of the printing and.
                    </h1>
                    <p className="text-gray-600 mb-6 text-[15px] leading-[32px]">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                    </p>
                    <p className="mt-6 inline-block bg-[#FEC200] text-white px-6 py-3 rounded-lg text-[15px]">
                        Shop Now
                        <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                    </p>
                </div>
                <div className="w-full md:w-auto">
                    <img
                        alt="A bowl of assorted fresh fruits including strawberries, kiwi, blueberries, and watermelon"
                        className="w-full h-auto"
                        src="./aboutus-1.png"
                    />
                </div>
            </div>
            <div className="bg-gray-100">
                <div className="container mx-auto py-12 px-4 md:px-20">
                    <h2 className="text-2xl font-bold mb-8 text-black">Why work with us</h2>
                    <div className="flex flex-col md:flex-row justify-center space-y-6 md:space-y-0 md:space-x-8">
                        {['Lorem Ipsum', 'Lorem Ipsum', 'Lorem Ipsum'].map((title, index) => (
                            <div key={index} className="bg-white md:px-8 px-4 py-6 md:py-12 rounded-lg shadow-lg">
                                <div className={`bg-${index === 0 ? 'purple' : index === 1 ? 'red' : 'green'}-100 text-${index === 0 ? 'purple' : index === 1 ? 'red' : 'green'}-600 px-8 py-2 rounded-full inline-block mb-4`}>
                                    {title}
                                </div>
                                <h3 className="text-xl font-semibold mb-4 text-black">{title}</h3>
                                <p className="text-gray-600 w-[90%]">Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="bg-green-100 mx-auto h-full">
                <div className="px-4 md:px-24 rounded-lg flex flex-col md:flex-row gap-4 md:gap-20">
                    <div className="md:w-1/3">
                        <img
                            alt="Sliced melon on a green background"
                            className="rounded-lg w-full h-auto"
                            src="/Rectangle25.png"
                        />
                    </div>
                    <div className="md:w-2/3 md:pl-6 mt-4 md:mt-0 flex flex-col justify-center gap-4">
                        <p className="text-[#FEC200] font-semibold text-[16px]">Lorem Ipsum</p>
                        <h1 className="text-2xl md:text-[28px] font-bold mt-2 w-full text-black">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        </h1>
                        <p className="text-gray-700 mt-4 md:mb-2 mb-8 text-[16px] w-full">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries,
                        </p>
                    </div>
                </div>
            </div>
            <div className="bg-white">
                {/* Our Team Section */}
                <div className="max-w-7xl container mx-auto">
                    <div className="mb-20 md:mx-0 mx-6">
                        <h2 className="text-xl font-semibold mb-16 mt-12 text-black">Our Team</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {teamMembers.map((member, index) => (
                                <div key={index} className="bg-[#F5F5F5] flex flex-col justify-center items-center p-4 rounded-[20px] w-full h-auto shadow">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-20 md:mx-0 mx-6">
                            {services.map((service, index) => (
                                <div key={index} className="bg-custom-green rounded-[18px] w-full h-auto p-4 text-black text-center flex justify-center flex-col items-center">
                                    <img src="icon-3.png" alt={`Icon for ${service.description}`} />
                                    <p className="text-[19px]">{service.description}</p>
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