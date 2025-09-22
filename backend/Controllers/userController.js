const User = require("../Model/userModel");

// ✅ Get all users
const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!users || users.length === 0) {
    return res.status(404).json({ message: "Users not found" });
  }
  return res.status(200).json({ users });
};

// ✅ Add new user (Signup)
const addUser = async (req, res, next) => {
  try {
    console.log("Signup request received:", req.body);
    console.log("File received:", req.file);
    
    const {
      firstName,
      lastName,
      country,
      dob,
      gender,
      phone,
      email,
      password,
      confirmPassword,
      agreeTerms,
      role,
    } = req.body;

    // Check confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Handle profile picture
    let profilePicturePath = "";
    if (req.file) {
      profilePicturePath = `/uploads/${req.file.filename}`;
    }

    const user = new User({
      firstName,
      lastName,
      country,
      dob,
      gender,
      phone,
      email,
      password, // plain text for now
      agreeTerms,
      role: role || "user", // default to 'user' if not provided
      profilePicture: profilePicturePath,
    });

    await user.save();
    console.log("User saved successfully:", user);
    return res.status(201).json({ message: "User registered successfully", user });
  } catch (err) {
    console.error("Error in addUser:", err);
    return res.status(500).json({ message: "Unable to add user", error: err.message });
  }
};

// ✅ User Login
const loginUser = async (req, res, next) => {
  try {
    console.log("Login request received:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: "Invalid password" });
  }

  return res.status(200).json({
    message: "Login successful",
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
    },
  });
  } catch (err) {
    console.error("Error in loginUser:", err);
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// ✅ Get user by ID
const getById = async (req, res, next) => {
  const id = req.params.id;
  let user;

  try {
    user = await User.findById(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.status(200).json({ user });
};

// ✅ Update user
const updateUser = async (req, res, next) => {
  const id = req.params.id;
  const {
    firstName,
    lastName,
    country,
    dob,
    gender,
    phone,
    email,
    password,
    confirmPassword,
    agreeTerms,
    role,
  } = req.body;

  // Check if passwords match only if password is provided
  if (password && password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  let user;
  try {
    user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Update user fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.country = country || user.country;
    user.dob = dob || user.dob;
    user.gender = gender || user.gender;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    if (password) user.password = password; // only update password if provided
    user.agreeTerms = agreeTerms !== undefined ? agreeTerms : user.agreeTerms;
    if (role) user.role = role; // allow updating role if provided

    await user.save();
    return res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// ✅ Delete user
const deleteUser = async (req, res, next) => {
  const id = req.params.id;
  let user;

  try {
    user = await User.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!user) {
    return res.status(404).json({ message: "Unable to delete user" });
  }
  return res.status(200).json({ message: "User deleted successfully", user });
};

// Export all functions
module.exports = {
  getAllUsers,
  addUser,
  loginUser,
  getById,
  updateUser,
  deleteUser,
};
