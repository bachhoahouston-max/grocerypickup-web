import React from 'react'

function ShopFasterTropicana() {
    return (
        <div className="bg-[url('/download2.png')] bg-cover bg-no-repeat w-full md:h-[666px]  md:p-0 p-5">
            <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-5 max-w-7xl  mx-auto h-full">
                <div className="flex flex-col justify-center items-start">
                    <p className="md:text-[55px] text-2xl font-bold text-custom-purple md:leading-[70px] text-[#35035C] ">Shop Faster With Tropicana App</p>
                    <p className="text-custom-purple font-medium md:text-[20px] text-[14px] text-[#35035C]  pt-5 md:w-full w-[250px]">Available on both IOS & Android</p>
                    <div className="flex md:flex-row flex-col justify-start items-center gap-5 md:pt-10 mt-4">
                        <img className="md:h-[63px] h-[50px] md:w-[219px] w-full object-contain" src="/image13.png" />
                        <img className="md:h-[63px] h-[58px] md:w-[219px] w-full object-contain " src="/image14.png" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShopFasterTropicana
