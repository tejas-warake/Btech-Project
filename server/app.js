require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./db/connect");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const CustomError = require("./errors/index");
var cron = require("node-cron");
const axios = require("axios");
const authenticateUser = require("./middleware/authenticateUser");
const User = require("./models/User");

const authRouter = require("./routes/authRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const complaintRouter = require("./routes/complaintRoutes");
const messageRouter = require("./routes/messageRoutes");
const userRouter = require("./routes/userRoutes");
const { getTotalNumbers } = require("./controllers/totalNumbersController");

const app = express();

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  const responseData = {
    message: "YO, HOW U DOIN?",
  };

  res.status(200).json(responseData);
});

cron.schedule("*/5 * * * *", () => {
  console.log("SERVER PING IS ALRIGHT!");
  const serverUrl = "http://127.0.0.1:5000";
  axios
    .get(serverUrl)
    .then((response) => {
      if (response.status === 200) {
        console.log(`Request sent to ${serverUrl}`);
      } else {
        console.error(
          `Failed to send request to ${serverUrl}. Status code: ${response.status}`
        );
      }
    })
    .catch((error) => {
      console.error(`Error sending request to ${serverUrl}: ${error.message}`);
    });
});
app.use("/api/v1/validateToken", authenticateUser, async (req, res) => {
  const userData = req.user;
  if (!userData) {
    throw new CustomError.UnauthenticatedError("Token not valid");
  }
  res.status(200).json({ userData });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/complaints", complaintRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/users", userRouter);
app.get("/api/v1/total-numbers", getTotalNumbers);

const port = 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
