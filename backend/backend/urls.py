from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from quiz import views

urlpatterns = [
    path('api/register/', views.RegisterUser().as_view(), name='register'),
    path('api/login/', TokenObtainPairView.as_view(), name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/surveys/', views.SurveyListCreate.as_view(), name='survey-list-create'),
    path('api/surveys/<int:pk>/', views.SurveyDetail.as_view(), name='survey-detail'),
    path('api/quiz/submit/', views.SubmitQuizView.as_view(), name='quiz-submit'),
    path('api/quiz/my-results/', views.UserQuizResultsView.as_view(), name='my-quiz-results'),
    path('api/quiz/survey/<int:survey_id>/results/', views.SurveyResultsView.as_view(), name='survey-results'),
]
