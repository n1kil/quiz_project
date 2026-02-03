from django.contrib.auth.models import User
from rest_framework import serializers
from .models import *

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password']) 
        user.save()
        return user



class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'answer_text', 'correct']

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'answers']

    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        question = Question.objects.create(**validated_data)

        for answer_data in answers_data:
            Answer.objects.create(question=question, **answer_data)
        
        return question

class SurveySerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)
    author = serializers.PrimaryKeyRelatedField(read_only=True)  
    author_name = serializers.CharField(source='author.username', read_only=True) 
    
    class Meta:
        model = Survey
        fields = ['id', 'title', 'description', 'author', 'author_name', 'questions', 'created_at']
    
    def create(self, validated_data):
        user = self.context['request'].user
        
        questions_data = validated_data.pop('questions')
        
        survey = Survey.objects.create(
            author=user, 
            **validated_data
        )
        
        for question_data in questions_data:
            answers_data = question_data.pop('answers')
            question = Question.objects.create(survey=survey, **question_data)
            
            for answer_data in answers_data:
                Answer.objects.create(question=question, **answer_data)
        
        return survey

class SubmitQuizSerializer(serializers.Serializer):
    """Сериализатор для отправки всех ответов на опрос"""
    survey_id = serializers.IntegerField()
    answers = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )
    
    def validate(self, data):
        # Пример структуры answers:
        # [
        #     {"question_id": 1, "answer_id": 3},
        #     {"question_id": 2, "answer_id": 5},
        # ]
        for answer in data['answers']:
            if 'question_id' not in answer or 'answer_id' not in answer:
                raise serializers.ValidationError(
                    "Каждый ответ должен содержать question_id и answer_id"
                )
        return data

class QuizResultSerializer(serializers.ModelSerializer):
    """Сериализатор для отображения результата"""
    survey_title = serializers.CharField(source='survey.title', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = QuizResult
        fields = ['id', 'user', 'user_name', 'survey', 'survey_title', 
                 'score', 'total_questions', 'percentage', 'submitted_at']
    
    def get_percentage(self, obj):
        if obj.total_questions > 0:
            return round((obj.score / obj.total_questions) * 100, 1)
        return 0

class UserResponseSerializer(serializers.ModelSerializer):
    """Сериализатор для ответов пользователя"""
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    selected_answer_text = serializers.CharField(source='selected_answer.answer_text', read_only=True)
    correct_answer_text = serializers.SerializerMethodField()
    
    class Meta:
        model = UserResponse
        fields = ['question', 'question_text', 'selected_answer', 'selected_answer_text',
                 'is_correct', 'correct_answer_text']
    
    def get_correct_answer_text(self, obj):
        # Получаем правильный ответ на этот вопрос
        correct_answer = Answer.objects.filter(
            question=obj.question, 
            correct=True
        ).first()
        return correct_answer.answer_text if correct_answer else None