import mongoose, {Schema} from "mongoose";

const SongSchema = new Schema({
  title: {
    type: String,
    required: true
},
  artist: {
    type: String,
    required: true
},
  album: {
    type: String,
},
  genre: {
    type: String,
    required: true
},
  audioUrl: {
    type: String,
    required: true
},
  coverImageUrl: {
    type: String,
},
},{timestamps: true});
export const song = mongoose.model("Song", SongSchema);
