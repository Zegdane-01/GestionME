import logging
from rest_framework import viewsets, permissions, status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Personne
from manager.models import Manager
from .serializers import PersonneSerializer, PersonneLoginSerializer, LogoutSerializer, PersonneCreateSerializer
from manager.serializers import ManagerSerializer
from .permissions import IsTeamLeader, IsTeamLeaderN1, IsTeamLeaderN2, IsCollaborateur
from rest_framework.permissions import IsAuthenticated, AllowAny

class PersonneViewSet(viewsets.ModelViewSet):
    queryset = Personne.objects.all()
    serializer_class = PersonneSerializer
    permission_classes = [AllowAny] 

class PersonneLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PersonneLoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            response_data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            try:
                manager = Manager.objects.get(matricule=user.matricule)
                response_data['is_manager'] = True
                response_data['manager'] = ManagerSerializer(manager).data  # Utilisez ManagerSerializer
            except Manager.DoesNotExist:
                response_data['is_manager'] = False
                response_data['user'] = PersonneSerializer(user).data  # Utilisez PersonneSerializer pour les non-managers

            return Response(response_data, status=status.HTTP_200_OK)
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
        

class LogoutView(APIView):
     permission_classes = (IsAuthenticated,)
     def post(self, request):
          
          try:
               refresh_token = request.data["refresh_token"]
               token = RefreshToken(refresh_token)
               token.blacklist()
               return Response(status=status.HTTP_205_RESET_CONTENT)
          except Exception as e:
               return Response(status=status.HTTP_400_BAD_REQUEST)
          
class PersonneViewSet(viewsets.ModelViewSet):
    queryset = Personne.objects.all()
    lookup_field = 'matricule'

    def get_serializer_class(self):
        if self.action == 'create':
            return PersonneCreateSerializer
        return PersonneSerializer