import React, { useState } from "react";
import { useRouter } from "next/router";
import { Api } from "@/services/service";
import { useTranslation } from "react-i18next";
import Head from "next/head";
const FeedbackForm = (props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    query: "",
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Only letters and spaces allowed";
        if (value.trim().split(/\s+/).length < 2) return "Please enter both first and last name";
        return "";
      case "email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
        return "";
      case "phoneNumber":
        if (!value) return "Phone number is required";
        if (!/^\d{10}$/.test(value)) return "Phone number must be 10 digits";
        return "";
      case "query":
        if (!value.trim()) return "This field is required";
        if (value.length < 10) return "Message should be at least 10 characters";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "fullName" && /[0-9]/.test(value)) {
      return;
    }
    if (name === "phoneNumber" && value && !/^\d*$/.test(value)) {
      return;
    }
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors({
      ...errors,
      [name]: error,
    });
  };

  const submitFeedback = (e) => {
    e.preventDefault();

    let formValid = true;
    const newErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        formValid = false;
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    if (!formValid) {
      props.toaster({
        type: "error",
        message: "Please fix the errors in the form",
      });
      return;
    }

    props.loader(true);

    Api("post", "createFeedback", formData).then(
      (res) => {
        props.loader(false);
        if (res?.status) {
          props.toaster({
            type: "success",
            message: "Query submitted successfully",
          });
          // Reset form
          setFormData({
            fullName: "",
            email: "",
            phoneNumber: "",
            query: "",
            message: "",
          });
          router.push("/");
        } else {
          props.toaster({
            type: "error",
            message: res?.data?.message || "Failed to submit feedback",
          });
        }
      },
      (err) => {
        props.loader(false);
        props.toaster({
          type: "error",
          message: err?.data?.message || "Failed to submit feedback",
        });
      }
    );
  };

  return (
    <>
      <Head>
        <title>Contact Us – Bachhoahouston Vietnamese Specialty Food</title>
        <meta name="description" content="Join the Bachhoahouston family! Own a proven retail franchise with food, grocery & delivery services. Start your franchise journey" />
        <link
          rel="canonical"
          href="https://www.bachhoahouston.com/ContactUs"
        />
      </Head>

      {/* <div className="min-h-[600px] md:mt-14 mt-14">

        <div className="flex justify-center items-center ">
          <h1 className="text-black font-bold text-[20px] md:text-[28px] p-2 bg-opacity-75 rounded lg:mt-3 ">
            {t("Contact Us")}
          </h1>
        </div>
        <div className="container mx-auto py-2 md:py-10">
          <form
            className="bg-white p-8 max-w-7xl mx-auto"
            onSubmit={submitFeedback}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className=" text-gray-700">{t("Full Name")}</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full mt-2 text-gray-700 p-2 border bg-[#F9F9F9] outline-none rounded-md ${errors.fullName ? "border-red-500" : ""
                    }`}
                  placeholder={t("Full Name")}
                  required
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm">{errors.fullName}</p>
                )}
              </div>
              <div>
                <label className=" text-[16px] text-gray-700">
                  {t("Email")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full mt-2 text-gray-700 p-2 border bg-[#F9F9F9] rounded-md outline-none ${errors.email ? "border-red-500" : ""
                    }`}
                  placeholder={t("Email")}
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
              <div>
                <label className=" text-gray-700 text-[16px]">
                  {t("Phone number")}
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={10}
                  className={`w-full mt-2 p-2 text-gray-700 border bg-[#F9F9F9] rounded-md outline-none ${errors.phoneNumber ? "border-red-500" : ""
                    }`}
                  placeholder={t("Phone number")}
                  required
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                )}
              </div>

              <div>
                <label className=" text-gray-700 text-[16px]">
                  {t("Message")} *
                </label>
                <textarea
                  name="query"
                  rows="3"
                  value={formData.query}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`text-gray-700 w-full mt-2 p-2 border bg-[#F9F9F9] rounded-md ${errors.message ? "border-red-500" : ""
                    }`}
                  placeholder={t("Message")}
                  required
                ></textarea>
                {errors.query && (
                  <p className="text-red-500 text-sm">{errors.query}</p>
                )}
              </div>
            </div>
            <div className="text-center mt-6">
              <button
                type="submit"
                className="bg-[#F38529] text-white py-2 px-6 rounded-md"
              >
                {t("Send Message")}
              </button>
            </div>
          </form>
        </div>
      </div> */}

      <div className="min-h-[600px] md:mt-14 mt-14">
        <div className="container mx-auto px-4 py-2 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">

            {/* Left Side - Content */}
            <div className="flex flex-col justify-start">
              <div className="mb-6">
                <p className="text-gray-500 text-sm mb-2">Home › {t("Contact Us")}</p>
                <h1 className="text-black font-bold text-[40px] md:text-[56px] leading-tight">
                  Get in-touch<br />with us!
                </h1>
              </div>

              <p className="text-gray-700 text-base mb-8">
                We're here to help! Whether you have a question about our services or need assistance with your account or want to provide feedback, our team is ready to assist you.
              </p>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 font-medium mb-1">Email:</p>
                  <p className="text-black text-lg">contact@bachhaohoustan.com</p>
                </div>

                <div>
                  <p className="text-gray-700 font-medium mb-1">Phone No:</p>
                  <p className="text-black text-lg">832-230-9288</p>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-start lg:items-center">
              <form
                className="bg-[#C8D5B9] p-6 md:p-8 rounded-3xl w-full"
                onSubmit={submitFeedback}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-black font-medium text-sm block mb-2">
                      {t("Full Name")}
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 text-gray-700 bg-white rounded-full outline-none ${errors.fullName ? "border-2 border-red-500" : "border-0"
                        }`}
                      placeholder={t("Enter your name")}
                      required
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-black font-medium text-sm block mb-2">
                      {t("Phone No")}
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength={10}
                      className={`w-full px-4 py-3 text-gray-700 bg-white rounded-full outline-none ${errors.phoneNumber ? "border-2 border-red-500" : "border-0"
                        }`}
                      placeholder={t("Enter your phone number")}
                      required
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-black font-medium text-sm block mb-2">
                    {t("Email")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 text-gray-700 bg-white rounded-full outline-none ${errors.email ? "border-2 border-red-500" : "border-0"
                      }`}
                    placeholder={t("Enter your email")}
                    required
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="text-black font-medium text-sm block mb-2">
                    {t("Message")}
                  </label>
                  <textarea
                    name="query"
                    rows="4"
                    value={formData.query}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 text-gray-700 bg-white rounded-3xl outline-none resize-none ${errors.query ? "border-2 border-red-500" : "border-0"
                      }`}
                    placeholder={t("Enter your message")}
                    required
                  ></textarea>
                  {errors.query && (
                    <p className="text-red-500 text-sm mt-1">{errors.query}</p>
                  )}
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-[#4A7C59] hover:bg-[#3d6b4a] text-white font-medium py-3 px-8 rounded-full transition-colors"
                  >
                    {t("Send Message")}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>

    </>

  );
};

export default FeedbackForm;