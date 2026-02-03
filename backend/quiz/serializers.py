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