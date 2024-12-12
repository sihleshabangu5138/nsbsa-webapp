const Users = require("../../models/User");
const Setting = require("../../models/Settings");
const axios = require("axios");
exports.verifyLoginPurchaseKey = async (req, res, next) => {
  try {
    const hostname = req.get("host");
    const parsedUrl = new URL("http://" + hostname);
    const domainName = parsedUrl.hostname;
    if (domainName === "ews.niftysol.com" || domainName === "localhost" || domainName === "192.168.1.39") {
      // If the request is from 'ews.niftysol.com', send a success response directly
      req.purchaseData = { data: "4" }; // Assuming the data is '4' for success
      return next();
    }
    const settings = await Setting.findOne({});
    if (!settings || !settings.pkey) {
      // Send an error response if the purchase code is not found
      return res.status(500).render("verficationerror", {
        title: "NiftyEWS",
        layout: "errorlayout",
        statuscode: "Purchase Key Not Found",
        message:
          "The purchase key could not be found in the database. Please try again later or contact support.",
        errorDetails: "If you need further assistance, please contact support.",
      });
    }
    const email = await Users.findOne({}, { email: 1 });
    const purchaseCode = settings.pkey;
   
    // Make a request to Envato API to verify the purchase code
    const response = await axios.post(
      `https://license.dasinfomedia.com/admin/api/license/register`,
      {
        pkey: purchaseCode,
        domain: domainName,
        email: email.email,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    // Assuming the response contains purchase data
    const purchaseData = response.data;

    switch (purchaseData.data) {
      case "0":
        // Send a success response if the purchase code is valid
        req.purchaseData = purchaseData;
        next();
        break;
      case "1":
        // Send an error response if purchase code is invalid
        // return res.status(200).json({ success: false, message: 'Entered Purchase key is invalid !', data: '1' });
        return res.status(200).render("verficationerror", {
          title: "NiftyEWS",
          layout: "errorlayout",
          statuscode: "Invalid Purchase Key",
          message:
            "The provided purchase key is invalid. Please provide a valid purchase key.",
          errorDetails:
            "If you need further assistance, please contact support.",
        });
        break;
      case "2":
        // Send an error response if license already registered
        // return res.status(200).json({ success: false, message: 'License already registered', data: '2' });
        return res.status(200).render("verficationerror", {
          title: "NiftyEWS",
          layout: "errorlayout",
          statuscode: "Invalid Purchase Key",
          message:
            "The provided purchase key is already in use with a different domain. Please provide a valid purchase key.",
          errorDetails:
            "If you need further assistance, please contact support.",
        });
      case "3":
        // Send an error response if failed to register license
        // return res.status(500).json({ success: false, message: 'Failed to register license', data: '3' });
        return res.status(500).render("verficationerror", {
          title: "NiftyEWS",
          layout: "errorlayout",
          statuscode: "Failed to Register License",
          message:
            "An error occurred while attempting to register the license. Please try again later.",
          errorDetails: "If the issue persists, please contact support.",
        });
      case "4":
        next();
        break;
      default:
        // Handle unexpected response data
        // return res.status(500).json({ success: false, message: 'Unexpected response from the server', data: '' });
        return res.status(500).render("verficationerror", {
          title: "NiftyEWS",
          layout: "errorlayout",
          statuscode: "Unexpected response from the server",
          message:
            "An error occurred while attempting to verify the license. Please try again later.",
          errorDetails: "If the issue persists, please contact support.",
        });
        break;
    }
  } catch (error) {
    // Send an error response if there's any issue with the verification process
    console.error("Error verifying purchase key:", error);
    // return res.status(500).json({ success: false, message: 'Internal server error' });
    return res.status(500).render("verficationerror", {
      title: "NiftyEWS",
      layout: "errorlayout",
      statuscode: "Unexpected Response",
      message:
        "An unexpected response was received from the server. Please try again later.",
      errorDetails: "If the issue persists, please contact support.",
    });
  }
};
