// utils/validation.js (NEW FILE)
export const validateRequest = (schema) => {
  return (req, res, next) => {
    // Implementation for request validation
    next();
  };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially harmful characters
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .substring(0, 500); // Limit length
};
