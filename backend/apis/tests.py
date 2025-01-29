from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from business.models import Business

class APITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.business = Business.objects.create(
          name= 'BusinessTest Name', 
          address= 'BusinessAddress1' ,
          contact_number= 'BusinessContactNumber1' ,
          description = 'BusinessDescription1' ,
          website = 'BusinessWebsite1'  
        )

    def test_api_listview(self):
        response = self.client.get(reverse('business-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Business.objects.count(),1)
        self.assertContains(response, self.business)