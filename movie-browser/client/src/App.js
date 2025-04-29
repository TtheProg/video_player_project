import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Grid, Card, CardMedia, CardContent, Typography, Dialog, IconButton } from '@mui/material';
// import './App.css';

/**
 * Main App component.
 * Fetches and displays movies, handles selection and playback.
 */
function App() {
  const [movies, setMovies] = useState([]);
  const [selected, setSelected] = useState(null);

  // Fetch movies from backend on mount
  useEffect(() => {
    axios.get('http://localhost:4000/api/movies').then(res => setMovies(res.data));
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center">
        Movie Browser
      </Typography>
      <Grid container spacing={4}>
        {movies.map(movie => (
          <Grid item key={movie.file} xs={12} sm={6} md={3}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => setSelected(movie)}>
              <CardMedia
                component="img"
                height="350"
                image={movie.poster || 'https://via.placeholder.com/350x500?text=No+Image'}
                alt={movie.title}
              />
              <CardContent>
                <Typography variant="h6">{movie.title} ({movie.year})</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {movie.overview}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
