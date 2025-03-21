import React, { useState, useEffect } from 'react';
import { CountryDropdown } from 'react-country-region-selector';
import { Api } from '@/services/service';

const EditProfile = (props) => {
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        gender: '',
        country: '',
        mobile: '',
    });
    
    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: '',
    });
    
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const userDetails = localStorage.getItem('userDetail');
        if (userDetails) {
            setUser(JSON.parse(userDetails));
            getProfileData();
        }
    }, []);

    const getProfileData = () => {
        props.loader(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
            props.toaster({ type: "error", message: "Authentication required" });
            props.loader(false);
            return;
        }

        Api("get", "getProfile", null).then(
            (res) => {
                props.loader(false);
                console.log("=>----",res.data);
                if (res?.status) {
                    setProfileData({
                        username: res.data.username || '',
                        email: res.data.email || '',
                        gender: res.data.gender || '',
                        country: res.data.country || '',
                        mobile: res.data.number || '',
                    });
                } else {
                    props.toaster({ type: "error", message: res?.data?.message || "Failed to load profile" });
                }
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.data?.message || "Failed to load profile" });
            }
        );
    };

    // Handle profile data change
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value
        });
    };

    // Handle country selection
    const selectCountry = (val) => {
        setProfileData({
            ...profileData,
            country: val
        });
    };

    // Handle password data change
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value
        });
    };

    // Toggle edit mode
    const toggleEditMode = () => {
        setIsEditing(!isEditing);
    };

    // Update profile information
    const updateProfile = () => {
        props.loader(true);
        
        Api("post", "updateProfile", profileData).then(
            (res) => {
                props.loader(false);
                if (res?.status) {
                    props.toaster({ type: "success", message: "Profile updated successfully" });
                    
                    // Update local storage with new user details if available
                    if (res.data) {
                        const userDetail = JSON.parse(localStorage.getItem('userDetail') || '{}');
                        const updatedUser = { ...userDetail, ...res.data };
                        localStorage.setItem('userDetail', JSON.stringify(updatedUser));
                        setUser(updatedUser);
                    }
                    
                    setIsEditing(false);
                } else {
                    props.toaster({ type: "error", message: res?.data?.message || "Failed to update profile" });
                }
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.data?.message || "Failed to update profile" });
            }
        );
    };

    const changePassword = () => {
        
        if (passwordData.password !== passwordData.confirmPassword) {
            props.toaster({ type: "error", message: "Passwords don't match" });
            return;
        }
        
        if (!passwordData.password) {
            props.toaster({ type: "error", message: "Password cannot be empty" });
            return;
        }
        
        props.loader(true);
        
        Api("post", "profile/changePassword", passwordData).then(
            (res) => {
                props.loader(false);
                if (res?.status) {
                    props.toaster({ type: "success", message: "Password changed successfully" });
                    setPasswordData({
                        password: '',
                        confirmPassword: ''
                    });
                } else {
                    props.toaster({ type: "error", message: res?.data?.message || "Failed to change password" });
                }
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.data?.message || "Failed to change password" });
            }
        );
    };

    
    const renderFormField = (label, name, type, value, placeholder) => {
        if (isEditing) {
            return (
                <div>
                    <label className="block text-gray-700">{label}</label>
                    <input
                        className="w-full mt-2 p-2 border rounded text-black"
                        placeholder={placeholder}
                        type={type}
                        name={name}
                        value={value}
                        onChange={handleProfileChange}
                    />
                </div>
            );
        } else {
            return (
                <div>
                    <label className="block text-gray-700">{label}</label>
                    <div className="text-black w-full mt-2 p-2 border rounded bg-gray-50">
                        {value || `No ${label.toLowerCase()} provided`}
                    </div>
                </div>
            );
        }
    };

    const renderGenderSelect = () => {
        if (isEditing) {
            return (
                <div>
                    <label className="block text-gray-700">Gender</label>
                    <select 
                        className="w-full mt-2 text-black p-2 border rounded"
                        name="gender"
                        value={profileData.gender}
                        onChange={handleProfileChange}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        {/* <option value="other">Other</option> */}
                    </select>
                </div>
            );
        } else {
            return (
                <div>
                    <label className="block text-gray-700">Gender</label>
                    <div className="text-black w-full mt-2 p-2 border rounded bg-gray-50">
                        {profileData.gender || 'No gender provided'}
                    </div>
                </div>
            );
        }
    };

    
    const renderCountryDropdown = () => {
        if (isEditing) {
            return (
                <div>
                    <label className="block text-gray-700">Country</label>
                    <CountryDropdown
                        className="w-full mt-2 p-2 border rounded text-black"
                        value={profileData.country}
                        onChange={selectCountry}
                    />
                </div>
            );
        } else {
            return (
                <div>
                    <label className="block text-gray-700">Country</label>
                    <div className="text-black w-full mt-2 p-2 border rounded bg-gray-50">
                        {profileData.country || 'No country provided'}
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="mx-auto max-w-7xl py-6 md:py-12">
            <div className="flex md:m-0 mt-6 flex-col justify-center items-center">
                <h1 className="text-center  text-[35px] md:text-[45px] font-semibold mb-2 text-black">
                    My
                    <span className="ml-2 text-[35px] md:text-[45px] font-semibold mb-4 text-custom-green">
                        Profile
                    </span>
                </h1>
                <p className="md:px-0 px-12 text-center text-[16px] mb-6 w-full md:w-[40%] text-black">
                    {" "}
                    Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet
                    sint. Velit officia consequat.
                </p>
            </div>
            <div className="md:m-0 m-5 mt-5 bg-white rounded-lg border-2 border-gray-200 shadow-lg">
                <div className="w-full relative h-48">
                    <img 
                        src="/Rectangle123.png" 
                        alt="Profile banner"
                        layout="fill"
                        objectFit="cover"
                    />
                </div>
                <div className="p-6 flex items-center">
                    <div className="w-16 h-16 relative rounded-full overflow-hidden mr-4">
                        <img
                            alt="Profile picture of a person"
                            src={user?.profileImage || "/avtar.jpg"}
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-black">{user?.fullName || profileData.username || "User Name"}</h2>
                        <p className="text-gray-600">{user?.email || profileData.email || "user@example.com"}</p>
                    </div>
                    <button 
                        className={`ml-auto px-4 py-2 rounded bg-black text-white`}
                        onClick={isEditing ? updateProfile : toggleEditMode}
                    >
                        {isEditing ? 'Save' : 'Edit'}
                    </button>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderFormField("Full Name", "username", "text", profileData.username, "Your Full Name")}
                        {renderFormField("Email", "email", "email", profileData.email, "Your Email")}
                        {renderGenderSelect()}
                        {renderCountryDropdown()}
                        {renderFormField("Mobile", "mobile", "text", profileData.mobile, "Your Mobile Number")}
                    </div>

                    {!isEditing && (
                        <>
                            <h3 className="text-lg font-semibold mt-8 mb-4 text-black">Change Password</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-gray-700">New Password</label>
                                    <input
                                        className="w-full text-black mt-2 p-2 border rounded"
                                        placeholder="Enter New Password"
                                        type="password"
                                        name="password"
                                        value={passwordData.password}
                                        onChange={handlePasswordChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">Confirm Password</label>
                                    <input
                                        className="w-full text-black mt-2 p-2 border rounded"
                                        placeholder="Confirm New Password"
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button 
                                    className="bg-black rounded-lg text-white px-4 py-2 justify-end mt-4"
                                    onClick={changePassword}
                                > 
                                    Change Password 
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditProfile;