import React, { useContext, useState, useEffect } from 'react'
import { useRouter } from "next/router";
import { userContext } from './_app';
import { PiSignOutFill } from 'react-icons/pi'
import Swal from "sweetalert2";
import EditProfile from './editProfile';
import { useTranslation } from "react-i18next";
import { languageContext } from "@/pages/_app";

function Account(props) {
    const router = useRouter();
    const [user, setUser] = useContext(userContext);
       const [lang, setLang] = useState(null);
       const [globallang, setgloballang] = useContext(languageContext);
       const { i18n } = useTranslation();
       const { t } = useTranslation();

       function handleClick(idx) {
        try {
            setLang(idx);
            const language = idx || "vi";
            console.log(language);
            i18n.changeLanguage(language);
            setgloballang(language);
            localStorage.setItem("LANGUAGE", language);
        } catch (err) {
            console.log(err.message);
        }
    }

    return (
        <div className={`w-full px-2 md:mt-8 mt-9 pb-4 `}>
            <div className='flex justify-center mx-auto  max-w-7xl  items-center gap-3'>
                {/* <div className="flex md:m-0 ms-4 flex-col justify-between items-center">
                    <h1 className="text-center  text-[30px] md:text-[45px] font-semibold mb-2 text-black">
                        My
                        <span className="ml-2 text-[30px] md:text-[45px] font-semibold  text-custom-green">
                            Profile
                        </span>
                    </h1>
                </div> */}
                <div>
                    {!user?.username ? (
                        <div className="flex justify-between w-full">
                            <button className='bg-custom-green rounded-[20px] h-[40px] w-[120px] text-white text-base font-normal' onClick={() => { router.push('/signIn') }}>
                                Sign in
                            </button>

                        </div>
                    ) : (
                        <div className='flex items-center'>
                         
                            <div className='w-[40px] h-[40px] bg-custom-green rounded-full flex justify-center items-center'>
                                <div
                                    onClick={() => {
                                        Swal.fire({
                                            text: "Are you sure you want to logout?",
                                            showCancelButton: true,
                                            confirmButtonText: "Yes",
                                            cancelButtonText: "No",
                                            confirmButtonColor: "#F38529",
                                            cancelButtonColor: "#F38529",
                                            customClass: {
                                                confirmButton: 'px-12 rounded-xl',
                                                cancelButton: 'px-12 py-2 rounded-lg text-white border-[12px] border-custom-green hover:none',
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
                <div className="flex rounded-lg">
                    <select className="bg-white border-1 py-1.5 px-1.5 w-full font-normal text-sm text-black outline-none cursor-pointer" 
                        value={lang}
                        onChange={(e) => handleClick(e.target.value)}
                    >
                        <option value={"vi"}>Vietnamese</option>
                        <option value={"en"}>English</option>
                    </select>
                </div>
            </div>
            {user?.username && (
                // <div className="mx-auto max-w-7xl py-6 md:py-12">

                //     <div className="md:m-0 m-1  mt-5 bg-white rounded-lg border-2 border-gray-200 shadow-lg">
                      
                //         <div className="p-4 md:p-6 flex flex-col sm:flex-row items-center sm:items-start">
                //             <div className="w-16 h-16 relative rounded-full overflow-hidden mb-3 sm:mb-0 sm:mr-4">
                //                 <img
                //                     alt="Profile picture"
                //                     src={user?.profileImage || "/avtar.jpg"}
                //                     className="w-full h-full object-cover"
                //                 />
                //             </div>
                //             <div className="text-center sm:text-left">
                //                 <h2 className="text-xl font-semibold text-black">{user?.fullName || profileData.username || "User Name"}</h2>
                //                 <p className="text-gray-600">{user?.email || profileData.email || "user@example.com"}</p>
                //             </div>
                //             <button
                //                 className="mt-3 sm:mt-0 sm:ml-auto px-4 py-2 rounded bg-custom-green text-white hover:bg-gray-800 transition"
                //                 onClick={isEditing ? updateProfile : toggleEditMode}
                //             >
                //                 {isEditing ? 'Save' : 'Edit'}
                //             </button>
                //         </div>

                //         <div className="p-6">
                //             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                //                 {renderFormField("Full Name", "username", "text", profileData.username, "Your Full Name")}
                //                 {renderFormField("Email", "email", "email", profileData.email, "Your Email")}
                //                 {renderGenderSelect()}
                //                 {renderCountryDropdown()}

                //                 {/* {renderFormField(
                //                 "Shipping Address",
                //                 "Shiping_address", // Ensure this matches the state
                //                 "text",
                //                 profileData.Shiping_address,
                //                 "Shipping Address")
                //                 } */}

                //                  <AddressInput
                //                     setProfileData={setProfileData}
                //                     profileData={profileData}
                //                     value={profileData?.address}
                //                     className="w-full mt-2 p-2 border rounded text-black"
                //                 />

                //                 {renderFormField("Mobile", "mobile", "text", profileData.mobile, "Your Mobile Number")}
                //             </div>

                //             {!isEditing && (
                //                 <>
                //                     <h3 className="text-lg font-semibold mt-8 mb-4 text-black">Change Password</h3>
                //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                //                         <div>
                //                             <label className="block text-gray-700">New Password</label>
                //                             <input
                //                                 className="w-full text-black mt-2 p-2 border rounded"
                //                                 placeholder="Enter New Password"
                //                                 type="password"
                //                                 name="password"
                //                                 value={passwordData.password}
                //                                 onChange={handlePasswordChange}
                //                             />
                //                         </div>
                //                         <div>
                //                             <label className="block text-gray-700">Confirm Password</label>
                //                             <input
                //                                 className="w-full text-black mt-2 p-2 border rounded"
                //                                 placeholder="Confirm New Password"
                //                                 type="password"
                //                                 name="confirmPassword"
                //                                 value={passwordData.confirmPassword}
                //                                 onChange={handlePasswordChange}
                //                             />
                //                         </div>
                //                     </div>
                //                     <div className="flex justify-end">
                //                         <button
                //                             className="bg-custom-green rounded-lg text-white px-4 py-2.5 justify-end mt-4"
                //                             onClick={changePassword}
                //                         >
                //                             Change Password
                //                         </button>
                //                     </div>
                //                 </>
                //             )}
                //         </div>
                        
                //     </div>
                // </div>
                <div>
                <EditProfile
                loader={props?.loader}
                toaster={props?.toaster}
                />    
                </div>
            )}
        </div>
    )
}

export default Account