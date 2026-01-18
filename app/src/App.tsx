import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, X, ChevronLeft, ChevronRight, Search, Loader2 } from 'lucide-react';

// TMDB API Access Token
const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwNDllYWQyNDcxNzBkZGE3M2RkNTY0YjI4ZDYxODcyYyIsIm5iZiI6MTc2ODc0NzIzNi45NDMsInN1YiI6IjY5NmNmMGU0NDA0ZjM2ZjVmOGRjYjI5NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.JgB3dZxhgX8mxtFZHDa7BYWoRLZbpH0nmTDKS_J3hD0';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
}

interface MovieState {
  trending: Movie[];
  action: Movie[];
  comedy: Movie[];
  drama: Movie[];
}

const MovieSite = () => {
  const [movies, setMovies] = useState<MovieState>({
    trending: [],
    action: [],
    comedy: [],
    drama: []
  });
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch trending movies
      const trendingResponse = await fetch(`${TMDB_BASE_URL}/trending/movie/week`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!trendingResponse.ok) throw new Error('Failed to fetch trending movies');
      const trendingData = await trendingResponse.json();

      // Fetch action movies
      const actionResponse = await fetch(`${TMDB_BASE_URL}/discover/movie?with_genres=28`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!actionResponse.ok) throw new Error('Failed to fetch action movies');
      const actionData = await actionResponse.json();

      // Fetch comedy movies
      const comedyResponse = await fetch(`${TMDB_BASE_URL}/discover/movie?with_genres=35`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!comedyResponse.ok) throw new Error('Failed to fetch comedy movies');
      const comedyData = await comedyResponse.json();

      // Fetch drama movies
      const dramaResponse = await fetch(`${TMDB_BASE_URL}/discover/movie?with_genres=18`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!dramaResponse.ok) throw new Error('Failed to fetch drama movies');
      const dramaData = await dramaResponse.json();

      const movieData = {
        trending: trendingData.results?.slice(0, 10) || [],
        action: actionData.results?.slice(0, 10) || [],
        comedy: comedyData.results?.slice(0, 10) || [],
        drama: dramaData.results?.slice(0, 10) || []
      };

      setMovies(movieData);

      if (movieData.trending.length > 0) {
        setSelectedMovie(movieData.trending[0]);
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('Error searching:', err);
      setSearchResults([]);
    }
  };

  const MovieRow = ({ title, movies }: { title: string; movies: Movie[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const scrollAmount = direction === 'left' ? -400 : 400;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };

    if (movies.length === 0) return null;

    return (
      <div className="mb-10 md:mb-14">
        <h2 className="text-xl md:text-2xl font-medium mb-4 px-4 md:px-12 text-white/90">{title}</h2>
        <div className="relative group">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur-md hover:bg-white/20 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide gap-4 px-4 md:px-12 pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="flex-shrink-0 w-40 md:w-56 cursor-pointer group/movie"
                onClick={() => setSelectedMovie(movie)}
              >
                <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2">
                  <img
                    src={movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750/2a2a2a/ffffff?text=No+Image'}
                    alt={movie.title}
                    className="w-full h-56 md:h-80 object-cover transition-transform duration-700 group-hover/movie:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/movie:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 translate-y-full group-hover/movie:translate-y-0 transition-transform duration-300">
                    <h3 className="text-sm md:text-base font-medium text-white truncate">{movie.title}</h3>
                    <p className="text-xs text-white/70 mt-1">
                      {movie.vote_average > 0 && `★ ${movie.vote_average.toFixed(1)}`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur-md hover:bg-white/20 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    );
  };

  if (loading && !selectedMovie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-white/50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Error Loading Movies</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={fetchMovies}
            className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full hover:bg-white/20 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white overflow-x-hidden">
      {/* Header - Apple TV Style */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 md:mx-8 mt-4 md:mt-6">
          <div className="flex items-center justify-between bg-white/5 backdrop-blur-xl rounded-2xl px-4 md:px-6 py-3 md:py-4 border border-white/10">
            <div className="flex items-center gap-4 md:gap-8">
              <h1 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Plus Movie
              </h1>
              <nav className="hidden lg:flex gap-6 text-sm text-white/70">
                <a href="#" className="hover:text-white transition">Watch Now</a>
                <a href="#" className="hover:text-white transition">Movies</a>
                <a href="#" className="hover:text-white transition">TV Shows</a>
                <a href="#" className="hover:text-white transition">Originals</a>
              </nav>
            </div>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="bg-white/10 rounded-full px-4 py-2 pl-10 text-sm w-32 md:w-48 focus:w-40 md:focus:w-64 focus:outline-none focus:bg-white/15 transition-all duration-300 placeholder:text-white/50"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            </form>
          </div>
        </div>
      </header>

      {/* Hero Section - Apple TV Style */}
      {selectedMovie && (
        <div className="relative h-screen">
          <div className="absolute inset-0">
            <img
              src={selectedMovie.backdrop_path ? `${TMDB_IMAGE_BASE}/original${selectedMovie.backdrop_path}` : 'https://via.placeholder.com/1920x1080/2a2a2a/ffffff?text=No+Image'}
              alt={selectedMovie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-transparent to-transparent" />
          </div>
          <div className="relative h-full flex flex-col justify-end px-4 md:px-12 pb-24 md:pb-32 pt-32">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">{selectedMovie.title}</h1>
              <p className="text-base md:text-lg mb-8 max-w-2xl text-white/80 leading-relaxed">{selectedMovie.overview}</p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowPlayer(true)}
                  className="bg-white text-gray-900 px-8 md:px-10 py-3 md:py-4 rounded-full font-medium flex items-center gap-3 hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg shadow-white/20"
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  Play
                </button>
                <button 
                  onClick={() => setSelectedMovie(selectedMovie)}
                  className="bg-white/10 backdrop-blur-md px-8 md:px-10 py-3 md:py-4 rounded-full font-medium flex items-center gap-3 hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-white/20"
                >
                  <Info className="w-5 h-5" />
                  More Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movie Rows */}
      <div className="relative -mt-20 z-10">
        {searchResults.length > 0 ? (
          <div>
            <div className="flex items-center justify-between px-4 md:px-12 mb-6">
              <h2 className="text-xl md:text-2xl font-medium">Search Results ({searchResults.length})</h2>
              <button 
                onClick={() => setSearchResults([])}
                className="text-sm text-white/60 hover:text-white transition"
              >
                Clear Search
              </button>
            </div>
            <MovieRow title="" movies={searchResults} />
          </div>
        ) : (
          <>
            <MovieRow title="Trending Now" movies={movies.trending} />
            <MovieRow title="Action & Adventure" movies={movies.action} />
            <MovieRow title="Comedy" movies={movies.comedy} />
            <MovieRow title="Drama" movies={movies.drama} />
          </>
        )}
      </div>

      {/* Video Player Modal - Apple TV Style */}
      {showPlayer && selectedMovie && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center">
          <button
            onClick={() => setShowPlayer(false)}
            className="absolute top-6 right-6 z-50 bg-white/10 hover:bg-white/20 p-3 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full h-full max-w-7xl max-h-screen p-4 md:p-8">
            <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10">
              <iframe
                src={`https://vidsrc.cc/v2/embed/movie/${selectedMovie.id}`}
                className="w-full h-full"
                allowFullScreen
                title={selectedMovie.title}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer - Apple TV Style */}
      <footer className="mt-20 px-4 md:px-12 py-12">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Plus Movie
              </h3>
              <p className="text-sm text-white/50">Built with TMDB API • For demonstration purposes only</p>
            </div>
            <p className="text-xs text-white/40">
              Get your free TMDB API key at <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">themoviedb.org</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MovieSite;
