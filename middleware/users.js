const { body } = require("express-validator");
const expressvalidatior = require("express-validator");
const {
  checkmobilenumber,
  checkemail,
  checkid,
} = require("../models/authModel");

exports.validateusersignup = (method) => {
  switch (method) {
    case "insertorg": {
      return [
        body("name")
          .exists()
          .withMessage("Name does not Exist")
          .isString()
          .withMessage("name must be a string")
          .isLength({ min: 3 })
          .withMessage("Name is too Short"),
        body("email")
          .exists()
          .withMessage("Email does not exist")
          .isEmail()
          .withMessage("Email is not valid")
          .custom((value) => {
            return checkemail(value).then((result) => {
              if (result === -1) {
                return Promise.reject("This email is incorrect");
              } else if (result === 1) {
                return Promise.reject("This email has been used");
              }
            });
          }),
        //   custom email check
        body("mobilenumber")
          .exists()
          .withMessage("Invalid mobilenumber")
          .isString()
          .withMessage("Mobile Number must be string")
          .isLength({ min: 10 })
          .withMessage("Mobile Number is too short")
          .isLength({ max: 13 })
          .withMessage("Mobile Number is too long")
          .custom((value) =>
            checkmobilenumber(value).then((result) => {
              if (result === -1) {
                return Promise.reject("This mobilenumber is incorrect");
              } else if (result === 1) {
                return Promise.reject("This mobilenumber has been used");
              }
            })
          ),
        body("password")
          .exists()
          .withMessage("Password does not exist")
          .isLength({ min: 2 })
          .withMessage("Password is too short"),
      ];
    }
    case "insertmerchant": {
      return [
        body("firstname")
          .exists()
          .withMessage("firstname does not exist")
          .isString()
          .withMessage("Firstname must be a string")
          .isLength({ min: 3 })
          .withMessage("Firstname is too Short"),
        body("lastname")
          .exists()
          .withMessage("lastname does not exist")
          .isString()
          .withMessage("Laststname must be a string")
          .isLength({ min: 3 })
          .withMessage("Lastname is too Short"),
        body("storename")
          .exists()
          .withMessage("Storename does not exist")
          .isString()
          .withMessage("Storename must be a string")
          .isLength({ min: 3 })
          .withMessage("Storename is too Short"),
        body("email")
          .exists()
          .withMessage("Email does not exist")
          .isEmail()
          .withMessage("Email is not valid")
          .custom((value) => {
            return checkemail(value).then((result) => {
              if (result === -1) {
                return Promise.reject("This email is incorrect");
              } else if (result === 1) {
                return Promise.reject("This email has been used");
              }
            });
          }),
        body("password")
          .exists()
          .withMessage("Password does not exist")
          .isLength({ min: 2 })
          .withMessage("Password is too short"),
        body("mobilenumber")
          .exists()
          .withMessage("Invalid mobilenumber")
          .isString()
          .withMessage("Mobile Number must be string")
          .isLength({ min: 10 })
          .withMessage("Mobile Number is too short")
          .isLength({ max: 13 })
          .withMessage("Mobile Number is too long")
          .custom((value) =>
            checkmobilenumber(value).then((result) => {
              if (result === -1) {
                return Promise.reject("This mobilenumber is incorrect");
              } else if (result === 1) {
                return Promise.reject("This mobilenumber has been used");
              }
            })
          ),
        body("idnumber")
          .exists()
          .withMessage("Id number does not exist")
          .isLength({ min: 7 })
          .withMessage("Id number is too short")
          .isLength({ max: 8 })
          .withMessage("Id number is too long")
          .isString()
          .withMessage("Id number must be a string")
          .custom((value) =>
            checkid(value).then((result) => {
              if (result === -1) {
                return Promise.reject("This id number is incorrect");
              } else if (result === 1) {
                return Promise.reject("This  id number has been used");
              }
            })
          ),
      ];
    }
    case "login": {
      return [
        body("email")
          .exists()
          .withMessage("Email does not exist")
          .isEmail()
          .withMessage("Email is not valid"),
        body("password").exists().withMessage("Password does not exist"),
      ];
    }
    case "checkemail": {
      return [
        body("email")
          .exists()
          .withMessage("Email does not exist")
          .isEmail()
          .withMessage("Email is not valid")
          .custom((value) => {
            return checkemail(value).then((result) => {
              if (result === -1) {
                return Promise.reject("This email is incorrect");
              } else if (result === 1) {
                return Promise.reject("This email has been used");
              }
            });
          }),
      ];
    }
    case "checkid": {
      return [
        body("idnumber")
          .exists()
          .withMessage("Id number does not exist in body")
          .isLength({ min: 7 })
          .withMessage("Id number is too short")
          .isLength({ max: 8 })
          .withMessage("Id number is too long")
          .isString()
          .withMessage("Id number must be a string")
          .custom((value) =>
            checkid(value).then((result) => {
              if (result === -1) {
                return Promise.reject("This id number is incorrect");
              } else if (result === 1) {
                return Promise.reject("This  id number has been used");
              }
            })
          ),
      ];
    }
    case "checkmobilenumber": {
      return [
        body("mobilenumber")
          .exists()
          .withMessage("Invalid mobilenumber")
          .isString()
          .withMessage("Mobile Number must be string")
          .isLength({ min: 10 })
          .withMessage("Mobile Number is too short")
          .isLength({ max: 13 })
          .withMessage("Mobile Number is too long")
          .custom((value) =>
            checkmobilenumber(value).then((result) => {
              if (result === -1) {
                return Promise.reject("This mobilenumber is incorrect");
              } else if (result === 1) {
                return Promise.reject("This mobilenumber has been used");
              }
            })
          ),
      ];
    }
    case "addrecipient": {
      return [
        body()
          .isArray()
          .withMessage("Recipients should be sent in array format")
          .isLength({ min: 1 })
          .withMessage("No recipients found"),
      ];
    }
    case "updaterecipient": {
      return [
        body("firstname")
          .exists()
          .withMessage("Firstname is missing")
          .isString()
          .withMessage("Firstname must be string")
          .isLength({ min: 3 })
          .withMessage("Firstname is too short"),
        body("lastname")
          .exists()
          .withMessage("Lastname is missing")
          .isString()
          .withMessage("Lastname must be string")
          .isLength({ min: 3 })
          .withMessage("Lastname is too short"),
        body("mobilenumber")
          .exists()
          .withMessage("Invalid mobilenumber")
          .isString()
          .withMessage("Mobile Number must be string")
          .isLength({ min: 10 })
          .withMessage("Mobile Number is too short")
          .isLength({ max: 13 })
          .withMessage("Mobile Number is too long"),
        body("idnumber")
          .exists()
          .withMessage("Id number does not exist")
          .isLength({ min: 7 })
          .withMessage("Id number is too short")
          .isLength({ max: 8 })
          .withMessage("Id number is too long")
          .isString()
          .withMessage("Id number must be a string"),
        body("userid").exists().withMessage("User id has not been set"),
      ];
    }
  }
};
