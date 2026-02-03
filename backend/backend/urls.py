from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from quiz import views

urlpatterns = [
    path('register/', views.RegisterUser().as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('surveys/', views.SurveyListCreate.as_view(), name='survey-list-create'),
    path('surveys/<int:pk>/', views.SurveyDetail.as_view(), name='survey-detail'),
]
