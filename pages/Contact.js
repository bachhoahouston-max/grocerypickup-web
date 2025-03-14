import React from 'react';
import { useRouter } from 'next/router';

const Contact = () => {
  const router = useRouter();
  return (
   <div className="mx-auto max-w-7xl py-12">
      <h1 className="text-center text-[36px] font-semibold mb-8 text-black">
        Catch Up with Our Customer Support
      </h1>
      <div className="grid  grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 ">
        {/* For Customers Section */}
        <div className="p-4 cursor-pointer"
        onClick={() => { router.push('/Feedbackform') }}
        >
          <img
            alt="Handshake between two people"
            className="rounded-[20px] w-[380px] h-[339px] object-cover"
            src="./contactusimage-1.png"
          />
          <h2 className="text-[24px] font-semibold mt-4 text-black">For Customers</h2>
          <p className="text-custom-gray mt-2 text-[18px]">
            Remote work has drastically improved my design skills by giving me the freedom to experiment, focus, and learn at my own pace.
          </p>
        </div>

        {/* For Produce Suppliers Section */}
        <div className="cursor-pointer p-4"
        
        onClick={() => { router.push('/RPIVenderFrom') }}
        >

          <img
            alt="Produce supplier in a market"
            className="rounded-[20px] w-[380px] h-[339px] object-cover"
            src="./contactusimage-2.png"
          />
          <h2 className="text-[24px] font-semibold mt-4 text-black">For Produce Suppliers</h2>
          <p className="text-custom-gray mt-2 text-[18px]">
            Remote work has drastically improved my design skills by giving me the freedom to experiment, focus, and learn at my own pace.
          </p>
        </div>

        {/* For Other Vendor Suppliers Section */}
        <div className="cursor-pointer p-4"
          onClick={() => { router.push('/venderFrom') }}
        >
          <img
            alt="Vendor supplies in a market"
            className="rounded-[20px] w-[380px] h-[339px] object-cover"
            src="./contactusimage-3.png"
          />
          <h2 className="text-[24px] font-semibold mt-4 text-black">For Other Vendor Suppliers</h2>
          <p className="text-custom-gray mt-2 text-[18px]">
            Remote work has drastically improved my design skills by giving me the freedom to experiment, focus, and learn at my own pace.
          </p>
        </div>

        {/* For Employment Verification Section */}
        <div className="cursor-pointer p-4"
        onClick={() => { router.push('/EmployementVerification') }}
        >
          <img
            alt="Person verifying employment on a smartphone"
            className="rounded-[20px] w-[380px] h-[339px] object-cover"
            src="./contactusimage-4.png"
          />
          <h2 className="text-[24px] font-semibold mt-4 text-black">For Employment Verification</h2>
          <p className="text-custom-gray mt-2 text-[18px]">
            Remote work has drastically improved my design skills by giving me the freedom to experiment, focus, and learn at my own pace.
          </p>
        </div>
      </div>
    </div> 
  );
};

export default Contact;