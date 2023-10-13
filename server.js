const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

let resturants;
app.use(cors());

app.get("/resturants", (req, res) => {
  res.status(200).json(resturants);
  return;
});
app.post("/resturants", (req, res) => {
  const { data } = req.body;
  resturants = data;
  res.status(201).json({ message: "resturants updated succesfully" });
  return;
});
port = process.env.PORT || 3001;

app.listen(port, () => console.log(`Server Listening to requests ${port}`));
