from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

class AuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.token_url = reverse('token_obtain_pair') # Wait, I renamed it in urls.py? No, I added obtain_auth_token
        # Let's check the url name in urls.py

    def test_token_obtain(self):
        url = '/api-token-auth/'
        data = {'username': 'testuser', 'password': 'testpassword'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_protected_endpoint_without_auth(self):
        url = '/api/trades/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_protected_endpoint_with_token(self):
        token, _ = Token.objects.get_or_create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        url = '/api/trades/'
        response = self.client.get(url)
        # Note: If there are no trades, it might return 200 [] but at least it's not 401
        self.assertEqual(response.status_code, status.HTTP_200_OK)
