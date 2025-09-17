import React, { useState, useEffect } from 'react';
import { CountryDropdown } from 'react-country-region-selector';
import { Api } from '@/services/service';
import AddressInput from '@/components/addressInput';
import { useTranslation } from 'react-i18next';
import { FaUserAlt } from "react-icons/fa";
const EditProfile = ({ loader, toaster }) => {
    const { t } = useTranslation()
    const [profileData, setProfileData] = useState({
        username: '',
        lastname: "",
        email: '',
        country: '',
        number: '',
        address: '',
    });

    const [profilePassword, setProfilePassword] = useState({
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({
        username: '',
        lastname: '',
        email: '',
        country: '',
        number: '',
        address: '',
        password: '',
        confirmPassword: ''
    });

    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const userDetails = localStorage.getItem('userDetail');
        const token = localStorage.getItem('token');

        if (userDetails && token) {
            setUser(JSON.parse(userDetails));
            getProfileData();
        }
        
    }, []);

    const validateField = (name, value) => {
        switch (name) {
            case 'username':
                if (!value.trim()) return t('First name is required');
                if (!/^[A-Za-z\s]+$/.test(value)) return t('Only letters allowed');
                if (value.length < 2) return t('Minimum 2 characters required');
                return '';
            case 'lastname':
                if (!value.trim()) return t('Last name is required');
                if (!/^[A-Za-z\s]+$/.test(value)) return t('Only letters allowed');
                if (value.length < 2) return t('Minimum 2 characters required');
                return '';
            case 'email':
                if (!value.trim()) return t('Email is required');
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('Invalid email format');
                return '';
            case 'country':
                if (!value) return t('Country is required');
                return '';
            case 'number':
                if (!value) return t('Phone number is required');
                if (!/^\d{10}$/.test(value)) return t('Must be 10 digits');
                return '';
            case 'address':
                if (!value.trim()) return t('Address is required');
                if (value.length < 10) return t('Address too short');
                return '';
            case 'password':
                if (!value && isEditing) return '';
                if (!value) return t('Password is required');
                if (value.length < 8) return t('Minimum 8 characters');
                if (!/[A-Z]/.test(value)) return t('At least one uppercase letter');
                if (!/[a-z]/.test(value)) return t('At least one lowercase letter');
                if (!/[0-9]/.test(value)) return t('At least one number');
                if (!/[^A-Za-z0-9]/.test(value)) return t('At least one special character');
                return '';
            case 'confirmPassword':
                if (profilePassword.password !== value) return t('Passwords do not match');
                return '';
            default:
                return '';
        }
    };

    const handleInputChange = (name, value) => {
        // Prevent numbers in name fields
        if ((name === 'username' || name === 'lastname') && /[0-9]/.test(value)) {
            return;
        }

        // Prevent non-numeric characters in phone number
        if (name === 'number' && value && !/^\d*$/.test(value)) {
            return;
        }

        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when typing
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handlePasswordChange = (name, value) => {
        setProfilePassword(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when typing
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleBlur = (name, value) => {
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const getProfileData = () => {
        loader(true);

        // if (!token) {
        //     toaster({ type: "error", message: ("Authentication required") });
        //     loader(false);
        //     return;
        // }

        Api("get", "getProfile", null)
            .then(res => {
                loader(false);
                if (res?.status) {
                    setProfileData(prev => ({
                        ...prev,
                        username: res.data.username || '',
                        email: res.data.email || '',
                        lastname: res.data.lastname || '',
                        country: res.data.country || '',
                        number: res.data.number || '',
                        address: res.data.address || ''
                    }));
                } else {
                    toaster({ type: "error", message: res?.data?.message });
                }
            })
            .catch(err => {
                loader(false);
                toaster({ type: "error", message: err?.data?.message });
            });
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = {};

        // Validate profile data
        Object.keys(profileData).forEach(key => {
            const error = validateField(key, profileData[key]);
            if (error) {
                isValid = false;
                newErrors[key] = error;
            }
        });

        // Validate password if not empty
        if (profilePassword.password || profilePassword.confirmPassword) {
            const passwordError = validateField('password', profilePassword.password);
            if (passwordError) {
                isValid = false;
                newErrors.password = passwordError;
            }

            const confirmError = validateField('confirmPassword', profilePassword.confirmPassword);
            if (confirmError) {
                isValid = false;
                newErrors.confirmPassword = confirmError;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const toggleEditMode = () => {
        if (isEditing) {
            if (!validateForm()) {
                toaster({ type: "error", message: t("Please fix the errors in the form") });
                return;
            }
            updateProfile();
        } else {
            setIsEditing(true);
        }
    };

    const updateProfile = () => {
        loader(true);
        const payload = {
            ...profileData,
        };

        Api("post", "updateProfile", payload)
            .then(res => {
                loader(false);
                if (res?.status) {
                    toaster({ type: "success", message: t("Profile updated successfully") });
                    if (res.data) {
                        const userDetail = JSON.parse(localStorage.getItem('userDetail') || '{}');
                        const updatedUser = { ...userDetail, ...res.data };
                        localStorage.setItem('userDetail', JSON.stringify(updatedUser));
                        setUser(updatedUser);
                    }
                    setIsEditing(false);
                } else {
                    toaster({ type: "error", message: res?.data?.message || t("Failed to update profile") });
                }
            })
            .catch(err => {
                loader(false);
                toaster({ type: "error", message: err?.data?.message || t("Failed to update profile") });
            });
    };

    const changePassword = () => {
        if (!profilePassword.password) {
            toaster({ type: "error", message: t("Password cannot be empty") });
            return;
        }

        if (profilePassword.password !== profilePassword.confirmPassword) {
            toaster({ type: "error", message: t("Passwords don't match") });
            return;
        }

        const passwordError = validateField('password', profilePassword.password);
        if (passwordError) {
            setErrors(prev => ({
                ...prev,
                password: passwordError,
                confirmPassword: ''
            }));
            return;
        }

        loader(true);
        const passwordData = {
            password: profilePassword.password,
            confirmPassword: profilePassword.confirmPassword
        };

        Api("post", "profile/changePassword", passwordData)
            .then(res => {
                loader(false);
                if (res?.status) {
                    toaster({ type: "success", message: t("Password changed successfully") });
                    setProfilePassword({
                        password: '',
                        confirmPassword: '',
                    });
                    setErrors(prev => ({
                        ...prev,
                        password: '',
                        confirmPassword: ''
                    }));
                } else {
                    toaster({ type: "error", message: res?.data?.message || t("Failed to change password") });
                }
            })
            .catch(err => {
                loader(false);
                toaster({ type: "error", message: err?.data?.message || t("Failed to change password") });
            });
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-12">
            {/* Header */}
            <div className="flex flex-col justify-center items-center mb-8">
                <h1 className="md:mt-0 mt-4 text-center text-3xl md:text-4xl font-semibold text-black">
                    {t("My")}  <span className="text-custom-green">{t("Profile")}</span>
                </h1>
                <p className="text-center text-base mt-2 max-w-xl text-black">
                    {t("Manage your account details, addresses all in one place")}.
                </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg border-2 border-gray-200 shadow-lg overflow-hidden">
                {/* Profile Header */}
                <div className="p-4 md:p-6 flex flex-col sm:flex-row items-center sm:items-start">
                    <div className="md:mr-8 md:mx-2 mx-auto mb-3 sm:mb-0 sm:mr-4">
                        <FaUserAlt className='text-black' size={55} />
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className="text-xl font-semibold text-black">{user?.fullName || profileData.username || "User Name"}</h2>
                        <p className="text-gray-600">{user?.email || profileData.email || "user@example.com"}</p>
                    </div>
                    <button
                        className="mt-3 sm:mt-0 sm:ml-auto px-4 py-2 rounded bg-custom-green text-white hover:bg-gray-800 cursor-pointer transition"
                        onClick={toggleEditMode}
                    >
                        {isEditing ? t('Save') : t('Edit')}
                    </button>
                </div>

                {/* Profile Form */}
                <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">{t("First Name")}</label>
                            {isEditing ? (
                                <>
                                    <input
                                        className={`w-full p-2 border rounded text-black focus:outline-none focus:ring-1 ${errors.username ? 'border-red-500 focus:ring-red-500' : 'focus:ring-black'}`}
                                        value={profileData.username}
                                        type='text'
                                        name="username"
                                        placeholder={t("Your Name")}
                                        onChange={(e) => handleInputChange("username", e.target.value)}
                                        onBlur={(e) => handleBlur("username", e.target.value)}
                                    />
                                    {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                                </>
                            ) : (
                                <div className="text-black w-full p-2 border rounded bg-gray-50">
                                    {profileData.username || t('Not provided')}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">{t("Last Name")}</label>
                            {isEditing ? (
                                <>
                                    <input
                                        className={`w-full p-2 border rounded text-black focus:outline-none focus:ring-1 ${errors.lastname ? 'border-red-500 focus:ring-red-500' : 'focus:ring-black'}`}
                                        value={profileData.lastname}
                                        type='text'
                                        name="lastname"
                                        placeholder={t("Your Last Name")}
                                        onChange={(e) => handleInputChange("lastname", e.target.value)}
                                        onBlur={(e) => handleBlur("lastname", e.target.value)}
                                    />
                                    {errors.lastname && <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>}
                                </>
                            ) : (
                                <div className="text-black w-full p-2 border rounded bg-gray-50">
                                    {profileData.lastname || t('Not provided')}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">{t("Email")}</label>
                            {isEditing ? (
                                <>
                                    <input
                                        className={`w-full p-2 border rounded text-black focus:outline-none focus:ring-1 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-black'}`}
                                        value={profileData.email}
                                        type='email'
                                        name="email"
                                        placeholder={t("Your Email")}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        onBlur={(e) => handleBlur("email", e.target.value)}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </>
                            ) : (
                                <div className="text-black w-full p-2 border rounded bg-gray-50">
                                    {profileData.email || t('Not provided')}
                                </div>
                            )}
                        </div>


                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">{t("Country")}</label>
                            {isEditing ? (
                                <>
                                    <CountryDropdown
                                        className={`w-full p-2 border rounded text-black focus:outline-none focus:ring-1 ${errors.country ? 'border-red-500 focus:ring-red-500' : 'focus:ring-black'}`}
                                        value={profileData.country}
                                        onChange={(val) => handleInputChange('country', val)}
                                        onBlur={() => handleBlur('country', profileData.country)}
                                    />
                                    {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                                </>
                            ) : (
                                <div className="text-black w-full p-2 border rounded bg-gray-50">
                                    {profileData.country || t('Not provided')}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">{t("Shipping Address")}</label>
                            {isEditing ? (
                                <>
                                    <AddressInput
                                        setProfileData={setProfileData}
                                        profileData={profileData}
                                        value={profileData?.address}
                                        className={`w-full p-2 border rounded text-black focus:outline-none focus:ring-1 ${errors.address ? 'border-red-500 focus:ring-red-500' : 'focus:ring-black'}`}
                                        onBlur={() => handleBlur('address', profileData.address)}
                                    />
                                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                </>
                            ) : (
                                <div className="text-black w-full p-2 border rounded bg-gray-50">
                                    {profileData.address || t('Not provided')}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-1">{t("Mobile")}</label>
                            {isEditing ? (
                                <>
                                    <input
                                        className={`w-full p-2 border rounded text-black focus:outline-none focus:ring-1 ${errors.number ? 'border-red-500 focus:ring-red-500' : 'focus:ring-black'}`}
                                        value={profileData.number}
                                        type='tel'
                                        name="number"
                                        placeholder={t("Your Mobile Number")}
                                        onChange={(e) => handleInputChange("number", e.target.value)}
                                        onBlur={(e) => handleBlur("number", e.target.value)}
                                        maxLength={10}
                                    />
                                    {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
                                </>
                            ) : (
                                <div className="text-black w-full p-2 border rounded bg-gray-50">
                                    {profileData.number || t('Not provided')}
                                </div>
                            )}
                        </div>
                    </div>

                    {!isEditing && (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-4 text-black">{t("Change Password")}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-1">{t("New Password")}</label>
                                    <input
                                        className={`w-full p-2 border rounded text-black focus:outline-none focus:ring-1 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-black'}`}
                                        placeholder={t("Enter New Password")}
                                        type="password"
                                        name="password"
                                        value={profilePassword.password}
                                        onChange={(e) => handlePasswordChange('password', e.target.value)}
                                        onBlur={(e) => handleBlur('password', e.target.value)}
                                    />
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-1">{t("Confirm Password")}</label>
                                    <input
                                        className={`w-full p-2 border rounded text-black focus:outline-none focus:ring-1 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'focus:ring-black'}`}
                                        placeholder={t("Confirm New Password")}
                                        type="password"
                                        name="confirmPassword"
                                        value={profilePassword.confirmPassword}
                                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                        onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
                                    />
                                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    className="bg-custom-green rounded-lg text-white px-4 py-2.5 hover:bg-gray-800 transition mt-4"
                                    onClick={changePassword}
                                >
                                    {t("Change Password")}
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