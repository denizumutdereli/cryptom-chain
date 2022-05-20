const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    max: 4,
    min: 2,
    immutable: true,
  },
  password: {
    type: String,
    required: [true, " {PATH} is required."],
    max: [16, "max length for {PATH} is ({MAXLENGTH})"],
    min: 5,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    message: "{VALUE} is not supported. Try {user}",
    required: [false, " {PATH} is required. You can set {buyer/seller}"],
    lowercase: true,
    immutable: true, //there should be some other features to update and track clients. Not here.
  },
  seasons: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "seasons",
  },
  teams: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teams",
  },
  fixtures: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "fixtures",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("users", UserSchema);
