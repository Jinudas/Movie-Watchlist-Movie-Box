import { useRef, useState } from "react";

export default function MovieCard({
  movie,
  saved,
  favorite,
  onSave,
  onFavorite,
  onWatchHistory,
  rank,
}) {
  const [playerOpen, setPlayerOpen] = useState(false);
  const videoRef = useRef(null);
  const lastSavedSecond = useRef(0);

  function openPlayer() {
    lastSavedSecond.current = 0;
    onWatchHistory?.(movie, 0, false);
    setPlayerOpen(true);
  }

  function saveProgress(event) {
    const seconds = Math.floor(event.currentTarget.currentTime);

    // Save progress at most once every 10 seconds.
    if (seconds - lastSavedSecond.current >= 10) {
      lastSavedSecond.current = seconds;
      onWatchHistory?.(movie, seconds, false);
    }
  }

  function closePlayer() {
    if (videoRef.current) {
      onWatchHistory?.(
        movie,
        Math.floor(videoRef.current.currentTime),
        false
      );
    }
    setPlayerOpen(false);
  }

  function finishVideo() {
    const seconds = videoRef.current
      ? Math.floor(videoRef.current.duration || videoRef.current.currentTime)
      : 0;

    onWatchHistory?.(movie, seconds, true);
  }

  function recordExternalWatchClick() {
    // The app can record the click, but the external service does not share
    // playback progress with this website.
    onWatchHistory?.(movie, 0, false);
  }

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
              onClick={openPlayer}
            >
              ▶ Watch now
            </button>
          ) : movie.watchUrl ? (
            <a
              className="watch-now-button"
              href={movie.watchUrl}
              target="_blank"
              rel="noreferrer"
              onClick={recordExternalWatchClick}
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
          onClick={closePlayer}
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
              onClick={closePlayer}
              aria-label="Close video player"
            >
              ×
            </button>

            <video
              ref={videoRef}
              className="video-player"
              src={movie.videoUrl}
              controls
              autoPlay
              playsInline
              onTimeUpdate={saveProgress}
              onEnded={finishVideo}
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