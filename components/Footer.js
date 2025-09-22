import React from "react";
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { useRouter } from "next/router";
import { MdEmail } from "react-icons/md";
import { useTranslation } from "react-i18next";
import Image from "next/image";

const Footer = () => {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <footer className="p-10 bg-custom-green text-black font-sans">
      <div className="container mx-auto xl:max-w-7xl border-b w-[90%] border-b-white pb-8">
        <div className="w-full flex flex-col md:flex-row justify-between ">

          <div className="md:w-1/3 w-full mb-6 md:mb-0">
            <Image
              alt="Grocery pickup logo"
              className="mb-4 cursor-pointer"
              height="50"
              src="/Logo2.png"
              style={{ width: "auto", height: "auto" }}
              width="180"
              onClick={() => router.push("/")}
            />
            <p className="text-[16px] md:text-[19px] text-white">
              {t(
                "Commitment to Quality"
              )}{" "}
            </p>
            <div className="flex space-x-4 mt-4">
              <a
                className="text-white border-2 rounded-full w-[40px] h-[40px] border-white flex justify-center items-center transition-transform duration-300 hover:-translate-y-[8px]"
                href="https://www.instagram.com/bachhoahouston/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
              <a
                className="text-white border-2 rounded-full w-[40px] h-[40px] border-white flex justify-center items-center transition-transform duration-300 hover:-translate-y-[8px]"
                href="https://www.facebook.com/groups/1861501697993458"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebookF />
              </a>
            </div>

            <div className="mt-6 text-white">
              {" "}
              <ul>
                <li className="flex items-center mb-2 transition-transform duration-300 hover:-translate-y-[8px]">
                  <IoCall className="text-2xl mr-2" />
                  <a
                    href="tel:832-230-9288"
                    className="text-[16px] md:text-[19px]text-white cursor-pointer"
                  >
                    832-230-9288
                  </a>
                </li>
                <li className="flex items-center transition-transform duration-300 hover:-translate-y-[8px]">
                  <MdEmail className="text-2xl mr-2" />
                  <a
                    className="text-[16px] md:text-[19px]"
                    href="mailto:contact@bachhoahouston.com"
                  >
                    contact@bachhoahouston.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="md:w-2/3 w-full flex flex-col md:flex-row  text-white">
            {/* Useful Links */}
            <div className="w-full md:w-1/3 mb-4 md:mb-0 ">
              <h3 className="font-bold mb-4  lg:text-[19px] text-[18px]  transition-transform duration-300 hover:-translate-y-[8px]">
                {t("Useful Links")}
              </h3>
              <ul>
                <li className="md:pb-2 pb-1 transition-transform duration-300 hover:-translate-y-[8px] hover:underline">
                  <a
                    className="text-[16px] md:text-[17px] "
                    href=""
                    onClick={() => router.push("/")}
                  >
                    {" "}
                    {t("Home")}
                  </a>
                </li>
                <li className="md:pb-2 pb-1 transition-transform duration-300 hover:-translate-y-[8px] hover:underline">
                  <a
                    className="cursor-pointer text-[16px] md:text-[17px]"
                    onClick={() => router.push("/AboutUs")}
                  >
                    {t("About Us")}{" "}
                  </a>
                </li>
                <li className="md:pb-2 pb-1 transition-transform duration-300 hover:-translate-y-[8px] hover:underline">
                  <a
                    className="cursor-pointer text-[16px] md:text-[17px]"
                    onClick={() => router.push("/ContactUs")}
                  >
                    {t("Contact")}
                  </a>
                </li>

                <li className="md:pb-2 pb-1 transition-transform duration-300 hover:-translate-y-[8px] hover:underline">
                  <a
                    className="cursor-pointer text-[16px] md:text-[17px]"
                    onClick={() => router.push("/StoreLocation")}
                  >
                    {t("Store Location")}
                  </a>
                </li>
                <li className="md:pb-2 pb-1 transition-transform duration-300 hover:-translate-y-[8px] hover:underline">
                  <a
                    className="cursor-pointer text-[16px] md:text-[17px]"
                    onClick={() => router.push("/FranchiseOpportunity")}
                  >
                    {t("Franchise Opportunity")}
                  </a>
                </li>
              </ul>
            </div>

            {/* Help & Support */}
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              <h3 className="font-bold mb-4  transition-transform duration-300 hover:-translate-y-[8px]  lg:text-[19px] text-[18px]">
                {t("Help & Support")}
              </h3>
              <ul>
                <li className="pb-2 cursor-pointer transition-transform duration-300 hover:-translate-y-[8px] hover:underline">
                  <a
                    className="text-[16px] md:text-[17px]"
                    onClick={() => router.push("/ReturnPolicy")}
                  >
                    {t("Return Policy")}{" "}
                  </a>
                </li>
                <li className="pb-2 cursor-pointer transition-transform duration-300 hover:-translate-y-[8px] hover:underline">
                  <a
                    className="text-[16px] md:text-[17px]"
                    onClick={() => router.push("/Termsandcondition")}
                  >
                    {t("Terms and Conditions")}{" "}
                  </a>
                </li>

                <li className="pb-2 cursor-pointer transition-transform duration-300 hover:-translate-y-[8px] hover:underline">
                  <a
                    className="text-[16px] md:text-[17px]"
                    onClick={() => router.push("/PrivacyPolicy")}
                  >
                    {t("Privacy Policy")}{" "}
                  </a>
                </li>
              </ul>
            </div>

            {/* Other Links */}
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              <h3 className="font-bold mb-4   transition-transform duration-300 hover:-translate-y-[8px] lg:text-[19px] text-[18px]">
                {t("Other Links")}
              </h3>
              <ul>
                <li className="md:pb-2 pb-1 cursor-pointer transition-transform duration-300 hover:-translate-y-[8px] hover:underline">
                  <a
                    className="text-[16px] md:text-[17px]"
                    onClick={() => router.push("/Myhistory")}
                  >
                    {t("History")}
                  </a>
                </li>

                <li className="md:pb-2 pb-1 cursor-pointer transition-transform duration-300 hover:-translate-y-[8px] hover:underline">
                  <a
                    className="text-[16px] md:text-[17px]"
                    onClick={() => router.push("/Mybooking")}
                  >
                    {t("My Order")}
                  </a>
                </li>

                <li className="md:pb-2 pb-1 cursor-pointer transition-transform duration-300 hover:-translate-y-[8px] hover:underline">
                  <a
                    className="text-[16px] md:text-[17px]"
                    onClick={() => router.push("/JoinOurDelievryTeam")}
                  >
                    {t("Join our delivery team")}
                  </a>
                </li>

                <li className="md:pb-2 pb-1 cursor-pointer transition-transform duration-300 hover:-translate-y-[8px] hover:underline">
                  <a
                    className="text-[16px] md:text-[17px]"
                    onClick={() => router.push("/HelpCenter")}
                  >
                    {t("⁠Help Center")}
                  </a>
                </li>

                <li className="md:pb-2 pb-1 cursor-pointer transition-transform duration-300 hover:-translate-y-[8px] hover:underline">
                  <a
                    href="/ProductRecallInfo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[16px] md:text-[17px]"
                  >
                    {t("⁠Product Recall Information")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pb-12 md:pb-6">
        <div className=" border-white mt-4 text-[16px] pt-4 text-center text-white">
          <p>{t("Copyright @ 2025 Bach Hoa Houston. All rights reserved")}.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

