const http = require("http");
const fs = require("fs");
const path = require("path");
const { Dropbox } = require("dropbox");
const fetch = require("node-fetch"); // Required for Dropbox SDK

// ---------------- CONFIG ----------------
const DROPBOX_TOKEN = "YOUR_DROPBOX_ACCESS_TOKEN"; // <-- Replace with your token
const DROPBOX_FOLDER = "/esp32cam";                 // Dropbox folder for photos

const dbx = new Dropbox({ accessToken: DROPBOX_TOKEN, fetch });

// ---------------- HELPERS ----------------
async function listFiles() {
  try {
    const response = await dbx.filesListFolder({ path: DROPBOX_FOLDER });
    return response.entries || [];
  } catch (err) {
    console.error("Dropbox list error:", err);
    return [];
  }
}

async function getTemporaryLink(dropboxPath) {
  try {
    const link = await dbx.filesGetTemporaryLink({ path: dropboxPath });
    return link.link;
  } catch (err) {
    console.error("Dropbox temporary link error:", err);
    return "#";
  }
}

// ---------------- SERVER ----------------
const server = http.createServer(async (req, res) => {
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

  } else if (req.method === "GET" && req.url === "/") {
    // Serve simple HTML page with list of photos
    const files = await listFiles();
    let html = `<html><head><title>ESP32 Photos</title></head><body>`;
    html += `<h1>Uploaded Photos</h1><ul>`;
    for (const file of files) {
      const tempLink = await getTemporaryLink(file.path_lower);
      html += `<li><a href="${tempLink}" target="_blank">${file.name}</a></li>`;
    }
    html += `</ul></body></html>`;
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);

  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
