import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from movies.models import Movie


movies_to_import = [
    {
        "title": "Interstellar",
        "description": "A team travels through a wormhole in search of a new home for humanity.",
        "year": 2014,
        "rating": "8.7",
        "genre": "Sci-Fi",
        "poster_url": "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80",
        "backdrop_url": "https://plus.unsplash.com/premium_photo-1682124752476-40db22034a58?q=80&w=880&auto=format&fit=crop",
        "watch_url": "https://www.justwatch.com/us/movie/interstellar",
        "trending_rank": None,
    },
    {
        "title": "The Dark Knight",
        "description": "",
        "year": 2008,
        "rating": "9.0",
        "genre": "Action",
        "poster_url": "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=600&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=85",
        "watch_url": "",
        "trending_rank": None,
    },
    {
        "title": "Arrival",
        "description": "",
        "year": 2016,
        "rating": "7.9",
        "genre": "Sci-Fi",
        "poster_url": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1800&q=85",
        "watch_url": "",
        "trending_rank": None,
    },
    {
        "title": "Life of Pi",
        "description": "",
        "year": 2012,
        "rating": "7.9",
        "genre": "Adventure",
        "poster_url": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=600&q=80",
        "backdrop_url": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=85",
        "watch_url": "",
        "trending_rank": None,
    },
    {
        "title": "Spider-Man",
        "description": "",
        "year": 2026,
        "rating": "9.1",
        "genre": "Action",
        "poster_url": "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=60",
        "backdrop_url": "https://images.hdqwalls.com/download/midnight-spiderman-hero-bf-1366x768.jpg",
        "watch_url": "",
        "trending_rank": None,
    },
    {
        "title": "Dune",
        "description": "",
        "year": 2025,
        "rating": "8.9",
        "genre": "Sci-Fi",
        "poster_url": "https://images.hdqwalls.com/download/dune-part-two-2024-5k-rl-1366x768.jpg",
        "backdrop_url": "https://images.hdqwalls.com/download/dune-part-two-poster-4k-sh-1366x768.jpg",
        "watch_url": "https://www.justwatch.com/in/movie/dune-2021",
        "trending_rank": None,
    },
    {
        "title": "Predator-Badlands",
        "description": "Predator: Badlands follows Dek, an exiled Yautja runt who crash-lands on the deadly planet Genna and teams up with Thia, a damaged Weyland-Yutani android, to hunt the regenerating apex predator Kalisk.",
        "year": 2025,
        "rating": "7.9",
        "genre": "Sci-Fi",
        "poster_url": "https://4kwallpapers.com/images/walls/thumbs_3t/23278.jpg",
        "backdrop_url": "https://4kwallpapers.com/images/walls/thumbs_3t/22254.jpg",
        "watch_url": "",
        "trending_rank": 1,
    },
]

for data in movies_to_import:
    title = data["title"]
    defaults = {key: value for key, value in data.items() if key != "title"}

    movie = Movie.objects.filter(
        title__iexact=title,
        category="movie",
    ).first()

    if movie:
        for field, value in defaults.items():
            setattr(movie, field, value)
        movie.save()
        print(f"Updated: {title}")
    else:
        Movie.objects.create(
            title=title,
            category="movie",
            **defaults,
        )
        print(f"Added: {title}")

print("Movie import finished.")