import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    sender: String,
    receiver: String,
    ciphertext: String,
    nonce: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Message', MessageSchema);