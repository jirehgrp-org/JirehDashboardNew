from django.shortcuts import render

# Create your views here.
from business.models import Business
from rest_framework import viewsets
from rest_framework import permissions
from .serializers import BusinessModelSerializer

class BusinessAPIViewSet(viewsets.ModelViewSet):
    queryset = Business.objects.all()
    serializer_class = BusinessModelSerializer
    permission_classes = [permissions.IsAuthenticated]
