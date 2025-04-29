import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Grid, Card, CardMedia, CardContent, Typography, Dialog, IconButton, Button, Box, TextField } from '@mui/material';
// import './App.css';

/**
 * Main App component.
 * Fetches and displays movies, handles selection and playback.
 */
function App() {
  const [movies, setMovies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const MOVIES_PER_PAGE = 9;

  // Fetch movies from backend on mount
  useEffect(() => {
    axios.get('http://localhost:4000/api/movies').then(res => setMovies(res.data));
  }, []);

  // Filter movies by search query (case-insensitive)
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic on filtered movies
  const startIdx = (page - 1) * MOVIES_PER_PAGE;
  const endIdx = startIdx + MOVIES_PER_PAGE;
  const pagedMovies = filteredMovies.slice(startIdx, endIdx);
  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / MOVIES_PER_PAGE));

  // Reset to page 1 if search changes and current page is out of range
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [search, totalPages, page]);

  function formatDuration(seconds) {
    if (!seconds) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [
      h > 0 ? String(h).padStart(2, '0') : null,
      String(m).padStart(2, '0'),
      String(s).padStart(2, '0')
    ].filter(Boolean).join(':');
  }

  return (
    <Container sx={{ py: 4 }} maxWidth="xl">
      <Typography variant="h3" gutterBottom align="center">
        Movie Browser
      </Typography>
      {/* Search Field */}
      <TextField
        label="Search movies"
        variant="outlined"
        fullWidth
        margin="normal"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <Grid container spacing={3}>
        {pagedMovies.map((movie, idx) => (
          <Grid item key={movie.file} xs={12} sm={6} md={4}>
            <Card
              sx={{
                cursor: 'pointer',
                width: 320,
                height: 320,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                margin: '0 auto',
                boxSizing: 'border-box',
              }}
              onClick={() => setSelected(movie)}
            >
              <CardMedia
                component="img"
                image={movie.poster || '/no_cover.jpg'}
                alt={movie.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 200, // Ensures the image doesn't overflow the card
                  objectFit: 'contain',
                  marginTop: 1,
                }}
              />
              <CardContent
                sx={{
                  width: '100%',
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-start',
                  padding: 2,
                  boxSizing: 'border-box',
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: '0.95rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    minHeight: '3.2em',
                    maxHeight: '3.2em',
                    marginTop: '-0.5em',
                  }}
                >
                  {movie.title} ({movie.year})
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: '0.85rem',
                    width: '100%',
                    marginTop: '0.2em',
                  }}
                >
                  {formatDuration(movie.duration)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination Controls */}
      <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
        <Button
          variant="contained"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          sx={{ mr: 2 }}
        >
          Previous
        </Button>
        <Typography variant="body1">
          Page {page} of {totalPages}
        </Typography>
        <Button
          variant="contained"
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          sx={{ ml: 2 }}
        >
          Next
        </Button>
      </Box>

      {/* Movie Player Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        {selected && (
          <div style={{ position: 'relative', background: '#000' }}>
            <IconButton
              onClick={() => setSelected(null)}
              style={{ position: 'absolute', top: 8, right: 8, color: '#fff', zIndex: 1 }}
            >
              ✕
            </IconButton>
            <video
              src={`http://localhost:4000/api/stream/${encodeURIComponent(selected.file)}`}
              controls
              autoPlay
              style={{ width: '100%', height: '70vh', background: '#000' }}
            />
          </div>
        )}
      </Dialog>
    </Container>
  );
}

export default App;
