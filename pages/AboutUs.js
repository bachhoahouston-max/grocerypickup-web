import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { LuBoomBox } from "react-icons/lu";
import { useTranslation } from "react-i18next";
import { Api } from "@/services/service";
import { Shield, Users, Truck, Star, CheckCircle, Clock } from 'lucide-react';

const AboutUs = (props) => {
  const { t } = useTranslation();
  const router = useRouter();

  const [teamMembers, setTeamMembers] = useState([]);

  const services = [
    { description: "Online Payment" },
    { description: "Maintenance Request Management" },
    { description: "Stakeholder Communication" },
    { description: "Document Management" },
  ];

  useEffect(() => {
    getTeamMembers();
  }, []);

  const getTeamMembers = async () => {
    props.loader(true);
    Api("get", "getTeamMembers", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res?.success) {
          setTeamMembers(res?.team || []);
        } else {
          props.loader(false);
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };
 const features = [
    {
      icon: Shield,
      title: "Quality You Can Trust",
      description: "We provide the freshest, most reliable groceries, ensuring every product meets high-quality standards. Our customers trust us for freshness and consistency.",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: Users,
      title: "Customer-Centric Approach", 
      description: "Our focus is on you. With easy ordering, quick delivery, and a commitment to customer satisfaction, we make grocery shopping simple and stress-free.",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: Truck,
      title: "Convenience at Your Doorstep",
      description: "From local produce to pantry essentials, we bring the best directly to you. Enjoy the convenience of a hassle-free, fast, and reliable shopping experience.",
      color: "bg-purple-50 text-purple-600"
    }
  ];
  return (
    <>
      <div className="w-full bg-[#f59b51] mx-auto flex flex-col md:flex-row justify-center items-center">
        <div className="md:py-18 py-8 w-full md:w-[780px] h-auto ps-4 md:ps-24">
          <nav className="mb-4 mt-18 md:mt-12 text-[16px] md:text-start text-center">
            <span className="text-white mr-1">{t("Home")} /</span>
            <span className="text-white">{t("About Us")}</span>
          </nav>
          <h1 className="md:mt-12 mt-4 md:text-start text-center text-[25px] md:text-3xl md:leading-[50px] leading-10 font-bold text-white mb-4">
            {t("Welcome to our online grocery store")}!
          </h1>
          <p className="text-white md:text-start w-[90%] text-center mb-6 text-[15px] leading-[32px]">
            {t(
              "We provide fresh, high-quality groceries with a focus on convenience and customer satisfaction. From local produce to everyday essentials, we ensure fast and reliable delivery. Our mission is to bring the best products straight to your doorstep, making grocery shopping easier and hassle-free"
            )}
          </p>
          <div className="flex justify-center md:justify-start mt-6">
            <p
              className="bg-[#F38529] cursor-pointer text-white px-6 py-3 rounded-lg text-[15px] inline-flex items-center"
              onClick={() => router.push("/categories/all")}
            >
              {t("Shop Now")}
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </p>
          </div>
        </div>
        <div className="md:flex hidden w-full md:w-auto">
          <img
            alt="A bowl of assorted fresh fruits including strawberries, kiwi, blueberries, and watermelon"
            className="w-[800px] h-auto"
            src="/Store.png"
          />
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#F38529]/10 to-transparent"></div>
          <div className="container mx-auto px-4 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-[#F38529] text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
                <Star className="w-4 h-4" />
                Why Work With Us
              </div>
              <h1 className="text-5xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Bringing Freshness &
                <span className="text-[#F38529]"> Convenience</span> Together
              </h1>
              <p className="text-xl text-gray-600 mb-4 leading-relaxed">
                We combine quality products with hassle-free shopping to make
                your daily grocery experience smoother and smarter
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                  <div
                    className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* About Section with Image */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex flex-col lg:flex-row max-h-[550px]">
              <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 bg-[#F38529]/10 text-[#F38529] px-4 py-2 rounded-full text-sm font-medium mb-6 w-fit">
                  <CheckCircle className="w-4 h-4" />
                  About Our Service
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                  Modern Grocery Delivery Service
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  We are a modern grocery pickup and delivery service committed
                  to making your daily shopping easier, faster, and more
                  reliable. With a wide range of fresh produce, pantry staples,
                  and household essentials, we bring convenience to your
                  doorstep.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#F38529]" />
                    Fast Delivery
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#F38529]" />
                    Trusted by Hundreds
                  </div>
                </div>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="aspect-square lg:aspect-auto lg:h-full bg-gradient-to-br from-[#F38529]/20 to-green-100 flex items-center justify-center">
                  <img
                    src="/Rectangle25.png"
                    alt="Fresh sliced melon"
                    className="w-full h-full object-cover rounded-2xl shadow-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-[#F38529] text-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-orange-100">Happy Families</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-orange-100">Customer Support</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">99%</div>
                <div className="text-orange-100">On-Time Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="max-w-7xl container mx-auto">
          <div className="md:mb-20 mb-10 md:mx-0 mx-6">
            <h2 className="text-2xl md:text-3xl font-semibold mb-8 md:mb-12 pt-12 text-black">
              {t("Our Team")}
            </h2>

            <div className="grid grid-cols-1  md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className=" flex flex-col justify-center hover:-translate-y-[20px]  items-center pb-6 rounded-[20px] w-full h-auto hover:shadow-lg transition-transform duration-500 cursor-pointer"
                >
                  <div className="w-[320px] h-[400px]  md:w-[300px] md:h-[350px] rounded-xl overflow-hidden mb-4 ">
                    <img
                      alt={`${member.membername}`}
                      className="w-full h-full object-cover"
                      src={member.memberimage}
                    />
                  </div>
                  <div className="hover:ms-4">
                    <span className="text-xl  font-semibold mb-2 text-black">
                      {member.membername} {""}
                    </span>
                    <span className="text-lg  text-black">
                      ({member.memberposition})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Our Services Section */}
        <div className="bg-[#F5F5F5]">
          <div className="max-w-7xl container mx-auto ">
            <h2 className="text-xl font-semibold mb-14 pt-14 text-black md:mx-0 mx-6">
              {t("Our Services")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-20 md:mx-0 mx-6">
              <div className="bg-custom-green hover:-translate-y-[20px] transition-transform duration-300 rounded-[18px] w-full h-auto cursor-pointer p-4 text-white text-center flex justify-center flex-col items-center">
                <LuBoomBox className="md:text-5xl text-4xl mb-2" />
                <p className="md:text-[19px] text-[16px]">
                  {t("Online Payment")}
                </p>
              </div>
              <div className="bg-custom-green rounded-[18px] hover:-translate-y-[20px] transition-transform duration-300 w-full h-auto cursor-pointer p-4 text-white text-center flex justify-center flex-col items-center">
                <LuBoomBox className="md:text-5xl text-4xl mb-2" />
                <p className="md:text-[19px] text-[16px]">
                  {t("Maintenance Request Management")}
                </p>
              </div>
              <div className="bg-custom-green rounded-[18px] hover:-translate-y-[20px] transition-transform duration-300 w-full h-auto cursor-pointer p-4 text-white text-center flex justify-center flex-col items-center">
                <LuBoomBox className="md:text-5xl text-4xl mb-2" />
                <p className="md:text-[19px] text-[16px]">
                  {t("Stakeholder Communication")}
                </p>
              </div>
              <div className="bg-custom-green rounded-[18px] hover:-translate-y-[20px] transition-transform duration-300 cursor-pointer w-full h-auto p-4 text-white text-center flex justify-center flex-col items-center">
                <LuBoomBox className="md:text-5xl text-4xl mb-2" />
                <p className="md:text-[19px] text-[16px]">
                  {t("Document Management")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUs;
