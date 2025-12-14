import "./config/env.js"; // MUST BE FIRST
import "./config/cloudinary.js";

import connectDB from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT;

connectDB();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
});
