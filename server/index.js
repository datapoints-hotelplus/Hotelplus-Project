const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", require("./routes/search.routes"));
app.use("/", require("./routes/export.routes"));
app.use("/api/drive", require("./routes/drive.routes"));
app.use("/api/ai", require("./routes/ai.routes"));

app.listen(5000, () =>
  console.log("🚀 Server running on port 5000")
);
