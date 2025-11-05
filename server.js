const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());

// ✅ Home route to fix "Cannot GET /"
app.get("/", (req, res) => {
  res.send("Server is running ✅ Use /register /login /profile");
});

// Dummy User Store
let users = [];

const SECRET_KEY = "mysecretkey";

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.send("✅ User Registered");
});

// LOGIN (Generate Token)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).send("❌ User not found");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).send("❌ Wrong password");

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ message: "✅ Login Successful", token });
});

// PROTECTED ROUTE
app.get("/profile", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).send("🚫 No Token Provided");

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    res.json({ message: "✅ Access Granted", user: verified });
  } catch {
    res.status(401).send("❌ Invalid Token");
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
