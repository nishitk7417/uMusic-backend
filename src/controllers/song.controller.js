import { Song } from "../models/song.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Upload Song
const uploadSong = asyncHandler(async (req, res) => {
  const { title, artist, genre } = req.body;
  const coverFile = req.files?.coverImage?.[0];
  const audioFile = req.files?.audioFile?.[0];

  if (!coverFile || !audioFile) {
    throw new ApiError(400, "Both cover image and audio file are required");
  }

  const uploadedCover = await uploadOnCloudinary(coverFile.path);
  const uploadedAudio = await uploadOnCloudinary(audioFile.path);

  if (!uploadedCover || !uploadedAudio) {
    throw new ApiError(500, "Error uploading files to Cloudinary");
  }

  const newSong = await Song.create({
    title,
    artist,
    genre,
    coverImage: uploadedCover.secure_url,
    audioFile: uploadedAudio.secure_url,
    uploadedBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, newSong, "Song uploaded successfully"));
});

// Get All Songs
const getAllSongs = asyncHandler(async (req, res) => {
    
  const songs = await Song.find().populate("uploadedBy", "name email");

  if (!songs || songs.length === 0) {
    throw new ApiError(404, "No songs found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, songs, "Songs fetched successfully"));
});

// Like a Song
const likeSong = asyncHandler(async (req, res) => {
  const songId = req.params.songId;
  const user = req.user;

  const song = await Song.findById(songId);
  if (!song) {
    throw new ApiError(404, "Song not found");
  }

  if (user.likedSongs.includes(songId)) {
    throw new ApiError(400, "You have already liked this song");
  }

  user.likedSongs.push(songId);
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, song, "Song liked successfully"));
});

// Unlike a Song
const unlikeSong = asyncHandler(async (req, res) => {
  const songId = req.params.songId;
  const user = req.user;

  const song = await Song.findById(songId);
  if (!song) {
    throw new ApiError(404, "Song not found");
  }

  if (!user.likedSongs.includes(songId)) {
    throw new ApiError(400, "You haven't liked this song yet");
  }

  user.likedSongs = user.likedSongs.filter(
    (id) => id.toString() !== songId
  );
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, song, "Song unliked successfully"));
});

// Get Liked Songs
const getLikedSongs = asyncHandler(async (req, res) => {
  const user = req.user;

  const likedSongs = await Song.find({
    _id: { $in: user.likedSongs },
  }).populate("uploadedBy", "name email");

  if (!likedSongs || likedSongs.length === 0) {
    throw new ApiError(404, "You haven't liked any songs yet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, likedSongs, "Liked songs fetched successfully"));
});

// Get Song by ID
const getSongById = asyncHandler(async (req, res) => {
  const songId = req.params.songId;

  const song = await Song.findById(songId).populate("uploadedBy", "name email");
  if (!song) {
    throw new ApiError(404, "Song not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, song, "Song fetched successfully"));
});

export {
  uploadSong,
  getAllSongs,
  likeSong,
  unlikeSong,
  getLikedSongs,
  getSongById,
};
