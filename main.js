const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.static('public')); // serve static files from public folder

const DOWNLOAD_FOLDER = path.join(__dirname, 'public', 'downloads');
if (!fs.existsSync(DOWNLOAD_FOLDER)) {
  fs.mkdirSync(DOWNLOAD_FOLDER, { recursive: true });
}

app.post('/download', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  const filename = `audio-${Date.now()}-${Math.floor(Math.random() * 1000)}.%(ext)s`;
  const outputPath = path.join(DOWNLOAD_FOLDER, filename);

  // Format option: best audio only
  const cmd = `yt-dlp -f bestaudio -o "${outputPath}" "${url}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error('yt-dlp error:', stderr);
      return res.status(500).json({ error: 'Failed to download audio' });
    }

    const baseFilename = filename.replace('.%(ext)s', '');
    const files = fs.readdirSync(DOWNLOAD_FOLDER);
    const downloadedFile = files.find(file => file.startsWith(baseFilename));
    if (!downloadedFile) {
      return res.status(500).json({ error: 'Downloaded file not found' });
    }

    const fileUrl = `/downloads/${downloadedFile}`;
    res.json({ link: fileUrl });
  });
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
