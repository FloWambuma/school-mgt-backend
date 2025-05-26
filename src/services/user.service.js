import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import submission from "../models/submissions.model.js";
 
// @desc register a user
// @route POST /api/users
// @access Public

export const registerUser = async (req, res) => {
  const { username, image, password, role } = req.body;

  // check if there is a username
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "username and password are required! " });
  }
  if (!role) {
    return res
      .status(400)
      .json({ message: "Please select your role, student or lecturer!" });
  }

  // check if the user already exists in the database
  const userAlreadyExists = await User.findOne({ username: username }).lean();

  if (userAlreadyExists) {
    return res
      .status(400)
      .json({ message: "User with that username already exists!" });
  }

  // hash user passwords
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // register a user
  try {
    const newUser = await User.create({
      username,
      image,
      password: hashedPassword,
      role,
    });
    return res
      .status(201)
      .json({ data: null, message: "Successfully registered, please login" });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Something went wrong! Try again later" });
  }
};

// @desc login a user
// @route POST /api/users/login
// @access Public
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  // check if there is a username
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "username and password are required! " });
  }

  // find user with this username
  const user = await User.findOne({ username: username });

  // user does not exists
  if (!user) {
    return res
      .status(400)
      .json({ message: "user does not exist! please register " });
  }

  // return user data
  if (user && (await bcrypt.compare(password, user.password))) {
    return res.status(200).json({
      data: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        accessToken: generateToken(user._id),
      },
      message: "Successfully logged in",
    });
  } else {
    return res
      .status(401)
      .json({ message: "Wrong credentials! check your username or password" });
  }
};

// @desc get a users profile
// @route GET /api/users/:id
// @access Private
export const getUserProfile = async (req, res) => {
  const userId = req.user.id; // from middleware

  const user_submissions = await submission
    .find({ studentId: userId }, "_id score assignmentId")
    .populate("assignmentId", "questions")
    .lean();
  if (user_submissions) {
    const data = {
      submissions: user_submissions,
    };
    return res.status(200).json(data);
  } else {
    return res
      .status(400)
      .json({ message: "Something went wrong! Try again later" });
  }
};

// @desc get students results per assignment
// @route GET /api/users/results
// @access public
 export const getAllUsersResults = async (req, res) => {
  const { assignmentId } = req.params;

  try {
   const all_submissions = await submission
    .find({ assignmentId })
.populate({
        path: "assignmentId",
        select: "title", // Optional, if you want the assignment title
      })
      .populate({
        path: "studentId",
        select: "username", // Select the student name
      })
    .lean();
    if (all_submissions && all_submissions.length > 0) {
      return res.status(200).json(all_submissions);
    } else {
      return res.status(404).json({ message: 'No submission for this assignment!' });
    }
  } catch (error) {
    console.error('Error fetching users by assignment:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc get all users
// @route GET /api/users
// @access public
export const getAllUsers = async (req, res) => {
  const users = await User.find({}, "-password").lean();
  if (users) {
    return res.status(200).json(users);
  } else {
    return res.status(404).json({ message: "No users found!" });
  }
};
// @desc  delete a user
// @route DELETE  /api/users/:id
// @access private
export const deleteUser = async (req, res) => {
  // NB: verify Bearer token sent here before deleting a user
  const user = await User.deleteOne({ _id: req.params.id });
  if (user) {
    res.status(200).json({
      success: true,
    });
  }
};

// Generate a JWT that expires after 30 days
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
