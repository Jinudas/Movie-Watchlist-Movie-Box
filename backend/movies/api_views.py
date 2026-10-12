from django.contrib.auth import (
    authenticate,
    get_user_model,
    login as django_login,
    logout as django_logout,
)
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Favorite, Movie, WatchHistory, Watchlist
from .serializers import MovieSerializer, RegistrationSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_token(request):
    return Response({"csrfToken": get_token(request._request)})


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegistrationSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Account created successfully."},
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def user_login(request):
    email = str(request.data.get("email", "")).strip().lower()
    password = request.data.get("password", "")

    if not email or not password:
        return Response(
            {"detail": "Enter your email and password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    User = get_user_model()
    account = User.objects.filter(email__iexact=email).first()

    if account is None:
        return Response(
            {"detail": "Email or password is incorrect."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    user = authenticate(
        request=request._request,
        username=account.username,
        password=password,
    )

    if user is None:
        return Response(
            {"detail": "Email or password is incorrect."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    django_login(request._request, user)

    return Response(
        {
            "message": "You are logged in.",
            "user": {
                "name": user.first_name,
                "email": user.email,
            },
            "csrfToken": get_token(request._request),
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response(
        {
            "user": {
                "name": request.user.first_name,
                "email": request.user.email,
            },
            "csrfToken": get_token(request._request),
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def user_logout(request):
    django_logout(request._request)
    return Response({"message": "You are logged out."})


@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def favorites(request):
    if request.method == "GET":
        entries = (
            Favorite.objects.filter(user=request.user)
            .select_related("movie")
        )
        serializer = MovieSerializer(
            [entry.movie for entry in entries],
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

    try:
        movie_id = int(request.data.get("movie_id"))
    except (TypeError, ValueError):
        return Response(
            {"detail": "Send a valid movie_id."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    movie = get_object_or_404(Movie, pk=movie_id)

    if request.method == "POST":
        Favorite.objects.get_or_create(user=request.user, movie=movie)
        return Response(
            {"message": "Favorite saved.", "movie_id": movie.id},
            status=status.HTTP_200_OK,
        )

    Favorite.objects.filter(user=request.user, movie=movie).delete()
    return Response(
        {"message": "Favorite removed.", "movie_id": movie.id},
        status=status.HTTP_200_OK,
    )


@api_view(["GET", "POST", "DELETE"])
@permission_classes([IsAuthenticated])
def watchlist_api(request):
    if request.method == "GET":
        entries = (
            Watchlist.objects.filter(user=request.user)
            .select_related("movie")
        )
        serializer = MovieSerializer(
            [entry.movie for entry in entries],
            many=True,
            context={"request": request},
        )
        return Response(serializer.data)

    try:
        movie_id = int(request.data.get("movie_id"))
    except (TypeError, ValueError):
        return Response(
            {"detail": "Send a valid movie_id."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    movie = get_object_or_404(Movie, pk=movie_id)

    if request.method == "POST":
        Watchlist.objects.get_or_create(user=request.user, movie=movie)
        return Response(
            {"message": "Watchlist saved.", "movie_id": movie.id},
            status=status.HTTP_200_OK,
        )

    Watchlist.objects.filter(user=request.user, movie=movie).delete()
    return Response(
        {"message": "Removed from watchlist.", "movie_id": movie.id},
        status=status.HTTP_200_OK,
    )


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def watch_history(request):
    if request.method == "GET":
        entries = (
            WatchHistory.objects.filter(user=request.user)
            .select_related("movie")
        )
        history = []

        for entry in entries:
            movie_data = MovieSerializer(
                entry.movie,
                context={"request": request},
            ).data
            history.append(
                {
                    "movie": movie_data,
                    "last_watched_at": entry.last_watched_at,
                    "position_seconds": entry.position_seconds,
                    "completed": entry.completed,
                }
            )

        return Response(history)

    try:
        movie_id = int(request.data.get("movie_id"))
        position_seconds = int(request.data.get("position_seconds", 0))
    except (TypeError, ValueError):
        return Response(
            {"detail": "Send a valid movie_id and position_seconds."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if position_seconds < 0:
        return Response(
            {"detail": "position_seconds cannot be negative."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    movie = get_object_or_404(Movie, pk=movie_id)
    completed = request.data.get("completed", False)

    WatchHistory.objects.update_or_create(
        user=request.user,
        movie=movie,
        defaults={
            "position_seconds": position_seconds,
            "completed": completed,
        },
    )

    return Response(
        {"message": "Watch history saved.", "movie_id": movie.id},
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def movie_list(request):
    movies = Movie.objects.all()
    serializer = MovieSerializer(
        movies,
        many=True,
        context={"request": request},
    )
    return Response(serializer.data)