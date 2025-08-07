const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

class OAuthService {
  // Initialize Google OAuth client
  static googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Verify Google token
  static async verifyGoogleToken(token) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      return ticket.getPayload();
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }

  // Verify Facebook token
  static async verifyFacebookToken(token) {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/me?fields=id,email,name&access_token=${token}`
      );
      return response.data;
    } catch (error) {
      console.error('Facebook token verification failed:', error);
      throw new Error('Invalid Facebook token');
    }
  }

  // Find or create user from OAuth data
  static async findOrCreateUser(provider, profile) {
    const { email, name, sub: oauthId } = profile;

    // Find existing user
    let user = await User.findOne({
      where: {
        [provider === 'google' ? 'googleId' : 'facebookId']: oauthId
      }
    });

    if (!user) {
      // Check if user exists with this email
      user = await User.findOne({ where: { email } });

      if (user) {
        // Link OAuth account to existing user
        await user.update({
          [provider === 'google' ? 'googleId' : 'facebookId']: oauthId,
          isVerified: true
        });
      } else {
        // Create new user
        user = await User.create({
          email,
          username: name,
          isVerified: true,
          [provider === 'google' ? 'googleId' : 'facebookId']: oauthId
        });
      }
    }

    return user;
  }

  // Generate JWT tokens
  static generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }
}

module.exports = OAuthService; 