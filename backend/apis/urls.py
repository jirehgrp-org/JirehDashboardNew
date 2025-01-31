from django.urls import path, include
from rest_framework.routers import SimpleRouter

from .views import BusinessAPIViewSet,CustomRegisterAPIView

router = SimpleRouter()
router.register('business', BusinessAPIViewSet, basename='business')

urlpatterns = [
    path('', include(router.urls)),
    path('registration/', CustomRegisterAPIView.as_view(), name='custom_register'),
]


