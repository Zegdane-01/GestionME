from rest_framework import permissions

class IsCollaborateur(permissions.BasePermission):
    """
    Autorise uniquement les utilisateurs avec le rôle 'Collaborateur'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'COLLABORATEUR'

class IsTeamLeader(permissions.BasePermission):
    """
    Autorise les utilisateurs avec les rôles 'Team Leader N1' ou 'Team Leader N2'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['TL1', 'TL2', 'CL', 'UDL']