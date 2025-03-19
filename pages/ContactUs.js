import React, { useState } from 'react';
import { Api } from '@/services/service';

const FeedbackForm = (props) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        query: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const submitFeedback = (e) => {
        e.preventDefault();
        props.loader(true);

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
        <div className="relative">
            <img
                src="./image12345.png"
                alt="Return Policy"
                className="h-24 md:h-full w-full"
            />
            <div className="absolute top-[44px] md:top-14 left-1/2 transform -translate-x-1/2 flex justify-center items-center ">
                <p className="text-black font-bold text-[15px] md:text-[28px] p-2 bg-opacity-75 rounded lg:mt-3 ">
                    Contact Us
                </p>
            </div>
            <div className="container mx-auto py-4 md:py-16 ">
                <form className="bg-white p-8 max-w-7xl mx-auto" onSubmit={submitFeedback}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full mt-2 text-gray-700 p-2 border bg-[#F9F9F9] outline-none rounded-md"
                                placeholder="Vaibhav"
                            />
                        </div>
                        <div>
                            <label className="block text-[16px] text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full mt-2 text-gray-700 p-2 border bg-[#F9F9F9] rounded-md outline-none"
                                placeholder="Vaibhavmehrotra84@gmail.com"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-[16px]">Phone number</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full mt-2 p-2 text-gray-700 border bg-[#F9F9F9] rounded-md outline-none"
                                placeholder="987846447874"
                            />
                        </div>

                        <div className="">
                            <label className="block text-gray-700 text-[16px]">Message </label>
                            <input
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full mt-2 p-2 border text-gray-700 bg-[#F9F9F9] rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-[16px]">My Query *</label>
                            <textarea
                                name="query"
                                type="text"
                                rows="4"
                                value={formData.query}
                                onChange={handleChange}
                                className="text-gray-700  w-full mt-2 p-2 border bg-[#F9F9F9] rounded-md"
                            >
                            </textarea>


                        </div>
                    </div>
                    <div className="text-center mt-6">
                        <button type="submit" className="bg-gray-800 text-white py-2 px-6 rounded-md">Send Query</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm;