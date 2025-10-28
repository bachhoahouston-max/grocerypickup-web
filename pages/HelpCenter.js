import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { Api } from '@/services/service';
import { useRouter } from "next/router";
import Head from "next/head";
function HelpCenter(props) {
    const { t } = useTranslation()
    const [JoinOurTeam, setJoinOurTeam] = useState({
        JoinTeam: ''
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const getPrivacyPolicy = () => {
        props.loader(true);  // Show the loader while fetching
        Api("get", "/content", router).then(
            (res) => {
                props.loader(false);  // Hide the loader after fetching

        
                if (res?.status) {
                    setJoinOurTeam({ JoinTeam: res?.data[0]?.HelpCenter, id: res?.data[0]?._id });
                    setLoading(false);  // Successfully fetched data, update loading state
                } else {
                    props.toaster({ type: "error", message: res?.data?.message });
                    setLoading(false);  // Even if there's an error, we need to stop the loading
                }
            },
            (err) => {
                props.loader(false);  // Hide loader if there's an error
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
        <>
            <Head>
                <title>
                    Customer Support Center – Help at Bachhoahouston</title>
                <meta name="description" content="Visit our customer support center for quick answers on orders, delivery, pickup, and more. We're here to help at Bachhoahouston every day!" />
                <link
                    rel="canonical"
                    href="https://www.bachhoahouston.com/HelpCenter"
                />
            </Head>
            <div className="relative min-h-screen md:mt-10 mt-9">
                <h1 className="text-black font-bold text-center text-[20px] md:text-[24px] p-2 bg-opacity-75 rounded lg:mt-3 ">
                    {t("Help Center")}
                </h1>
                <section className="bg-white w-full flex flex-col justify-center items-center">
                    <div className="max-w-7xl mx-auto w-full md:px-5 px-5 md:pt-10 pt-5 md:pb-10 pb-5 md:min-h-screen">

                        {loading ? (
                            <p className="text-base text-black font-normal md:pb-5">Loading...</p>
                        ) : (
                            <div className="md:text-[18px] text-[14px] text-black font-normal md:pb-5 store-content" dangerouslySetInnerHTML={{ __html: JoinOurTeam?.JoinTeam }} />
                        )}
                    </div>
                </section>
            </div>
        </>

    );
}

export default HelpCenter;