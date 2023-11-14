const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already Exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to Create the User");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

const allUsers = asyncHandler(async (req, res) => {
  //mongoose data base queries
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  // show all except me
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { name } = req.body;

  const userUpdate = await User.findByIdAndUpdate(
    id,
    {
      name,
    },
    {
      new: true,
    }
  );
  if (!userUpdate) {
    res.status(404);
    throw new Error("User Not Found");
  } else {
    res.json({
      _id: userUpdate._id,
      name: userUpdate.name,
      email: userUpdate.email,
      pic: userUpdate.pic,
      token: generateToken(userUpdate._id),
    });
  }
});

const updateProfile = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { pic } = req.body;

  const userUpdate = await User.findByIdAndUpdate(
    id,
    {
      pic,
    },
    {
      new: true,
    }
  );
  if (!userUpdate) {
    res.status(404);
    throw new Error("User Not Found");
  } else {
    res.json({
      _id: userUpdate._id,
      name: userUpdate.name,
      email: userUpdate.email,
      pic: userUpdate.pic,
      token: generateToken(userUpdate._id),
    });
  }
});

module.exports = {
  registerUser,
  authUser,
  allUsers,
  updateUser,
  updateProfile,
};
