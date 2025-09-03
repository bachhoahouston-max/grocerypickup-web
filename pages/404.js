import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const NotFoundPage = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>404 - Page Not Found | NEW NUONG</title>
      </Head>


      <main className="flex flex-col items-center justify-center min-h-[70vh] bg-amber-50 py-12 px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-9xl font-bold text-custom-green mb-4">404</h1>
          <h2 className="text-4xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
          <p className="text-xl text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-custom-green hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </main>

    </>
  );
};

export default NotFoundPage;