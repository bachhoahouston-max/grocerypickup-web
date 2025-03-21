import React from 'react';
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { MdOutlineMail } from "react-icons/md";
import { useRouter } from 'next/router';

const Footer = () => {
  const router = useRouter();
  return (<>

    <footer className="p-10 bg-custom-green text-black font-sans">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-center lg:gap-14 xl:gap-10">
          {/* Logo and Description */}
          <div className="w-full mb-6 md:mb-0">
            <img
              alt="Tropicano logo"
              className="mb-4 cursor-pointer"
              height="50"
              src="/logo.png"
              width="150"
              onClick={() => router.push('/')}
            />
            <p className="text-[16px] md:text-[19px] text-black">Your digital partner for personal and professional growth</p>
            <div className="flex space-x-4 mt-4">
              <a className="text-black border-2 rounded-full w-[40px] h-[40px] border-black flex justify-center items-center" href="#">
                <FaLinkedinIn />
              </a>
              <a className="text-black border-2 rounded-full w-[40px] h-[40px] border-black flex justify-center items-center" href="#">
                <FaInstagram />
              </a>
              <a className="text-black border-2 rounded-full w-[40px] h-[40px] border-black flex justify-center items-center" href="#">
                <FaFacebookF />
              </a>
              <a className="text-blck border-2 rounded-full w-[40px] h-[40px] border-black flex justify-center items-center" href="#">
                <FaXTwitter />
              </a>
              <a className="text-black border-2 rounded-full w-[40px] h-[40px] border-black flex justify-center items-center" href="#">
                <FaYoutube />
              </a>
            </div>
          </div>
          <div className='md:flex-row flex w-full'>
            {/* Useful Links */}
            <div className="w-1/2 mb-4 md:mb-0 max-w-2xl">
              <h3 className="font-bold mb-4 xl:text-[22px] lg:text-[19px] text-[18px]">Useful Links</h3>
              <ul>
                <li className="md:pb-2 pb-1"><a className="text-[16px] md:text-[19px]" href=""
                  onClick={() => router.push('/')}
                >Home</a></li>
                <p className="md:pb-2 pb-1"><a className=" cursor-pointer text-[16px] md:text-[19px]"
                  onClick={() => router.push('/AboutUs')}
                >About Us</a></p>
                <p className="md:pb-2 pb-1"><a className=" cursor-pointer text-[16px] md:text-[19px]"
                  onClick={() => router.push('/ContactUs')}
                >Contact</a></p>
              </ul>
            </div>

            {/* Help & Support */}
            <div className="w-1/2 mb-4 md:mb-0">
              <h3 className="font-bold mb-4 xl:text-[22px] lg:text-[19px] text-[18px]">Help & Support</h3>
              <ul>
                <p className="pb-2 cursor-pointer"><a className=" text-[16px] md:text-[19px]"
                  onClick={() => router.push('/ReturnPolicy')}
                >Return Policy</a></p>

                <p className="pb-2 cursor-pointer"><a className=" text-[16px] md:text-[19px]"
                  onClick={() => router.push('/Termsandcondition')}
                >  Terms and condition</a></p>



                <p className="pb-2 cursor-pointer"><a className="text-[16px] md:text-[19px]"
                  onClick={() => router.push('/DataPolicy')}
                >Data Policy</a></p>

              </ul>
            </div>
          </div>
          <div className='md:flex-row flex w-full'>
            {/* Other Links */}
            <div className="w-1/2 mb-4 md:mb-0">
              <h3 className="font-bold mb-4 xl:text-[22px] lg:text-[19px] text-[18px]">Other Links</h3>
              <ul>

                <p className="md:pb-2 pb-1 cursor-pointer"><a className=" text-[16px] md:text-[19px]"
                  onClick={() => router.push('/Myhistory')}
                >  History  </a></p>


                <p className="md:pb-2 pb-1 cursor-pointer"><a className="text-[16px] md:text-[19px]"
                  onClick={() => router.push('/Mybooking')}
                >  My Bookings  </a></p>
              </ul>
            </div>

            <div className="w-1/2 mb-4 md:mb-0">
              <h3 className="font-bold mb-4 xl:text-[22px] lg:text-[19px] text-[18px]">
                Contact us
              </h3>
              <ul>
                <div className="flex justify-start">
                  <IoCall className="text-2xl mr-2" />
                 
                    <a href="tel:6393274099" className="md:pb-2 pb-1 text-[16px] md:text-[19px] text-black cursor-pointer font-semibold">+(402) 54646</a>
                </div>
              </ul>
              <ul>
                <div className="flex ">
                  <MdOutlineMail className="text-2xl md:text-3xl mr-2" />
                  <li className="md:pb-2 pb-1"><a className=" text-[16px] md:text-[19px]" href="#">
                    Support@zeeddo.com</a></li>

                </div>
              </ul>

            </div>
          </div>
        </div>

      </div>
      <div className="flex justify-center pb-12 md:pb-6">
        <div class="border-t w-[90%] border-white mt-6 text-[16px] pt-6 text-center">
          <p>
            Copyright © Zeeddo 1924. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer >

  </>)
}
export default Footer;