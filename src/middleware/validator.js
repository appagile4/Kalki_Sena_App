const { body, validationResult } = require("express-validator");

// Middleware to check validation results and return formatted response
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: extractedErrors[0].message,
      errors: extractedErrors,
    });
  }
  next();
};

// Validation rules for Signup
const validateSignup = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .custom((val) => {
      // Must contain at least 7 digits
      const digits = val.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        throw new Error("Please enter a valid phone number");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("gender")
    .optional()
    .isIn(["Male", "Female", "Other", ""])
    .withMessage("Gender must be Male, Female, or Other"),

  body("dob")
    .optional()
    .isString()
    .withMessage("Date of birth must be a string"),

  body("avatar")
    .optional()
    .isString()
    .withMessage("Avatar must be a valid string"),

  handleValidationErrors,
];

// Validation rules for Login
const validateLogin = [
  body("identifier")
    .trim()
    .notEmpty()
    .withMessage("Email or phone number is required"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  handleValidationErrors,
];

module.exports = {
  validateSignup,
  validateLogin,
  handleValidationErrors,
};
