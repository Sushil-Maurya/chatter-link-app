import cloudinary from "../lib/cloudinary.ts";
import { generateToken } from "../lib/utils.ts";
import bcryptjs from "bcryptjs";
import User from "../models/User.ts";

// signup a new user
export const signup = async (req: any, res: any) => {
    const { name, email, password, profilePic, bio } = req.body;
    try {
        if (!name || !email || !password || !bio) {
            return res.json({ success: false, message: 'All fields are required' })
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.json({ success: false, message: 'User already exists' })
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = await User.create({ name, email, password: hashedPassword, profilePic, bio });

        const token = generateToken(newUser._id.toString());

        res.json({ success: true, message: 'User created successfully', user: newUser, token });
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}

// login a user
export const login = async (req: any, res: any) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid password' })
        }
        const token = generateToken(user._id.toString());
        res.json({ success: true, message: 'User logged in successfully', user, token })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}

// Controller function to check user is authenticated
export const checkAuth = async (req: any, res: any) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }
        res.json({ success: true, message: 'User is authenticated', user })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}

// U

// get all users
export const getAllUsers = async (req: any, res: any) => {
    try {
        const users = await User.find();
        res.json({ success: true, users })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}

// get a user
export const getUser = async (req: any, res: any) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }
        res.json({ success: true, user })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}

// update a user
export const updateUser = async (req: any, res: any) => {
    try {
        const { name, profilePic, bio } = req.body;
        const userId = req.user._id;
        let updatedUser;
        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { name, bio }, { new: true });
            if (!updatedUser) {
                return res.json({ success: false, message: 'User not found' })
            }

        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, { name, bio, profilePic: upload.secure_url }, { new: true });
            if (!updatedUser) {
                return res.json({ success: false, message: 'User not found' })
            }
        }
        res.json({ success: true, message: 'User updated successfully', user: updatedUser })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}

// delete a user
export const deleteUser = async (req: any, res: any) => {
    try {
        const userId = req.user._id;
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.json({ success: false, message: 'User not found' })
        }
        res.json({ success: true, message: 'User deleted successfully', user: deletedUser })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}

