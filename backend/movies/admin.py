from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Movie, WatchHistory


admin.site.site_header = "Cinema Control Room"
admin.site.site_title = "Cinema Admin"
admin.site.index_title = "Manage your movie library"


@admin.register(Movie)
class MovieAdmin(ModelAdmin):
    list_display = (
        "title",
        "category",
        "year",
        "rating",
        "is_upcoming",
        "trending_rank",
    )
    list_filter = ("category", "genre", "is_upcoming")
    search_fields = ("title", "genre")


@admin.register(WatchHistory)
class WatchHistoryAdmin(ModelAdmin):
    list_display = ("user", "movie", "last_watched_at", "position_seconds", "completed")
    list_filter = ("completed",)
    search_fields = ("user__email", "movie__title")