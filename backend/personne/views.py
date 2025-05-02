from rest_framework import viewsets, permissions, status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Personne
from .serializers import PersonneSerializer, PersonneLoginSerializer
from .permissions import IsTeamLeader, IsTeamLeaderN1, IsTeamLeaderN2, IsCollaborateur
from rest_framework.permissions import IsAuthenticated, AllowAny

class PersonneViewSet(viewsets.ModelViewSet):
    queryset = Personne.objects.all()
    serializer_class = PersonneSerializer
    permission_classes = [permissions.AllowAny] 

class PersonneLoginView(APIView):
    permission_classes = [permissions.AllowAny] 
    def get(self, request):
        return Response({"detail": "Method not allowed"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def post(self, request):
        serializer = PersonneLoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': PersonneSerializer(user).data,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

class PersonneLogoutView(APIView):
    permission_classes = [] # Autoriser tout le monde pour la déconnexion
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)