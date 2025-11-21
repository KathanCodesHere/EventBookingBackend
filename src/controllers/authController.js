import User from "../models/user.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
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

import {
  clearTokenCookies,
  generateTokens,
  setTokensCookies,
  verifyRefreshToken,
} from "../utils/jwtUtils.js";

//signup user
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

    // Prepare Response (without password)
    const responseUser = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      mobile: newUser.mobile,
      role: newUser.role,
      isActive: newUser.isActive,
      isVerified: newUser.isVerified,
      // accessToken,
      createdAt: newUser.createdAt,
    };

    return sendSuccess(res, responseUser, "Registration successful", 201);
  } catch (error) {
    console.error("Signup Error:", error);
    return sendError(res, "Something went wrong while registration");
  }
};

//login user
export const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // Sanitize
    const sanitizedMobile = sanitizeInput(String(mobile));
    const sanitizedPassword = sanitizeInput(String(password));

    const errors = [];

    // Validate
    const mobileValidation = validateMobile(sanitizedMobile);
    if (!mobileValidation.isValid) errors.push(mobileValidation.message);

    const passwordValidation = validatePassword(sanitizedPassword);
    if (!passwordValidation.isValid) errors.push(passwordValidation.message);

    if (!mobile) errors.push("Mobile is required");
    if (!password) errors.push("Password is required");

    if (errors.length > 0) return sendValidationError(res, errors);

    // Check user
    const user = await User.findOne({ mobile: sanitizedMobile }).select(
      "+password"
    );
    if (!user) return sendError(res, "Mobile number not registered", 400);
    //  Check if email is verified
    //      if (!user.isVerified) {
    //       return sendError(res, "Please verify your email first", 403);
    //     }

    // Compare password
    const isMatch = await bcrypt.compare(sanitizedPassword, user.password);
    if (!isMatch) return sendError(res, "Invalid password", 400);

    // Generate tokens
    const payload = { userId: user._id, mobile: user.mobile };
    const { accessToken, refreshToken } = generateTokens(payload);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    setTokensCookies(res, accessToken, refreshToken);

    const responseUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
      accessToken,
      createdAt: user.createdAt,
    };

    return sendSuccess(res, responseUser, "User logged in successfully", 200);
  } catch (error) {
    console.error("Login Error:", error);
    return sendError(res, "Something went wrong while login", 500);
  }
};

//refresh token

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return sendError(res, "Refresh token not found", 401);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token || !user.isActive) {
      return sendError(res, "Invalid refresh token", 401);
    }

    // Generate new tokens
    const payload = { userId: user._id, mobile: user.mobile };
    const { accessToken, refreshToken: newRefreshToken } =
      generateTokens(payload);

    // Save refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set cookies
    setTokensCookies(res, accessToken, newRefreshToken);

    return sendSuccess(res, null, "Token refreshed successfully");
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return sendError(res, "Invalid or expired refresh token", 401);
  }
};

//get profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-refreshToken  -createdAt -updatedAt"
    );

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, { user }, "Profile retrieved successfully");
  } catch (error) {
    console.error("Get Profile Error:", error);
    return sendError(res, "Something went wrong while fetching profile");
  }
};

//logout user
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await User.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: "" } }
      );
    }

    clearTokenCookies(res);

    return sendSuccess(res, null, "Logged out successfully");
  } catch (error) {
    console.error("Logout Error:", error);
    return sendError(res, "Something went wrong during logout", 500);
  }
};
