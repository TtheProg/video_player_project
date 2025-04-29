/**
 * Express server for movie browser app.
 * Scans a directory for movie files, fetches metadata, and streams movies.
 *
 * Endpoints:
 *   GET /api/movies - List movies with metadata and cover art
 *   GET /api/stream/:file - Stream a movie file
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');
require('dotenv').config();

const app = express();
const PORT = 4000;

// Allow requests from frontend
app.use(cors());

// Directory where movies are stored
const MOVIE_DIR = '/Users/hm/Documents/arabic anime/'; // <-- Change this to your hard drive path

// OMDb API setup
const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_SEARCH_URL = 'http://www.omdbapi.com/';

// Set ffprobe path for fluent-ffmpeg
ffmpeg.setFfprobePath(ffprobeStatic.path);

/**
 * Helper: Get list of movie files in the directory.
 * @returns {Array} List of movie file names.
 */
function getMovieFiles() {
  const exts = ['.mp4', '.mkv', '.avi', '.mov'];
  return fs.readdirSync(MOVIE_DIR).filter(file =>
    exts.includes(path.extname(file).toLowerCase())
  );
}

/**
 * Helper: Clean up filename to get a likely movie title.
 * Removes year, resolution, and extra info.
 * @param {string} filename
 * @returns {string} cleaned title
 */
function extractTitle(filename) {
  // Remove extension
  let title = filename.replace(/\.[^/.]+$/, '');
  // Remove year (e.g., 1999)
  title = title.replace(/\b(19|20)\d{2}\b/, '');
  // Remove common tags (resolution, encoding, etc.)
  title = title.replace(/\b(720p|1080p|2160p|4k|BluRay|WEBRip|x264|x265|HDR|DVDRip|BRRip|AAC|MP3|H264|HEVC)\b/gi, '');
  // Replace dots/underscores with spaces
  title = title.replace(/[\._]/g, ' ');
  // Remove extra spaces
  title = title.replace(/\s+/g, ' ').trim();
  return title;
}

/**
 * Helper: Fetch movie metadata from OMDb by title.
 * @param {string} title - Movie title.
 * @returns {Promise<Object>} Metadata object.
 */
async function fetchMovieMetadata(title) {
  if (!OMDB_API_KEY) {
    return { title, overview: '', poster: '', year: '' };
  }
  try {
    const res = await axios.get(OMDB_SEARCH_URL, {
      params: {
        apikey: OMDB_API_KEY,
        t: title,
      },
    });
    const movie = res.data;
    if (!movie || movie.Response === 'False') return { title, overview: '', poster: '', year: '' };
    return {
      title: movie.Title,
      overview: movie.Plot,
      poster: movie.Poster !== 'N/A' ? movie.Poster : '',
      year: movie.Year,
    };
  } catch (err) {
    // If OMDb returns 401 or any error, just return the title and empty fields
    return { title, overview: '', poster: '', year: '' };
  }
}

// Helper: Get video duration in seconds
function getVideoDuration(filePath) {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err || !metadata || !metadata.format || !metadata.format.duration) {
        resolve(null);
      } else {
        resolve(metadata.format.duration);
      }
    });
  });
}

/**
 * API: Get list of movies with metadata.
 */
app.get('/api/movies', async (req, res) => {
  const files = getMovieFiles();
  const movies = await Promise.all(
    files.map(async file => {
      const filePath = path.join(MOVIE_DIR, file);
      const title = extractTitle(file);
      const meta = await fetchMovieMetadata(title);
      const duration = await getVideoDuration(filePath);
      return {
        file,
        title: meta?.title || title,
        overview: meta?.overview || '',
        poster: meta?.poster || '',
        year: meta?.year || '',
        duration,
      };
    })
  );
  res.json(movies);
});

/**
 * API: Stream movie file.
 * @param {string} file - Movie file name.
 */
app.get('/api/stream/:file', (req, res) => {
  const filePath = path.join(MOVIE_DIR, req.params.file);
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // Partial stream for seeking
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4', // Adjust if needed
    });
    fileStream.pipe(res);
  } else {
    // Full stream
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
