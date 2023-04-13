const refreshRouter = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

refreshRouter.get('/', async (req, res) => {
  console.log('=====================');
  console.log('=======REFRESHING========');
  console.log('=====================');
  const cookies = req.cookies;
  if (cookies) {
    console.log('refresh cookie:', cookies?.jwt.slice(-4));
  }
  if (!cookies?.jwt) return res.sendStatus(401);
  const refreshToken = cookies.jwt;
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

  // const foundUser = await User.findOne({ refreshToken }).exec();
  const foundUser = await User.findOne({
    refreshToken: { $in: [refreshToken] },
  }).exec();
  console.log('found user');

  // Detected refresh token reuse!
  if (!foundUser) {
    console.log('no found user');
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) return res.sendStatus(403); //Forbidden
        // Delete refresh tokens of hacked user
        const hackedUser = await User.findOne({
          _id: decoded.id,
        }).exec();
        hackedUser.refreshToken = [];
        const result = await hackedUser.save();
      }
    );
    return res.sendStatus(403); //Forbidden
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
        // expired refresh token
        console.log('err expired refresh token', err);
        foundUser.refreshToken = [...newRefreshTokenArray];
        const result = await foundUser.save();
      }
      if (err || foundUser._id.toString() !== decoded.id) {
        console.log('failing here');
        // console.log('failing here', foundUser._id, decoded.id);
        return res.sendStatus(403);
      }

      // Refresh token was still valid
      const accessToken = jwt.sign(
        {
          id: foundUser._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15s' }
      );

      const newRefreshToken = jwt.sign(
        {
          id: foundUser._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '10m' }
      );
      if (newRefreshToken) {
        console.log(
          'old',
          cookies?.jwt.slice(-4),
          'new',
          newRefreshToken.slice(-4)
        );
      }
      // Saving refreshToken with current user
      foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      const result = await foundUser.save();
      console.log('success');

      // Creates Secure Cookie with refresh token
      res.cookie('jwt', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken });
    }
  );
});

module.exports = refreshRouter;
