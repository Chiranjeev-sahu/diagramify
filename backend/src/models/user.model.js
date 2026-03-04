import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    diagramsGenerated: [
      {
        type: Schema.Types.ObjectId,
        ref: "Diagram",
      },
    ],
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  // In async middleware, use 'return' instead of calling 'next()'
  // Mongoose automatically waits for the Promise to resolve
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password); // this.password is the actual encrypted saved password whereas password the one we have to compare with
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, username: this.username },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

export const User = model("User", userSchema);
