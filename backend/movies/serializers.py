from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Movie

User = get_user_model()


class RegistrationSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
    )

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )
        return value.lower()

    def create(self, validated_data):
        name = validated_data.pop("name")
        email = validated_data.pop("email")

        return User.objects.create_user(
            username=email,
            email=email,
            first_name=name,
            **validated_data,
        )


class MovieSerializer(serializers.ModelSerializer):
    video_file = serializers.FileField(
        use_url=True,
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Movie
        fields = (
            "id",
            "title",
            "description",
            "year",
            "rating",
            "genre",
            "category",
            "poster_url",
            "backdrop_url",
            "watch_url",
            "video_file",
            "is_upcoming",
            "trending_rank",
            "created_at",
        )