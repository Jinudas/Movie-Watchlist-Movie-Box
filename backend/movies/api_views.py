from django.contrib.auth import (
    authenticate,
    get_user_model,
    login as django_login,
    logout as django_logout,
)
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Movie
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