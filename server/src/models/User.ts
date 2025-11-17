import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      sparse: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
    },
    accountType: {
      type: String,
      enum: ['guest', 'persistent'],
      default: 'guest',
    },
    stats: {
      gamesPlayed: { type: Number, default: 0 },
      gamesWon: { type: Number, default: 0 },
      totalGuesses: { type: Number, default: 0 },
      bestTime: { type: Number },
      currentWinStreak: { type: Number, default: 0 },
      averageGuesses: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
