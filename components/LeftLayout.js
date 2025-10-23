import React, { useState, useEffect, useContext } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/router";
import { languageContext } from "@/pages/_app";
import { useTranslation } from "react-i18next";

const LeftLayout = (props) => {
    const [isLanguage, setIsLanguage] = useState(false);
    const [searchData, setSearchData] = useState("");
    const { lang, changeLang } = useContext(languageContext);
    const { i18n, t } = useTranslation();
    const router = useRouter();

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

    const handleSearchSubmit = (e) => {
        e?.preventDefault();
        if (searchData.trim() === "") {
            props.toaster({
                type: "error",
                message: "Please enter search value",
            });
            return;
        }
        props.loader(true);
        router.push(`/Search/${searchData}`);
        // setSearchData("");
        props.loader(false);
    };

    return (

        <div className="bg-white p-3 shadow-md w-full hidden md:flex">
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto">

                <div className="flex flex-1 justify-center ps-36">
                    <div className="flex items-center w-full max-w-lg bg-gray-50 rounded-full px-4 py-2 border-2 relative">
                        <Search size={20} className="text-gray-400" />
                        <form onSubmit={handleSearchSubmit} className="flex-1">
                            <input
                                type="text"
                                value={searchData}
                                onChange={(e) => setSearchData(e.target.value)}
                                placeholder="Search"
                                className="w-full bg-transparent text-black text-sm px-3 outline-none placeholder:text-gray-400"
                            />
                        </form>

                        {/* X Icon to clear input */}
                        {searchData && (
                            <button
                                type="button"
                                onClick={() => setSearchData("")}
                                className="absolute right-3 text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

              
                <div className="flex items-center gap-3 pl-6">
                    <span className="text-sm text-gray-600">Language:</span>
                    <div className="flex bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                        <button
                            onClick={() => handleClick("en")}
                            className={`px-4 py-2 cursor-pointer text-xs font-semibold transition ${lang === "en"
                                    ? "bg-custom-green text-white"
                                    : "text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => handleClick("vi")}
                            className={`px-4 py-2 text-xs cursor-pointer font-semibold transition ${lang === "vi"
                                    ? "bg-custom-green text-white"
                                    : "text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            VI
                        </button>
                    </div>
                </div>

            </div>
        </div>


    );
};

export default LeftLayout;