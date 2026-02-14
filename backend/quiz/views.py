from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from .models import *
from .serializers import *
from django.shortcuts import get_object_or_404

class RegisterUser(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SurveyListCreate(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        print(f"Authorization header: {request.headers.get('Authorization')}")
        surveys = Survey.objects.all().prefetch_related('questions__answers')
        serializer = SurveySerializer(surveys, many=True)
        return Response(serializer.data)

    def post(self, request):
        print(f"Authorization header: {request.headers.get('Authorization')}")
        print(f"Received data: {request.data}")
        print(f"User: {request.user}")
        serializer = SurveySerializer(
            data=request.data, 
            context={'request': request}
        )
        if serializer.is_valid():
            survey = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class SurveyDetail(APIView):
    permission_classes = [AllowAny]
    
    def get_object(self, pk):
        survey = get_object_or_404(Survey.objects.prefetch_related('questions__answers'), pk=pk)
        return survey
    
    def get(self, request, pk):
        survey = self.get_object(pk)
        serializer = SurveySerializer(survey)
        return Response(serializer.data)
    
    def delete(self, request, pk):
        survey = self.get_object(pk)
        

        if survey.author != request.user:
            return Response(
                {"error": "Вы не являетесь автором этого опроса"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        survey.delete()
        return Response(
            {"message": f"Опрос '{survey.title}' успешно удален"},
            status=status.HTTP_204_NO_CONTENT
        )       
    

class SubmitQuizView(APIView):
    """Отправить все ответы на опрос разом"""
    permission_classes = [IsAuthenticated]  
    
    def post(self, request):
         
        if not request.user.is_authenticated:
            return Response({"error": "Вы не авторизованы"}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = SubmitQuizSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        survey_id = serializer.validated_data['survey_id']
        answers_data = serializer.validated_data['answers']
        
        try:
            survey = Survey.objects.prefetch_related('questions__answers').get(id=survey_id)
        except Survey.DoesNotExist:
            return Response(
                {"error": "Опрос не найден"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        existing_result = QuizResult.objects.filter(
            user=request.user,  
            survey=survey
        ).exists()
        
        if existing_result:
            return Response(
                {"error": "Вы уже проходили этот опрос"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        quiz_result = QuizResult.objects.create(
            user=request.user,  
            survey=survey,
            total_questions=survey.questions.count(),
            score=0
        )
        
        
        correct_answers = 0
        
        for answer_data in answers_data:
            question_id = answer_data['question_id']
            answer_id = answer_data['answer_id']
            
            try:
                question = Question.objects.get(id=question_id, survey=survey)
                selected_answer = Answer.objects.get(id=answer_id, question=question)
                
                
                user_response = UserResponse.objects.create(
                    quiz_result=quiz_result,
                    question=question,
                    selected_answer=selected_answer,
                    is_correct=selected_answer.correct
                )
                
                if selected_answer.correct:
                    correct_answers += 1
                    
            except (Question.DoesNotExist, Answer.DoesNotExist):
                continue
        
        
        quiz_result.score = correct_answers
        quiz_result.save()
        
       
        result_serializer = QuizResultSerializer(quiz_result)
        responses = UserResponse.objects.filter(quiz_result=quiz_result)
        responses_serializer = UserResponseSerializer(responses, many=True)
        
        return Response({
            'result': result_serializer.data,
            'detailed_responses': responses_serializer.data,
            'message': f"Опрос завершен! Ваш результат: {correct_answers}/{quiz_result.total_questions}"
        }, status=status.HTTP_201_CREATED)


class UserQuizResultsView(APIView):
    """Получить все результаты пользователя"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        results = QuizResult.objects.filter(
            user=request.user
        ).select_related('survey').order_by('-submitted_at')
        
        serializer = QuizResultSerializer(results, many=True)
        return Response(serializer.data)

class SurveyResultsView(APIView):
    """Получить результаты по конкретному опросу"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, survey_id):
        try:
            survey = Survey.objects.get(id=survey_id)
        except Survey.DoesNotExist:
            return Response(
                {"error": "Опрос не найден"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        results = QuizResult.objects.filter(
            user=request.user,
            survey=survey
        ).order_by('-submitted_at')
        
        if not results.exists():
            return Response(
                {"message": "Вы ещё не проходили этот опрос"},
                status=status.HTTP_200_OK
            )
        
        serializer = QuizResultSerializer(results, many=True)
        return Response(serializer.data)