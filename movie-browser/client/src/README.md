# Video Player Project

A modern, full-stack movie browser and player.  
- **Backend:** Node.js + Express (serves local movie files and fetches metadata from OMDb)
- **Frontend:** React + Material-UI (beautiful, responsive UI)

---

## Features

- Browse your local movie collection with cover art and metadata
- Click a movie to play it in the browser
- Clean, modern UI

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- [npm](https://www.npmjs.com/)

---

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TtheProg/video_player_project.git
   cd video_player_project
   ```

2. **Install dependencies for both backend and frontend:**
   ```bash
   cd movie-browser/server
   npm install
   cd ../client
   npm install
   cd ../../..
   ```

3. **Set up your OMDb API key:**
   - Create a file at `movie-browser/server/.env` with this content:
     ```
     OMDB_API_KEY=your_omdb_api_key_here
     ```
   - Replace `your_omdb_api_key_here` with your actual OMDb API key.

4. **Set the path to your movies:**
   - Edit `movie-browser/server/index.js` and set the `MOVIE_DIR` variable to the folder where your movies are stored.

---

## Running the App

From the project root (`video_player_project`), run these commands in two separate terminals:

### **Start the backend:**
```bash
cd movie-browser/server
node index.js
```

### **Start the frontend:**
```bash
cd movie-browser/client
npm start
```

- The backend will run on [http://localhost:4000](http://localhost:4000)
- The frontend will run on [http://localhost:3000](http://localhost:3000)

---

## Future Goals / To Dos

- Chromecast integration
- 4x4 grid layout with pages
- More modern interface with hover, animations, gloss, colors, etc.
- Search field
- File length as meta info
- Path selector so that the user selects the movie folder through UI
- Default cover is a thumbnail from the middle of the file
- Scraping the web for a cover art

---

## Notes

- **Never commit your `.env` file or API keys to GitHub!**
- If you add new movies to your folder, restart the backend to refresh the list.

---

## License

MIT

