"use client";

import React from "react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Mail, Phone } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer
      className="py-10 bg-custom-lightGreen text-black font-sans rounded-tl-[50px] rounded-tr-[50px] "
      role="contentinfo"
      aria-label="Website Footer"
    >
      <div className="container mx-auto xl:max-w-7xl border-b-[2px] w-[90%] border-b-gray-500  pb-8">
        <div className="relative md:w-[200px] w-[170px] md:h-16 h-14 mb-5 ">
          <Link href="/" aria-label="Go to homepage">
            <Image
              alt="Bach Hoa Houston grocery pickup logo"
              className="mb-4 cursor-pointer "
              fill
              src="/logo-bachahoustan.png"
              priority
            />
          </Link>
        </div>
        <div className="w-full flex flex-col md:flex-row justify-between">
          {/* Left Section */}
          <div className="md:w-1/3 w-full mb-6 md:mb-0">

            <p className="text-[16px] md:text-[19px] text-black">
              {t("Commitment to Quality")}
            </p>

            {/* Social Links */}
            <div className="flex space-x-4 mt-4">
              <a
                aria-label="Instagram"
                className="text-black border-2 rounded-full w-[40px] h-[40px] border-black flex justify-center items-center transition-transform duration-300 hover:-translate-y-[8px]"
                href="https://www.instagram.com/bachhoahouston2025/?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D#"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
              <a
                aria-label="Facebook Group"
                className="text-black border-2 rounded-full w-[40px] h-[40px] border-black flex justify-center items-center transition-transform duration-300 hover:-translate-y-[8px]"
                href="https://www.facebook.com/people/Bach-Hoa-Houston/61579418325421/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook />
              </a>
            </div>

            {/* Contact Info */}
            <div className="mt-6 text-black">
              <ul>
                <li className="flex items-center mb-2 transition-transform duration-300 hover:-translate-y-[8px]">
                  <Phone className="text-2xl mr-2" aria-hidden="true" />
                  <a
                    href="tel:832-230-9288"
                    className="text-[16px] md:text-[19px]"
                  >
                    832-230-9288
                  </a>
                </li>
                <li className="flex items-center transition-transform duration-300 hover:-translate-y-[8px]">
                  <Mail className="text-2xl mr-2" aria-hidden="true" />
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
          <div className="md:w-2/3 w-full flex flex-col md:flex-row text-black">
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
      <div className="">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between py-6 gap-4">

          {/* Copyright */}
          <div className="text-center md:text-left text-sm md:text-base text-gray-700">
            <p>
              © {new Date().getFullYear()} <span className="font-semibold text-black">Bach Hoa Houston</span>.{" "}
              {t("All rights reserved")}
            </p>
          </div>

          {/* App Store Buttons */}
          <div className="flex flex-row items-center justify-center gap-3 md:mb-0 mb-10">
            <a
              href="https://apps.apple.com/us/app/b%C3%A1ch-ho%C3%A1-houston/id6745395289"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform transform hover:scale-105 flex flex-col items-start max-w-[150px] bg-white px-3 py-1 rounded-md"
            >
              <p className="text-black text-[16px] whitespace-nowrap">
                {t("Download on the")}
              </p>
              <div className="flex  justify-center items-center gap-2">
                <p className="text-black text-[16px] whitespace-nowrap">
                  {t("App Store")}
                </p>
                <Image
                  src="/AppStore.png"
                  alt="Download on the App Store"
                  width={25}
                  height={15}
                  className="object-contain"
                />
              </div>
            </a>

            <a
              href="https://play.google.com/store/apps/details?id=com.bachhoahouston"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform transform hover:scale-105 bg-white px-3 py-1 rounded-md max-w-[150px] flex flex-wrap items-start"
            >

              <p className="text-black text-[16px] whitespace-nowrap">
                {t("Download on the")}
              </p>
              <div className="flex  justify-center items-center gap-2">
                <p className="text-black text-[16px] whitespace-nowrap">
                  {t("Play Store")}
                </p>
                <Image
                  src="/GooglePlay.png"
                  alt="Download on the Google Play Store"
                  width={25}
                  height={15}
                  className="object-contain"
                />
              </div>
            </a>
          </div>

        </div>
      </div>

    </footer>
  );
};

export default Footer;
