require("dotenv").config();
require("./database/connection");

// Importing route handlers
const signupRoutes = require("./routes/userAuthorization/signup");
const loginRoutes = require("./routes/userAuthorization/login");
const forgotPasswordRoutes = require("./routes/passwordReset/forgotPassword");
const resetPasswordRoutes = require("./routes/passwordReset/resetPassword");
const verifyOtpRouter = require("./routes/otpHandling/verifyOtp");
const resendOtpRouter = require("./routes/otpHandling/resendOtp");

const express = require("express");
const app = express();
const cors = require("cors");
const PORT = 6005;
const secretKey = process.env.SECRET_KEY;

const session = require("express-session");
const passport = require("passport");
const {
  initializePassport,
  authenticateGoogle,
  handleGoogleCallback,
} = require("./routes/userAuthorization/googleAuth");

// Initialize Passport and session
initializePassport();

// middleware
app.use(express.json());

// Define the allowed origins
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

// Set up CORS options
const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

// Use cors middleware with options
app.use(cors(corsOptions));

// Secret key for hashing the user data
app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
// General Login and Signup
app.use("/api/signup", signupRoutes);
app.use("/api/login", loginRoutes);

// Google Login
app.get("/auth/google", authenticateGoogle());
app.get("/auth/google/callback", handleGoogleCallback());
app.get("/login/success", async (req, res) => {
  if (req.user) {
    res.status(200).json({ message: "user Login", user: req.user });
  } else {
    res.status(400).json({ message: "Not Authorized" });
  }
});

app.use("/api/forgotPassword", forgotPasswordRoutes);
app.use("/api/resetPassword", resetPasswordRoutes);
app.use("/api/user-otp-verification", verifyOtpRouter);
app.use("/api/resend-otp", resendOtpRouter);

//Logout the user
app.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("http://localhost:5173/bytebazaar/login");
  });
});

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
