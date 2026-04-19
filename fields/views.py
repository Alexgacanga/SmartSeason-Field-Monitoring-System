from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Field, FieldUpdate, CropStage
from .serializers import FieldSerializer
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken

class FieldViewSet(viewsets.ModelViewSet):
    serializer_class = FieldSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Dynamically filter the database based on who is logged in.
        Admins see everything. Agents only see their assigned fields.
        """
        user = self.request.user
        
        # Check if the user has an Admin profile
        if hasattr(user, 'profile') and user.profile.role == 'ADMIN':
            return Field.objects.all().order_by('-created_at')
        
        # Otherwise, strictly limit to fields assigned to this specific agent
        return Field.objects.filter(agent=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def add_update(self, request, pk=None):
        """
        Custom endpoint for Field Agents to log a progress update.
        URL: POST /api/fields/{id}/add_update/
        """
        field = self.get_object()
        
        notes = request.data.get('notes', '')
        new_stage = request.data.get('stage_at_time')
        requires_attention = request.data.get('requires_attention', False)

        if not new_stage:
            return Response({"error": "Stage is required."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Update the main Field's current stage
        field.current_stage = new_stage
        field.save()

        # 2. Save the Agent's log entry
        FieldUpdate.objects.create(
            field=field,
            recorded_by=request.user,
            notes=notes,
            stage_at_time=new_stage,
            requires_attention=requires_attention
        )

        return Response({"status": "Update logged successfully!"}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_agents(request):
    """
    Fetches a list of all Field Agents for the Admin assignment dropdown.
    URL: GET /api/agents/
    """
    # Verify the user requesting this is an Admin
    if not hasattr(request.user, 'profile') or request.user.profile.role != 'ADMIN':
        return Response({"error": "Unauthorized. Only admins can view agent lists."}, status=status.HTTP_403_FORBIDDEN)
    
    # Fetch all users who are marked as agents in their profile
    agents = User.objects.filter(profile__role='AGENT').values('id', 'username')
    return Response(agents)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Returns the currently logged-in user's role so React knows which dashboard to show.
    """
    # Default to AGENT if they somehow don't have a profile
    role = request.user.profile.role if hasattr(request.user, 'profile') else 'AGENT'
    
    return Response({
        'username': request.user.username,
        'role': role
    })

@api_view(['POST'])
@permission_classes([]) # Leave empty so unauthenticated users can access it
def register_user(request):
    """
    Registers a new user, defaults their role to AGENT, and returns JWT tokens.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username is already taken."}, status=status.HTTP_400_BAD_REQUEST)

    # 1. Create the base User
    user = User.objects.create(
        username=username,
        password=make_password(password) # Securely hash the password
    )
    
    # 2. Create the UserProfile and default to AGENT
    from .models import UserProfile, UserRole
    UserProfile.objects.create(user=user, role=UserRole.AGENT)

    # 3. Generate JWT tokens so they can log in instantly
    refresh = RefreshToken.for_user(user)

    return Response({
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }, status=status.HTTP_201_CREATED)