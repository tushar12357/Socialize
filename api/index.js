const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;

const app = express();
const port = 5000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());
const jwt = require("jsonwebtoken");
app.use('/files', express.static('files'));

mongoose
  .connect(
    "mongodb+srv://tusharcdry:8874271357@socialize-native.rnfft.mongodb.net/?retryWrites=true&w=majority&appName=socialize-native"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((e) => {
    console.log("Connection Unsuccessful", e);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const User = require("./models/user");
const Message = require("./models/message");

app.post("/register", (req, res) => {
  const { name, email, password, image } = req.body;
  const newUser = new User({ name, email, password, image });
  newUser
    .save()
    .then(() => {
      res.status(200).json({ message: "User registered successfully" });
    })
    .catch((err) => {
      console.log("Error registering user", err);
      res.status(500).json({ message: "Error registering user" });
    });
});

const createToken = (userId) => {
  const payload = {
    userId: userId,
  };
  const token = jwt.sign(
    payload,
    "5c2e7b1fc405ff54c2b6c6ce12d06c971f5d382c20dae57d791c0ca3912cf778",
    { expiresIn: "1h" }
  );
  return token;
};

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ message: "User does not exist" });
      }
      if (user.password !== password) {
        return res.status(400).json({ message: "Incorrect password" });
      }
      const token = createToken(user._id);
      res.status(200).json({ token });
    })
    .catch((error) => {
      console.log("Error in finding user", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

app.get("/users/:userId", (req, res) => {
  const loggedInUserId = req.params.userId;
  User.find({ _id: { $ne: loggedInUserId } })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      console.log("Error retreiving users", error);
      res.status(500).json({ message: "Internal server error" });
    });
});

app.post("/friend-request", async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;
  try {
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { friendRequests: currentUserId },
    });
    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentFriendRequests: selectedUserId },
    });
    res.status(200).json({ message: "friend request sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/friend-request/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate("friendRequests", "name email image")
      .lean();
    const friendRequests = user.friendRequests;
    res.json(friendRequests);
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/friend-request/accept", async (req, res) => {
  try {
    const { senderId, recepientId } = req.body;
    const sender = await User.findById(senderId);
    const recepient = await User.findById(recepientId);
    sender.friends.push(recepientId);
    recepient.friends.push(senderId);
    recepient.friendRequests = recepient.friendRequests.filter(
      (request) => request.toString() !== senderId.toString()
    );
    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (request) => request.toString() !== recepientId.toString()
    );

    await sender.save();
    await recepient.save();
    res.status(200).json({ message: "Friend request accepted succesfully" });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/accepted-friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      "friends",
      "name email image"
    );
    const acceptedFriends = user.friends;
    res.json(acceptedFriends);
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const multer = require("multer");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "files/");
  },
  filename: function (req, file, cb) {
   
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/messages", upload.single("imageFile"), async (req, res) => {
  try {
    const { senderId, recepientId, messageType, messageText } = req.body;
    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message:messageText,
      timestamp: new Date(),
      imageUrl: messageType === "image" ? req.file.path:null,
    });
    await newMessage.save()
    res.status(200).json({message:"Message sent successfully"})
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get('/user/:userId',async(req,res)=>{
  try {
    const {userId}=req.params;
    const recepientId=await User.findById(userId);
    res.json(recepientId);
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})


app.get('/messages/:senderId/:recepientId',async(req,res)=>{
  try {
    const {senderId,recepientId}=req.params;
    const messages=await Message.find({
      $or:[
        {senderId:senderId,recepientId:recepientId},
        {senderId:recepientId,recepientId:senderId}
      ]
    }).populate("senderId","_id name")
    res.json(messages)
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

app.post('/deleteMessages',async(req,res)=>{
  try {
    const {messages}=req.body;
    if(!Array.isArray(messages) || messages.length===0){
      return res.status(400).json({message:"Invalid request body"})
    }
    await Message.deleteMany({_id:{$in:messages}})
    res.json({message:"Message deleted successfully"})
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

app.get('/friend-requests/sent/:userId',async(req,res)=>{
  try {
    const {userId}=req.params;
    const user=await User.findById(userId).populate("sentFriendRequests","name email image").lean()
    const sentFriendRequests=user.sentFriendRequests;
    res.json(sentFriendRequests)

  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

app.get('/friends/:userId',(req,res)=>{
  try {
    const {userId}=req.params;
    User.findById(userId).populate("friends").then((user)=>{
      if(!user){
        return res.status(404).json({message:"User not found"})
      }
      const friendIds=user.friends.map((friend)=>friend._id)
      res.status(200).json(friendIds)
    })
  } catch (error) {
    onsole.log("Error", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})