
from django.urls import path
from .views import ChatbotAPIView, LanguageTestAPIView

urlpatterns = [
    path('chatbot/', ChatbotAPIView.as_view(), name='chatbot'),
    path('test-language/', LanguageTestAPIView.as_view(), name='test-language'),
]
