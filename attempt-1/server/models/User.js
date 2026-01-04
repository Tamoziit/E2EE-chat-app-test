import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    publicKey: String
});

export default mongoose.model('User', UserSchema);
