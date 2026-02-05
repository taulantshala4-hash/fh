const http = require("http");
const fs = require("fs");
const path = require("path");
const { Dropbox } = require("dropbox");
const fetch = require("node-fetch"); // Required for Dropbox SDK

// ---------------- CONFIG ----------------
const DROPBOX_TOKEN = "sl.u.AGSpwOB_GRDyDXCyanAiHOf-Q-XPD08S6-b3BgmNgktVatNoNNz3iRi2b9r2bY5gbdNaf_weKa2aYGMqrMsUfSyGXbqoPuAsMyMnPWSco9ZsL_PJ766vWJdu025dTsuWWlPUhJ0Y5nyPlkVuaLHdQsmFnbvBu1KBZT2lTK0fXH6-0_xIQSYwN_iV3SjiCCWoNG-wzKwD0n-uGty3wlh1_4oQXru7H3cb84nvo_IwQJ_tiit2zsBY8EOxo9JYWDExAE71pf4sPAfE-aU3r3Z4nWeZU3EUEM8OcpzcVrAUhjykiXuMxDbXQNDGO4kTAnfqPVwUD1QwLAna9byI2u_gL4xjGLLWTHlzoWb3Ug7vhxvM0q2-S7DLwv34KWQuvw4ZEHDhPX3IyYdVtGbCA1t-SzluM6pYEny9RQEvNMPXFCF4r4-fWQu20OyTfLJpdZBz3Kql36XWh4mJIM52L7lKdMCbPAGron00dvGRKeItzzKMBkjAX44eQXRUHQ2vrfbhpRt7YNqN_jhXQfx3gN8makkEIvw9jWtKuWFr7miZ0e1DqXl7HqEmcs939osh7YYdeWPhHVPhUq68gamWRM5L2DMyNh6Dl--PPkEkvMGTIn-IDJnZKzDlkwT1n9sS0Vc9o6Aqf7_Pbv-JJ0BMsV1zoQS_1CgFtw0shMDVYnsuf5o7dL2eLZai2gSGCv2aZIOiSYMihdJCSk5lxPgL7Z1-Gx5C3cyv76mLJntgddt2QLAw52JINgPs5z8YYKsp4hUztGQU_ln3OkK4v-Sc7DBNFUQLq0k9uMRYNfCyOgyG-37iOFCOJIWoovBX8NosC1EWha9wl5waKmtznkJnS2Iwv1JJAMdHlsVIhY46SMkU2zyak1z4vGC2CNd6ocAwgHOPI9Zg28iPI_NkAjEWuWyBRhwBA5QbmK3SuIiVlL7hFCdxk83RmCkIXpCV97qKpiPBGZobuPFYZws9rj0xnwMbB3zOhJcmxWB9E7lE07LtXe9n86WPDehgQUtvf-N87M-hJcwJbtmhv6FyV4zLp7XRcnMexMp71D9bcExaOBa5YYMVLU_OT6nDHZCqkmkpj_oiKrFYzEzo_paCfahFOpfiMoJXsMonmP1nXhf9wM8ONi-xjJOMuH2BVJzGTkFOlQUOiIsXUEhi4EoM4Ejfy-wEhATcUCCQ-YU2VFQAZPUoiA-1VroJl29mvvg9pl9Z5kvmgiFGRZe1rJEPW1H8vyg-jeNk3Bdujr9pOO_JDkfmJ5JCL5jCyqzKNmItfjPzfUrkTeh5PKopPX_KAK3UKf4Q7vxf6CcYL6Cfi0PBJ3VbrRxjoQ"; // <-- Replace with your token
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

