from django.urls import path, include
from rest_framework.routers import DefaultRouter
# Make sure to import register_user here!
from .views import FieldViewSet, get_agents, current_user, register_user 

router = DefaultRouter()
router.register(r'fields', FieldViewSet, basename='field')

urlpatterns = [
    path('', include(router.urls)),
    path('agents/', get_agents, name='get_agents'),
    path('users/me/', current_user, name='current_user'),
    path('register/', register_user, name='register_user'),
]