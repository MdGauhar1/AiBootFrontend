import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  userText = '';
  aiResponse = '';
  voices: SpeechSynthesisVoice[] = [];
  utter: SpeechSynthesisUtterance | null = null;
  synth = window.speechSynthesis;

  // ✅ NEW: Chat history array
  chatHistory: { user: string; ai: string }[] = JSON.parse(localStorage.getItem('chatHistory') || '[]');


  constructor(private http: HttpClient) {
    speechSynthesis.onvoiceschanged = () => {
      this.voices = speechSynthesis.getVoices();
    };
    if (speechSynthesis.getVoices().length > 0) {
      this.voices = speechSynthesis.getVoices();
    }
  }

  startListening() {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = (event: any) => {
      this.userText = event.results[0][0].transcript;
      this.sendToAI(this.userText);
    };
  }


  sendToAI(text: string) {
  this.http.post("https://aibootspringboot.onrender.com/api/ask", { message: text }, { responseType: 'text' })
    .subscribe(response => {
      this.aiResponse = response;
      this.speak(response);

      this.chatHistory.push({ user: text, ai: response });

      // ✅ Save updated chat history
      localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
    });
}


  speak(text: string) {
    if (this.synth.speaking) {
      this.synth.cancel();
    }

    this.utter = new SpeechSynthesisUtterance(text);

    const femaleVoice = this.voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.toLowerCase().includes('female') || v.name.includes('Google UK English Female'))
    );

    if (femaleVoice) {
      this.utter.voice = femaleVoice;
    }

    this.synth.speak(this.utter);
  }

  stopSpeaking() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
  }

  clearHistory() {
  this.chatHistory = [];
  localStorage.removeItem('chatHistory');
}

}
