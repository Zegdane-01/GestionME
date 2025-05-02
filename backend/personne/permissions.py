from rest_framework import permissions

class IsTeamLeaderN1(permissions.BasePermission):
    """
    Autorise uniquement les utilisateurs avec le rôle 'Team Leader N1'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'N1'

class IsTeamLeaderN2(permissions.BasePermission):
    """
    Autorise uniquement les utilisateurs avec le rôle 'Team Leader N2'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'N2'

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
        return request.user.is_authenticated and request.user.role in ['N1', 'N2']