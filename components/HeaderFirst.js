import React, { useState, useRef, useEffect } from 'react';
import { BiPhoneCall } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import { useRouter } from 'next/router';
import { IoIosArrowForward } from "react-icons/io";
import { Api } from '@/services/service';

const HeaderFirst = (props) => {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState('home');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [category, setCategory] = useState([]);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        CategoryData();
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    
    const CategoryData = () => {
        props.loader(true);

        Api("get", "getCategory", null).then(
            (res) => {
                props.loader(false);
                console.log("=>----", res.data);
                setCategory(res.data);
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.data?.message || "Failed to load profile" });
            }
        );
    };

    const handleCategoryClick = (path) => {
        router.push(path);
        setDropdownOpen(false);
    };

    return (
        <nav className="bg-white border-t-1 border-[#F0F1F1]">
            <div className="container mx-auto px-4 py-2 flex justify-center items-center">
                <div className="hidden flex-1 lg:flex justify-center space-x-6">
                    <p className={`text-base font-medium cursor-pointer ml-2 ${selectedTab === 'home' ? 'text-custom-green' : 'text-custom-black'}`}
                        onClick={() => { router.push('/'); setSelectedTab('home'); }}
                    >Home</p>
                    <div className="relative flex" ref={dropdownRef}>
                        <button
                            className={`text-base font-medium cursor-pointer inline-flex items-center ${selectedTab === 'AllCategory' ? 'text-custom-green' : 'text-custom-black'}`}
                            onClick={() => { router.push('/AllCategory'); setSelectedTab('AllCategory'); }}
                        >
                            Categories
                            
                        </button>
                        <IoIosArrowDown className="text-2xl cursor-pointer ml-1 text-black" 
                             onClick={() => {
                                setDropdownOpen(prev => !prev); // Toggle 
                            }}
                            />
                        {dropdownOpen && (
                            <div className="absolute top-full left-0 mt-4 bg-custom-gold shadow-lg rounded-xl w-[241px] overflow-hidden z-20 pt-3 pb-4">
                                {category.slice(0, 6).map((category, index) => (
                                    <div key={index} className='flex flex-col justify-between'>
                                        <div className='flex flex-row justify-between'   onClick={() => { router.push(`/categories/${category?.slug}`) }}>
                                            <p
                                                className="px-4 py-1.5 text-black text-[16px] cursor-pointer"
                                              
                                            >
                                                {category.name}
                                            </p>
                                            <IoIosArrowForward className='text-2xl mt-2 mr-1 text-black' />
                                        </div>
                                    </div>
                                ))}
                                <p
                                    className="px-4 py-1.5 text-black text-[16px] cursor-pointer"
                                    onClick={() => handleCategoryClick('/categories/all')}
                                >
                                    See All Categories
                                </p>
                            </div>
                        )}
                    </div>
                    <p className={`text-base font-medium cursor-pointer ml-2 ${selectedTab === 'AboutUs' ? 'text-custom-green' : 'text-custom-black'}`}
                        onClick={() => { router.push('/AboutUs'); setSelectedTab('AboutUs'); }}>
                        About Us
                    </p>
                    <p className={`text-base font-medium cursor-pointer ml-2 ${selectedTab === 'Contact' ? 'text-custom-green' : 'text-custom-black'}`}
                        onClick={() => { router.push('/ContactUs'); setSelectedTab('Contact'); }}>
                        Contact
                    </p>
                </div>
                <div className="hidden lg:flex items-center space-x-2 mr-6">
                    <BiPhoneCall className="text-[#FEC200] text-3xl" />
                    <a href="tel:6393274099" className="text-custom-black cursor-pointer font-semibold">+(402) 54646</a>

                   
                </div>
            </div>
        </nav>
    );
};

export default HeaderFirst;