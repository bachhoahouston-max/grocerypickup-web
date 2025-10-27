import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { LuBoomBox } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { Api } from "@/services/service";
import { FaStore, FaCarSide, FaTruck, FaShippingFast } from "react-icons/fa";
import { Shield, Users, Truck, Star, CheckCircle, Clock, Leaf, ShoppingCart } from 'lucide-react';
import Head from "next/head";
import Image from "next/image";

const services = [
  {
    title: "In Store Pickup",
    description: "Pick it up inside the store",
    icon: <FaStore className="md:text-5xl text-4xl mb-2" />,
  },
  {
    title: "Curbside Pickup",
    description: "We bring it out to your car",
    icon: <FaCarSide className="md:text-5xl text-4xl mb-2" />,
  },
  {
    title: "Next Day Local Delivery",
    description: "Cut off time 8 pm",
    icon: <FaTruck className="md:text-5xl text-4xl mb-2" />,
  },
  {
    title: "Shipping",
    description: "Delivery in 3 to 5 business days",
    icon: <FaShippingFast className="md:text-5xl text-4xl mb-2" />,
  },
];

const AboutUs = (props) => {
  const { t } = useTranslation();
  const router = useRouter();

  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    getTeamMembers();
  }, []);

  const getTeamMembers = async () => {
    props.loader(true);
    Api("get", "getTeamMembers", "", router).then(
      (res) => {
        props.loader(false);
        if (res?.success) {
          setTeamMembers(res?.team || []);
        } else {
          props.loader(false);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const features = [
    {
      icon: Shield,
      title: "Quality You Can Trust",
      description: "We provide the freshest, most reliable groceries, ensuring every product meets high-quality standards. Our customers trust us for freshness and consistency",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: Users,
      title: "Customer-Centric Approach",
      description: "Our focus is on you. With easy ordering, quick delivery, and a commitment to customer satisfaction, we make grocery shopping simple and stress-free",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: Truck,
      title: "Convenience at Your Doorstep",
      description: "From local produce to pantry essentials, we bring the best directly to you. Enjoy the convenience of a hassle-free, fast, and reliable shopping experience",
      color: "bg-purple-50 text-purple-600"
    }
  ];

  return (
    <>
      <Head>
        <title>About Bachhoahouston – Vietnamese Specialty Food Store</title>
        <meta name="description" content="Discover Bachhoahouston, your trusted Vietnamese specialty food store offering groceries, home delivery & more. Rooted in culture, built on care" />
        <link
          rel="canonical"
          href="https://www.bachhoahouston.com/AboutUs"
        />
      </Head>

      <div className="max-w-7xl mx-auto px-4 ">


        <div className="bg-custom-lightGreen rounded-3xl  my-28 relative">
          <div className="flex flex-col lg:flex-row ">
            <div className="max-w-2xl p-8 lg:p-12 flex flex-col justify-center min-h-[450px]">
              <h1 className="text-[24px] md:text-[28px]  font-bold text-gray-900 mb-4 leading-tight">
                {t("Welcome to our online grocery store")}!
              </h1>
              <p className="text-gray-700 mb-6 text-[17px] leading-relaxed">
                {t(
                  "We provide fresh, high-quality groceries with a focus on convenience and customer satisfaction. From local produce to everyday essentials, we ensure fast and reliable delivery. Our mission is to bring the best products straight to your doorstep, making grocery shopping easier and hassle-free"
                )}
              </p>
              <div className="flex mt-6">
                <button
                  className="bg-[#2E7D3266] cursor-pointer  text-black px-6 py-3 rounded-lg text-[15px] inline-flex items-center transition-colors"
                  onClick={() => router.push("/categories/all")}
                >
                  {t("Shop Now")}
                  <ShoppingCart size={20} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
          <div className="absolute -top-13 right-10 lg:w-[550px] md:flex hidden">
            <div className="relative w-full h-[420px] lg:h-[550px]">
              <Image
                fill
                src="/Store.png"
                alt="bach hoa houston"
                className="object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>


        <div className="md:mt-28">
          <div className="bg-[#D4E8D4] rounded-3xl px-6 py-12">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-[28px] md:text-[36px] font-bold text-gray-900 mb-3">
                {t("Why Shop From Us")}
              </h2>
              <div className="flex justify-center items-center gap-2 mb-4">
                <Leaf className="text-gray-700 w-5 h-5 md:flex hidden" />
                <p className="text-[20px] md:text-[24px] text-gray-900">
                  {t("Bringing")} <span className="text-[#5FBA47] font-semibold">{t("Freshness")}</span> {t("& Convenience Together")}
                </p>
                <Leaf className="text-gray-700 w-5 h-5 md:flex hidden" />
              </div>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                {t("We combine quality products with hassle-free shopping to make your daily grocery experience smoother and smarter")}
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 md:mt-20 mt-10 mb-16 ">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-[#D4E8D4] rounded-2xl min-h-[280px] p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center">
                  <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="text-gray-900" size={48} />
                  </div>
                  <h3 className="text-[18px] font-bold text-gray-900 mb-3">
                    {t(feature.title)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-[13px]">
                    {t(feature.description)}
                  </p>
                </div>
              </div>
            ))}
          </div>


          <div className="bg-custom-lightGreen rounded-3xl  my-12 md:my-28 relative ">
            <div className="flex flex-col lg:flex-row ">
              <div className="lg:max-w-2xl p-8 lg:p-12 flex flex-col justify-center">
                <h2 className="text-[28px] lg:text-[32px] font-bold text-gray-900 mb-6 leading-tight">
                  {t("Modern Grocery Delivery Service")}
                </h2>
                <p className="text-gray-700 text-[15px] leading-relaxed mb-8">
                  {t("We are a modern grocery pickup and delivery service committed to making your daily shopping easier, faster, and more reliable. With a wide range of fresh produce, pantry staples, and household essentials, we bring convenience to your doorstep")}.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#2E7D3266]
 px-4 py-2 rounded-full text-[13px] text-gray-900">
                    <Clock className="w-4 h-4 " />
                    {t("Fast Delivery")}
                  </div>
                  <div className="flex items-center gap-2 bg-[#2E7D3266] px-4 py-2 rounded-full text-[13px] text-gray-800">
                    <Star className="w-4 h-4 " />
                    {t("Trusted by Hundreds")}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-10 right-10 lg:w-[500px] md:flex hidden">
              <div className="relative w-full h-[400px] lg:h-[400px]">
                <Image
                  fill
                  src="/Rectangle25.png"
                  alt="bach hoa houston"
                  className="object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>

        </div>


        {teamMembers.length > 0 && (
          <div className="mb-16">
            <h2 className="text-center text-[28px] md:text-[32px] font-bold mb-12 text-gray-900">
              {t("Our Team")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="max-w-80 bg-black text-white rounded-2xl cursor-pointer hover:-translate-y-2 hover:shadow-lg transition-all duration-300 flex flex-col items-center pb-6"
                >
                  {/* Image container */}
                  <div className="relative -mt-px overflow-hidden rounded-2xl w-full h-[350px]">
                    <Image
                      fill
                      alt={member.membername}
                      src={member.memberimage}
                      className="object-cover object-top hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute bottom-0 z-10 h-60 w-full bg-gradient-to-t pointer-events-none from-black to-transparent"></div>
                  </div>

                  {/* Text details */}
                  <div className="px-4  text-center mt-4">
                    <p className="text-lg">{member.membername}</p>
                    <p className="text-sm font-medium bg-gradient-to-r from-[#22c55e] via-[#16a34a] to-[#15803d] text-transparent bg-clip-text">

                      {member.memberposition}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        <div className="mb-16">
          <h2 className="text-center text-[28px] md:text-[32px] font-bold mb-12 text-gray-900">
            {t("Modern Grocery Delivery Service")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-[#D4E8D4] hover:-translate-y-2 transition-all duration-300 rounded-2xl px-4 py-8 text-center flex flex-col items-center cursor-pointer hover:shadow-lg"
              >
                <p className="text-black/90">  {service.icon}</p>
                <p className="text-[18px] md:text-[20px] font-semibold text-gray-900">
                  {t(service.title)}
                </p>
                <p className="text-[14px] md:text-[15px] text-gray-700 mt-2">
                  {t(service.description)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;