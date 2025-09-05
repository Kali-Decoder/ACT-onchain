const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const PORT = 8080;
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB Atlas connection
const MONGO_URI = "mongodb+srv://cricket:cricket@cricket.k5iepu2.mongodb.net/";
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("MongoDB connection error:", err));

// Schema
const leaderboardSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  rewardPoints: { type: Number, default: 0 },
  transactionHashes: { type: [String], default: [] },
}, { timestamps: true });

const Leaderboard = mongoose.model("Leaderboard", leaderboardSchema);

// Add a bet (increment points)
app.post("/bet", async (req, res) => {
  try {
    const { address, transactionHash } = req.body;
    if (!address || !transactionHash) {
      return res.status(400).json({ error: "Address and transactionHash required" });
    }

    // Check for duplicate transaction
    const duplicateTx = await Leaderboard.findOne({ transactionHashes: transactionHash });
    if (duplicateTx) {
      return res.status(400).json({ error: "Transaction already recorded" });
    }

    // Update if user exists, otherwise create
    const user = await Leaderboard.findOneAndUpdate(
      { address },
      {
        $inc: { rewardPoints: 10 },
        $push: { transactionHashes: transactionHash }
      },
      { new: true, upsert: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get leaderboard sorted by rewardPoints
app.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find().sort({ rewardPoints: -1 });
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
