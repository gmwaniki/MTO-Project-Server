const express = require("express");

const router = express.Router();
const authcontroller = require("../controller/AuthController");
const { checksignupvalues } = require("../middleware/checksignupdetails");
const recipientscontroller = require("../controller/RecipientsController");
const {
  paymentIntent,
  paymentsuccesswebhook,
} = require("../controller/PaymentController");
const products = require("../products.json");
const {
  organisationdetails,
  sendtokenstoallrecipients,
} = require("../controller/OrgController");

const checksession = (req, res, next) => {
  if (!req.session.userid) {
    res.status(401).send("Please login");
  } else {
    next();
  }
};
const checkrole = (req, res, next) => {
  if (req.session.role !== "organisation") {
    res.status(401).send("Unauthorized");
  } else {
    console.log("Role:", req.session.role);
    next();
  }
};

router.get("/", (req, res) => {
  console.log(req.session);
  res.json({ message: "Hello" });
});
router.post("/", checksession, (req, res) => {
  res.json({ message: "Hello" });
});
router.get("/bye", (req, res) => {
  res.send("Good Bye");
});
router.post("/signuporg", checksignupvalues, authcontroller.signuporg);
router.post(
  "/signupmerchant",
  checksignupvalues,
  authcontroller.signupmerchant
);
router.post("/login", authcontroller.login);

router.post("/issessionactive", (req, res) => {
  console.log(req.session);

  if (req.session.userid) {
    res.status(200).json({ status: true });
  } else {
    res.status(401).json({ status: false });
  }
});

//check if id is valid
router.post("/checkid", authcontroller.checkid);
// check if mobilenumber is valid
router.post("/checkmobilenumber", authcontroller.checkmobilenumber);

router.post("/addrecipients", checksession, recipientscontroller.addrecipients);

router.post(
  "/selectrecipientsfororg",
  checksession,
  recipientscontroller.selectrecipientsfororg
);
router.post("/secret", paymentIntent);

router.post("/products", checksession, checkrole, async (req, res) => {
  res.json(products);
});

router.post("/orgdetails", organisationdetails);
router.post(
  "/sendtoallrecipients",
  checksession,
  checkrole,
  sendtokenstoallrecipients
);

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
