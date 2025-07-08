#!/usr/bin/env python3
"""
K.E.N. & J.A.R.V.I.S. Voice Integration System
Advanced Whisper + spaCy integration for professional voice capabilities
"""

import asyncio
import logging
import json
import time
import threading
from typing import Dict, List, Any, Optional, Callable
from datetime import datetime
from pathlib import Path
import numpy as np

# Voice processing imports
import whisper
import spacy
import speech_recognition as sr
import pyttsx3
import pyaudio
import wave
import webrtcvad
from scipy import signal
import librosa

# K.E.N. & J.A.R.V.I.S. integration
from ai.algorithms.ken_49_algorithm_engine import KEN49Engine
from ai.jarvis.connector import JARVISConnector

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class WhisperSpaCyVoiceEngine:
    """
    Advanced voice processing engine combining Whisper and spaCy
    with K.E.N. & J.A.R.V.I.S. integration
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or self._default_config()
        
        # Initialize models
        self.whisper_model = None
        self.spacy_nlp = None
        self.ken_engine = None
        self.jarvis_connector = None
        
        # Voice components
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.tts_engine = pyttsx3.init()
        self.vad = webrtcvad.Vad(2)  # Voice Activity Detection
        
        # Audio settings
        self.sample_rate = 16000
        self.chunk_size = 1024
        self.audio_format = pyaudio.paInt16
        self.channels = 1
        
        # State management
        self.is_listening = False
        self.is_processing = False
        self.conversation_context = []
        self.voice_profile = {}
        
        # Performance metrics
        self.metrics = {
            'total_requests': 0,
            'successful_recognitions': 0,
            'average_processing_time': 0,
            'enhancement_factor': 0
        }
    
    def _default_config(self) -> Dict[str, Any]:
        """Default configuration for voice engine"""
        return {
            'whisper': {
                'model_size': 'base',  # tiny, base, small, medium, large
                'language': 'en',
                'temperature': 0.0,
                'best_of': 5,
                'beam_size': 5
            },
            'spacy': {
                'model': 'en_core_web_sm',
                'disable': ['ner'],  # Disable components not needed
                'max_length': 1000000
            },
            'tts': {
                'rate': 200,
                'volume': 0.8,
                'voice_id': 0
            },
            'ken_integration': {
                'enhancement_level': 'maximum',
                'algorithm_set': 'all_49',
                'real_time_processing': True
            },
            'jarvis_integration': {
                'consciousness_level': 'maximum',
                'memory_integration': True,
                'learning_enabled': True
            },
            'audio': {
                'noise_reduction': True,
                'auto_gain_control': True,
                'echo_cancellation': True,
                'voice_activity_detection': True
            }
        }
    
    async def initialize(self):
        """Initialize all voice processing components"""
        logger.info("🎤 Initializing Whisper + spaCy Voice Engine...")
        
        try:
            # Initialize Whisper
            logger.info("Loading Whisper model...")
            self.whisper_model = whisper.load_model(
                self.config['whisper']['model_size']
            )
            
            # Initialize spaCy
            logger.info("Loading spaCy NLP model...")
            self.spacy_nlp = spacy.load(
                self.config['spacy']['model'],
                disable=self.config['spacy']['disable']
            )
            
            # Initialize K.E.N. engine
            logger.info("Connecting to K.E.N. engine...")
            self.ken_engine = KEN49Engine()
            await self.ken_engine.initialize()
            
            # Initialize J.A.R.V.I.S. connector
            logger.info("Connecting to J.A.R.V.I.S. system...")
            self.jarvis_connector = JARVISConnector()
            await self.jarvis_connector.connect()
            
            # Configure TTS
            self._configure_tts()
            
            # Calibrate microphone
            await self._calibrate_microphone()
            
            logger.info("✅ Voice engine initialization complete!")
            
        except Exception as e:
            logger.error(f"❌ Voice engine initialization failed: {e}")
            raise
    
    def _configure_tts(self):
        """Configure text-to-speech engine"""
        voices = self.tts_engine.getProperty('voices')
        
        # Set voice properties
        self.tts_engine.setProperty('rate', self.config['tts']['rate'])
        self.tts_engine.setProperty('volume', self.config['tts']['volume'])
        
        # Select voice (prefer female voice for J.A.R.V.I.S.)
        if voices and len(voices) > self.config['tts']['voice_id']:
            self.tts_engine.setProperty('voice', voices[self.config['tts']['voice_id']].id)
    
    async def _calibrate_microphone(self):
        """Calibrate microphone for optimal voice recognition"""
        logger.info("🎙️ Calibrating microphone...")
        
        with self.microphone as source:
            # Adjust for ambient noise
            self.recognizer.adjust_for_ambient_noise(source, duration=2)
            
        # Set recognition parameters
        self.recognizer.energy_threshold = 4000
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 0.8
        self.recognizer.operation_timeout = None
        self.recognizer.phrase_threshold = 0.3
        self.recognizer.non_speaking_duration = 0.8
        
        logger.info("✅ Microphone calibration complete")
    
    async def listen_continuously(self, callback: Callable = None):
        """Start continuous voice listening with real-time processing"""
        logger.info("🎧 Starting continuous voice listening...")
        
        self.is_listening = True
        
        def audio_callback(recognizer, audio):
            """Callback for processing audio in background"""
            if not self.is_listening:
                return
            
            # Process audio in separate thread to avoid blocking
            threading.Thread(
                target=self._process_audio_async,
                args=(audio, callback),
                daemon=True
            ).start()
        
        # Start background listening
        stop_listening = self.recognizer.listen_in_background(
            self.microphone, 
            audio_callback,
            phrase_time_limit=30
        )
        
        try:
            while self.is_listening:
                await asyncio.sleep(0.1)
        finally:
            stop_listening(wait_for_stop=False)
            logger.info("🔇 Stopped continuous listening")
    
    def _process_audio_async(self, audio, callback: Callable = None):
        """Process audio asynchronously"""
        try:
            # Run async processing in new event loop
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(self.process_voice_input(audio))
            
            if callback and result:
                callback(result)
                
        except Exception as e:
            logger.error(f"❌ Audio processing error: {e}")
        finally:
            loop.close()
    
    async def process_voice_input(self, audio_data) -> Dict[str, Any]:
        """Process voice input through complete pipeline"""
        if self.is_processing:
            return None
        
        self.is_processing = True
        start_time = time.time()
        
        try:
            # Step 1: Speech-to-text with Whisper
            transcription = await self._transcribe_with_whisper(audio_data)
            if not transcription or not transcription.strip():
                return None
            
            logger.info(f"🎤 Transcribed: {transcription}")
            
            # Step 2: NLP processing with spaCy
            nlp_analysis = await self._analyze_with_spacy(transcription)
            
            # Step 3: K.E.N. enhancement
            ken_enhanced = await self._enhance_with_ken(transcription, nlp_analysis)
            
            # Step 4: J.A.R.V.I.S. processing
            jarvis_response = await self._process_with_jarvis(
                transcription, nlp_analysis, ken_enhanced
            )
            
            # Step 5: Generate response
            response_text = await self._generate_response(jarvis_response)
            
            # Step 6: Text-to-speech
            await self._speak_response(response_text)
            
            # Update metrics
            processing_time = time.time() - start_time
            self._update_metrics(processing_time, True)
            
            # Store in conversation context
            self.conversation_context.append({
                'timestamp': datetime.now().isoformat(),
                'input': transcription,
                'response': response_text,
                'processing_time': processing_time,
                'ken_enhancement': ken_enhanced.get('enhancement_factor', 0),
                'jarvis_confidence': jarvis_response.get('confidence', 0)
            })
            
            return {
                'transcription': transcription,
                'nlp_analysis': nlp_analysis,
                'ken_enhanced': ken_enhanced,
                'jarvis_response': jarvis_response,
                'response_text': response_text,
                'processing_time': processing_time
            }
            
        except Exception as e:
            logger.error(f"❌ Voice processing error: {e}")
            self._update_metrics(time.time() - start_time, False)
            return None
        finally:
            self.is_processing = False
    
    async def _transcribe_with_whisper(self, audio_data) -> str:
        """Transcribe audio using Whisper"""
        try:
            # Convert audio data to numpy array
            audio_np = np.frombuffer(audio_data.get_raw_data(), dtype=np.int16)
            audio_float = audio_np.astype(np.float32) / 32768.0
            
            # Resample if necessary
            if len(audio_float) > 0:
                audio_resampled = librosa.resample(
                    audio_float, 
                    orig_sr=self.sample_rate, 
                    target_sr=16000
                )
            else:
                return ""
            
            # Transcribe with Whisper
            result = self.whisper_model.transcribe(
                audio_resampled,
                language=self.config['whisper']['language'],
                temperature=self.config['whisper']['temperature'],
                best_of=self.config['whisper']['best_of'],
                beam_size=self.config['whisper']['beam_size']
            )
            
            return result['text'].strip()
            
        except Exception as e:
            logger.error(f"❌ Whisper transcription error: {e}")
            return ""
    
    async def _analyze_with_spacy(self, text: str) -> Dict[str, Any]:
        """Analyze text using spaCy NLP"""
        try:
            doc = self.spacy_nlp(text)
            
            analysis = {
                'tokens': [token.text for token in doc],
                'lemmas': [token.lemma_ for token in doc],
                'pos_tags': [token.pos_ for token in doc],
                'entities': [(ent.text, ent.label_) for ent in doc.ents],
                'sentiment': self._analyze_sentiment(doc),
                'intent': self._extract_intent(doc),
                'keywords': self._extract_keywords(doc),
                'complexity': len(doc.sents),
                'confidence': self._calculate_nlp_confidence(doc)
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"❌ spaCy analysis error: {e}")
            return {}
    
    def _analyze_sentiment(self, doc) -> Dict[str, float]:
        """Analyze sentiment of the text"""
        # Simple sentiment analysis based on token sentiment
        positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic']
        negative_words = ['bad', 'terrible', 'awful', 'horrible', 'disappointing']
        
        tokens = [token.text.lower() for token in doc]
        positive_score = sum(1 for word in tokens if word in positive_words)
        negative_score = sum(1 for word in tokens if word in negative_words)
        
        total_words = len(tokens)
        if total_words == 0:
            return {'positive': 0.0, 'negative': 0.0, 'neutral': 1.0}
        
        positive_ratio = positive_score / total_words
        negative_ratio = negative_score / total_words
        neutral_ratio = 1.0 - positive_ratio - negative_ratio
        
        return {
            'positive': positive_ratio,
            'negative': negative_ratio,
            'neutral': max(0.0, neutral_ratio)
        }
    
    def _extract_intent(self, doc) -> str:
        """Extract user intent from the text"""
        # Simple intent classification based on patterns
        text_lower = doc.text.lower()
        
        if any(word in text_lower for word in ['what', 'how', 'when', 'where', 'why', 'who']):
            return 'question'
        elif any(word in text_lower for word in ['please', 'can you', 'could you', 'would you']):
            return 'request'
        elif any(word in text_lower for word in ['create', 'make', 'build', 'generate']):
            return 'creation'
        elif any(word in text_lower for word in ['analyze', 'process', 'enhance', 'improve']):
            return 'analysis'
        elif any(word in text_lower for word in ['hello', 'hi', 'hey', 'greetings']):
            return 'greeting'
        else:
            return 'general'
    
    def _extract_keywords(self, doc) -> List[str]:
        """Extract important keywords from the text"""
        keywords = []
        
        for token in doc:
            # Include nouns, proper nouns, and adjectives
            if (token.pos_ in ['NOUN', 'PROPN', 'ADJ'] and 
                not token.is_stop and 
                not token.is_punct and 
                len(token.text) > 2):
                keywords.append(token.lemma_.lower())
        
        return list(set(keywords))  # Remove duplicates
    
    def _calculate_nlp_confidence(self, doc) -> float:
        """Calculate confidence score for NLP analysis"""
        # Simple confidence based on text characteristics
        factors = []
        
        # Length factor
        length_score = min(1.0, len(doc) / 50)  # Optimal around 50 tokens
        factors.append(length_score)
        
        # Entity recognition factor
        entity_score = min(1.0, len(doc.ents) / 5)  # More entities = higher confidence
        factors.append(entity_score)
        
        # Sentence structure factor
        complete_sentences = sum(1 for sent in doc.sents if len(sent) > 3)
        structure_score = min(1.0, complete_sentences / len(list(doc.sents)) if doc.sents else 0)
        factors.append(structure_score)
        
        return sum(factors) / len(factors) if factors else 0.5
    
    async def _enhance_with_ken(self, text: str, nlp_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance processing with K.E.N. algorithms"""
        try:
            if not self.ken_engine:
                return {'enhancement_factor': 1.0, 'processed_text': text}
            
            enhancement_request = {
                'input_text': text,
                'nlp_context': nlp_analysis,
                'enhancement_level': self.config['ken_integration']['enhancement_level'],
                'algorithm_set': self.config['ken_integration']['algorithm_set'],
                'voice_context': True
            }
            
            enhanced_result = await self.ken_engine.enhance_voice_input(enhancement_request)
            
            return enhanced_result
            
        except Exception as e:
            logger.error(f"❌ K.E.N. enhancement error: {e}")
            return {'enhancement_factor': 1.0, 'processed_text': text}
    
    async def _process_with_jarvis(self, text: str, nlp_analysis: Dict[str, Any], 
                                 ken_enhanced: Dict[str, Any]) -> Dict[str, Any]:
        """Process with J.A.R.V.I.S. consciousness"""
        try:
            if not self.jarvis_connector:
                return {'response': text, 'confidence': 0.5}
            
            jarvis_request = {
                'original_text': text,
                'nlp_analysis': nlp_analysis,
                'ken_enhancement': ken_enhanced,
                'conversation_context': self.conversation_context[-5:],  # Last 5 exchanges
                'consciousness_level': self.config['jarvis_integration']['consciousness_level'],
                'voice_interaction': True
            }
            
            jarvis_response = await self.jarvis_connector.process_voice_interaction(jarvis_request)
            
            return jarvis_response
            
        except Exception as e:
            logger.error(f"❌ J.A.R.V.I.S. processing error: {e}")
            return {'response': f"I understand you said: {text}", 'confidence': 0.5}
    
    async def _generate_response(self, jarvis_response: Dict[str, Any]) -> str:
        """Generate final response text"""
        try:
            response_text = jarvis_response.get('response', 'I apologize, I did not understand that.')
            
            # Add personality and context
            if jarvis_response.get('confidence', 0) > 0.8:
                # High confidence response
                return response_text
            elif jarvis_response.get('confidence', 0) > 0.5:
                # Medium confidence response
                return f"I believe {response_text.lower()}"
            else:
                # Low confidence response
                return f"I'm not entirely sure, but {response_text.lower()}"
                
        except Exception as e:
            logger.error(f"❌ Response generation error: {e}")
            return "I apologize, I encountered an error processing your request."
    
    async def _speak_response(self, text: str):
        """Convert text to speech and play"""
        try:
            # Run TTS in separate thread to avoid blocking
            def speak():
                self.tts_engine.say(text)
                self.tts_engine.runAndWait()
            
            thread = threading.Thread(target=speak, daemon=True)
            thread.start()
            
            # Wait for speech to complete (with timeout)
            thread.join(timeout=30)
            
        except Exception as e:
            logger.error(f"❌ Text-to-speech error: {e}")
    
    def _update_metrics(self, processing_time: float, success: bool):
        """Update performance metrics"""
        self.metrics['total_requests'] += 1
        
        if success:
            self.metrics['successful_recognitions'] += 1
        
        # Update average processing time
        current_avg = self.metrics['average_processing_time']
        total_requests = self.metrics['total_requests']
        
        self.metrics['average_processing_time'] = (
            (current_avg * (total_requests - 1) + processing_time) / total_requests
        )
    
    async def stop_listening(self):
        """Stop voice listening"""
        self.is_listening = False
        logger.info("🔇 Voice listening stopped")
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current performance metrics"""
        success_rate = (
            self.metrics['successful_recognitions'] / self.metrics['total_requests']
            if self.metrics['total_requests'] > 0 else 0
        )
        
        return {
            **self.metrics,
            'success_rate': success_rate,
            'conversation_length': len(self.conversation_context)
        }
    
    def get_conversation_history(self) -> List[Dict[str, Any]]:
        """Get conversation history"""
        return self.conversation_context.copy()
    
    async def process_text_input(self, text: str) -> str:
        """Process text input (for testing without voice)"""
        try:
            # Simulate audio processing pipeline without actual audio
            nlp_analysis = await self._analyze_with_spacy(text)
            ken_enhanced = await self._enhance_with_ken(text, nlp_analysis)
            jarvis_response = await self._process_with_jarvis(text, nlp_analysis, ken_enhanced)
            response_text = await self._generate_response(jarvis_response)
            
            return response_text
            
        except Exception as e:
            logger.error(f"❌ Text processing error: {e}")
            return "I apologize, I encountered an error processing your request."

# Factory function for easy initialization
async def create_voice_engine(config: Dict[str, Any] = None) -> WhisperSpaCyVoiceEngine:
    """Create and initialize voice engine"""
    engine = WhisperSpaCyVoiceEngine(config)
    await engine.initialize()
    return engine

# Example usage
async def main():
    """Example usage of the voice engine"""
    try:
        # Create voice engine
        voice_engine = await create_voice_engine()
        
        # Test text processing
        response = await voice_engine.process_text_input(
            "Hello J.A.R.V.I.S., can you enhance this text with K.E.N. algorithms?"
        )
        print(f"Response: {response}")
        
        # Start continuous listening (uncomment for voice input)
        # await voice_engine.listen_continuously()
        
    except Exception as e:
        logger.error(f"❌ Voice engine error: {e}")

if __name__ == "__main__":
    asyncio.run(main())

