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

      <div className="min-h-[600px] md:mt-5 mt-14 md:mb-0 mb-10">
        <div className="container mx-auto px-4 py-2 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">

            {/* Left Side - Content */}
            <div className="flex flex-col justify-start">
              <div className="mb-6">
                <p className="text-gray-500 text-sm mb-2 font-poppins">Home › {t("Contact Us")}</p>
                <h1 className="text-black font-poppins font-light text-[88px] leading-[116px] tracking-normal">
                  {t("Get in-touch")}<br />{t("with us")}!
                </h1>
              </div>

              <p className="text-gray-700 text-base mb-8 font-poppins">
                {t("We're here to help! Whether you have a question about our services or need assistance with your account or want to provide feedback, our team is ready to assist you")}.
              </p>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-700 font-medium mb-1">{t("Email")}:</p>
                  <a
                    href="mailto:contact@bachhoahouston.com"
                    className="text-black text-lg font-poppins hover:text-blue-600 transition"
                  >
                    contact@bachhoahouston.com
                  </a>
                </div>

                <div>
                  <p className="text-gray-700 font-medium mb-1">{t("Phone No")}:</p>
                  <a
                    href="tel:8322309288"
                    className="text-black text-lg hover:text-blue-600 transition"
                  >
                    832-230-9288
                  </a>
                </div>
              </div>

            </div>

            {/* Right Side - Form */}
            <div className="flex items-start lg:items-center">
              <form
                className="bg-[#2E7D3240] p-6 md:p-8 rounded-3xl w-full"
                onSubmit={submitFeedback}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="font-poppins text-black font-medium text-sm block mb-2">
                      {t("Full Name")}
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full font-poppins px-4 py-3 text-gray-700 bg-white rounded-full outline-none ${errors.fullName ? "border-2 border-red-500" : "border-0"
                        }`}
                      placeholder={t("Enter your name")}
                      required
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="font-poppins text-black font-medium text-sm block mb-2">
                      {t("Phone No")}
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      maxLength={10}
                      className={`w-full px-4 font-poppins py-3 text-gray-700 bg-white rounded-full outline-none ${errors.phoneNumber ? "border-2 border-red-500" : "border-0"
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
                    className="bg-[#2E7D32] hover:bg-[#3d6b4a] text-white font-medium py-3 px-8 rounded-full transition-colors cursor-pointer"
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