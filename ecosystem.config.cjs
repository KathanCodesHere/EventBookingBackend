module.exports = {
  apps: [
    {
      name: "eventbooking-backend",
      script: "src/server.js",
      cwd: "C:/Users/WIN/OneDrive/Desktop/EventBooking/EventBookingBackend",
      instances: 1,
      exec_mode: "fork", // CLUSTER Windows me stable nahi hota islie fork
      watch: false,

      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },

      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};

/*
 PM2 me kaise check kare (short commands)
✔ Check status
pm2 status

✔ Logs dekhne ke liye
pm2 logs eventbooking-backend

✔ Restart
pm2 restart eventbooking-backend

✔ Stop
pm2 stop eventbooking-backend

✔ Delete
pm2 delete eventbooking-backend


PM2 file → backend ko auto-manage + auto-restart + logs + environment config deta hai.

Check commands → pm2 status, pm2 logs, pm2 restart.

*/
