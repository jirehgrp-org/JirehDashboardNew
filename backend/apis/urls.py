from django.urls import path
from rest_framework.routers import SimpleRouter

from .views import BusinessAPIViewSet

router = SimpleRouter()
router.register('', BusinessAPIViewSet, basename='business')

urlpatterns = router.urls


