import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protect = async (req, res, next) => {
  let token;

  // Check for token in the request headers
  if (
    req.headers?.authorization &&
    req.headers?.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers?.authorization.split(" ")[1]; // Extract the token

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from the decoded token
      req.user = await User.findById(decoded.id).select("-password"); // Exclude password from user object

      if (!req.user) {
        return res.status(401).json({ message: "User not found!" });
      }

      next(); // Proceed to the next middleware/controller
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed!" });
    }
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided!" });
  }
};

export default protect;
