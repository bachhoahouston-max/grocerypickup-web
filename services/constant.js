const prodUrl = "https://api.lifology.com";
const devUrl = "https://sp-app-api.herokuapp.com/v1/api/";
let apiUrl = devUrl;

// const user = !!localStorage
//   ? JSON.parse(localStorage.getItem("userDetail"))
//   : null;

// const user = () => {
//   if (localStorage) {
//     return SON.parse(localStorage.getItem("userDetail"));
//   } else {
//     return null;
//   }
// };

const Constants = {
  baseUrl: apiUrl,
  lightgrey: "#757575",
  grey: "#333333",
  yellow: "#FFE600",
  black: "#000000",
  green: "#07A404",
  white: "#FFFFFF",
  red: "#E71126",
  constant_appLaunched: "appLaunched",
  HAS_ACCOUNT: "HASACCOUNT",
  LANGUAGE_SELECTED: "LANGUAGE_SELECTED",
  header_back_middle_right: "header_back_middle_right",
  header_back: "header_back",
  keyUserToken: "token",
  isOnboarded: "isOnboarded",
  authToken: "",
  keysocailLoggedIn: "isSocialLoggedIn",
  isProfileCreated: "isProfileCreated",
  userInfoObj: "userInfoObj",
  lastUserType: "lastUserType",
  isDeviceRegistered: "isDeviceRegistered",
  canResetPass: "canResetPass",
  fcmToken: "fcmToken",
  productionUrl: prodUrl,
  developmentUrl: devUrl,

  emailValidationRegx:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  numberValidationRegx: /^\d+$/,
  passwordValidation: /^(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/,


};




export default Constants;
