import React from "react";
import { useTranslation } from "react-i18next";
import { FaStar } from "react-icons/fa6";
import Image from "next/image";

const Testimonials = () => {
  const { t } = useTranslation();

  const testimonialsData = [
    {
      id: 1,
      name: "Yen Tran",
      role: t("Customer"),
      image: "/yen_tran.jpg",
      quote: t(
        "The quality and freshness of the groceries are top-notch. I love how easy it is to order and pick up a real time-saver for busy people like me"
      ),
      rating: 5,
    },
    {
      id: 2,
      name: "David Tran",
      role: t("Customer"),
      image: "/David_jran.jpg",
      quote: t(
        "This service has changed how I shop. Everything is well-organized, on time, and perfectly packed. Highly recommend to anyone looking for convenience and quality"
      ),
      rating: 5,
    },
    {
      id: 3,
      name: "Chau Le",
      role: t("Customer"),
      image: "/Chau_le.jpg",
      quote: t(
        "From the intuitive website to the freshness of each item — every part of the experience feels premium. It's reliable, efficient, and customer-focused"
      ),
      rating: 5,
    },
  ];

  return (
    <div className="bg-white md:mt-4 mt-12 md:mb-6 mb-12">
      <div className="container mx-auto max-w-7xl md:py-12 py-0">
        <div className="text-center mb-12 flex flex-col items-center justify-center">
          <h2 className="text-[20px] md:text-[24px] mb-2 font-bold text-black">
            {t("Great Words From People")}
          </h2>
          <p className="text-gray-500 w-11/12 md:w-1/2 text-sm md:text-base text-center italic">
            {t(
              "Here's what our customers and partners are saying about their experience — from the freshness of our products to the ease of grocery pickup"
            )}
            .
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 place-items-center xl:mx-auto md:mx-10 mx-auto xl:gap-10 md:gap-8 lg:gap-8 gap-16 pt-8 max-w-7xl">
          {testimonialsData.map((testimonial) => (
            <div
              key={testimonial.id}
              className="relative bg-[url('/backgound12.png')] bg-cover bg-center bg-no-repeat rounded-lg flex flex-col justify-center items-center h-64 md:h-80 w-80 md:w-[350px] lg:w-[350px] xl:w-[420px] transition-transform duration-300 hover:-translate-y-[8px] hover:shadow-xl"
            >
              <Image
                alt={`Portrait of ${testimonial.name}`}
                className="absolute top-[-45px] left-1/2 transform -translate-x-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-8 border-4 border-white"
                src={testimonial.image}
                width={60}
                height={60}
              />
              <h3 className="text-lg md:text-2xl mt-6 text-black font-semibold">
                {testimonial.name}
              </h3>
              <p className="text-gray-500 mb-4 text-xs md:text-base">
                {testimonial.role}
              </p>
              <p className="text-gray-600 mb-4 px-6 text-xs md:text-sm lg:text-base text-center">
                {testimonial.quote}
              </p>
              <div className="flex justify-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar
                    key={i}
                    className="text-[#F38529] md:text-[17px] text-sm"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
