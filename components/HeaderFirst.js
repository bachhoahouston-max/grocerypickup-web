import React, { useState, useRef, useEffect } from 'react';
import { BiPhoneCall } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import { useRouter } from 'next/router';
import { IoIosArrowForward } from "react-icons/io";
import { Api } from '@/services/service';
import { useTranslation } from "react-i18next";
import { languageContext } from "@/pages/_app";
import { useContext } from 'react';

const HeaderFirst = (props) => {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState('home');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [category, setCategory] = useState([]);
    const dropdownRef = useRef(null);

    const [lang, setLang] = useState(null);
    const [globallang, setgloballang] = useContext(languageContext);
    const { i18n } = useTranslation();
    const { t } = useTranslation();

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

    function handleClick(idx) {
        try {
            setLang(idx);
            const language = idx || "vi";
            console.log(language);
            i18n.changeLanguage(language);
            setgloballang(language);
            localStorage.setItem("LANGUAGE", language);
        } catch (err) {
            console.log(err.message);
        }
    }

    // Navigation handler function
    const handleNavigation = (path, tab) => {
        console.log(`Navigating to ${path}, setting tab to ${tab}`);
        setSelectedTab(tab);
        router.push(path);
    };

    return (
        <nav className="bg-white border-t-1 border-[#F0F1F1] relative">
            <div className=" mt-2 mx-auto px-4 py-2 flex justify-center items-center ">
                <div className="hidden flex-1 lg:flex justify-center space-x-6">
                    <p className={`text-base font-medium cursor-pointer ml-2 ${selectedTab === 'home' ? 'text-custom-green' : 'text-custom-black'}`}
                        onClick={(e) => { 
                            e.preventDefault();
                            handleNavigation('/', 'home');
                         }}
                    >
                        {t("Home")}
                    </p>
                    <div className="relative flex" ref={dropdownRef}>
                        <button
                            className={`text-base font-medium cursor-pointer inline-flex items-center ${selectedTab === 'AllCategory' ? 'text-custom-green' : 'text-custom-black'}`}
                            onClick={(e) => { 
                                e.preventDefault();
                                handleNavigation('/AllCategory', 'AllCategory');
                            }}
                        >
                           {t("Categories")} 
                        </button>
                        <IoIosArrowDown className="text-2xl cursor-pointer ml-1 text-black"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDropdownOpen(prev => !prev); // Toggle 
                            }}
                        />
                        {dropdownOpen && (
                            <div className="absolute top-full left-0 mt-4 bg-custom-gold shadow-lg rounded-xl w-[241px] overflow-hidden z-20 pt-3 pb-4">
                                {category.slice(0, 6).map((category, index) => (
                                    <div key={index} className='flex flex-col justify-between'>
                                        <div 
                                            className='flex flex-row justify-between cursor-pointer' 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleNavigation(`/categories/${category?.slug}`, 'category');
                                            }}
                                        >
                                            <p className="px-4 py-1.5 text-white text-[16px]">
                                                {category.name}
                                            </p>
                                            <IoIosArrowForward className='text-2xl mt-2 mr-1 text-white' />
                                        </div>
                                    </div>
                                ))}
                                <p
                                    className="px-4 py-1.5 text-white text-[16px] cursor-pointer"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavigation('/categories/all', 'allCategories');
                                    }}
                                >
                                   {t("See All Categories")} 
                                </p>
                            </div>
                        )}
                    </div>
                    <p className={`text-base font-medium cursor-pointer ml-2 ${selectedTab === 'AboutUs' ? 'text-custom-green' : 'text-custom-black'}`}
                        onClick={(e) => { 
                            e.preventDefault();
                            handleNavigation('/AboutUs', 'AboutUs');
                        }}>
                        {t("About Us")}
                    </p>
                    <p className={`text-base font-medium cursor-pointer ml-2 ${selectedTab === 'Contact' ? 'text-custom-green' : 'text-custom-black'}`}
                        onClick={(e) => { 
                            e.preventDefault();
                            handleNavigation('/ContactUs', 'Contact');
                        }}>
                       {t("Contact")} 
                    </p>
                </div>
            </div>
            <div className="xl:right-20 lg:right-12  absolute top-2 px-4 py-2 flex justify-end items-center">
                <div className="hidden lg:flex items-center space-x-2 mr-6">
                    <BiPhoneCall className="text-[#F38529] text-3xl" />
                    <a href="tel:832-230-9288" className="text-custom-black cursor-pointer font-semibold">832-230-9288</a>
                </div>
                <div className="hidden lg:flex rounded-lg">
                    <select className="bg-white w-full font-normal text-sm text-black outline-none cursor-pointer" 
                        value={lang}
                        onChange={(e) => handleClick(e.target.value)}
                    >
                        <option value={"vi"}>Vietnamese</option>
                        <option value={"en"}>English</option>
                    </select>
                </div>
            </div>
        </nav>
    );
};

export default HeaderFirst;