"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  onGenerate: (input: string) => void;
  isLoading: boolean;
};

export default function InputPanel({ onGenerate, isLoading }: Props) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("このブラウザは音声入力に対応していません");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    onGenerate(text);
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <h2 className="text-lg font-bold text-gray-800">入力</h2>
      <textarea
        className="flex-1 min-h-[200px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        placeholder="患者の情報や観察内容を入力してください...&#10;&#10;例：&#10;田中太郎さん、78歳男性。本日朝から頭痛の訴えあり。&#10;BP 150/90、P 78、T 36.8。食事摂取量は昼食5割。&#10;「頭が重い感じがする」と話される。"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={toggleListening}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isListening
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {isListening ? "⏹ 録音停止" : "🎤 音声入力"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !text.trim()}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "生成中..." : "SOAP生成"}
        </button>
      </div>
    </div>
  );
}
