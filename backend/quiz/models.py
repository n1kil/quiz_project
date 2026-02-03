from django.db import models
from django.contrib.auth.models import User

class Survey(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='surveys',
        null=True,  
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)  
    
    def __str__(self):
        return self.title

class Question(models.Model):
    survey = models.ForeignKey(Survey, related_name='questions', on_delete=models.CASCADE)
    question_text = models.CharField(max_length=255)

    def __str__(self):
        return self.question_text

class Answer(models.Model):
    question = models.ForeignKey(Question, related_name='answers', on_delete=models.CASCADE)
    answer_text = models.CharField(max_length=255)
    correct = models.BooleanField(default=False)

    def __str__(self):
        return self.answer_text
    


class QuizResult(models.Model):
    """Результат прохождения опроса (все ответы сразу)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_results')
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='results')
    submitted_at = models.DateTimeField(auto_now_add=True)
    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-submitted_at']  # новые результаты сверху
    
    def __str__(self):
        return f"{self.user.username} - {self.survey.title} - {self.score}/{self.total_questions}"

class UserResponse(models.Model):
    """Ответ пользователя на конкретный вопрос"""
    quiz_result = models.ForeignKey(QuizResult, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_answer = models.ForeignKey(Answer, on_delete=models.CASCADE)
    is_correct = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['quiz_result', 'question']  # один ответ на вопрос в попытке
