const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const app = express();
const user = require('./model.js')
const path = require("path");
const { checkForAuthentication } = require("./checkAuth.js");
const port = process.env.PORT || 3000;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(checkForAuthentication("token"));

mongoose
  .connect("mongodb://localhost:27017/USER")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/signin", (req, res) => {
  return res.render("signin");
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    

    if (email && password) {
      const token = await user.matchPassword(email, password);
      if (token) {
        res.cookie("token", token);
        return res.redirect("/");
      }
    }
    return res.render("signin", { error: "Invalid email or password" });
  } catch (error) {
    console.error("Signin error:", error);
    return res
      .status(500)
      .render("signin", { error: "Invalid email or password" });
  }
});

app.get("/signup", (req, res) => {
  return res.render("signup");
});

app.post("/signup", async (req, res) => {
  console.log(req.body)
  const { name, password, email, date } = req.body;
  try {
    const prevUser = await user.findOne({ email });
    console.log(prevUser);

    if (prevUser) {
      return res.render("signup", { message: "Email Already Exists" });
    }
    let newUser = new user({
      name,
      email,
      date,
      password,
    });

    await newUser.save();
    return res.render("signin", { user: newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error occurred while creating the user.");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
