import { useState } from "react";

export default function MovieCard({
  movie,
  saved,
  favorite,
  onSave,
  onFavorite,
  rank,
}) {
  const [playerOpen, setPlayerOpen] = useState(false);

  return (
    <>
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

          {movie.videoUrl ? (
            <button
              type="button"
              className="watch-now-button"
              onClick={() => setPlayerOpen(true)}
            >
              ▶ Watch now
            </button>
          ) : movie.watchUrl ? (
            <a
              className="watch-now-button"
              href={movie.watchUrl}
              target="_blank"
              rel="noreferrer"
            >
              ▶ Watch now
            </a>
          ) : null}
        </div>
      </article>

      {playerOpen && movie.videoUrl && (
        <div
          className="video-modal-backdrop"
          role="presentation"
          onClick={() => setPlayerOpen(false)}
        >
          <section
            className="video-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Watch ${movie.title}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="video-modal-close"
              onClick={() => setPlayerOpen(false)}
              aria-label="Close video player"
            >
              ×
            </button>

            <video
              className="video-player"
              src={movie.videoUrl}
              controls
              autoPlay
              playsInline
            >
              Your browser does not support video playback.
            </video>

            <h2>{movie.title}</h2>
          </section>
        </div>
      )}
    </>
  );
}