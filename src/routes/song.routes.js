import express from "express";
import { uploadSong, getAllSongs, likeSong, unlikeSong, getLikedSongs,getSongById } from "../controllers/song.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Admin-only song upload route with two file fields: coverImage & audioFile
router.post("/upload", verifyJWT, isAdmin, upload.fields([{ name: "coverImage", maxCount: 1 },{ name: "audioFile", maxCount: 1 },]), uploadSong);

// Get all songs
router.get("/songs", getAllSongs);

// Like a song
router.post("/like/:songId", verifyJWT, likeSong);

// Unlike a song
router.post("/unlike/:songId", verifyJWT, unlikeSong);

// Get liked songs of the user
router.get("/liked", verifyJWT, getLikedSongs);

// Get a specific song by ID
router.get("/:songId", getSongById);

export default router;
