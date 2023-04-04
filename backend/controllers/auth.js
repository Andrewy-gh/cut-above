const User = require('../models/User');
const bcrypt = require('bcrypt');
const authRouter = require('express').Router();
const jwt = require('jsonwebtoken');

authRouter.post('/login', async (req, res) => {
  const cookies = req.cookies;
  console.log('existing refresh token?', cookies.jwt);

  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ message: 'Username and password are required.' });

  const foundUser = await User.findOne({ email }).exec();
  if (!foundUser) return res.sendStatus(401); //Unauthorized
  // evaluate password
  const match = await bcrypt.compare(password, foundUser.passwordHash);
  if (match) {
    // create JWTs
    const accessToken = jwt.sign(
      {
        id: foundUser._id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15s' }
    );
    console.log('=AUTH CONTROLLERS===============');
    console.log('ACCESS TOKEN', accessToken);
    const newRefreshToken = jwt.sign(
      {
        id: foundUser._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '10m' }
    );
    console.log('=AUTH CONTROLLERS===============');
    console.log('REFRESH TOKEN', newRefreshToken);
    // Changed to let keyword
    let newRefreshTokenArray = !cookies?.jwt
      ? foundUser.refreshToken
      : foundUser.refreshToken.filter((rt) => rt !== cookies.jwt);

    if (cookies?.jwt) {
      /* 
            Scenario added here: 
                1) User logs in but never uses RT and does not logout 
                2) RT is stolen
                3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
            */
      const refreshToken = cookies.jwt;
      const foundToken = await User.findOne({ refreshToken }).exec();

      // Detected refresh token reuse!
      if (!foundToken) {
        // clear out ALL previous refresh tokens
        newRefreshTokenArray = [];
      }

      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
      });
    }

    // Saving refreshToken with current user
    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    const result = await foundUser.save();
    console.log('successfully logged in', result);

    // Creates Secure Cookie with refresh token
    res.cookie('jwt', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send authorization roles and access token to user
    res.json({ accessToken });
  } else {
    res.sendStatus(401);
  }
});

module.exports = authRouter;
