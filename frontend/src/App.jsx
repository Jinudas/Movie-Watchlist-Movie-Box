import { useEffect, useState } from "react";
import MovieCard from "./components/moviecard1.jsx";
import Login from "./components/login.jsx";
import Register from "./components/register.jsx";
import movies from "./data/movies.js";
import webSeries from "./data/webseries.jsx";
import animation from "./data/animation.jsx";
import "./App.css";

const pages = [
  "Home",
  "Movies",
  "Web Series",
  "Animation",
  "Favorites",
  "Watch History",
  "Register",
  "Login",
];

const partners = [
  {
    name: "Paramount",
    logo: "https://www.plex.tv/wp-content/uploads/2021/11/Paramount-Black-500x500-1.png",
  },
  {
    name: "Warner Bros.",
    logo: "https://www.plex.tv/wp-content/uploads/2019/09/warner-bros.png",
  },
  {
    name: "Metro-Goldwyn-Mayer",
    logo: "https://www.plex.tv/wp-content/uploads/2019/11/metro-goldwyn-mayer.png",
  },
  {
    name: "Lionsgate",
    logo: "https://www.plex.tv/wp-content/uploads/2019/09/lionsgate.png",
  },
  {
    name: "Legendary",
    logo: "https://www.plex.tv/wp-content/uploads/2019/11/legendary.png",
  },
  {
    name: "Magnolia",
    logo: "https://www.plex.tv/wp-content/uploads/2020/03/magnolia.png",
  },
];

function mapDatabaseTitle(item) {
  return {
    ...item,
    databaseId: item.id,
    id: `database-${item.id}`,
    poster: item.poster_url || "",
    backdrop: item.backdrop_url || item.poster_url || "",
    watchUrl: item.watch_url || "",
    videoUrl: item.video_file || "",
    upcoming: item.is_upcoming,
    rank: item.trending_rank,
  };
}

function mergeCatalog(localItems, databaseItems, category) {
  const databaseForCategory = databaseItems.filter(
    (item) => item.category === category
  );

  const databaseNames = new Set(
    databaseForCategory.map((item) => item.title.trim().toLowerCase())
  );

  const localWithoutDuplicates = localItems
    .map((item) => ({ ...item, category }))
    .filter(
      (item) => !databaseNames.has(item.title.trim().toLowerCase())
    );

  return [...databaseForCategory, ...localWithoutDuplicates];
}

async function readResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("The server returned a response that was not JSON.");
  }
}

export default function App() {
  const [activePage, setActivePage] = useState("Home");
  const [currentUser, setCurrentUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [slide, setSlide] = useState(0);

  const [databaseTitles, setDatabaseTitles] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);

  const movieTitles = mergeCatalog(movies, databaseTitles, "movie");
  const webSeriesTitles = mergeCatalog(
    webSeries,
    databaseTitles,
    "webseries"
  );
  const animationTitles = mergeCatalog(
    animation,
    databaseTitles,
    "animation"
  );

  const allTitles = [
    ...movieTitles,
    ...webSeriesTitles,
    ...animationTitles,
  ];

  const upcomingMovies = movieTitles.filter((movie) => movie.upcoming);
  const genres = [
    "All",
    ...new Set(movieTitles.map((movie) => movie.genre).filter(Boolean)),
  ];

  useEffect(() => {
    let ignoreResult = false;

    async function restoreLogin() {
      try {
        const response = await fetch("/api/me/", {
          credentials: "same-origin",
        });

        if (!response.ok) {
          return;
        }

        const data = await readResponse(response);

        if (!ignoreResult) {
          setCurrentUser(data.user);
          setCsrfToken(data.csrfToken || "");
        }
      } catch (error) {
        console.error("Could not restore the login session:", error);
      }
    }

    restoreLogin();

    return () => {
      ignoreResult = true;
    };
  }, []);

  useEffect(() => {
    let ignoreResult = false;

    async function loadDatabaseTitles() {
      try {
        const response = await fetch("/api/movies/");

        if (!response.ok) {
          throw new Error(`Movie request failed: ${response.status}`);
        }

        const data = await readResponse(response);

        if (!Array.isArray(data)) {
          throw new Error("The movie API did not return a list.");
        }

        if (!ignoreResult) {
          setDatabaseTitles(data.map(mapDatabaseTitle));
        }
      } catch (error) {
        console.error("Could not load movies from Django:", error);
      }
    }

    loadDatabaseTitles();

    return () => {
      ignoreResult = true;
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setWatchlist([]);
      setFavorites([]);
      setWatchHistory([]);
      return undefined;
    }

    let ignoreResult = false;

    async function loadAccountLists() {
      try {
        const [watchlistResponse, favoritesResponse, historyResponse] =
          await Promise.all([
            fetch("/api/watchlist/", {
              credentials: "same-origin",
            }),
            fetch("/api/favorites/", {
              credentials: "same-origin",
            }),
            fetch("/api/history/", {
              credentials: "same-origin",
            }),
          ]);

        if (!watchlistResponse.ok) {
          throw new Error(
            `Watchlist request failed: ${watchlistResponse.status}`
          );
        }

        if (!favoritesResponse.ok) {
          throw new Error(
            `Favorites request failed: ${favoritesResponse.status}`
          );
        }

        if (!historyResponse.ok) {
          throw new Error(
            `History request failed: ${historyResponse.status}`
          );
        }

        const [watchlistData, favoritesData, historyData] =
          await Promise.all([
            readResponse(watchlistResponse),
            readResponse(favoritesResponse),
            readResponse(historyResponse),
          ]);

        if (ignoreResult) {
          return;
        }

        setWatchlist(
          watchlistData.map((movie) => `database-${movie.id}`)
        );
        setFavorites(
          favoritesData.map((movie) => `database-${movie.id}`)
        );
        setWatchHistory(
          historyData.map((entry) => ({
            ...entry,
            movie: mapDatabaseTitle(entry.movie),
          }))
        );
      } catch (error) {
        console.error("Could not load your account lists:", error);
      }
    }

    loadAccountLists();

    return () => {
      ignoreResult = true;
    };
  }, [currentUser]);

  useEffect(() => {
    if (movieTitles.length === 0) {
      setSlide(0);
      return undefined;
    }

    const timer = setInterval(() => {
      setSlide((currentSlide) => (currentSlide + 1) % movieTitles.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [movieTitles.length]);

  const featuredMovie =
    movieTitles.length > 0
      ? movieTitles[slide % movieTitles.length]
      : null;

  let pageTitles = movieTitles;

  if (activePage === "Movies") {
    pageTitles = movieTitles;
  } else if (activePage === "Web Series") {
    pageTitles = webSeriesTitles;
  } else if (activePage === "Animation") {
    pageTitles = animationTitles;
  } else if (activePage === "Favorites") {
    pageTitles = allTitles.filter((title) =>
      favorites.includes(title.id)
    );
  } else if (activePage === "Watch History") {
    pageTitles = watchHistory.map((entry) => entry.movie);
  }

  const visibleTitles = pageTitles.filter((title) => {
    const matchesGenre =
      activePage !== "Home" ||
      selectedGenre === "All" ||
      title.genre === selectedGenre;

    const matchesSearch = title.title
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesGenre && matchesSearch;
  });

  function openPage(page) {
    setActivePage(page);
    setSearch("");
    setSelectedGenre("All");
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLoginSuccess(user, token) {
    setCurrentUser(user);
    setCsrfToken(token || "");
    setActivePage("Home");
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleLogout() {
    try {
      const response = await fetch("/api/logout/", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.detail || "Could not log out.");
      }

      setCurrentUser(null);
      setCsrfToken("");
      setActivePage("Home");
    } catch (error) {
      alert(error.message || "Could not connect to the server.");
    }
  }

  async function toggleWatchlist(movie) {
    if (!currentUser) {
      alert("Please log in to save titles to your account watchlist.");
      openPage("Login");
      return;
    }

    if (!movie.databaseId) {
      alert("This title must be added in Django Admin before it can be saved to your account.");
      return;
    }

    const isSaved = watchlist.includes(movie.id);
    const method = isSaved ? "DELETE" : "POST";

    try {
      const response = await fetch("/api/watchlist/", {
        method,
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ movie_id: movie.databaseId }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.detail || "Could not update your watchlist.");
      }

      setWatchlist((current) =>
        isSaved
          ? current.filter((id) => id !== movie.id)
          : [...current, movie.id]
      );
    } catch (error) {
      alert(error.message || "Could not connect to the server.");
    }
  }

  async function toggleFavorite(movie) {
    if (!currentUser) {
      alert("Please log in to save favorites to your account.");
      openPage("Login");
      return;
    }

    if (!movie.databaseId) {
      alert("This title must be added in Django Admin before it can be saved as a favorite.");
      return;
    }

    const isFavorite = favorites.includes(movie.id);
    const method = isFavorite ? "DELETE" : "POST";

    try {
      const response = await fetch("/api/favorites/", {
        method,
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ movie_id: movie.databaseId }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.detail || "Could not update your favorites.");
      }

      setFavorites((current) =>
        isFavorite
          ? current.filter((id) => id !== movie.id)
          : [...current, movie.id]
      );
    } catch (error) {
      alert(error.message || "Could not connect to the server.");
    }
  }

  async function saveWatchHistory(movie, positionSeconds, completed) {
    if (!currentUser || !movie.databaseId) {
      return;
    }

    try {
      const response = await fetch("/api/history/", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          movie_id: movie.databaseId,
          position_seconds: positionSeconds,
          completed,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.detail || "Could not save watch history.");
      }

      setWatchHistory((current) => {
        const previousEntry = current.find(
          (entry) => entry.movie.id === movie.id
        );

        const updatedEntry = {
          movie,
          position_seconds: positionSeconds,
          completed,
          last_watched_at: new Date().toISOString(),
        };

        return [
          updatedEntry,
          ...current.filter((entry) => entry.movie.id !== movie.id),
        ];
      });
    } catch (error) {
      console.error("Could not save watch history:", error);
    }
  }

  function renderMovieCard(movie, rank) {
    return (
      <MovieCard
        key={movie.id}
        movie={movie}
        rank={rank}
        saved={watchlist.includes(movie.id)}
        favorite={favorites.includes(movie.id)}
        onSave={() => toggleWatchlist(movie)}
        onFavorite={() => toggleFavorite(movie)}
        onWatchHistory={saveWatchHistory}
      />
    );
  }

  const isAuthPage = activePage === "Login" || activePage === "Register";

  return (
    <div className="app" id="home">
      <header
        className={`navbar ${
          activePage === "Home" ? "navbar-on-hero" : ""
        }`}
      >
        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <button
          className="logo"
          type="button"
          onClick={() => openPage("Home")}
        >
          <span>▶</span> MOVIE BOX
        </button>

        {currentUser && (
          <>
            <span className="account-name">
              Hi, {currentUser.name || currentUser.email}
            </span>
            <button
              className="logout-button"
              type="button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </>
        )}

        {!isAuthPage && (
          <input
            className="search"
            type="search"
            placeholder="Search titles..."
            aria-label="Search titles"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        )}
      </header>

      <button
        className={`drawer-backdrop ${menuOpen ? "show" : ""}`}
        type="button"
        aria-label="Close navigation menu"
        onClick={() => setMenuOpen(false)}
      />

      <aside className={`side-drawer ${menuOpen ? "open" : ""}`}>
        <div className="drawer-heading">
          <span>Browse Cinema</span>
          <button
            type="button"
            className="drawer-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav>
          {pages.map((page) => (
            <button
              key={page}
              type="button"
              className={activePage === page ? "active" : ""}
              onClick={() => openPage(page)}
            >
              {page}
              {page === "Favorites" ? ` (${favorites.length})` : ""}
            </button>
          ))}
        </nav>
      </aside>

      {activePage === "Login" ? (
        <Login
          onSwitchPage={setActivePage}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : activePage === "Register" ? (
        <Register onSwitchPage={setActivePage} />
      ) : (
        <main>
          {activePage === "Home" && featuredMovie && (
            <section
              key={featuredMovie.id}
              className="hero"
              style={{
                backgroundImage: `url("${featuredMovie.backdrop}")`,
              }}
            >
              <div className="hero-shade">
                <div className="hero-content">
                  <span className="eyebrow">FEATURED</span>
                  <h1>{featuredMovie.title}</h1>
                  <p className="hero-meta">
                    {featuredMovie.year} · ★ {featuredMovie.rating}
                  </p>

                  {featuredMovie.description && (
                    <p className="hero-description">
                      {featuredMovie.description}
                    </p>
                  )}
                </div>

                <div
                  className="slide-dots"
                  role="group"
                  aria-label="Choose featured movie"
                >
                  {movieTitles.map((movie, index) => (
                    <button
                      key={movie.id}
                      type="button"
                      className={`slide-dot ${
                        slide === index ? "active" : ""
                      }`}
                      onClick={() => setSlide(index)}
                      aria-label={`Show ${movie.title}`}
                      aria-current={slide === index ? "true" : undefined}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {activePage === "Home" && (
            <section className="section genre-section">
              <span className="eyebrow">EXPLORE YOUR MOOD</span>
              <h2>Browse by Genre</h2>

              <div className="genre-chips">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    className={selectedGenre === genre ? "selected" : ""}
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">BROWSE THE COLLECTION</span>
                <h2>
                  {activePage === "Home"
                    ? "Trending Movies"
                    : activePage === "Favorites"
                      ? "My Favorites"
                      : activePage}
                </h2>
              </div>

              <span className="result-count">
                {visibleTitles.length} titles
              </span>
            </div>

            {visibleTitles.length > 0 ? (
              <div className="movie-grid">
                {visibleTitles.map((movie) =>
                  renderMovieCard(
                    movie,
                    activePage === "Home" ? movie.rank : undefined
                  )
                )}
              </div>
            ) : (
              <p className="empty-message">
                {activePage === "Favorites"
                  ? "You haven’t favorited any titles yet. Tap the heart on a card to add one."
                  : activePage === "Watch History"
                    ? "Your watch history will appear here after you watch a title."
                    : "No titles found."}
              </p>
            )}
          </section>

          {activePage === "Home" && (
            <>
              {currentUser && (
                <section className="section watchlist-section">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">SAVED FOR LATER</span>
                      <h2>My Watchlist</h2>
                    </div>
                  </div>

                  {allTitles.some((title) =>
                    watchlist.includes(title.id)
                  ) ? (
                    <div className="movie-grid">
                      {allTitles
                        .filter((title) => watchlist.includes(title.id))
                        .map((movie) => renderMovieCard(movie))}
                    </div>
                  ) : (
                    <p className="empty-message">
                      Add a title above to start your account watchlist.
                    </p>
                  )}
                </section>
              )}

              {currentUser && (
                <section className="section">
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">RECENTLY WATCHED</span>
                      <h2>Watch History</h2>
                    </div>
                    <button
                      type="button"
                      className="footer-top-link"
                      onClick={() => openPage("Watch History")}
                    >
                      View all
                    </button>
                  </div>

                  {watchHistory.length > 0 ? (
                    <div className="movie-grid">
                      {watchHistory
                        .slice(0, 5)
                        .map((entry) => renderMovieCard(entry.movie))}
                    </div>
                  ) : (
                    <p className="empty-message">
                      Your watched titles will appear here.
                    </p>
                  )}
                </section>
              )}

              <section className="section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">COMING SOON</span>
                    <h2>Upcoming Movies</h2>
                  </div>
                  <span className="result-count">
                    {upcomingMovies.length} titles
                  </span>
                </div>

                {upcomingMovies.length > 0 ? (
                  <div className="movie-grid">
                    {upcomingMovies.map((movie) =>
                      renderMovieCard(movie)
                    )}
                  </div>
                ) : (
                  <p className="empty-message">
                    No upcoming movies have been added yet.
                  </p>
                )}
              </section>

              <section className="features-section">
                <div className="features-grid">
                  <article className="feature-card">
                    <span className="feature-symbol" aria-hidden="true">
                      🌍
                    </span>
                    <h3>Works Worldwide</h3>
                    <p>
                      Discover movies and shows from countries around the
                      world.
                    </p>
                  </article>

                  <article className="feature-card">
                    <span className="feature-symbol" aria-hidden="true">
                      🎬
                    </span>
                    <h3>Thousands of Titles</h3>
                    <p>
                      Browse movies, shows, documentaries, sports, and more.
                    </p>
                  </article>

                  <article className="feature-card">
                    <span className="feature-symbol" aria-hidden="true">
                      ✓
                    </span>
                    <h3>Always 100% Free</h3>
                    <p>Explore titles without a payment or subscription.</p>
                  </article>

                  <article className="feature-card">
                    <span className="feature-symbol" aria-hidden="true">
                      📱
                    </span>
                    <h3>Device-Friendly</h3>
                    <p>
                      Enjoy MovieBox on phones, tablets, computers, and TVs.
                    </p>
                  </article>
                </div>
              </section>

              <section className="streaming-section">
                <div className="streaming-copy">
                  <span className="streaming-eyebrow">
                    YOUR STREAMING, ORGANIZED
                  </span>
                  <h2>See what’s new on Prime Video, Netflix, and more.</h2>
                  <p>
                    Choose your favorite streaming services to discover titles,
                    search faster, and find new recommendations—all in one
                    place. Connect with friends and see what they’re watching.
                  </p>
                  <a
                    className="streaming-cta"
                    href="https://www.plex.tv/blog/discover-together/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Discover More Now <span aria-hidden="true">↗</span>
                  </a>
                </div>

                <div
                  className="streaming-platforms"
                  aria-label="Streaming platforms"
                >
                  <span className="platform-badge platform-netflix">
                    Netflix
                  </span>
                  <span className="platform-badge platform-prime">
                    prime video
                  </span>
                  <span className="platform-badge platform-disney">
                    Disney+
                  </span>
                  <span className="platform-badge platform-apple">
                    Apple TV+
                  </span>
                  <span className="platform-badge platform-max">Max</span>
                  <span className="platform-badge platform-hulu">hulu</span>
                  <span className="platform-badge platform-paramount">
                    Paramount+
                  </span>
                  <span className="platform-badge platform-peacock">
                    peacock
                  </span>
                </div>
              </section>

              <section className="partners-section">
                <h2>Proud Partners with</h2>
                <div className="partners-grid">
                  {partners.map((partner) => (
                    <div className="partner-card" key={partner.name}>
                      <img src={partner.logo} alt={partner.name} />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      )}

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <button
              className="footer-logo"
              type="button"
              onClick={() => openPage("Home")}
            >
              <span>▶</span> MOVIE BOX
            </button>
            <p>
              Find movies to enjoy, save titles for later, and keep your
              favorites together.
            </p>
          </div>

          <div className="footer-column">
            <h3>Explore</h3>
            {[
              "Home",
              "Movies",
              "Web Series",
              "Animation",
              "Favorites",
              "Watch History",
            ].map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => openPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <div className="footer-column">
            <h3>Browse by genre</h3>
            {genres.slice(1, 5).map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => {
                  setActivePage("Home");
                  setSelectedGenre(genre);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {genre}
              </button>
            ))}
          </div>

          <div className="footer-note">
            <h3>Your movie space</h3>
            <p>
              Search for a title, save it to your watchlist, or tap the heart
              to add it to Favorites.
            </p>
            <button
              type="button"
              className="footer-top-link"
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
            >
              Back to top ↑
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Cinema</span>
          <span>Made for movie lovers.</span>
        </div>
      </footer>
    </div>
  );
}