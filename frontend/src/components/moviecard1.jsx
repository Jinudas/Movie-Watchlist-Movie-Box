export default function MovieCard({
  movie,
  saved,
  favorite,
  onSave,
  onFavorite,
  rank,
}) {
  return (
    <article className="movie-card">
      <div className="poster">
        <img src={movie.poster} alt={`Poster for ${movie.title}`} />

        {rank && <span className="rank-badge">#{rank}</span>}

        <button
          type="button"
          className={`favorite-button ${favorite ? "selected" : ""}`}
          onClick={onFavorite}
          aria-label={favorite ? "Remove favorite" : "Add favorite"}
          title={favorite ? "Remove favorite" : "Add favorite"}
        >
          {favorite ? "♥" : "♡"}
        </button>
      </div>

      <div className="movie-details">
        <div className="movie-heading">
          <h3>{movie.title}</h3>
          <span className="rating">★ {movie.rating}</span>
        </div>

        <p>
          {movie.year} <span>·</span> {movie.genre}
        </p>

        <button
          type="button"
          className="watchlist-button"
          onClick={onSave}
        >
          {saved ? "✓ In your watchlist" : "+ Add to watchlist"}
        </button>

        {movie.watchUrl && (
          <a
            className="watch-now-button"
            href={movie.watchUrl}
            target="_blank"
            rel="noreferrer"
          >
            ▶ Watch now
          </a>
        )}
      </div>
    </article>
  );
}