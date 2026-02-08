import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/db';

// Configure Local Strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Find user by username
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        return done(null, false, { message: 'Invalid username or password' });
      }

      // Check if user is approved
      if (!user.isApproved) {
        return done(null, false, { message: 'Account pending admin approval' });
      }

      // Check if user is active
      if (!user.isActive) {
        return done(null, false, { message: 'Account has been deactivated' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid username or password' });
      }

      // Update last login time
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Success - return user without password
      const { password: _, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error);
    }
  })
);

// Serialize user for session storage
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isApproved: true,
        isActive: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return done(null, false);
    }

    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
