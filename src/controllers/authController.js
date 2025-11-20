import User from "../models/user.js";
import bcrypt from "bcryptjs";

import {
  validateEmail,
  validateMobile,
  validateUsername,
  validatePassword,
  validateRole,
  sanitizeObject,
  sanitizeInput,
  validateRequired,
} from "../validation/validation.js";

import {
  sendSuccess,
  sendError,
  sendUnauthorized,
  sendValidationError,
} from "../utils/responseHandler.js";

import { generateTokens, setTokensCookies } from "../utils/jwtUtils.js";

export const signup = async (req, res) => {
  try {
    const { username, email, mobile, password, role } = req.body;

    // Convert mobile to string
    const sanitizedMobile = sanitizeInput(String(mobile));

    // Sanitize remaining fields
    const sanitizedData = sanitizeObject({ username, email, password, role });

    const errors = [];

    // Validate mobile
    const mobileValidation = validateMobile(sanitizedMobile);
    if (!mobileValidation.isValid) {
      return sendValidationError(res, [mobileValidation.message]);
    }

    // Validate username
    if (sanitizedData.username) {
      const usernameValidation = validateUsername(sanitizedData.username);
      if (!usernameValidation.isValid) errors.push(usernameValidation.message);
    }

    // Validate email
    if (sanitizedData.email) {
      const emailValidation = validateEmail(sanitizedData.email);
      if (!emailValidation.isValid) errors.push(emailValidation.message);
    }

    // Validate password
    if (sanitizedData.password) {
      const passwordValidation = validatePassword(sanitizedData.password);
      if (!passwordValidation.isValid) errors.push(passwordValidation.message);
    }

    // Validate Role or Default
    const finalRole = sanitizedData.role || "user";
    const roleValidation = validateRole(finalRole);
    if (!roleValidation.isValid) errors.push(roleValidation.message);

    if (errors.length > 0) return sendValidationError(res, errors);

    // Check if mobile exists
    const existingMobile = await User.findOne({ mobile: sanitizedMobile });
    if (existingMobile) return sendError(res, "Mobile already exists", 400);

    // Check if email exists
    if (sanitizedData.email) {
      const existingEmail = await User.findOne({ email: sanitizedData.email });
      if (existingEmail) return sendError(res, "Email already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      Number(process.env.BCRYPT_SALT_ROUNDS)
    );

    // Create new user
    const newUser = new User({
      username: sanitizedData.username,
      email: sanitizedData.email,
      mobile: sanitizedMobile,
      password: hashedPassword,
      role: finalRole,
    });

    await newUser.save();

    /*GENERATE TOKENS */
    const payload = {
      id: newUser._id,
      role: newUser.role,
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    /*SAVE REFRESH TOKEN */
    newUser.refreshToken = refreshToken;
    newUser.lastLogin = new Date();
    await newUser.save();

    /* SET COOKIES  */
    setTokensCookies(res, accessToken, refreshToken);

    // Prepare Response (without password)
    const responseUser = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      mobile: newUser.mobile,
      role: newUser.role,
      isActive: newUser.isActive,
      isVerified: newUser.isVerified,
      accessToken,
      createdAt: newUser.createdAt,
    };

    return sendSuccess(res, responseUser, "Registration successful", 201);
  } catch (error) {
    console.error("Signup Error:", error);
    return sendError(res, "Something went wrong while registration");
  }
};
