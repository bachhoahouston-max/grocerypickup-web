import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Api } from '@/services/service';
import { useTranslation } from "react-i18next";

const FeedbackForm = (props) => {
 const { t } = useTranslation()
 const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        query: '',
        message: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear error for the field being edited
        setErrors({
            ...errors,
            [name]: ''
        });
    };

    

    const submitFeedback = (e) => {
        e.preventDefault();
        props.loader(true);
    
        // Validation
        // if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.query || !formData.message) {
        //     props.loader(false);
        //     props.toaster({ type: "error", message: "All fields are required." });
        //     return;
        // }
    
        // Phone number validation
        if (formData.phoneNumber.length !== 10) {
            props.loader(false);
            props.toaster({ type: "error", message: "Phone number must be exactly 10 digits." });
            return;
        }
    
        Api("post", "createFeedback", formData).then(
            (res) => {
                props.loader(false);
                if (res?.status) {
                    props.toaster({ type: "success", message: "Query submitted successfully" });
                    // Reset form
                    setFormData({
                        fullName: '',
                        email: '',
                        phoneNumber: '',
                        query: '',
                        message: ''
                    });
                    router.push("/");
                } else {
                    props.toaster({ type: "error", message: res?.data?.message || "Failed to submit feedback" });
                }
            },
            (err) => {
                props.loader(false);
                props.toaster({ type: "error", message: err?.data?.message || "Failed to submit feedback" });
            }
        );
    };

    return (
        <div className="relative md:mt-0 mt-14">
            <img
                src="./image00.png"
                alt="Return Policy"
                className="h-24 md:h-full w-full"
            />
            <div className="absolute top-[44px] md:top-14 left-1/2 transform -translate-x-1/2 flex justify-center items-center ">
                <p className="text-black font-bold text-[15px] md:text-[28px] p-2 bg-opacity-75 rounded lg:mt-3 ">
                    {t("Contact Us")}
                </p>
            </div>
            <div className="container mx-auto py-4 md:py-16 ">
                <form className="bg-white p-8 max-w-7xl mx-auto" onSubmit={submitFeedback}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-gray-700">{t("Full Name")}</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`w-full mt-2 text-gray-700 p-2 border bg-[#F9F9F9] outline-none rounded-md ${errors.fullName ? 'border-red-500' : ''}`}
                                placeholder={t("Full Name")}
                                required
                            />
                            {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
                        </div>
                        <div>
                            <label className="block text-[16px] text-gray-700"> {t("Email")}</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full mt-2 text-gray-700 p-2 border bg-[#F9F9F9] rounded-md outline-none ${errors.email ? 'border-red-500' : ''}`}
                                placeholder={t("Email")}
                                required
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-700 text-[16px]">{t("Phone number")}</label>
                            <input
                                type="number"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                minLength={10}
                                maxLength={10}
                                className={`w-full mt-2 p-2 text-gray-700 border bg-[#F9F9F9] rounded-md outline-none ${errors.phoneNumber ? 'border-red-500' : ''}`}
                                placeholder={t("Phone number")}
                                required
                            />
                            {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
                        </div>

                      

                        <div>
                            <label className="block text-gray-700 text-[16px]">{t("Message")} *</label>
                            <textarea
                                name="query"
                                rows="3"
                                value={formData.query}
                                onChange={handleChange}
                                className={`text-gray-700 w-full mt-2 p-2 border bg-[#F9F9F9] rounded-md ${errors.query ? 'border-red-500' : ''}`}
                               placeholder= {t("Message")} 
                                required
                            >
                            </textarea>
                            {errors.query && <p className="text-red-500 text-sm">{errors.query}</p>}
                        </div>
                    </div>
                    <div className="text-center mt-6">
                        <button type="submit" className="bg-[#F38529] text-white py-2 px-6 rounded-md">{t("Send Message")}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm;