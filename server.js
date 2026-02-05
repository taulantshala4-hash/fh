const http = require("http");
const fs = require("fs");
const path = require("path");
const { Dropbox } = require("dropbox");
const fetch = require("node-fetch"); // Needed for Dropbox SDK in Node.js

// ---------------- CONFIG ----------------
const DROPBOX_TOKEN = "";
const DROPBOX_FOLDER = "/esp32cam"; // Folder in Dropbox to save images

const dbx = new Dropbox({ accessToken: DROPBOX_TOKEN, fetch });

// ---------------- SERVER ----------------
const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/upload") {
    let data = [];

    req.on("data", chunk => data.push(chunk));
    req.on("end", async () => {
      const buffer = Buffer.concat(data);
      const filename = `cam_${Date.now()}.jpg`;
      const dropboxPath = `${DROPBOX_FOLDER}/${filename}`;

      try {
        await dbx.filesUpload({ path: dropboxPath, contents: buffer });
        console.log("Image uploaded to Dropbox:", dropboxPath);
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("OK");
      } catch (err) {
        console.error("Dropbox upload error:", err);
        res.writeHead(500);
        res.end("Upload failed");
      }
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
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

