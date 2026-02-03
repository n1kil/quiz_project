from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        
        surveys = Survey.objects.all().prefetch_related('questions__answers')
        serializer = SurveySerializer(surveys, many=True)
        return Response(serializer.data)

    def post(self, request):
        print(f"Received data: {request.data}")
        
        serializer = SurveySerializer(
            data=request.data, 
            context={'request': request}  
        )
        
        if serializer.is_valid():
            try:
                print(f"Saving survey: {serializer.validated_data}")
                
                
                survey = serializer.save() 
                print(f"Created survey by user: {request.user.username}")
                print(f"Survey author: {survey.author}")

                for question in survey.questions.all():
                    print(f"Created question: {question.question_text}")
                    for answer in question.answers.all():
                        print(f"  Answer: {answer.answer_text} (correct: {answer.correct})")
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                print(f"Error while saving survey: {e}")
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class SurveyDetail(APIView):
    permission_classes = [IsAuthenticated]
    
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