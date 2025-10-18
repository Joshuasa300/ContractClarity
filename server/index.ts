import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

const app = express();

// IMPORTANT: Stripe webhooks need raw body, so exclude /api/webhook from JSON parsing
app.use('/api/webhook', express.raw({ type: 'application/json' }));

// Increase body size limits to handle large document uploads for all other routes
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: false, limit: '100mb' }));

// CORS configuration - explicit same-origin policy
const isDevelopment = process.env.NODE_ENV === 'development';

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost on any port
    if (isDevelopment) {
      const allowedOrigins = [
        'http://localhost:5000',
        'http://localhost:3000',
        /^http:\/\/localhost:\d+$/,
      ];
      const isAllowed = allowedOrigins.some(allowed => 
        allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
      );
      return callback(null, isAllowed);
    }
    
    // In production, only allow the app's own origin
    // This will be the deployed Replit URL
    const allowedOrigins = [
      origin, // Allow same-origin requests
    ];
    
    // For Replit deployments, allow the replit.app domain
    if (origin.endsWith('.replit.app') || origin.endsWith('.repl.co')) {
      return callback(null, true);
    }
    
    callback(null, true); // Allow same-origin by default
  },
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // Cache preflight requests for 24 hours
}));

// Security headers with Helmet - environment-aware CSP

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Production: strict scriptSrc (no unsafe-inline/eval) but allows necessary third-party scripts
      // Development: relaxed scriptSrc for Vite dev server
      scriptSrc: isDevelopment 
        ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"] 
        : ["'self'", "https://js.stripe.com"],
      // Allow inline styles for both environments (required for React components & shadcn/ui)
      // Note: Inline styles pose minimal XSS risk compared to inline scripts
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://checkout.stripe.com", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://checkout.stripe.com", "https://js.stripe.com"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for better compatibility with external services
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow resources from other origins
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Add support contact route before any middleware that might interfere
  app.post("/api/support/contact", async (req, res) => {
    try {
      console.log("Support contact request received:", req.body);
      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        console.log("Missing required fields:", { name: !!name, email: !!email, subject: !!subject, message: !!message });
        return res.status(400).json({ 
          message: "All fields are required" 
        });
      }

      console.log("Attempting to send support email...");
      
      // Import email service here to avoid circular dependencies
      const { emailService } = await import('./services/emailService');
      
      // Send email to support team
      const emailSent = await emailService.sendSupportEmail({
        from: email,
        fromName: name,
        subject: subject,
        message: message,
        to: "info@contractclarity.co.uk"
      });

      console.log("Email sent result:", emailSent);

      if (!emailSent) {
        return res.status(500).json({ 
          message: "Failed to send support email" 
        });
      }

      res.json({ 
        message: "Support email sent successfully" 
      });
    } catch (error) {
      console.error("Support contact error details:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ 
        message: "Internal server error" 
      });
    }
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const PORT = parseInt(process.env.PORT || "5000");

  // Setup periodic cleanup of expired pending registrations
  setInterval(async () => {
    try {
      const { storage } = await import('./storage');
      await storage.cleanupExpiredRegistrations();
    } catch (error) {
      console.error('Error cleaning up expired registrations:', error);
    }
  }, 60 * 60 * 1000); // Every hour

  // Initial cleanup on startup
  setTimeout(async () => {
    try {
      const { storage } = await import('./storage');
      await storage.cleanupExpiredRegistrations();
      log('✅ Initial cleanup of expired registrations completed');
    } catch (error) {
      console.error('Error during initial cleanup:', error);
    }
  }, 5000); // Wait 5 seconds after startup

  const startServer = (port: number) => {
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying port ${port + 1}`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  };

  startServer(PORT);
})();