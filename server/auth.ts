import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { type User as DbUser } from "@shared/schema";
import connectPg from "connect-pg-simple";
import Stripe from "stripe";

declare global {
  namespace Express {
    interface User extends DbUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return await bcrypt.compare(supplied, stored);
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export function setupAuth(app: Express) {
  // Session configuration
  const PostgresSessionStore = connectPg(session);
  const sessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: 7 * 24 * 60 * 60, // 1 week
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy (email/password)
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !user.password || user.authProvider !== "local") {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isValidPassword = await comparePasswords(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Enhanced Google Strategy with comprehensive error handling and logging
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        // Dynamic callback URL handling like Flask example
        callbackURL: process.env.NODE_ENV === 'development' 
          ? `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}/api/auth/google/callback`
          : "/api/auth/google/callback",
        // Enhanced scopes following Flask example pattern
        scope: [
          "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/userinfo.profile", 
          "openid"
        ],
        state: true, // Enable state parameter for CSRF protection
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("Google OAuth: Processing authentication for user:", profile.id);
          console.log("Google OAuth: Profile data received:", {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            verified: profile.emails?.[0]?.verified
          });

          // Validate required profile data
          if (!profile.id) {
            console.error("Google OAuth: Missing profile ID");
            return done(new Error("Invalid Google profile: missing ID"), null);
          }

          const email = profile.emails?.[0]?.value;
          if (!email) {
            console.error("Google OAuth: Missing email in profile");
            return done(new Error("Invalid Google profile: missing email"), null);
          }

          // Check if email is verified
          const isEmailVerified = profile.emails?.[0]?.verified;
          if (!isEmailVerified) {
            console.warn("Google OAuth: Email not verified for user:", email);
          }

          // Check if user exists with Google ID
          let user = await storage.getUserByGoogleId(profile.id);
          
          if (user) {
            console.log("Google OAuth: Existing user found with Google ID:", user.id);
            // Update profile information if needed
            if (user.email !== email || 
                user.firstName !== (profile.name?.givenName || '') ||
                user.lastName !== (profile.name?.familyName || '') ||
                user.profileImageUrl !== (profile.photos?.[0]?.value || '')) {
              
              console.log("Google OAuth: Updating user profile information");
              user = await storage.upsertUser({
                id: user.id,
                email: email,
                firstName: profile.name?.givenName || user.firstName || '',
                lastName: profile.name?.familyName || user.lastName || '',
                profileImageUrl: profile.photos?.[0]?.value || user.profileImageUrl || '',
                authProvider: user.authProvider,
                googleId: profile.id,
                password: user.password,
              });
            }
            return done(null, user);
          }

          // Check if user exists with same email (account linking)
          user = await storage.getUserByEmail(email);
          if (user) {
            console.log("Google OAuth: Linking Google account to existing email user");
            if (user.authProvider === 'local') {
              // Link Google account to existing local user
              user = await storage.linkGoogleAccount(user.id, profile.id);
              console.log("Google OAuth: Successfully linked Google account to existing user");
              return done(null, user);
            } else if (user.authProvider === 'google' && !user.googleId) {
              // Update existing Google user with missing Google ID
              user = await storage.linkGoogleAccount(user.id, profile.id);
              return done(null, user);
            } else {
              console.error("Google OAuth: User exists with different auth provider:", user.authProvider);
              return done(new Error("Account exists with different authentication method"), null);
            }
          }

          // Create new user with comprehensive data validation
          console.log("Google OAuth: Creating new user account");
          const newUserData = {
            id: `google_${profile.id}_${Date.now()}`,
            email: email,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            profileImageUrl: profile.photos?.[0]?.value || '',
            authProvider: "google" as const,
            googleId: profile.id,
            password: null,
          };

          // Validate user data before creation
          if (!newUserData.email || !newUserData.id) {
            console.error("Google OAuth: Invalid user data for creation:", newUserData);
            return done(new Error("Failed to create user: invalid data"), null);
          }

          const newUser = await storage.createUser(newUserData);
          console.log("Google OAuth: Successfully created new user:", newUser.id);

          return done(null, newUser);
        } catch (error) {
          console.error("Google OAuth: Authentication error:", error);
          console.error("Google OAuth: Error details:", {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            profileId: profile?.id
          });
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth Routes
  
  // Traditional registration
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        firstName,
        lastName,
        password: hashedPassword,
        authProvider: "local",
        googleId: null,
        profileImageUrl: null,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          authProvider: user.authProvider,
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Traditional login
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    const user = req.user!;
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      authProvider: user.authProvider,
    });
  });

  // Enhanced Google OAuth routes with comprehensive error handling
  app.get("/api/auth/google", (req, res, next) => {
    try {
      console.log("Google OAuth: Initiating authentication flow");
      console.log("Google OAuth: Request origin:", req.get('origin'));
      console.log("Google OAuth: Request host:", req.get('host'));
      
      // Store original URL for redirect after authentication (like Flask state management)
      if (req.query.returnTo && typeof req.query.returnTo === 'string') {
        req.session.returnTo = req.query.returnTo;
        console.log("Google OAuth: Storing return URL:", req.query.returnTo);
      }
      
      // Enhanced scope configuration following Flask example
      const authOptions = {
        scope: [
          "https://www.googleapis.com/auth/userinfo.email",
          "https://www.googleapis.com/auth/userinfo.profile",
          "openid"
        ],
        accessType: 'offline',
        prompt: 'consent' // Ensure we get refresh token
      };
      
      console.log("Google OAuth: Using scopes:", authOptions.scope);
      
      passport.authenticate("google", authOptions)(req, res, next);
    } catch (error) {
      console.error("Google OAuth: Error initiating authentication:", error);
      res.redirect("/auth?error=oauth_init_failed&provider=google");
    }
  });

  app.get("/api/auth/google/callback", (req, res, next) => {
    try {
      console.log("Google OAuth: Processing callback");
      console.log("Google OAuth: Full callback URL:", req.originalUrl);
      console.log("Google OAuth: Request host:", req.get('host'));
      console.log("Google OAuth: Callback query params:", {
        code: req.query.code ? "present" : "missing",
        state: req.query.state ? "present" : "missing", 
        error: req.query.error || "none",
        error_description: req.query.error_description || "none"
      });

      // Check for OAuth errors from Google
      if (req.query.error) {
        console.error("Google OAuth: Error from Google:", req.query.error);
        console.error("Google OAuth: Error description:", req.query.error_description);
        
        // Handle specific Google OAuth errors
        let errorMessage = 'Authentication failed';
        if (req.query.error === 'access_denied') {
          errorMessage = 'Access denied by user or Google';
        } else if (req.query.error === 'redirect_uri_mismatch') {
          errorMessage = `Callback URL mismatch. Expected: https://${req.get('host')}/api/auth/google/callback`;
          console.error("Google OAuth: CALLBACK URL ISSUE - Please add this URL to your Google OAuth app:", `https://${req.get('host')}/api/auth/google/callback`);
        } else if (req.query.error === 'invalid_client') {
          errorMessage = 'Invalid Google OAuth client configuration';
        } else {
          errorMessage = req.query.error_description || req.query.error;
        }
        
        return res.redirect(`/auth?error=google_error&message=${encodeURIComponent(errorMessage)}`);
      }

      // Validate state parameter (CSRF protection like Flask example)
      if (req.query.state && req.session.state && req.query.state !== req.session.state) {
        console.error("Google OAuth: State parameter mismatch");
        return res.redirect("/auth?error=state_mismatch");
      }

      passport.authenticate("google", {
        failureRedirect: "/auth?error=google_auth_failed",
        failureMessage: true
      })(req, res, (err) => {
        if (err) {
          console.error("Google OAuth: Authentication error:", err);
          const errorMessage = err.message || 'Authentication failed';
          return res.redirect(`/auth?error=auth_failed&message=${encodeURIComponent(errorMessage)}`);
        }

        try {
          console.log("Google OAuth: Authentication successful");
          console.log("Google OAuth: User authenticated:", req.user?.id);

          // Handle return URL (like Flask redirect after login)
          const returnTo = req.session.returnTo || '/';
          delete req.session.returnTo; // Clean up session

          console.log("Google OAuth: Redirecting to:", returnTo);
          res.redirect(returnTo);
        } catch (redirectError) {
          console.error("Google OAuth: Error during redirect:", redirectError);
          res.redirect("/auth?error=redirect_failed");
        }
      });
    } catch (error) {
      console.error("Google OAuth: Callback processing error:", error);
      res.redirect("/auth?error=callback_failed");
    }
  });

  // Enhanced Logout with comprehensive session cleanup (like Flask example)
  app.post("/api/logout", (req, res, next) => {
    try {
      console.log("Logout: Processing logout request for user:", req.user?.id);
      
      const userId = req.user?.id;
      req.logout((err) => {
        if (err) {
          console.error("Logout: Error during passport logout:", err);
          return next(err);
        }

        // Comprehensive session cleanup like Flask session.clear()
        req.session.destroy((sessionErr) => {
          if (sessionErr) {
            console.error("Logout: Error destroying session:", sessionErr);
            return res.status(500).json({ message: "Failed to logout completely" });
          }

          console.log("Logout: Successfully logged out user:", userId);
          res.clearCookie('connect.sid'); // Clear session cookie
          res.json({ message: "Logged out successfully" });
        });
      });
    } catch (error) {
      console.error("Logout: Unexpected error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Enhanced user endpoint with comprehensive user information (like Flask example)
  app.get("/api/user", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.user!;
      console.log("User info request for:", user.id);
      
      // Comprehensive user information like Flask get_user_info
      // Always fetch fresh user data from database to ensure latest plan status
      const freshUser = await storage.getUser(user.id);
      const currentUser = freshUser || user;
      
      console.log("Returning user info for:", currentUser.firstName, currentUser.lastName);
      console.log("Account status:", currentUser.accountStatus);
      
      const userInfo = {
        id: currentUser.id,
        email: currentUser.email,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        displayName: `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.email,
        profileImageUrl: currentUser.profileImageUrl,
        authProvider: currentUser.authProvider,
        isEmailVerified: currentUser.authProvider === 'google', // Google users have verified emails
        createdAt: currentUser.createdAt,
        lastLogin: new Date().toISOString(),
        accountType: currentUser.authProvider === 'google' ? 'Google Account' : 'Email Account',
        hasProfileImage: !!currentUser.profileImageUrl,
        // Include subscription/plan information - always from fresh database data
        accountStatus: currentUser.accountStatus || 'free',
        stripeCustomerId: currentUser.stripeCustomerId,
        subscriptionExpiresAt: currentUser.subscriptionExpiresAt,
      };

      console.log("Returning user info for:", userInfo.displayName);
      res.json(userInfo);
    } catch (error) {
      console.error("Error fetching user info:", error);
      res.status(500).json({ message: "Failed to fetch user information" });
    }
  });

  // Additional endpoint for user profile details (following Flask pattern)
  app.get("/api/user/profile", (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.user!;
      
      // Detailed profile information
      const profileInfo = {
        personalInfo: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          displayName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        },
        accountInfo: {
          id: user.id,
          authProvider: user.authProvider,
          createdAt: user.createdAt,
          profileImageUrl: user.profileImageUrl,
          isEmailVerified: user.authProvider === 'google',
        },
        preferences: {
          // Can be expanded based on user preferences
          theme: 'system',
          language: 'en',
        }
      };

      res.json(profileInfo);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Delete user account endpoint
  app.delete("/api/user/delete", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.user!;
      console.log("Account deletion request for user:", user.id, user.email);
      
      // Cancel Stripe subscription if user has one
      if (user.stripeCustomerId) {
        try {
          console.log("🔄 Cancelling Stripe subscription for customer:", user.stripeCustomerId);
          
          // Get all active subscriptions for the customer
          const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'active'
          });
          
          // Cancel all active subscriptions
          for (const subscription of subscriptions.data) {
            await stripe.subscriptions.cancel(subscription.id);
            console.log("✅ Cancelled subscription:", subscription.id);
          }
          
          // Also cancel any trialing subscriptions
          const trialSubscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'trialing'
          });
          
          for (const subscription of trialSubscriptions.data) {
            await stripe.subscriptions.cancel(subscription.id);
            console.log("✅ Cancelled trial subscription:", subscription.id);
          }
          
          console.log("✅ All Stripe subscriptions cancelled for user:", user.email);
        } catch (stripeError) {
          console.error("⚠️ Error cancelling Stripe subscription:", stripeError);
          // Don't fail the entire deletion if Stripe cancellation fails
          // The user's account should still be deleted from our system
        }
      }
      
      // Delete all user data from database (cascading delete)
      await storage.deleteUser(user.id);
      
      // Logout the user and destroy session
      req.logout((err) => {
        if (err) {
          console.error("Error during logout after account deletion:", err);
          return res.status(500).json({ message: "Account deleted but session cleanup failed" });
        }

        req.session.destroy((sessionErr) => {
          if (sessionErr) {
            console.error("Error destroying session after account deletion:", sessionErr);
            return res.status(500).json({ message: "Account deleted but session cleanup failed" });
          }

          console.log("✅ Account successfully deleted for user:", user.email);
          res.clearCookie('connect.sid');
          res.json({ message: "Account deleted successfully" });
        });
      });
    } catch (error) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Update user profile endpoint
  app.patch("/api/user/profile", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = req.user!;
      const { firstName, lastName, email } = req.body;
      
      console.log("Profile update request for user:", user.id, user.email);
      console.log("New data:", { firstName, lastName, email });
      
      // Basic validation
      if (!email || !email.includes('@')) {
        return res.status(400).json({ message: "Valid email is required" });
      }
      
      // Check if email is already taken by another user
      if (email !== user.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== user.id) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }
      
      // Update user profile
      const updatedUser = await storage.updateUserProfile(user.id, {
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        email: email.trim().toLowerCase(),
      });
      
      console.log("✅ Profile updated successfully for user:", user.email);
      res.json({ 
        message: "Profile updated successfully",
        user: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
        }
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
}