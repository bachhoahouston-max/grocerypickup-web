import axios from "axios";

const staticPages = [
    { url: "https://www.bachhoahouston.com/", priority: 1.0 },
    { url: "https://www.bachhoahouston.com/AboutUs", priority: 0.8 },
    { url: "https://www.bachhoahouston.com/ContactUs", priority: 0.8 },
    { url: "https://www.bachhoahouston.com/StoreLocation", priority: 0.7 },
    { url: "https://www.bachhoahouston.com/FranchiseOpportunity", priority: 0.7 },
    { url: "https://www.bachhoahouston.com/ReturnPolicy", priority: 0.7 },
    { url: "https://www.bachhoahouston.com/Termsandcondition", priority: 0.7 },
    { url: "https://www.bachhoahouston.com/PrivacyPolicy", priority: 0.7 },
    { url: "https://www.bachhoahouston.com/HelpCenter", priority: 0.6 },
    { url: "https://www.bachhoahouston.com/ProductRecallInfo", priority: 0.6 },
    { url: "https://www.bachhoahouston.com/JoinOurDelievryTeam", priority: 0.6 },
    { url: "https://www.bachhoahouston.com/signIn", priority: 0.6 },
    { url: "https://www.bachhoahouston.com/AllCategory", priority: 0.6 },
    { url: "https://www.bachhoahouston.com/Mybooking", priority: 0.6 },
    { url: "https://www.bachhoahouston.com/Myhistory", priority: 0.6 },
    { url: "https://www.bachhoahouston.com/account", priority: 0.6 },
    { url: "https://www.bachhoahouston.com/editProfile", priority: 0.6 },
    { url: "https://www.bachhoahouston.com/forgotPassword", priority: 0.6 },
    { url: "https://www.bachhoahouston.com/payment", priority: 0.6 },
    { url: "https://www.bachhoahouston.com/signUp", priority: 0.6 },
    { url: "https://www.bachhoahouston.com/Favourite", priority: 0.6 },
];

function generateSiteMap(products, categories) {
    return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     
     <!-- Static Pages -->
     ${staticPages
            .map(
                (page) => `
       <url>
         <loc>${page.url}</loc>
         <lastmod>${new Date().toISOString()}</lastmod>
         <changefreq>weekly</changefreq>
         <priority>${page.priority}</priority>
       </url>`
            )
            .join("")}

     <!-- Product Pages -->
     ${products
            .map(
                (p) => `
       <url>
         <loc>https://www.bachhoahouston.com/product-details/${p.slug}</loc>
         <lastmod>${new Date().toISOString()}</lastmod>
         <changefreq>daily</changefreq>
         <priority>0.7</priority>
       </url>`
            )
            .join("")}

     <!-- Category Pages -->
     ${categories
            .map(
                (c) => `
       <url>
         <loc>https://www.bachhoahouston.com/categories/${c.slug}</loc>
         <lastmod>${new Date().toISOString()}</lastmod>
         <changefreq>weekly</changefreq>
         <priority>0.7</priority>
       </url>`
            )
            .join("")}
   </urlset>`;
}

const SiteMap = () => {

};

export async function getServerSideProps({ res }) {
    try {

        const [productsRes, categoriesRes] = await Promise.all([
            axios.get("https://api.bachhoahouston.com/v1/api/getProduct"),
            axios.get("https://api.bachhoahouston.com/v1/api/getCategory"),
        ]);

        const products = productsRes.data?.data || [];
        const categories = categoriesRes.data?.data || [];

        const sitemap = generateSiteMap(products, categories);

        res.setHeader("Content-Type", "text/xml");
        res.write(sitemap);
        res.end();
    } catch (error) {
        console.error("Error generating sitemap:", error);
    }

    return { props: {} };
}

export default SiteMap;
