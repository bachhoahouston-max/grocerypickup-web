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
        <div className={`w-full px-2 md:mt-8 mt-14 pb-4 `}>
            <div className='flex justify-start  items-center gap-4'>
                <div>
                    {!user?.username ? (
                        <div className="flex justify-between w-full">
                        <button className='bg-custom-green rounded-[20px] h-[40px] w-[120px] text-white text-base font-normal' onClick={() => { router.push('/signIn') }}>
                            Sign in
                        </button>
                        {/* <IoIosArrowForward className="text-gray-300 text-xl mt-3" /> */}
                        </div>
                    ) : (
                        <div className='flex items-center'>
                            <span className='text-white text-base font-normal mr-2'>Logout</span>
                            <div className='w-[40px] h-[40px] bg-custom-green rounded-full flex justify-center items-center'>
                                <div
                                    onClick={() => {
                                        Swal.fire({
                                            text: "Are you sure you want to logout?",
                                            showCancelButton: true,
                                            confirmButtonText: "Yes",
                                            cancelButtonText: "No",
                                            confirmButtonColor: "#FEC200",
                                            cancelButtonColor: "#ffffff",
                                            customClass: {
                                                confirmButton: 'px-12 rounded-xl',
                                                cancelButton: 'px-12 py-2 rounded-lg text-custom-green border-[12px] border-custom-green hover:none',
                                                text: 'text-[20px] text-black',
                                                actions: 'swal2-actions-no-hover',
                                                popup: 'rounded-[15px] shadow-custom-green'
                                            },
                                            buttonsStyling: true,

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

 </div>
                    {user?.username && (
                        <div
                            className='bg-custom-green h-[40px] w-[40px] rounded-full flex justify-center items-center group relative'
                        >
                            <p className="font-bold text-white text-base text-center capitalize">
                                {user?.username?.charAt(0).toUpperCase()}
                            </p>


                        </div>
                    )}
               
                
            </div>
        </div>
    )
}

export default Account