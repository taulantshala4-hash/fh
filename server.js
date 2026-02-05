const http = require("http");
const fs = require("fs");
const path = require("path");
const { Dropbox } = require("dropbox");
const fetch = require("node-fetch"); // Needed for Dropbox SDK in Node.js

// ---------------- CONFIG ----------------
const DROPBOX_TOKEN = "sl.u.AGRxOlPcUVMi1r-GUxXFEuGryMM8Y2TgI9k0vETGsqJZpuKhui2yHt90E0EUbNB1yxkGTvNC0irpPNTG31YkCzQgsGeRSy45nadBLckmRvfIkKjAyRHWUpGUMmVTNq9ja_XWGMI0fAFTcJ2eNEFKBgME2TSi5g3EOihs0M8OTcLNutQIcJqhV12XMRkFa1ve3wDyqAh_BgtvBpsE1prhvnDtAdZtEXugmYjlW3zwfoNZRIsNLBpM3uiVU_kadXmn5-zDv23_4Pe-GQzXeROvBVVvMkFp4P_YjIZa4M67ZX8TNnv9j-f8pvrD3mTUOIeI8cVj-RH6LAD8KBL-wRrXzXYeBJKCzy6OUyQ1mfpe4elqmO7GD4n-5hivMx0Kb9TjzplVvc7bo_KVC7XtA5R6MGTx1C0Dt8Grxou1W4YFp3wBXewSp3HhAMI2mXGQHTnx7ukSq-q3nqioOarnhqZIiv_MjQ6RATHcXB7JZr0AWLoBxh5GavX4wtB7xWKumQl4wy1TkQePojpdvNNNARfAgMKHrHusmNq7Aten-rubZFECyDUtrsJi_7z8GHLpZAE3hC3sUlygTqEC_TADATnMmwXWN_VNc3a1qAwGurez4qz4FaNA9PsZEFJy_VPn3YTGO0jytdE6ijNQ_Y9L_CviW1uuo7OeSOi5-XtXHMV5dHBZ3YcCbtG-Nj_Qw1gyAPi_v8xu9CQCRefq7aX80Ksg0ovJr6hSQYPJXhrWmdfkk4w10SGTNFg7qYJViih9gHYFdrO8KViS-qY-UyflSkjC2k6DWkHVtDJFQENliTG5SUHFNum7Dg39Qylehg2ySipSorp9ed5PB8CxW_QP0wOmJWPwY86xHDoi4INzYeXLGw8OPmJOxa3Wb1KVWFV_97p4s0XzwA5QoV38FjueGVMUUc1gNGCije95-A77ytoDavE0ey6yFfo-cccERYuYosGdn01iz2hYdLei6aiOHxGgEkAOQo5zfwwXpPRbhtc5Wf39HytZQ5tz867B4gKOY3eRk5OLoJZop7mTiVXli82CQ4fQFjkUIs1hoM6phByLTor6a4S7p_d8xgU5oDMm3sA9_s7tndR0AM97C-_xB9ICWxRUL_qOkbtbvCjuMHV13W1i_Xb4MTsxSt_wev7OrWg6baf2F1Wm5aKCYRRuZiXnjMg_Co9wVtYVE95FnrhhJ7gS1mrP38ezsX8EUT1JqH8OHZHA3fGq4UuuMu6d5gSRpiYMQq4b1ad61QpVK4JXOO0yo7hBDpybwU_xLOVROBMVG472EnmoV_ZdcpaO734YntjCQJ6slhj-bJLr6f5jqJ6-iA";
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
