import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

function MainHeader(props) {
  
  
  return (
    <div className="bg-[url('/image88.png')] bg-cover bg-no-repeat md:h-[580px] md:p-0 ">
     <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-5 max-w-7xl mx-auto h-full px-4 md:px-5">
    <div className="flex flex-col justify-center items-center md:items-start py-10 md:py-0">
        <p className="text-black mb-4 mt-6 md:mt-6 md:mb-12 font-semibold text-[13px] md:text-[15px] text-center md:text-start">
            <span className="text-custom-gold font-semibold">100%</span> Organic Fruits
        </p>
        <h1 className="text-center md:text-start text-2xl md:text-4xl lg:text-[55px] font-bold text-custom-purple leading-tight md:leading-[60px] text-black">
            Explore fresh<br />juicy Fruits.
        </h1>
        <p className="text-[#6B6B6B] text-center md:text-start font-medium text-[13px] md:text-[15px] mt-4 italic md:mt-12 max-w-md w-[90%]">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy
        </p>
        <button className="flex justify-center md:justify-start bg-[#FEC200] text-white px-6 py-3 rounded-lg text-[13px] md:text-[15px] mt-6 md:mt-12 items-center">
            Shop Now
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
        </button>
    </div>
</div>
    </div>
  );
}

export default MainHeader;