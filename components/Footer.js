"use client";

import React from "react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer
      className="p-10 bg-custom-green text-black font-sans"
      role="contentinfo"
      aria-label="Website Footer"
    >
      <div className="container mx-auto xl:max-w-7xl border-b w-[90%] border-b-white pb-8">
        <div className="w-full flex flex-col md:flex-row justify-between">
          {/* Left Section */}
          <div className="md:w-1/3 w-full mb-6 md:mb-0">
            <Link href="/" aria-label="Go to homepage">
              <Image
                alt="Bach Hoa Houston grocery pickup logo"
                className="mb-4 cursor-pointer"
                height={50}
                src="/Logo2.png"
                style={{ width: "auto", height: "auto" }}
                width={180}
                priority
              />
            </Link>

            <p className="text-[16px] md:text-[19px] text-white">
              {t("Commitment to Quality")}
            </p>

            {/* Social Links */}
            <div className="flex space-x-4 mt-4">
              <a
                aria-label="Instagram"
                className="text-white border-2 rounded-full w-[40px] h-[40px] border-white flex justify-center items-center transition-transform duration-300 hover:-translate-y-[8px]"
                href="https://www.instagram.com/bachhoahouston2025/?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D#"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
              <a
                aria-label="Facebook Group"
                className="text-white border-2 rounded-full w-[40px] h-[40px] border-white flex justify-center items-center transition-transform duration-300 hover:-translate-y-[8px]"
                href="https://www.facebook.com/people/Bach-Hoa-Houston/61579418325421/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebookF />
              </a>
            </div>

            {/* Contact Info */}
            <div className="mt-6 text-white">
              <ul>
                <li className="flex items-center mb-2 transition-transform duration-300 hover:-translate-y-[8px]">
                  <IoCall className="text-2xl mr-2" aria-hidden="true" />
                  <a
                    href="tel:832-230-9288"
                    className="text-[16px] md:text-[19px]"
                  >
                    832-230-9288
                  </a>
                </li>
                <li className="flex items-center transition-transform duration-300 hover:-translate-y-[8px]">
                  <MdEmail className="text-2xl mr-2" aria-hidden="true" />
                  <a
                    href="mailto:contact@bachhoahouston.com"
                    className="text-[16px] md:text-[19px]"
                  >
                    contact@bachhoahouston.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Section - Links */}
          <div className="md:w-2/3 w-full flex flex-col md:flex-row text-white">
            {/* Useful Links */}
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              <h3 className="font-bold mb-4 lg:text-[19px] text-[18px]">
                {t("Useful Links")}
              </h3>
              <ul>
                <li className="pb-1 md:pb-2 hover:underline">
                  <Link href="/Mybooking">{t("My Order")}</Link>
                </li>
                <li className="pb-1 md:pb-2 hover:underline">
                  <Link href="/Myhistory">{t("History")}</Link>
                </li>
                <li className="pb-1 md:pb-2 hover:underline">
                  <Link href="/AboutUs">{t("About Us")}</Link>
                </li>
                <li className="pb-1 md:pb-2 hover:underline">
                  <Link href="/ContactUs">{t("Contact")}</Link>
                </li>

                {/* <li className="pb-1 md:pb-2 hover:underline">
                  <Link href="/FranchiseOpportunity">
                    {t("Franchise Opportunity")}
                  </Link>
                </li> */}
              </ul>
            </div>

            {/* Help & Support */}
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              <h3 className="font-bold mb-4 lg:text-[19px] text-[18px]">
                {t("Help & Support")}
              </h3>
              <ul>
                <li className="pb-2 hover:underline">
                  <Link href="/ReturnPolicy">{t("Return Policy")}</Link>
                </li>
                <li className="pb-2 hover:underline">
                  <Link href="/Termsandcondition">
                    {t("Terms and Conditions")}
                  </Link>
                </li>
                <li className="pb-2 hover:underline">
                  <Link href="/PrivacyPolicy">{t("Privacy Policy")}</Link>
                </li>
              </ul>
            </div>

            {/* Other Links */}
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              <h3 className="font-bold mb-4 lg:text-[19px] text-[18px]">
                {t("Other Links")}
              </h3>
              <ul>
                <li className="pb-1 md:pb-2 hover:underline">
                  <Link href="/StoreLocation">{t("Store Location")}</Link>
                </li>
                <li className="pb-1 md:pb-2 hover:underline">
                  <Link href="/JoinOurDelievryTeam">
                    {t("Join our delivery team")}
                  </Link>
                </li>
                <li className="pb-1 md:pb-2 hover:underline">
                  <Link href="/HelpCenter">{t("Help Center")}</Link>
                </li>
                <li className="pb-1 md:pb-2 hover:underline">
                  <a
                    href="/ProductRecallInfo"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("Product Recall Information")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="flex justify-center pb-12 md:pb-6">
        <div className="border-white mt-4 text-[16px] pt-4 text-center text-white">
          <p>
            © {new Date().getFullYear()} Bach Hoa Houston.{" "}
            {t("All rights reserved")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
