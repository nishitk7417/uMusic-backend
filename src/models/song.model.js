import mongoose, {Schema} from "mongoose";

const songSchema = new Schema({
  title: {
    type: String,
    required: [true, "Song title is required"]
  },
  artist: {
    type: String,
    required: [true, "Artist name is required"]
  },
  genre: {
    type: String
  },
  coverImage: {
    type: String, // URL or local path
    required: true
  },
  audioFile: {
    type: String, // URL or local path
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
},{timestamps: true});

export const Song = mongoose.model("Song", songSchema);
