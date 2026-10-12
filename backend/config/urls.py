from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from movies.api_views import (
    csrf_token,
    current_user,
    movie_list,
    register,
    user_login,
    user_logout,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/csrf/", csrf_token, name="csrf-token"),
    path("api/register/", register, name="register"),
    path("api/login/", user_login, name="login"),
    path("api/logout/", user_logout, name="logout"),
    path("api/me/", current_user, name="current-user"),
    path("api/movies/", movie_list, name="movie-list"),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )