import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const testimonialsData = [
    {
        name: "Ahmed Saeed",
        role: "Co Founder",
        image: "https://storage.googleapis.com/a1aa/image/1MdlyNcbY16TApF_cHcFWQMQT3JO1HAK2iiV9QUhqNA.jpg",
        testimonial: "The quality and freshness of the groceries are top-notch. I love how easy it is to order and pick up — a real time-saver for busy people like me",
    },
    {
        name: "John Doe",
        role: "Co Founder",
        image: "https://storage.googleapis.com/a1aa/image/8wI3Cv5Mv_0IebpC_sZ0kyGk6lNq-ZP4mrQHIhWcJZI.jpg",
        testimonial: "This service has changed how I shop. Everything is well-organized, on time, and perfectly packed. Highly recommend to anyone looking for convenience and quality",
    },
    {
        name: "Jane Smith",
        role: "Co Founder",
        image: "https://storage.googleapis.com/a1aa/image/1MdlyNcbY16TApF_cHcFWQMQT3JO1HAK2iiV9QUhqNA.jpg",
        testimonial: "From the intuitive website to the freshness of each item — every part of the experience feels premium. It’s reliable, efficient, and customer-focused..",
    },
];

const Testimonials = () => {
    return (
        <div className="bg-white md:mt-4 mt-12 md:mb-6 mb-12">
            <div className="container mx-auto max-w-7xl md:py-12 py-0">
                <div className="text-center mb-12 flex flex-col items-center justify-center">
                    <h2 className="text-[20px] md:text-[24px] mb-2 font-bold text-black">Great Words From People</h2>
                    <p className="text-[#6B6B6B] w-[90%] md:w-[50%] text-[13px] md:text-[15px] text-center italic">
                    Here’s what our customers and partners are saying about their experience — from the freshness of our products to the ease of grocery pickup.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 place-items-center xl:mx-auto md:mx-10 mx-auto xl:gap-10 md:gap-12 gap-16 pt-8 max-w-7xl">

                    {testimonialsData.map((testimonial, index) => (
                        <div key={index} className="relative bg-[url('/backgound12.png')] bg-cover rounded-lg flex flex-col justify-center items-center h-[254px] md:h-[329px] xl:w-[416px] md:w-[386px] w-[330px]">
                            <img
                                alt={`Portrait of ${testimonial.name}`}
                                className="absolute top-[-45px] md:left-40 left-32 md:w-24 w-20 h-20 md:h-24 rounded-full mx-auto mb-8"
                                src={testimonial.image}
                            />
                            <h3 className="text-[18px] md:text-[24px] mt-6 text-black font-semibold">{testimonial.name}</h3>
                            <p className="text-gray-500 mb-4 text-[12px] md:text-[16px]">{testimonial.role}</p>
                            <p className="text-gray-600 mb-4 px-6 text-[12px] md:text-[16px] text-center">{testimonial.testimonial}</p>
                            <div className="flex justify-center mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-500" />
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