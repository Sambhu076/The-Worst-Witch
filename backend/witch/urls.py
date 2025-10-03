
from django.urls import path
from . import views

urlpatterns = [

    path('api/google-tts/', views.google_tts, name='google_tts'),

    path('api/book-review/check-answer', views.check_book_review_answer, name='check_answer'),


]