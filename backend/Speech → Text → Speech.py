import speech_recognition as sr
import pyttsx3

engine = pyttsx3.init()
engine.setProperty("rate", 160)
engine.setProperty("volume", 1.0)

voices = engine.getProperty("voices")
engine.setProperty("voice", voices[1].id) 


recognizer = sr.Recognizer()

def speak(text):
    """Convert text to speech"""
    engine.say(text)
    engine.runAndWait()

def listen():
    """Listen to microphone and recognize speech"""
    with sr.Microphone() as source:
        print(" Speak something...")
        recognizer.adjust_for_ambient_noise(source) 
        audio = recognizer.listen(source)
    try:
        text = recognizer.recognize_google(audio)
        print(" You said:", text)
        return text
    except sr.UnknownValueError:
        print(" Sorry, I could not understand")
        return None
    except sr.RequestError:
        print(" API unavailable")
        return None

while True:
    command = listen()
    if command:
        if "exit" in command.lower():
            speak("Goodbye! Exiting program.")
            break
        else:
            reply = f"You said: {command}"
            speak(reply)
