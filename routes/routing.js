const express = require("express");

const router = express.Router();
const authcontroller = require("../controller/AuthController");
const { checkforvalidationerrors } = require("../middleware/validationerrors");
const recipientscontroller = require("../controller/RecipientsController");
const {
  paymentIntent,
  paymentsuccesswebhook,
} = require("../controller/PaymentController");
const products = require("../products.json");
const {
  organisationdetails,
  sendtokenstoallrecipients,
  getOrgRecipientTransaction,
  getmerchantsbyorgid,
  getothermerchantsbyorgid,
  addmerchantoorg,
  removemerchantfromorg,
  sendtokenstoarecipient,
} = require("../controller/OrgController");
const { validateusersignup } = require("../middleware/users");
const {
  maketransaction,
  completetransaction,
  merchantdetails,
  previoustransactions,
  redeemtokens,
} = require("../controller/MerchantController");
const { sendtoarecipient } = require("../models/organisationmodel");

const checksession = (req, res, next) => {
  console.log("This is ", req.session);
  if (!req.session.userid) {
    res.status(401).json({ message: "Please login" });
  } else {
    next();
  }
};

const orgrole = (req, res, next) => {
  if (req.session.role !== "Organisation") {
    res.status(401).send("Unauthorized");
  } else {
    console.log("Role:", req.session.role);
    next();
  }
};
const merchantrole = (req, res, next) => {
  if (req.session.role !== "Merchant") {
    res.status(401).send("Unauthorized");
  } else {
    console.log("Role:", req.session.role);
    next();
  }
};

router.get("/", (req, res) => {
  // console.log(req.session);
  res.json({ message: "Hello" });
});
router.post("/", checksession, (req, res) => {
  res.json({ message: "Hello" });
});
router.get("/bye", (req, res) => {
  res.send("Good Bye");
});
router.post(
  "/signuporg",
  validateusersignup("insertorg"),
  checkforvalidationerrors,
  authcontroller.signuporg
);
router.post(
  "/signupmerchant",
  validateusersignup("insertmerchant"),
  checkforvalidationerrors,
  authcontroller.signupmerchant
);
router.post(
  "/login",
  validateusersignup("login"),
  checkforvalidationerrors,
  authcontroller.login
);

router.post("/issessionactive", (req, res) => {
  console.log(req.session);

  if (req.session.userid) {
    res.status(200).json({ status: true });
  } else {
    res.status(401).json({ status: false });
  }
});

//check if id is valid
router.post(
  "/checkid",
  validateusersignup("checkid"),
  checkforvalidationerrors,
  authcontroller.checkid
);
// check if mobilenumber is valid
router.post(
  "/checkmobilenumber",
  validateusersignup("checkmobilenumber"),
  checkforvalidationerrors,
  authcontroller.checkmobilenumber
);
router.post(
  "/checkemail",
  validateusersignup("checkemail"),
  checkforvalidationerrors,
  authcontroller.checkemail
);

router.post(
  "/addrecipients",
  checksession,
  orgrole,
  validateusersignup("addrecipient"),
  checkforvalidationerrors,
  recipientscontroller.addrecipients
);

router.post(
  "/selectrecipientsfororg",
  checksession,
  orgrole,
  recipientscontroller.selectrecipientsfororg
);
router.post(
  "/updaterecipient",
  checksession,
  orgrole,
  validateusersignup("updaterecipient"),
  checkforvalidationerrors,
  recipientscontroller.updaterecipient
);
router.post(
  "/deleterecipient",
  checksession,
  orgrole,
  recipientscontroller.deleterecipient
);
router.post("/secret", checksession, orgrole, paymentIntent);

router.post("/products", checksession, orgrole, async (req, res) => {
  res.json(products);
});

router.post("/orgdetails", checksession, orgrole, organisationdetails);
router.post(
  "/sendtoallrecipients",
  checksession,
  orgrole,
  sendtokenstoallrecipients
);
router.post("/sendtoarecipient", checksession, orgrole, sendtokenstoarecipient);

router.post("/gettransactions", checksession, getOrgRecipientTransaction);

// router.post("/getmerchants", checksession);
router.post("/getmerchantsbyorg", checksession, orgrole, getmerchantsbyorgid);
router.post(
  "/getothermerchants",
  checksession,
  orgrole,
  getothermerchantsbyorgid
);

router.post("/addmerchanttoorg", checksession, orgrole, addmerchantoorg);
router.post(
  "/removemerchantfromorg",
  checksession,
  orgrole,
  removemerchantfromorg
);
router.post("/merchantdetails", checksession, merchantrole, merchantdetails);
router.post("/maketransaction", checksession, merchantrole, maketransaction);
router.post(
  "/merchanttransactions",
  checksession,
  merchantrole,
  previoustransactions
);
router.post(
  "/completetransaction",
  checksession,
  merchantrole,
  completetransaction
);
router.post("/redeemtokens", checksession, merchantrole, redeemtokens);

router.post("/logout", checksession, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(404).json({ message: err });
    }
  });
  res.clearCookie("userscookie");
  res.status(200).json({ message: "GoodBye" });
});

module.exports = router;
