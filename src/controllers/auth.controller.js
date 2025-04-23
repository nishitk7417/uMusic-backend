import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';



const registerUser = asyncHandler(async(req,res)=>{

    const {name, email, password, role} = req.body;
    console.log("req body",req.body);
    

    //validation - not empty field
    if(!name || !email || !password){
        throw new ApiError(400, "All fields are required.")
    }

    // check if user already exist: username and email
    const existedUser = await User.findOne({
        $or: [{email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with email already exists")
    }
    // create user object - for creating entry in DB
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'user'
    })

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password"
    )

    // check for user creation
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // return res
    return res.status(201). json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

// user login logic
const loginUser = asyncHandler(async(req, res) =>{

    //req body = > data extraction
    const {email, password} = req.body;

    // checking email field
    if(!email){
        throw new ApiError(400," email is required");
    }

    //find the user
    const user = await User.findOne({
        $or: [{email}]
    })
    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    //password check
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials");
    }

    // use generateAccessAndRefreshToken method
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password")

    // send cookies
    const options ={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User logged in successfully"
    ))
})

//user logout logic
const logoutUser = asyncHandler(async (req, res) => {
    // Clear access and refresh tokens from cookies
    res
        .status(200)
        .clearCookie("accessToken", { httpOnly: true, secure: true })
        .clearCookie("refreshToken", { httpOnly: true, secure: true })
        .json(new ApiResponse(200, null, "User logged out successfully"));
});

//generate access and refresh token
const generateAccessAndRefreshToken = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

export {
    registerUser,
    loginUser,
    logoutUser
}