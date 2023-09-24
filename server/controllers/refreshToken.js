const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  // if (!cookies?.jwt) return res.sendStatus(401);
  if (!cookies?.jwt) throw new AppError(401, "Unauthorized");
  const refreshToken = cookies.jwt;
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });

  const foundUser = await User.findOne({ refreshToken }).exec();

  // Detected refresh token reuse!
  // Token has already been deleted from previous log out
  if (!foundUser) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        // if (err) return res.sendStatus(403); //Forbidden
        if (err) throw new AppError(403, "Forbidden"); //Forbidden
        // Delete refresh tokens of hacked user
        const hackedUser = await User.findOne({
          _id: decoded._id,
        }).exec();
        hackedUser.refreshToken = [];
        await hackedUser.save();
      }
    );
    // return res.sendStatus(403); //Forbidden
    throw new AppError(403, "Forbidden"); //Forbidden
  }

  const newRefreshTokenArray = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );

  // evaluate jwt
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        // remove expired refresh token from user db
        foundUser.refreshToken = [...newRefreshTokenArray];
        await foundUser.save();
      }
      if (err || foundUser._id.toString() !== decoded.id)
        // return res.sendStatus(403);
        throw new AppError(403, "Forbidden");

      // Refresh token was still valid
      const accessToken = jwt.sign(
        {
          id: foundUser._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      const newRefreshToken = jwt.sign(
        { id: foundUser._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      // Saving refreshToken with current user
      foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      await foundUser.save();

      // Creates Secure Cookie with refresh token
      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 1 * 60 * 60 * 1000, // 1 day
      });
      res.json({ token: accessToken });
    }
  );
};

module.exports = { handleRefreshToken };
