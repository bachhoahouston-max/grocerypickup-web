import React from 'react';

const CouponCode = () => {
  const coupons = Array(9).fill({
    code: 'GHAVRU3463463',
    description: 'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum',
    imageUrl: './giftbox.png',
  });

  return (
    <div className="container w-[75%] mx-auto p-4 bg-white my-7">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {coupons.map((coupon, index) => (
          <div key={index} className="bg-custom-green h-[336px] rounded-lg p-4  flex justify-center items-center flex-col">
            <div className="rounded-full w-[157px] h-[157px] bg-black flex justify-center items-center"> 
            <img
              alt="Gift box with a red ribbon"
              className="w-20 h-20 mb-4"
            //   height="100"
              src={coupon.imageUrl}
            //   width="100"
            />
            </div>
            <h2 className="text-[18px] font-bold mb-2 mt-2">Coupon Code</h2>
            <p className="text-black text-[14px] rounded-md px-2 py-[7px]  border-2 border-black  mb-2">
              {coupon.code}
            </p>
            <p className="text-black xl:w-[40%] w-[50%] text-[13px] text-center mt-2">{coupon.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouponCode;