const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Make an "uploads" folder if it doesn't exist
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `cam_${timestamp}.jpg`);
  }
});
const upload = multer({ storage });

// Serve uploaded images
app.use('/uploads', express.static(UPLOAD_DIR));

// Endpoint to upload images
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  res.send('✓ Upload successful!');
});

// Page to view all photos
app.get('/', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).send('Error reading uploads folder');

    let html = '<h1>ESP32 Photos</h1>';
    html += '<ul>';
    files.reverse().forEach(file => {
      html += `<li><a href="/uploads/${file}" download>${file}</a></li>`;
    });
    html += '</ul>';

    res.send(html);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
