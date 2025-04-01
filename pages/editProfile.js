import React, { useState, useEffect } from 'react';
import { CountryDropdown } from 'react-country-region-selector';
import { Api } from '@/services/service';

const EditProfile = ({ loader, toaster }) => {
    // Combined state for all data
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        gender: '',
        country: '',
        mobile: '',
        shippingAddress: '',
        password: '',
        confirmPassword: '',
    });

    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Load user data on component mount
    useEffect(() => {
        const userDetails = localStorage.getItem('userDetail');
        if (userDetails) {
            setUser(JSON.parse(userDetails));
            getProfileData();
        }
    }, []);
     
    // Improved input handler for each specific field
    const handleInputChange = (name, value) => {
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Fetch profile data from API
    const getProfileData = () => {
        loader(true);
        const token = localStorage.getItem('token');

        if (!token) {
            toaster({ type: "error", message: "Authentication required" });
            loader(false);
            return;
        }

        Api("get", "getProfile", null)
            .then(res => {
                loader(false);
                if (res?.status) {
                    setProfileData(prev => ({
                        ...prev,
                        username: res.data.username || '',
                        email: res.data.email || '',
                        gender: res.data.gender || '',
                        country: res.data.country || '',
                        mobile: res.data.number || '',
                        shippingAddress: res.data.Shiping_address || ''
                    }));
                } else {
                    toaster({ type: "error", message: res?.data?.message || "Failed to load profile" });
                }
            })
            .catch(err => {
                loader(false);
                toaster({ type: "error", message: err?.data?.message || "Failed to load profile" });
            });
    };

    // Toggle edit mode
    const toggleEditMode = () => setIsEditing(!isEditing);

    // Update profile API call
    const updateProfile = () => {
        loader(true);
        const payload = {
            ...profileData,
            number: profileData.mobile,
            Shiping_address: profileData.shippingAddress
        };

        Api("post", "updateProfile", payload)
            .then(res => {
                loader(false);
                if (res?.status) {
                    toaster({ type: "success", message: "Profile updated successfully" });
                    if (res.data) {
                        const userDetail = JSON.parse(localStorage.getItem('userDetail') || '{}');
                        const updatedUser = { ...userDetail, ...res.data };
                        localStorage.setItem('userDetail', JSON.stringify(updatedUser));
                        setUser(updatedUser);
                    }
                    setIsEditing(false);
                } else {
                    toaster({ type: "error", message: res?.data?.message || "Failed to update profile" });
                }
            })
            .catch(err => {
                loader(false);
                toaster({ type: "error", message: err?.data?.message || "Failed to update profile" });
            });
    };

    // Change password API call
    const changePassword = () => {
        if (profileData.password !== profileData.confirmPassword) {
            toaster({ type: "error", message: "Passwords don't match" });
            return;
        }

        if (!profileData.password) {
            toaster({ type: "error", message: "Password cannot be empty" });
            return;
        }

        loader(true);
        const passwordData = {
            password: profileData.password,
            confirmPassword: profileData.confirmPassword
        };

        Api("post", "profile/changePassword", passwordData)
            .then(res => {
                loader(false);
                if (res?.status) {
                    toaster({ type: "success", message: "Password changed successfully" });
                    setProfileData(prev => ({
                        ...prev,
                        password: '',
                        confirmPassword: ''
                    }));
                } else {
                    toaster({ type: "error", message: res?.data?.message || "Failed to change password" });
                }
            })
            .catch(err => {
                loader(false);
                toaster({ type: "error", message: err?.data?.message || "Failed to change password" });
            });
    };

    // Improved form field component with dedicated onChange handler
    const FormField = ({ label, name, type, value, placeholder }) => (
        <div className="mb-4">
            <label className="block text-gray-700 mb-1">{label}</label>
            {isEditing ? (
                <input
                    className="w-full p-2 border rounded text-black focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder={placeholder}
                    type={type}
                    name={name}
                    value={value}
                    onChange={(e) => handleInputChange(name, e.target.value)}
                />
            ) : (
                <div className="text-black w-full p-2 border rounded bg-gray-50">
                    {value || `No ${label.toLowerCase()} provided`}
                </div>
            )}
        </div>
    );

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-12">
            {/* Header */}
            <div className="flex flex-col justify-center items-center mb-8">
                <h1 className="md:mt-0 mt-4 text-center text-3xl md:text-4xl font-semibold text-black">
                    My <span className="text-custom-green">Profile</span>
                </h1>
                <p className="text-center text-base mt-2 max-w-xl text-black">
                    Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet
                    sint. Velit officia consequat.
                </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg border-2 border-gray-200 shadow-lg overflow-hidden">
                {/* Profile Header */}
                <div className="p-4 md:p-6 flex flex-col sm:flex-row items-center sm:items-start">
                    <div className="w-16 h-16 relative rounded-full overflow-hidden mb-3 sm:mb-0 sm:mr-4">
                        <img
                            alt="Profile picture"
                            src={user?.profileImage || "/avtar.jpg"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className="text-xl font-semibold text-black">{user?.fullName || profileData.username || "User Name"}</h2>
                        <p className="text-gray-600">{user?.email || profileData.email || "user@example.com"}</p>
                    </div>
                    <button
                        className="mt-3 sm:mt-0 sm:ml-auto px-4 py-2 rounded bg-black text-white hover:bg-gray-800 transition"
                        onClick={isEditing ? updateProfile : toggleEditMode}
                    >
                        {isEditing ? 'Save' : 'Edit'}
                    </button>
                </div>

                {/* Profile Form */}
                <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <FormField
                            label="Full Name"
                            name="username"
                            type="text"
                            value={profileData.username}
                            placeholder="Your Full Name"
                        />
                        <FormField
                            label="Email"
                            name="email"
                            type="email"
                            value={profileData.email}
                            placeholder="Your Email"
                        />

                        {/* Gender Select with improved handler */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">Gender</label>
                            {isEditing ? (
                                <select
                                    className="w-full p-2 border rounded text-black focus:outline-none focus:ring-1 focus:ring-black"
                                    name="gender"
                                    value={profileData.gender}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            ) : (
                                <div className="text-black w-full p-2 border rounded bg-gray-50">
                                    {profileData.gender || 'No gender provided'}
                                </div>
                            )}
                        </div>

                        {/* Country Select with improved handler */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">Country</label>
                            {isEditing ? (
                                <CountryDropdown
                                    className="w-full p-2 border rounded text-black focus:outline-none focus:ring-1 focus:ring-black"
                                    value={profileData.country}
                                    onChange={(val) => handleInputChange('country', val)}
                                />
                            ) : (
                                <div className="text-black w-full p-2 border rounded bg-gray-50">
                                    {profileData.country || 'No country provided'}
                                </div>
                            )}
                        </div>

                        <FormField
                            label="Shipping Address"
                            name="shippingAddress"
                            type="text"
                            value={profileData.shippingAddress}
                            placeholder="Shipping Address"
                        />

                        <FormField
                            label="Mobile"
                            name="mobile"
                            type="text"
                            value={profileData.mobile}
                            placeholder="Your Mobile Number"
                        />
                        <FormField
                            label="Shipping Address"
                            name="shippingAddress"
                            type="text"
                            value={profileData.shippingAddress}
                            placeholder="Shipping Address"
                        />
                        <FormField
                            label="Shipping Address"
                            name="shippingAddress"
                            type="text"
                            value={profileData.shippingAddress}
                            placeholder="Shipping Address"
                        />
                    </div>

                    {/* Password Change Section with improved handlers */}
                    {!isEditing && (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-4 text-black">Change Password</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-1">New Password</label>
                                    <input
                                        className="w-full p-2 border rounded text-black focus:outline-none focus:ring-1 focus:ring-black"
                                        placeholder="Enter New Password"
                                        type="password"
                                        name="password"
                                        value={profileData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-1">Confirm Password</label>
                                    <input
                                        className="w-full p-2 border rounded text-black focus:outline-none focus:ring-1 focus:ring-black"
                                        placeholder="Confirm New Password"
                                        type="password"
                                        name="confirmPassword"
                                        value={profileData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    className="bg-black rounded-lg text-white px-4 py-2 hover:bg-gray-800 transition mt-4"
                                    onClick={changePassword}
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditProfile;