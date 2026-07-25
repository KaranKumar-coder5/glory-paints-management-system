export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10;
};

export const validateRequired = (value) => {
  if (typeof value === "string") return value.trim().length > 0;
  return value !== null && value !== undefined;
};

export const validateMinLength = (value, min) => {
  return value && value.length >= min;
};

export const getValidationError = (value, rules) => {
  for (const rule of rules) {
    if (rule.required && !validateRequired(value)) {
      return rule.message || "This field is required";
    }
    if (rule.email && value && !validateEmail(value)) {
      return rule.message || "Invalid email address";
    }
    if (rule.phone && value && !validatePhone(value)) {
      return rule.message || "Invalid phone number";
    }
    if (rule.minLength && value && !validateMinLength(value, rule.minLength)) {
      return rule.message || `Minimum ${rule.minLength} characters`;
    }
  }
  return null;
};
