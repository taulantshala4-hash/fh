const http = require("http");
const fs = require("fs");
const path = require("path");

// Ensure upload folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/upload") {
    const filename = path.join(uploadDir, `image_${Date.now()}.jpg`);
    const fileStream = fs.createWriteStream(filename);

    req.pipe(fileStream);

    req.on("end", () => {
      console.log("Image received:", filename);
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("OK");
    });

    req.on("error", (err) => {
      console.error("Upload error:", err);
      res.writeHead(500);
      res.end("Upload failed");
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
