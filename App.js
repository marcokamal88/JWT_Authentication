import express, { json } from "express";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
const app = express();
app.use(json());
const port = 3000;
let users = [];
app.post("/register", async (req, res) => {
  let userFound = users.some((user) => user.username == req.body.username);
  console.log(userFound);
  if (userFound) {
    return res.send("user already exists :)");
  } else {
    const hashedPassword = await hash(req.body.password, 10);
    const newUser = {
      username: req.body.username,
      password: hashedPassword,
    };
    users.push(newUser);
    return res.send("user added :)");
  }
});
app.post("/login", async (req, res) => {
  let userFound = users.find((user) => user.username == req.body.username);
  console.log(userFound);
  if (!userFound) {
    res.send("Authentication failed :(");
  } else {
    const passwordMatch = await compare(req.body.password, userFound.password);
    if (!passwordMatch) {
      res.send("wrong password :(");
    }
    const token = jwt.sign({ username: userFound.username }, "marco", {
      expiresIn: "1h",
    });
    res.send(token);
  }
});

app.get("/me", verifyToken, (req, res) => {
  res.send(res.username);
});
function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (bearerHeader) {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, "marco", (err, username) => {
      if (err) return res.sendStatus(403);
      res.username = username;
      next();
    });
  } else {
    res.sendStatus(403);
  }
}
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
