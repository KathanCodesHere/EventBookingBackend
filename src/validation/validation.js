import mongoose from "mongoose";

//validate mobile number
export const validateMobile = (mobile) => {
  if (!mobile) {
    return { isValid: false, message: "Mobile number is required" };
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    return { isValid: false, message: "Mobile number must be 10 digits" };
  }

  return { isValid: true };
};

//validate email
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: "Email is required" };
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  return { isValid: true };
};

//validate username

export const validateUsername = (username) => {
  const regex = /^[a-zA-Z0-9_]+$/; //space allowed
  if (!username || username.trim().length < 3) {
    return {
      isValid: false,
      message: "Username must be at least 3 characters",
    };
  }

  if (!regex.test(username)) {
    return {
      isValid: false,
      message:
        "Username can only contail letters,numbers,underscore and spaces",
    };
  }
  return { isValid: true };
};

// validate password
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: "Password is required" };
  }

  // Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char, no spaces
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    return {
      isValid: false,
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
    };
  }

  return { isValid: true };
};

//validate role
export const validateRole = (role) => {
  const validRoles = ["admin", "user", "organizer", "ticketChecker"];

  if (!role) {
    return { isValid: false, message: "Role is required" };
  }

  if (!validRoles.includes(role)) {
    return {
      isValid: false,
      message: "Role must be one of:admin,user,organizer,ticketChecker",
    };
  }

  return { isValid: true };
};

//validate requires fields
export const validateRequired = (fileds) => {
  const errors = [];

  for (const [fieldName, value] of Object.entries(fileds)) {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      errors.push({ field: fieldName, message: `${fieldName} is required` });
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

//sanitize input bt trimming white spaces
export const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return input.trim();
  }
  return input;
};

//sanitize object inputs

export const sanitizeObject = (obj) => {
  const sanitizedObj = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitizedObj[key] = sanitizeInput(value);
  }

  return sanitizedObj;
};

//validate mongoose object id
export const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};
