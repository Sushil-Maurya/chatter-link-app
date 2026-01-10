import mongoose, { Schema } from 'mongoose';

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Create a compound index to ensure unique pairs of participants
conversationSchema.index({ participants: 1 }, { unique: true });

// Pre-save hook to sort participants for consistent lookup
conversationSchema.pre('save', function (next) {
  this.participants.sort();
  next();
});

// Static method to find or create a conversation
conversationSchema.statics.findOrCreate = async function (participant1: string, participant2: string) {
  const participants = [participant1, participant2].sort();
  let conversation = await this.findOne({
    participants: { $all: participants },
  }).populate('lastMessage');

  if (!conversation) {
    conversation = await this.create({
      participants,
    });
  }

  return conversation;
};

export default mongoose.model('Conversation', conversationSchema);
