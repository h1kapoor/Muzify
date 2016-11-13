import json
from os.path import join, dirname
from watson_developer_cloud import ToneAnalyzerV3, SpeechToTextV1
from app.tokens import tone_analyzer, speech_to_text

#Returns a json object generated by Watson
def analyze_tone(text):
    return tone_analyzer.tone(text=text)

#Parses through the json object and Returns a dictionary with emotions and scores attached
def get_sentiments(analyzed_tones):
    emotions = {}
    for tone in analyzed_tones['document_tone']['tone_categories'][0]['tones']:
       emotions[tone['tone_name']] = tone['score']
    return emotions

#Returns a text file that is generated from the speech file using Watson
def speech_text():
    filename = join(dirname(__file__), 'static/record.wav')
    text = ""
    with open(filename, 'rb') as audio_file:
        text_json = speech_to_text.recognize(audio_file, content_type='audio/wav')
        try:
            text = text_json['results'][0]['alternatives'][0]['transcript']
        except IndexError:
            text = ""
    return text
