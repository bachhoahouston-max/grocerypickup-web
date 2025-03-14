import React, { useContext, useState } from 'react'
import { useRouter } from "next/router";
import { userContext } from './_app';
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { PiSignOutFill } from 'react-icons/pi'
import Swal from "sweetalert2";
import { IoIosArrowForward } from "react-icons/io";

function Account() {
    const router = useRouter();
    const [user, setUser] = useContext(userContext);
    const [showHover, setShowHover] = useState(false);

    return (
        <div className={`w-full px-5 pt-8 pb-4 ${showHover ? "h-48":""}`}>
            <div className='flex justify-start items-center gap-5'>
            {!user?.username ? (
                    <button className='bg-custom-green rounded-[20px] h-[40px] w-[120px] text-white text-base font-normal' onClick={() => { router.push('/signIn') }}>
                        Sign in
                    </button>
                ) : (
                    <div className='flex items-center'>
                        <span className='text-white text-base font-normal mr-2'>Logout</span>
                        <div className='w-[40px] h-[40px] bg-custom-green rounded-full flex justify-center items-center'>
                            <div
                                onClick={() => {
                                    Swal.fire({
                                        title: "Are you sure you want to logout?",
                                        showCancelButton: true,
                                        confirmButtonText: "Yes",
                                        cancelButtonText: "No",
                                        confirmButtonColor: "#00BB75",
                                        cancelButtonColor: "#ffffff",
                                        customClass: {
                                            confirmButton: 'px-12 rounded-xl',
                                            cancelButton: 'px-12 py-2 rounded-lg text-custom-green border-[12px] border-custom-green hover:none',
                                            title: 'text-[20px] text-black',
                                            actions: 'swal2-actions-no-hover',
                                            popup: 'rounded-[15px] shadow-custom-green'
                                        },
                                        buttonsStyling: true,
                                        reverseButtons: true,
                                        width: '320px'
                                    }).then(function (result) {
                                        if (result.isConfirmed) {
                                            localStorage.removeItem("userDetail");
                                            localStorage.removeItem("token");
                                            router.push("/signIn");
                                        }
                                    });
                                }}
                                className="w-[40px] h-[40px] bg-custom-green rounded-full flex justify-center items-center text-white font-semibold"
                            >
                                <PiSignOutFill className='text-white w-[23px] h-[23px]' />
                            </div>
                        </div>
                    </div>
                )}
              
              
                {user?.username && (
                    <div 
                        className='bg-custom-green h-[40px] w-[40px] rounded-full flex justify-center items-center group relative'
                        onMouseEnter={() => setShowHover(true)}
                        onMouseLeave={() => setShowHover(false)}
                    >
                        <p className="font-bold text-white text-base text-center capitalize">
                            {user?.username?.charAt(0).toUpperCase()}
                        </p>
                        
                        {showHover && (
                            <div className="lg:absolute top-4 right-0 lg:min-w-[250px] md:z-40">
                                <div className="bg-custom-green lg:shadow-inner z-10 rounded-md lg:mt-8 shadow-inner">
                                    <ul>
                                        <li className="px-3 shadow-inner py-2 flex justify-between">
                                            <div
                                                className="block px-5 py-1 pl-0 text-white text-left font-semibold text-base"
                                                onClick={() => { router.push("/Mybooking") }}
                                            >
                                                {"My Booking"}
                                            </div>
                                            <IoIosArrowForward className="text-2xl text-white" />
                                        </li>
                                        <li className="px-3 shadow-inner py-2 flex justify-between">
                                            <div
                                                className="block px-5 py-1 pl-0 text-white text-left font-semibold text-base"
                                                onClick={() => { router.push("/Myhistory") }}
                                            >
                                                {"History"}
                                            </div>
                                            <IoIosArrowForward className="text-2xl text-white" />
                                        </li>
                                        <li className="px-3 shadow-inner py-2 flex justify-between">
                                            <div
                                                className="block px-5 py-1 pl-0 text-white text-left font-semibold text-[16px]"
                                                onClick={() => { router.push("/") }}
                                            >
                                                {"Notifications"}
                                            </div>
                                            <IoIosArrowForward className="text-2xl text-white" />
                                        </li>
                                        <li className="px-3 shadow-inner py-2 flex justify-between">
                                            <div
                                                className="block px-5 py-1 pl-0 text-white text-left font-semibold text-[16px]"
                                                onClick={() => { router.push("/editProfile") }}
                                            >
                                                {"Edit Profile"}
                                            </div>
                                            <IoIosArrowForward className="text-2xl text-white" />
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}

              
            </div>
        </div>
    )
}

export default Account