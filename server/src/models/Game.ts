import mongoose, { Schema } from 'mongoose';

const gameSchema = new Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    players: [
      {
        id: { type: String, required: true },
        username: { type: String, required: true },
        secretNumber: { type: String, required: true },
        guesses: [
          {
            guessNumber: String,
            feedback: [String],
            timestamp: { type: Date, default: Date.now },
          },
        ],
        score: { type: Number, default: 0 },
      },
    ],
    gameMode: {
      type: String,
      enum: ['classic', 'speed', 'deception', 'ultimate'],
      default: 'classic',
    },
    gameState: {
      type: String,
      enum: ['waiting', 'ready', 'playing', 'finished'],
      default: 'waiting',
    },
    currentTurn: String,
    winner: String,
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Game', gameSchema);
