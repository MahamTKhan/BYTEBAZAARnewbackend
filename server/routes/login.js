const router = require("express").Router();
const { user_model } = require("../models/userSchema");
const bcrypt = require("bcrypt");
const Joi = require("joi"); // library for data validation

module.exports = router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body);

    // if there is an error in input data, then generate a message
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    // query to check if the user is authenticated
    const user = await user_model.findOne({ email: req.body.email });

    // if user is not authenticated, then generate an error message
    if (!user)
      return res.status(401).send({ message: "Invalid Email or Password" });

    // if user email is authenticated, then validate the password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    // if password is not correct, then generate an error message
    if (!validPassword)
      return res.status(401).send({ message: "Invalid Email or Password" });

    // If email and password are valid, generate JWT token
    const token = user.generateAuthToken();
    res.status(200).send({ data: token, message: "logged in successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// function to validate the input data
const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

// module.exports = router;