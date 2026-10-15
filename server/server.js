const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');
const { runAutomatedReminders } = require('./services/reminderService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database (auto fallback to embedded Mongo if needed)
    await connectDB();

    // 2. Start HTTP Server
    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` ⚡ InvoiceFlow API Server running on port ${PORT}`);
      console.log(` 🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` 🌐 Healthcheck: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });

    // 3. Run initial automated reminder & priority scan
    setTimeout(() => {
      runAutomatedReminders();
    }, 3000);

    // Run every 30 minutes
    setInterval(runAutomatedReminders, 30 * 60 * 1000);

    // Graceful Shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server terminated.');
      });
    });
  } catch (err) {
    console.error('Fatal: Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
