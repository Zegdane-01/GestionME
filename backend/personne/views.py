import logging
from rest_framework import viewsets, permissions, status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Personne
from .serializers import PersonneSerializer, PersonneLoginSerializer, LogoutSerializer
from .permissions import IsTeamLeader, IsTeamLeaderN1, IsTeamLeaderN2, IsCollaborateur
from rest_framework.permissions import IsAuthenticated, AllowAny

class PersonneViewSet(viewsets.ModelViewSet):
    queryset = Personne.objects.all()
    serializer_class = PersonneSerializer
    permission_classes = [permissions.AllowAny] 

class PersonneLoginView(APIView):
    permission_classes = [permissions.AllowAny] 

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

logger = logging.getLogger(__name__)
class PersonneLogoutView(APIView):
    serializer_class = LogoutSerializer

    def post(self, request):
        logger.info(f"Requête de déconnexion reçue : {request.data}")
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            refresh_token = serializer.validated_data['refresh']
            logger.info(f"Token de rafraîchissement reçu et validé : '{refresh_token}'")
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({"detail": "Déconnexion réussie."}, status=status.HTTP_205_RESET_CONTENT)
            except Exception as e:
                logger.error(f"Erreur lors de la mise sur liste noire du token : {e}")
                return Response({"detail": "Le token refresh est invalide ou a déjà expiré."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            logger.error(f"Erreurs du sérialiseur : {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)