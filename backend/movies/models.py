from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Movie(models.Model):
    CATEGORY_CHOICES = [
        ("movie", "Movie"),
        ("webseries", "Web Series"),
        ("animation", "Animation"),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    year = models.PositiveSmallIntegerField(null=True, blank=True)
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(10)],
    )
    genre = models.CharField(max_length=100, blank=True)
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="movie",
    )
    poster_url = models.URLField(blank=True)
    backdrop_url = models.URLField(blank=True)
    watch_url = models.URLField(blank=True)
    video_file = models.FileField(
        upload_to="movies/videos/",
        blank=True,
        null=True,
    )
    is_upcoming = models.BooleanField(default=False)
    trending_rank = models.PositiveSmallIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class WatchHistory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="watch_history",
    )
    movie = models.ForeignKey(
        Movie,
        on_delete=models.CASCADE,
        related_name="watch_history",
    )
    last_watched_at = models.DateTimeField(auto_now=True)
    position_seconds = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)

    class Meta:
        ordering = ["-last_watched_at"]
        constraints = [
            models.UniqueConstraint(
                fields=("user", "movie"),
                name="uniq_user_movie_history",
            ),
        ]

    def __str__(self):
        return f"{self.user} watched {self.movie}"


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="movie_favorites",
    )
    movie = models.ForeignKey(
        Movie,
        on_delete=models.CASCADE,
        related_name="user_favorites",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "movie"],
                name="uniq_user_favorite",
            ),
        ]

    def __str__(self):
        return f"{self.user} favorited {self.movie}"


class Watchlist(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="watchlist_items",
    )
    movie = models.ForeignKey(
        Movie,
        on_delete=models.CASCADE,
        related_name="in_watchlists",
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-added_at"]
        constraints = [
            models.UniqueConstraint(
                fields=("user", "movie"),
                name="uniq_user_movie_watchlist",
            ),
        ]

    def __str__(self):
        return f"{self.user} saved {self.movie}"