import cloudinary from "../lib/cloudinary.js";
import User from "../models/User.js";
import Invite from "../models/Invite.js";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateToken } from "../lib/utils.js";
import crypto from "crypto";

// signup a new user
export const signup = asyncHandler(async (req: any, res: any) => {
    const { name, email, password, gender, phone, inviteToken } = req.body;

    if (!name || !email || !password || !gender) {
        throw new ApiError(400, 'Please fill all required fields');
    }

    const userEmailExists = await User.findOne({ email });
    if (userEmailExists) {
        throw new ApiError(400, 'User already exists');
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        gender,
        phone
    });

    if (newUser) {
        // Handle Invite
        if (inviteToken) {
            const invite = await Invite.findOne({ token: inviteToken, status: "pending" });
            if (invite) {
                // Mutual Add using $addToSet
                await User.findByIdAndUpdate(
                    invite.senderId,
                    { $addToSet: { contacts: newUser._id } }
                );
                
                await User.findByIdAndUpdate(
                    newUser._id,
                    { $addToSet: { contacts: invite.senderId } }
                );
                
                // Update invite status
                await Invite.findByIdAndUpdate(invite._id, { status: "accepted" });
            }
        }

        const token = generateToken(newUser._id.toString());
        res.status(201).json(
            new ApiResponse(201, 'User created successfully', { user: newUser, token })
        );
    }
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

// get all users (Contacts only)
export const getAllUsers = asyncHandler(async (req: any, res: any) => {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('contacts', '-password');
    if (!user) {
         throw new ApiError(404, 'User not found');
    }
    
    res.status(200).json(
        new ApiResponse(200, 'Users fetched successfully', { users: user.contacts })
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

// Search users globally (only name/email, limit fields)
export const searchUsers = asyncHandler(async (req: any, res: any) => {
    const { query } = req.query;
    if (!query) {
        return res.status(200).json(new ApiResponse(200, 'No query provided', { users: [] }));
    }

    const users = await User.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
        ],
        _id: { $ne: req.user._id } // Exclude self
    }).select("name email profilePic gender"); // Only return public info

    res.status(200).json(
        new ApiResponse(200, 'Users found', { users })
    );
});

// Add a user to contacts (Manual Add)
export const addContact = asyncHandler(async (req: any, res: any) => {
    // Input can be an ID (if from search) OR an identifier (email/phone/username) if manual input.
    // The previous implementation assumed an ID in params. I'll modify to accept body for identifier or params for ID.
    // Requirements: "Add a user by username / phone / email"
    
    const { id: contactId } = req.params;
    const { identifier } = req.body; // Expect { identifier: "email@example.com" } or similar if manual
    const userId = req.user._id;

    let targetUser = null;

    if (contactId && mongoose.Types.ObjectId.isValid(contactId)) {
        targetUser = await User.findById(contactId);
    } else if (identifier) {
        // Search by email, phone, or name (exact match for add)
        targetUser = await User.findOne({ 
            $or: [
                { email: identifier },
                { phone: identifier },
                { name: identifier }
            ]
        });
    }

    if (!targetUser) {
        // User not found -> Create Invite
        if (!identifier) {
             throw new ApiError(404, 'User not found');
        }
        
        // Check if identifier is email or phone
        const isEmail = identifier.includes('@');
        const isPhone = !isEmail && /^\+?[0-9]{10,15}$/.test(identifier);
        
        if (!isEmail && !isPhone) {
            throw new ApiError(400, "Please provide a valid email or phone number for invitation");
        }

        // Generate Invite
        const token = crypto.randomBytes(16).toString('hex');
        const invite = await Invite.create({
            senderId: userId,
            targetEmail: isEmail ? identifier : null,
            targetPhone: isPhone ? identifier : null,
            token
        });
        
        return res.status(200).json(new ApiResponse(200, 'User not registered, invite generated', { 
            status: 'invited', 
            identifier,
            inviteUrl: `https://chatterlink.com/register?invite=${token}`
        }));
    }

    const user = await User.findById(userId);
    
    if (!user) {
        throw new ApiError(404, 'Current user not found');
    }

    // Check self
    if (targetUser._id.toString() === userId.toString()) {
        throw new ApiError(400, "Cannot add yourself");
    }

    // Mutual Add using $addToSet to avoid duplicates
    await User.findByIdAndUpdate(
        userId,
        { $addToSet: { contacts: targetUser._id } },
        { new: true }
    );
    
    await User.findByIdAndUpdate(
        targetUser._id,
        { $addToSet: { contacts: userId } },
        { new: true }
    );

    // Fetch updated user and contact for response
    const updatedUser = await User.findById(userId);
    const updatedContact = await User.findById(targetUser._id);

    res.status(200).json(
        new ApiResponse(200, 'Contact added successfully', { 
            user: updatedUser, 
            contact: updatedContact, 
            status: 'added' 
        })
    );
});

// Sync Phone Contacts
export const syncContacts = asyncHandler(async (req: any, res: any) => {
    const { contacts } = req.body; // Expect array of { name, phone, email }
    if (!Array.isArray(contacts)) {
        throw new ApiError(400, "Invalid contacts data");
    }

    const phones = contacts.map((c: any) => c.phone).filter(Boolean);
    const emails = contacts.map((c: any) => c.email).filter(Boolean);

    // Find registered users matching phone or email
    const registeredUsers = await User.find({
        $or: [
            { phone: { $in: phones } },
            { email: { $in: emails } }
        ]
    }).select("name email phone profilePic gender");

    // Separate registered vs non-registered
    // Note: This is loop-heavy if contacts list is huge, but fine for typical use.
    const registeredIds = new Set(registeredUsers.map(u => u.email));
    
    // Just return registered users to show "On ChatApp". 
    // And users can click "Invite" for others (handled by frontend sharing).
    
    res.status(200).json(
        new ApiResponse(200, 'Contacts synced', { registeredUsers })
    );
});

