from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access it.
    Assumes the model has a 'user' attribute.
    """
    message = "You do not have permission to access this object."
    
    def has_object_permission(self, request, view, obj):
        # Check if the object has a 'user' attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        return False


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners to edit, but allow anyone to read.
    Assumes the model has a 'user' attribute.
    """
    message = "You do not have permission to edit this object."
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        return False


class IsGroupMember(permissions.BasePermission):
    """
    Custom permission to only allow group members to access group objects.
    """
    message = "You must be a member of this group."
    
    def has_object_permission(self, request, view, obj):
        # Check if the object has a 'group' attribute
        if hasattr(obj, 'group'):
            return obj.group.members.filter(id=request.user.id).exists()
        # Check if the object itself is a group
        elif hasattr(obj, 'members'):
            return obj.members.filter(id=request.user.id).exists()
        return False


class IsGroupAdmin(permissions.BasePermission):
    """
    Custom permission to only allow group admins to modify group settings.
    """
    message = "Only group admins can perform this action."
    
    def has_object_permission(self, request, view, obj):
        from groups.models import GroupMembership
        
        # For group objects
        if hasattr(obj, 'members'):
            return GroupMembership.objects.filter(
                group=obj,
                user=request.user,
                role='admin'
            ).exists()
        
        # For group-related objects
        elif hasattr(obj, 'group'):
            return GroupMembership.objects.filter(
                group=obj.group,
                user=request.user,
                role='admin'
            ).exists()
        
        return False