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

function getSavedItems(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
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
  const [watchlist, setWatchlist] = useState(() =>
    getSavedItems("cinema-watchlist")
  );
  const [favorites, setFavorites] = useState(() =>
    getSavedItems("cinema-favorites")
  );

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

        if (!response.ok) return;

        const data = await response.json();

        if (!ignoreResult) {
          setCurrentUser(data.user);
          setCsrfToken(data.csrfToken);
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

        const data = await response.json();

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
    const movieCount = movieTitles.length;

    if (movieCount === 0) {
      setSlide(0);
      return undefined;
    }

    const timer = setInterval(() => {
      setSlide((currentSlide) => (currentSlide + 1) % movieCount);
    }, 4000);

    return () => clearInterval(timer);
  }, [movieTitles.length]);

  useEffect(() => {
    localStorage.setItem("cinema-watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem("cinema-favorites", JSON.stringify(favorites));
  }, [favorites]);

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
    pageTitles = allTitles.filter((title) => favorites.includes(title.id));
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

  function handleLoginSuccess(user, token) {
    setCurrentUser(user);
    setCsrfToken(token);
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

      const data = await response.json();

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

  function toggleItem(list, setList, id) {
    setList(
      list.includes(id)
        ? list.filter((itemId) => itemId !== id)
        : [...list, id]
    );
  }

  function openPage(page) {
    setActivePage(page);
    setSearch("");
    setSelectedGenre("All");
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
                {visibleTitles.map((title) => (
                  <MovieCard
                    key={title.id}
                    movie={title}
                    rank={activePage === "Home" ? title.rank : undefined}
                    saved={watchlist.includes(title.id)}
                    favorite={favorites.includes(title.id)}
                    onSave={() =>
                      toggleItem(watchlist, setWatchlist, title.id)
                    }
                    onFavorite={() =>
                      toggleItem(favorites, setFavorites, title.id)
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="empty-message">
                {activePage === "Favorites"
                  ? "You haven’t favorited any titles yet. Tap the heart on a card to add one."
                  : "No titles found."}
              </p>
            )}
          </section>

          {activePage === "Home" && (
            <>
              <section className="section watchlist-section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">SAVED FOR LATER</span>
                    <h2>My Watchlist</h2>
                  </div>
                </div>

                {allTitles.some((title) => watchlist.includes(title.id)) ? (
                  <div className="movie-grid">
                    {allTitles
                      .filter((title) => watchlist.includes(title.id))
                      .map((title) => (
                        <MovieCard
                          key={title.id}
                          movie={title}
                          saved
                          favorite={favorites.includes(title.id)}
                          onSave={() =>
                            toggleItem(watchlist, setWatchlist, title.id)
                          }
                          onFavorite={() =>
                            toggleItem(favorites, setFavorites, title.id)
                          }
                        />
                      ))}
                  </div>
                ) : (
                  <p className="empty-message">
                    Add a title above to start your watchlist.
                  </p>
                )}
              </section>

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
                    {upcomingMovies.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        saved={watchlist.includes(movie.id)}
                        favorite={favorites.includes(movie.id)}
                        onSave={() =>
                          toggleItem(watchlist, setWatchlist, movie.id)
                        }
                        onFavorite={() =>
                          toggleItem(favorites, setFavorites, movie.id)
                        }
                      />
                    ))}
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
                    <span className="feature-symbol" aria-hidden="true">🌍</span>
                    <h3>Works Worldwide</h3>
                    <p>
                      Discover movies and shows from countries around the
                      world.
                    </p>
                  </article>

                  <article className="feature-card">
                    <span className="feature-symbol" aria-hidden="true">🎬</span>
                    <h3>Thousands of Titles</h3>
                    <p>
                      Browse movies, shows, documentaries, sports, and more.
                    </p>
                  </article>

                  <article className="feature-card">
                    <span className="feature-symbol" aria-hidden="true">✓</span>
                    <h3>Always 100% Free</h3>
                    <p>Explore titles without a payment or subscription.</p>
                  </article>

                  <article className="feature-card">
                    <span className="feature-symbol" aria-hidden="true">📱</span>
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
                  <span className="platform-badge platform-netflix">Netflix</span>
                  <span className="platform-badge platform-prime">prime video</span>
                  <span className="platform-badge platform-disney">Disney+</span>
                  <span className="platform-badge platform-apple">Apple TV+</span>
                  <span className="platform-badge platform-max">Max</span>
                  <span className="platform-badge platform-hulu">hulu</span>
                  <span className="platform-badge platform-paramount">
                    Paramount+
                  </span>
                  <span className="platform-badge platform-peacock">peacock</span>
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
            {["Home", "Movies", "Web Series", "Animation", "Favorites"].map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => openPage(page)}
                >
                  {page}
                </button>
              )
            )}
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
              Use the search bar to find a title. Save it to your watchlist or
              tap the heart to add it to Favorites.
            </p>
            <button
              type="button"
              className="footer-top-link"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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