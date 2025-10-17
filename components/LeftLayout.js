import React, { useState, useEffect, useRef, useContext } from "react";
import { Settings, HelpCircle, Search, Languages, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/router";
import { languageContext } from "@/pages/_app";
import { useTranslation } from "react-i18next";

const LeftLayout = (props) => {
    const [isLanguage, setIsLanguage] = useState(false);
    const [isSearch, setIsSearch] = useState(false);
    const [searchData, setSearchData] = useState("");
    const { lang, changeLang } = useContext(languageContext);
    const { i18n, t } = useTranslation();
    const router = useRouter();
    const inputRef = useRef();

    useEffect(() => {
        i18n.changeLanguage(lang);
    }, [lang]);

    const handleClick = (language) => {
        try {
            changeLang(language);
            i18n.changeLanguage(language);
        } catch (err) {
            console.log(err.message);
        }
    };

    const handleSearchSubmit = () => {
        if (searchData.trim() === "") {
            props.toaster({
                type: "error",
                message: "Please enter search value",
            });
            return;
        }
        props.loader(true)
        router.push(`/Search/${searchData}`);
        setSearchData("")
        setIsSearch(false);
        props.loader(false)
    };

    useEffect(() => {
        if (isSearch && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isSearch]);

    return (
        <>
            {/* Left fixed buttons */}
            <div className="hidden fixed top-1/2 -translate-y-1/2 md:flex flex-col gap-4 z-50 bg-custom-green rounded-tr-full rounded-br-full p-1.5 h-[170px] justify-center">
                <button
                    className="p-3 bg-white text-black rounded-full shadow-md cursor-pointer transition hover:scale-110"
                    onClick={() => setIsSearch(true)}
                >
                    <Search size={20} />
                </button>

                <button
                    className="p-3 bg-white text-black rounded-full shadow-md cursor-pointer transition hover:scale-110 relative"
                    onClick={() => setIsLanguage((prev) => !prev)}
                >
                    <Languages size={20} />
                    {/* Language Dropdown */}
                    <AnimatePresence>
                        {isLanguage && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                                className="absolute left-14 top-0 bg-white rounded-lg shadow-lg p-2 w-32"
                            >
                                <select
                                    className="w-full bg-white text-black text-sm outline-none cursor-pointer"
                                    value={lang}
                                    onChange={(e) => handleClick(e.target.value)}
                                >
                                    <option value={"en"}>English</option>
                                    <option value={"vi"}>Vietnamese</option>
                                </select>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>

                {/* <button className="p-3 bg-white text-black rounded-full shadow-md cursor-pointer transition hover:scale-110">
                    <Settings size={20} />
                </button>

                <button className="p-3 bg-white text-black rounded-full shadow-md cursor-pointer transition hover:scale-110">
                    <HelpCircle size={20} />
                </button> */}

            </div>

            {/* Fullscreen search overlay */}
            <AnimatePresence>
                {isSearch && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-48"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="bg-white rounded-2xl shadow-2xl flex items-center gap-2 p-6 w-[90%] max-w-2xl relative"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchData}
                                onChange={(e) => setSearchData(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                                placeholder={t("Search for products...")}
                                className="flex-1 text-black text-lg px-3 py-2 rounded-md outline-none"
                            />

                            <button
                                onClick={handleSearchSubmit}
                                className="px-4 py-2 bg-custom-green text-white rounded-lg hover:bg-green-700 transition"
                            >
                                {t("Search")}
                            </button>

                            <button
                                onClick={() => {
                                    setSearchData('')
                                    setIsSearch(false)
                                }}
                                className="absolute top-1 right-1 text-gray-600 hover:text-red-500 transition cursor-pointer"
                            >
                                <X size={22} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default LeftLayout;
