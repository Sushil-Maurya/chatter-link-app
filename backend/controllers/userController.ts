import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import bcryptjs from "bcryptjs";
import User from "../models/User.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// signup a new user
export const signup = asyncHandler(async (req: any, res: any) => {
    const { name, email, password, profilePic, bio, gender } = req.body;

    if (!name || !email || !password || !bio || !gender) {
        throw new ApiError(400, 'All fields are required');
    }
    const user = await User.findOne({ email });
    if (user) {
        throw new ApiError(400, 'User already exists');
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = await User.create({ name, email, password: hashedPassword, profilePic, bio, gender });

    const token = generateToken(newUser._id.toString());

    res.status(201).json(
        new ApiResponse(201, 'User created successfully', { user: newUser, token })
    );
});

// login a user
export const login = asyncHandler(async (req: any, res: any) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(400, 'User not found');
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
         throw new ApiError(400, 'Invalid password');
    }
    const token = generateToken(user._id.toString());
    
    res.status(200).json(
        new ApiResponse(200, 'User logged in successfully', { user, token })
    );
});

// Controller function to check user is authenticated
export const checkAuth = asyncHandler(async (req: any, res: any) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        throw new ApiError(400, 'User not found');
    }
    res.status(200).json(
        new ApiResponse(200, 'User is authenticated', { user })
    );
});

// get all users
export const getAllUsers = asyncHandler(async (req: any, res: any) => {
    const users = await User.find();
    res.status(200).json(
        new ApiResponse(200, 'Users fetched successfully', { users })
    );
});

// get a user
export const getUser = asyncHandler(async (req: any, res: any) => {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
         throw new ApiError(400, 'User not found');
    }
    res.status(200).json(
        new ApiResponse(200, 'User fetched successfully', { user })
    );
});

// update a user
export const updateUser = asyncHandler(async (req: any, res: any) => {
    const { name, profilePic, bio } = req.body;
    const userId = req.user._id;
    let updatedUser;
    
    if (!profilePic) {
        updatedUser = await User.findByIdAndUpdate(userId, { name, bio }, { new: true });
    } else {
        const upload = await cloudinary.uploader.upload(profilePic);
        updatedUser = await User.findByIdAndUpdate(userId, { name, bio, profilePic: upload.secure_url }, { new: true });
    }
    
    if (!updatedUser) {
         throw new ApiError(400, 'User not found');
    }

    res.status(200).json(
        new ApiResponse(200, 'User updated successfully', { user: updatedUser })
    );
});

// delete a user
export const deleteUser = asyncHandler(async (req: any, res: any) => {
    const userId = req.user._id;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
         throw new ApiError(400, 'User not found');
    }
    res.status(200).json(
        new ApiResponse(200, 'User deleted successfully', { user: deletedUser })
    );
});

