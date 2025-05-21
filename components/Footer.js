import React from 'react';
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { useRouter } from 'next/router';
import { MdEmail } from "react-icons/md";
import { useTranslation } from "react-i18next";


const Footer = () => {
  const { t } = useTranslation()
  const router = useRouter();
  return (
    <footer className="p-10 bg-custom-green text-black font-sans">
      <div className="container mx-auto xl:max-w-7xl border-b w-[90%] border-b-white pb-8">
        <div className="flex flex-col md:flex-row justify-between lg:gap-14 xl:gap-10">
          {/* Logo and Description */}
          <div className="w-full mb-6 md:mb-0">
            <img
              alt="Tropicano logo"
              className="mb-4 cursor-pointer"
              height="50"
              src="/Logo2.png"
              width="150"
              onClick={() => router.push('/')}
            />
            <p className="text-[16px] md:text-[19px] text-white">
              {t("Your digital partner for growth, with a commitment to quality")} </p>
            <div className="flex space-x-4 mt-4">
              <a className="text-white border-2 rounded-full w-[40px] h-[40px] border-white flex justify-center items-center" href="#">
                <FaLinkedinIn />
              </a>
              <a className="text-white border-2 rounded-full w-[40px] h-[40px] border-white flex justify-center items-center" href="#">
                <FaInstagram />
              </a>
              <a className="text-white border-2 rounded-full w-[40px] h-[40px] border-white flex justify-center items-center" href="#">
                <FaFacebookF />
              </a>
              <a className="text-white border-2 rounded-full w-[40px] h-[40px] border-white flex justify-center items-center" href="#">
                <FaXTwitter />
              </a>
              <a className="text-white border-2 rounded-full w-[40px] h-[40px] border-white flex justify-center items-center" href="#">
                <FaYoutube />
              </a>
            </div>
            <div className='mt-6 text-white'> <ul>
              <li className="flex items-center mb-2">
                <IoCall className="text-2xl mr-2" />
                <a href="tel:832-230-9288" className="text-[16px] md:text-[19px]text-white cursor-pointer">832-230-9288</a>
              </li>
              <li className="flex items-center">
                <MdEmail className="text-2xl mr-2" />
                <a className="text-[16px] md:text-[19px]" href="mailto:contact@bachhoahouston.com">contact@bachhoahouston.com</a>
              </li>
            </ul></div>
          </div>

          <div className='flex flex-col md:flex-row w-full text-white'>
            {/* Useful Links */}
            <div className="w-full md:w-1/3 mb-4 md:mb-0 ">
              <h3 className="font-bold mb-4  lg:text-[19px] text-[18px]">{t("Useful Links")}</h3>
              <ul>
                <li className="md:pb-2 pb-1"><a className="text-[16px] md:text-[17px]" href="" onClick={() => router.push('/')}> {t("Home")}</a></li>
                <li className="md:pb-2 pb-1"><a className="cursor-pointer text-[16px] md:text-[17px]" onClick={() => router.push('/AboutUs')}>{t("About Us")} </a></li>
                <li className="md:pb-2 pb-1"><a className="cursor-pointer text-[16px] md:text-[17px]" onClick={() => router.push('/ContactUs')}>{t("Contact")}</a></li>
              </ul>
            </div>

            {/* Help & Support */}
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              <h3 className="font-bold mb-4  lg:text-[19px] text-[18px]">{t("Help & Support")}</h3>
              <ul>
                <li className="pb-2 cursor-pointer"><a className="text-[16px] md:text-[17px]" onClick={() => router.push('/ReturnPolicy')}>{t("Return Policy")} </a></li>
                <li className="pb-2 cursor-pointer"><a className="text-[16px] md:text-[17px]" onClick={() => router.push('/Termsandcondition')}>{t("Terms and Conditions")} </a></li>
               
                <li className="pb-2 cursor-pointer"><a className="text-[16px] md:text-[17px]" onClick={() => router.push('/PrivacyPolicy')}>{t("Privacy Policy")} </a></li>
                
              </ul>
            </div>
      

          
            {/* Other Links */}
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              <h3 className="font-bold mb-4  lg:text-[19px] text-[18px]">{("Other Links")}</h3>
              <ul>
                <li className="md:pb-2 pb-1 cursor-pointer"><a className="text-[16px] md:text-[17px]" onClick={() => router.push('/Myhistory')}>{t("History")}</a></li>
                <li className="md:pb-2 pb-1 cursor-pointer"><a className="text-[16px] md:text-[17px]" onClick={() => router.push('/Mybooking')}>{t("My Order")}</a></li>
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
}

export default Footer;



  {/* Contact Us */}
            {/* <div className="w-full md:w-1/2 mb-4 md:mb-0">
              <h3 className="font-bold mb-4  lg:text-[19px] text-[18px]">{t("Contact Us")}</h3>
              <ul>
                <li className="flex items-center mb-2">
                  <IoCall className="text-2xl mr-2" />
                  <a href="tel:6393274589" className="text-[16px] md:text-[19px]text-white cursor-pointer">+(402) 54646</a>
                </li>
                <li className="flex items-center">
                  <MdEmail className="text-2xl mr-2" />
                  <a className="text-[16px] md:text-[19px]" href="mailto:contact@bachhoahouston.com">contact@bachhoahouston.com</a>
                </li>
              </ul>
            </div> */}