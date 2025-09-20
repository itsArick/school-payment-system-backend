import { body, validationResult } from 'express-validator';


const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const createPaymentValidation = [
  body('student_info.name')
    .notEmpty()
    .withMessage('Student name is required')
    .trim(),
  body('student_info.id')
    .notEmpty()
    .withMessage('Student ID is required')
    .trim(),
  body('student_info.email')
    .isEmail()
    .withMessage('Valid student email is required')
    .normalizeEmail(),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0'),
  body('gateway_name')
    .optional()
    .trim(),
  body('school_id') // NEW validation for school_id
    .optional()
    .isMongoId()
    .withMessage('Valid school ID is required'),
  handleValidationErrors
];

// Export all validations
export {
  handleValidationErrors,
  loginValidation,
  registerValidation,
  createPaymentValidation
};
