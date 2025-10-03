# book_review_app/views.py

import json
import os
import logging
from django.http import JsonResponse, HttpResponse, HttpRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from google.cloud import texttospeech

logger = logging.getLogger(__name__)

# --- Data and Scripts for the Activity ---
# This data is based on your requirement documents.
# In a larger app, this would be in a database or a separate file.

QUESTION_DATA = {
    'Q1': {
        # [cite_start]Category and difficulty for logging [cite: 3, 4]
        'category': 'Recall',
        'difficulty': 'EASY',
        # [cite_start]Adaptive conversation scripts for Q1 [cite: 116, 119, 127, 133]
        'scripts': {
            'full_correct': {
                'tts_text': "Yes, that’s exactly right — Mildred Hubble. Well remembered! She’s the girl who always seems to get into trouble at Miss Cackle’s Academy.",
                'next_action': 'PROCEED_TO_Q2'
            },
            'partial': {
                'tts_text': "Yes, that’s right — Mildred is her first name. Can you remember her second name too? It begins with an H…",
                'next_action': 'AWAIT_RESPONSE'
            },
            'wrong': {
                'tts_text': "Good try — that character is in the story, but isn't the main one. Is the main character's name Maud or Mildred?",
                'next_action': 'AWAIT_RESPONSE'
            },
            'idk': {
                'tts_text': "That’s okay — let’s work it out together. Is it Maud, Mildred, or Miss Hardbroom?",
                'next_action': 'AWAIT_RESPONSE'
            }
        }
    }
}

# --- Helper Function for AI Analysis (Placeholder) ---
# As requested, this is a separate function. For Q1, the logic is rule-based.
# This function could be expanded to use a GenAI model for more complex questions (e.g., analyzing sentiment or creativity).

def call_ai_for_analysis(student_text):
    """
    Analyzes student's text. Currently uses simple rules, but can be
    upgraded to a full AI/LLM call for more nuanced understanding.
    """
    # Clean the text for simple keyword matching
    cleaned_text = student_text.lower().strip()
    
    # [cite_start]This logic determines the conversational path [cite: 265-270]
    if "mildred hubble" in cleaned_text:
        return 'full_correct'
    elif "mildred" in cleaned_text:
        return 'partial'
    elif "maud" in cleaned_text or "hardbroom" in cleaned_text:
        return 'wrong'
    elif "i don't know" in cleaned_text:
        return 'idk'
    else:
        # Default for other unrecognized answers
        return 'wrong'

# --- Main View for the Book Review Activity ---

@csrf_exempt # Use proper authentication in production
def check_book_review_answer(request: HttpRequest):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    try:
        # 1. Parse incoming data from the frontend
        data = json.loads(request.body)
        question_id = data.get('question_id')
        student_text = data.get('student_text')
        time_ms = data.get('time_to_first_response_ms', 5000)

        if not all([question_id, student_text]):
            return JsonResponse({'error': 'Missing required data'}, status=400)

        # 2. Analyze the student's answer using the helper function
        # For now, we only have logic for Q1
        if question_id == 'Q1':
            path = call_ai_for_analysis(student_text)
        else:
            return JsonResponse({'error': 'Question ID not found'}, status=404)

        # [cite_start]3. Log the performance data based on your requirements [cite: 247-276]
        # In a real app, this would be saved to a database.
        
        # [cite_start]Determine timing level based on thresholds [cite: 58-61]
        if time_ms <= 3000:
            timing_level = 'fast'
        elif 3001 <= time_ms <= 7000:
            timing_level = 'typical'
        else:
            timing_level = 'slow'

        log_entry = {
            'question_id': question_id,
            'category': QUESTION_DATA[question_id]['category'],
            'difficulty': QUESTION_DATA[question_id]['difficulty'],
            'student_text': student_text,
            'path': path,
            'time_to_first_response_ms': time_ms,
            'timing_level': timing_level,
            'attempt_count': 1, # This would be tracked in the session state
            'hints_used': 0,    # This would also be tracked
    }
        print("PERFORMANCE LOG:", log_entry) # Simulating the logging action

        # 4. Get the scripted response based on the analysis
        script = QUESTION_DATA[question_id]['scripts'][path]
        tts_text = script['tts_text']
        next_action = script['next_action']

        # 5. Send the response back to the frontend
        return JsonResponse({
            'tts_text': tts_text, 
            'next_action': next_action
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f"Error in check_book_review_answer: {e}", exc_info=True)
        return JsonResponse({'error': 'Internal server error'}, status=500)

# --- Separate View for Google Text-to-Speech ---

@csrf_exempt
@require_http_methods(["POST"])
def google_tts(request):
    try:
        data = json.loads(request.body)
        text_to_speak = data.get('text')
        
        if not text_to_speak: return JsonResponse({'error': 'No text provided'}, status=400)
        
        credentials_path = os.path.join(os.path.dirname(__file__), '..', 'google-credentials.json')
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
        client = texttospeech.TextToSpeechClient()
        synthesis_input = texttospeech.SynthesisInput(text=text_to_speak)
        voice = texttospeech.VoiceSelectionParams(language_code="en-US", name="en-US-Chirp3-HD-Kore")
        audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)
        response = client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)
        return HttpResponse(response.audio_content, content_type='audio/mpeg')
    except Exception as e:
        logger.error(f"Error in google_tts: {e}", exc_info=True)
        return JsonResponse({'error': 'Failed to generate audio'}, status=500)
