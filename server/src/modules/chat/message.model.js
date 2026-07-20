import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    attachmentUrl: { type: String }
  },
  { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);

