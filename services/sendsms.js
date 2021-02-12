require("dotenv").config();

const credentials = {
  apiKey: `${process.env.africastalkingkey}`, // use your sandbox app API key for development in the test environment
  username: "projectapp", // use 'sandbox' for development in the test environment
};
const Africastalking = require("africastalking")(credentials);

// Initialize a service e.g. SMS
const sms = Africastalking.SMS;

// Use the service

// Send message and capture the response or error
exports.sendsms = async (to, message) => {
  try {
    const result = await sms.send({
      to,
      message,
    });
    console.log(result);
  } catch (error) {
    console.log(error);
    console.error(error);
  }
};
