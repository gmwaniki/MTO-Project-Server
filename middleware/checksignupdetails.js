const checksignupvalues = (req, res, next) => {
  let theempty = {};

  for (const key in req.body) {
    if (req.body[key] === "") {
      theempty = { ...theempty, [key]: req.body[key] };
    } else {
      console.log(key + "pass");
    }
  }
  let nullkeys = Object.keys(theempty).toString();
  if (nullkeys) {
    res.status(400).json({ message: "The values " + nullkeys + " are empty" });
  } else {
    next();
  }
};

module.exports = {checksignupvalues};
