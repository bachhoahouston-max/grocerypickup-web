import axios from "axios";
import packageJson from "../package.json";
// export const ConstantsUrl = "http://localhost:3005/v1/api/";
export const ConstantsUrl = "https://api.bachhoahouston.com/v1/api/";
export const APP_PLATFORM = "web";
export const APP_VERSION = packageJson?.version || "0.1.0";

const getClientLanguage = () => {
  if (typeof window !== "undefined") {
    const stored =
      localStorage?.getItem("LANGUAGE") ||
      localStorage?.getItem("i18nextLng");
    if (stored && stored.toLowerCase().startsWith("vi")) {
      return "vi";
    }
  }
  return "en";
};

const getCommonHeaders = () => {
  const lang = getClientLanguage();
  return {
    language: lang,
    lang: lang,
    "Accept-Language": lang,
    platform: APP_PLATFORM,
    Platform: APP_PLATFORM,
    "x-platform": APP_PLATFORM,
    "app-platform": APP_PLATFORM,
    "app-version": APP_VERSION,
    appversion: APP_VERSION,
    "x-app-version": APP_VERSION,
    version: APP_VERSION,
  };
};

// Global interceptor: ensures language, platform, and app version headers are attached to every outgoing API header
axios.interceptors.request.use((config) => {
  const headers = getCommonHeaders();
  config.headers = config.headers || {};
  Object.assign(config.headers, headers);
  return config;
});

function Api(method, url, data, router, params) {
  return new Promise(function (resolve, reject) {
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage?.getItem("token") || "";
    }

    axios({
      method,
      url: ConstantsUrl + url,
      data,
      headers: {
        Authorization: `jwt ${token}`,
        ...getCommonHeaders(),
      },
      params,
    }).then(
      (res) => {
        resolve(res.data);
      },
      (err) => {

        if (err.response) {
          const status = err.response.status;
          const message = err.response?.data?.message || "";
          if (
            (status === 401 || status === 403) &&
            typeof window !== "undefined"
          ) {
            if (
              message.toLowerCase().includes("jwt expired") ||
              message.toLowerCase().includes("unauthorized")
            ) {
              localStorage.removeItem("token");
              localStorage.removeItem("userDetail");
              router?.push("/signIn");
            }
          }

          reject(err.response.data);
        } else {
          reject(err);
        }
      }
    );
  });
}

function ApiFormData(method, url, data, router) {
  return new Promise(function (resolve, reject) {
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage?.getItem("token") || "";
    }
    axios({
      method,
      url: ConstantsUrl + url,
      data,
      headers: {
        Authorization: `jwt ${token}`,
        "Content-Type": "multipart/form-data",
        ...getCommonHeaders(),
      },
    }).then(
      (res) => {
        resolve(res.data);
      },
      (err) => {

        if (err.response) {
          if (err?.response?.status === 401) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("userDetail");
              router?.push("/");
            }
          }
          reject(err.response.data);
        } else {
          reject(err);
        }
      }
    );
  });
}

function ApiGetPdf(url, data, router, params) {
  return new Promise(function (resolve, reject) {
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage?.getItem("token") || "";
    }

    axios({
      method: "POST",
      url: ConstantsUrl + url,
      data,
      headers: {
        Authorization: `jwt ${token}`,
        ...getCommonHeaders(),
      },
      params,
      responseType: "blob",
    }).then(
      (res) => {
        const file = new Blob([res.data], { type: "application/pdf" });
        const fileURL = window.URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = fileURL;
        link.setAttribute("download", `bachhoahouston-invoice-${data.id}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve(res.data);
      },
      (err) => {

        if (err.response) {
          const status = err.response.status;
          const message = err.response?.data?.message || "";

          if (
            (status === 401 || status === 403) &&
            typeof window !== "undefined"
          ) {
            if (
              message.toLowerCase().includes("jwt expired") ||
              message.toLowerCase().includes("unauthorized")
            ) {
              localStorage.removeItem("token");
              localStorage.removeItem("userDetail");
              router?.push("/signIn");
            }
          }
          reject(err.response.data);
        } else {
          reject(err);
        }
      }
    );
  });
}

// const timeSince = (date) => {
//   date = new Date(date);
//   const diff = new Date().valueOf() - date.valueOf();
//   const seconds = Math.floor(diff / 1000);
//   var interval = seconds / 31536000;

//   if (interval > 1) {
//     return Math.floor(interval) + " Years";
//   }
//   interval = seconds / 2592000;
//   if (interval > 1) {
//     return (
//       Math.floor(interval) +
//       (Math.floor(interval) > 1 ? " Months" : " Month") +
//       " ago"
//     );
//   }
//   interval = seconds / 604800;
//   if (interval > 1) {
//     return (
//       Math.floor(interval) +
//       (Math.floor(interval) > 1 ? " Weeks" : " Week") +
//       " ago"
//     );
//   }

//   interval = seconds / 86400;
//   if (interval > 1) {
//     return (
//       Math.floor(interval) +
//       (Math.floor(interval) > 1 ? " Days" : " Day") +
//       " ago"
//     );
//   }
//   interval = seconds / 3600;
//   if (interval > 1) {
//     return (
//       Math.floor(interval) +
//       (Math.floor(interval) > 1 ? " Hours" : " Hour") +
//       " ago"
//     );
//   }
//   interval = seconds / 60;
//   if (interval > 1) {
//     return (
//       Math.floor(interval) +
//       (Math.floor(interval) > 1 ? " Min" : " min") +
//       " ago"
//     );
//   }
//   return "Just now";
// };

const pdfDownload = async (fileName, data) => {
  return new Promise(function (resolve, reject) {
    pdfMake.vfs = {};
    pdfMake.jszip = jszip;
    pdfMake.DynamicContent = {
      content: {
        widths: "100%",
      },
    };
    pdfMake.fonts = {
      Roboto: {
        normal:
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf",
        bold: "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf",
        italics:
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf",
        bolditalics:
          "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf",
      },
    };

    pdfmake.createPdf(data).download(fileName);
    pdfmake.createPdf(data).getDataUrl((blob) => {

      resolve(blob);
    });
  });
};

const replaceUrl = (url) => {
  return url?.replace(
    "https://surfacegallery.s3.eu-north-1.amazonaws.com",
    "https://d1wm56uk2e4fvb.cloudfront.net"
  );
};

export { Api, pdfDownload, ApiFormData, replaceUrl, ApiGetPdf };