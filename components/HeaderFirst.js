import React, { useState, useRef, useEffect } from "react";
import { BiPhoneCall } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import { useRouter } from "next/router";
import { IoIosArrowForward } from "react-icons/io";
import { Api } from "@/services/service";
import { useTranslation } from "react-i18next";
import { languageContext } from "@/pages/_app";
import { useContext } from "react";

const HeaderFirst = (props) => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("home");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [category, setCategory] = useState([]);
  const dropdownRef = useRef(null);
  const { lang, changeLang } = useContext(languageContext);
  const { i18n } = useTranslation();
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    CategoryData();
  }, []);

  const CategoryData = () => {
    // props.loader(true);

    Api("get", "getCategory", null).then(
      (res) => {
        props.loader(false);
        setCategory(res.data);
      },
      (err) => {
        props.loader(false);
        props.toaster({
          type: "error",
          message: err?.data?.message || "Failed to load profile",
        });
      }
    );
  };

  const handleClick = (language) => {
    try {
      changeLang(language);
      i18n.changeLanguage(language);
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang]);


  const handleNavigation = (path, tab) => {
    setSelectedTab(tab);
    router.push(path);
  };

  return (
    <>
      <nav className="bg-white  relative">
        <div className="mt-2 mx-auto px-4 py-2 md:flex hidden ">
          <div className="hidden flex-1 lg:flex justify-center lg:space-x-8">
            <p
              className={`text-[16px] font-medium transition-transform duration-300 hover:-translate-y-[5px]  cursor-pointer  ${selectedTab === "home"
                ? "text-custom-green"
                : "text-custom-black hover:!text-[#2e7d32]"
                }`}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/", "home");
              }}
            >
              {t("Home")}
            </p>
            <div className=" ml-4 relative flex transition-transform duration-300 hover:-translate-y-[5px]" ref={dropdownRef}>
              <button
                className={`text-[16px] font-medium cursor-pointer inline-flex items-center ${selectedTab === "AllCategory"
                  ? "text-custom-green"
                  : "text-custom-black hover:!text-[#2e7d32]"
                  }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/AllCategory", "AllCategory");
                }}
              >
                {t("Categories")}
              </button>

              <IoIosArrowDown
                className="text-2xl cursor-pointer ml-1 text-black"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen((prev) => !prev);
                }}
              />

              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-4 bg-custom-green shadow-lg rounded-xl w-[241px] overflow-hidden z-20 pt-3 pb-2">
                  {category.slice(0, 6).map((cat, index) => (
                    <div key={index} className="flex flex-col justify-between">
                      <div
                        className="flex flex-row justify-between cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDropdownOpen(false); // Close dropdown
                          handleNavigation(
                            `/categories/${cat?.slug}`,
                            "category"
                          );
                        }}
                      >
                        <p className="px-4 py-1.5 text-white text-[16px]">
                          {cat.name}
                        </p>
                        <IoIosArrowForward className="text-2xl mt-2 mr-1 text-white" />
                      </div>
                    </div>
                  ))}

                  <p
                    className=" px-4 py-1.5 text-white text-[16px] cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setDropdownOpen(false);
                      handleNavigation("/categories/all", "allCategories");
                    }}
                  >
                    {t("See All Categories")}
                  </p>
                </div>
              )}
            </div>

            {/* <p
              className={`text-[16px] font-medium transition-transform duration-300 hover:-translate-y-[5px] cursor-pointer ml-2 
    ${selectedTab === "FranchiseOpportunity"
                  ? "text-custom-green"
                  : "text-custom-black hover:!text-[#2e7d32]"
                }
  `}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/FranchiseOpportunity", "FranchiseOpportunity");
              }}
            >
              {t("Franchise Opportunity")}
            </p> */}

            <p
              className={`text-[16px] font-medium transition-transform duration-300 hover:-translate-y-[5px]  cursor-pointer ml-2 
    ${selectedTab === "AboutUs"
                  ? "text-custom-green"
                  : "text-custom-black hover:!text-[#2e7d32]"
                }
  `}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/AboutUs", "AboutUs");
              }}
            >
              {t("About Us")}
            </p>
            <p
              className={`text-[16px] font-medium cursor-pointer transition-transform duration-300 hover:-translate-y-[5px] ml-2 ${selectedTab === "Contact"
                ? "text-custom-green"
                : "text-custom-black hover:!text-[#2e7d32]"
                }`}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/ContactUs", "Contact");
              }}
            >
              {t("Contact Us")}
            </p>

            <p
              className={`text-[16px] font-medium transition-transform duration-300 hover:-translate-y-[5px] cursor-pointer ml-2 ${selectedTab === "StoreLocation"
                ? "text-custom-green"
                : "text-custom-black hover:!text-[#2e7d32]"
                }`}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation("/StoreLocation", "StoreLocation");
              }}
            >
              {t("Store Location")}
            </p>

          </div>
        </div>

        {/* <div className="2xl:right-20 lg:right-8  absolute top-2 px-4 py-2 flex justify-end items-center">
          <div className="hidden lg:flex items-center space-x-2 mr-2 transition-transform duration-300 hover:-translate-y-[5px]">
            <BiPhoneCall className="text-[#F38529] 2xl:text-3xl lg:text-xl" />
            <a
              href="tel:832-230-9288"
              className="text-custom-black cursor-pointer font-semibold xl:text-[16px] 2xl:text-[18px] lg:text-[12px]"
            >
              832-230-9288
            </a>
          </div>
          {/* <div className="rounded-lg lg:flex hidden">
            <select
              className="bg-white w-full font-normal text-sm text-black outline-none cursor-pointer"
              value={lang}
              onChange={(e) => handleClick(e.target.value)}
            >
              <option value={"en"}>English</option>
              <option value={"vi"}>Vietnamese</option>
            </select>
          </div> 
        </div> */}

      </nav>


    </>
  );
};

export default HeaderFirst;
