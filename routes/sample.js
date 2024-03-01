const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env.local" });
const secretKey = process.env.JWT_SECRET;
const router = express.Router();
const { getLoginUser } = require("../mongodb");
const { createUser } = require("../mongodb");
const { checkEmailUnique } = require("../mongodb");
const { getAllUsersDB } = require("../mongodb");
const { getUserInfoFromDatabase } = require("../mongodb");
const { getCarousel } = require("../mongodb");
const { createCarouselItem } = require("../mongodb");
const { updateCarouselItem } = require("../mongodb");
const { deleteCarouselItem } = require("../mongodb");
const { updateUser } = require("../mongodb");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

async function generateToken(user) {
  const secretKey = process.env.JWT_SECRET;
  return jwt.sign({ userId: user._id }, secretKey, { expiresIn: "1h" });
}

function authenticate(req, res, next) {
  const token = req.headers.authorization;
  console.log(token);
  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    console.log(decoded);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
}
router.get("/protected", authenticate, (req, res) => {
  res.json({ message: "Protected route accessed successfully" });
});

router.post("/register", async (req, res) => {
  const { name, email, password, age, country, gender, isAdmin } = req.body;

  try {
    const isUnique = await checkEmailUnique(email);
    if (!isUnique) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const salt = await bcrypt.genSalt(10);
    const user = await createUser(
      name,
      email,
      await bcrypt.hash(password, salt),
      age,
      country,
      gender,
      isAdmin
    );
    const token = await generateToken(user);
    res.json(token);
  } catch (error) {
    console.error("Error registering user", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await getLoginUser(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { email: user.email, role: user.role },
        process.env.JWT_SECRET
      );

      res.cookie("token", token, { httpOnly: true, secure: true });

      res.json({ message: "Login successful", token: token });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error logging in", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const allUsers = await getAllUsersDB();
    //console.log(allUsers)
    res.json(allUsers);
  } catch (error) {
    console.error("Cannot connect to MongoDB:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getUser/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const userInfo = await getUserInfoFromDatabase(email);
    if (userInfo) {
      res.json({ message: "get user info successful", userInfo });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("error connect to db", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//#region send mail
router.post("/send-email", (req, res) => {
  const { to, subject, message } = req.body;
  console.log(`to:${to},subject:${subject},message:${message}`);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    secure: false,
    port: 587,
    auth: {
      user: "mukhambetaliev.aslanbek@gmail.com",
      pass: "kvnr ybxy nrwn zoow",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: "mukhambetaliev.aslanbek@gmail.com",
    to: to,
    subject: subject,
    text: message,
  };

  console.log(mailOptions);

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to send email" });
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).json({ message: "Email sent successfully" });
    }
  });
});
//#endregion

router.get("/checkEmailUnique/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const isUnique = await checkEmailUnique(email);
    res.json({ isUnique });
  } catch (error) {
    console.error("Error while checking email uniqueness:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/postTask", async (req, res) => {
  try {
    const { title, content, difficulty, isCompleted, userId } = req.body;
    const tasks = await createTask(
      title,
      content,
      difficulty,
      isCompleted,
      userId
    );

    res.status(200).json({ message: "Task created succesfully" });
  } catch (error) {
    console.error("Error when create a task", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/postUser", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const user = await createUser(
      name,
      email,
      await bcrypt.hash(password, salt)
    );

    res.status(200).json({ message: "User created sucessfully", user });
  } catch (error) {
    console.error("Error when creating user", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/deleteTask/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteTasks(id);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error while deleting task", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/patchTask/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { isCompleted } = req.body;
    const updated = await updateTask(id, isCompleted);
    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Error while updating task", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//#endregion

router.patch("/patchUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age, country, gender, isAdmin } = req.body;
    console.log(id, name, email, age, country, gender, isAdmin);
    const updated = await updateUser(
      id,
      name,
      email,
      age,
      country,
      gender,
      isAdmin
    );
    console.log(updated);
    res.status(200).json({ message: "User updated successfully", updated });
  } catch (error) {
    console.error("Error while updating task", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//#region Carousel

router.get("/images", async (req, res) => {
  try {
    const images = await getCarousel();
    // console.log(images);
    res.json(images);
  } catch (err) {
    console.error("Error:", err);
  }
});
router.post("/image", async (req, res) => {
  try {
    const { title, description, url } = req.body;
    const newImage = await createCarouselItem(title, description, url);
    res.json({ message: "succesfull created image", newImage });
  } catch (err) {
    console.error("Error:", err);
  }
});
router.patch("/updateImage/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const { title, description, url } = req.body;
    console.log(title, description, url);
    const newImage = await updateCarouselItem(id, title, description, url);
    res.json({ message: "succesfull update of image", newImage });
  } catch (err) {
    console.error("Error:", err);
  }
});
router.delete("/deleteImage/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const delImage = await deleteCarouselItem(id);
    res.json({ message: "deleted successgully", delImage });
  } catch (err) {
    console.error("Error:", err);
  }
});
//#endregion
module.exports = router;
