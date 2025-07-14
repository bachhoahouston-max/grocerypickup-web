
import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { Api } from '@/services/service';
import { useRouter } from "next/router";

function FranchiseOpportunity(props) {
    const { t } = useTranslation()
    const [FranchiseOpportunity, setFranchiseOpportunity] = useState("");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const getPrivacyPolicy = () => {
        props.loader(true);  // Show the loader while fetching
        Api("get", "/content", router).then(
            (res) => {
                props.loader(false);  // Hide the loader after fetching

                console.log("API Response =>", res.data);

                if (res?.status) {
                    setFranchiseOpportunity(res?.data[0]?.FranchiseOpportunity );
                    setLoading(false);  // Successfully fetched data, update loading state
                } else {
                    props.toaster({ type: "error", message: res?.data?.message });
                    setLoading(false);  // Even if there's an error, we need to stop the loading
                }
            },
            (err) => {
                props.loader(false);  // Hide loader if there's an error
                console.log("API Error =>", err);
                props.toaster({ type: "error", message: err?.data?.message });
                props.toaster({ type: "error", message: err?.message });
                setLoading(false);  // Stop loading in case of error
            }
        );
    };

    useEffect(() => {
        getPrivacyPolicy();
    }, []);

    return (
        <div className="relative min-h-screen md:mt-4 mt-8">
            <section className="bg-white w-full flex flex-col justify-center items-center">
                <div className="max-w-7xl mx-auto w-full md:px-5 px-5 md:pt-10 pt-5 md:pb-10 pb-5 md:min-h-screen">

                    {loading ? (
                        <p className="text-base text-black font-normal md:pb-5">Loading...</p>
                    ) : (
                        <div className="md:text-[18px] text-[14px] text-black font-normal md:pb-5" dangerouslySetInnerHTML={{ __html: FranchiseOpportunity }} />
                    )}
                </div>
            </section>
        </div>
    );
}

export default FranchiseOpportunity;