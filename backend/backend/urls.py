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



# #{
#     "title": "Тестовая викторина по программированию",
#     "description": "Проверьте свои знания в программировании. 5 вопросов разной сложности.",
#     "questions": [
#         {
#             "question_text": "Какой язык программирования самый популярный в веб-разработке?",
#             "answers": [
#                 {"answer_text": "JavaScript", "correct": true},
#                 {"answer_text": "Python", "correct": false},
#                 {"answer_text": "Java", "correct": false},
#                 {"answer_text": "C#", "correct": false}
#             ]
#         },
#         {
#             "question_text": "Что такое REST API?",
#             "answers": [
#                 {"answer_text": "Архитектурный стиль для создания веб-сервисов", "correct": true},
#                 {"answer_text": "Язык программирования", "correct": false},
#                 {"answer_text": "База данных", "correct": false},
#                 {"answer_text": "Фреймворк для фронтенда", "correct": false}
#             ]
#         },
#         {
#             "question_text": "Какой оператор используется для проверки равенства в Python?",
#             "answers": [
#                 {"answer_text": "==", "correct": true},
#                 {"answer_text": "=", "correct": false},
#                 {"answer_text": "===", "correct": false},
#                 {"answer_text": "!=", "correct": false}
#             ]
#         },
#         {
#             "question_text": "Что такое Django?",
#             "answers": [
#                 {"answer_text": "Фреймворк для Python", "correct": true},
#                 {"answer_text": "База данных", "correct": false},
#                 {"answer_text": "Язык программирования", "correct": false},
#                 {"answer_text": "Браузер", "correct": false}
#             ]
#         },
#         {
#             "question_text": "Какой метод HTTP используется для получения данных?",
#             "answers": [
#                 {"answer_text": "GET", "correct": true},
#                 {"answer_text": "POST", "correct": false},
#                 {"answer_text": "PUT", "correct": false},
#                 {"answer_text": "DELETE", "correct": false}
#             ]
#         }
#     ]
# }



# {
#     "survey_id": 1,
#     "answers": [
#         {
#             "question_id": 1,
#             "answer_id": 1  # JavaScript - правильно
#         },
#         {
#             "question_id": 2,
#             "answer_id": 5  # Архитектурный стиль... - правильно
#         },
#         {
#             "question_id": 3,
#             "answer_id": 9  # == - правильно
#         },
#         {
#             "question_id": 4,
#             "answer_id": 13  # Фреймворк для Python - правильно
#         },
#         {
#             "question_id": 5,
#             "answer_id": 17  # GET - правильно
#         }
#     ]
# }