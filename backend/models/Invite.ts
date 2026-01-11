import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    targetEmail: {
        type: String,
        default: null
    },
    targetPhone: {
        type: String,
        default: null
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "expired"],
        default: "pending"
    }
}, {
    timestamps: true
});

const Invite = mongoose.model("Invite", inviteSchema);
export default Invite;
