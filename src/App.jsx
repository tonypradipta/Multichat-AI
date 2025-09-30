import { useState, useEffect, useRef } from "react";

// Import data models dari file yang sebenarnya
const models = [
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
  { id: "gemini-1.5-flash", name: "Gemini Flash", provider: "Google" },
  { id: "mistral-large-latest", name: "Mistral Large", provider: "Mistral" },
  { id: "deepseek-chat", name: "DeepSeek Chat", provider: "DeepSeek" }
];

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [aiReady, setAiReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Untuk testing, langsung set AI ready setelah 1 detik
    const timer = setTimeout(() => {
      setAiReady(true);
    }, 1000);

    // Jika Puter tersedia, gunakan itu
    const checkReady = setInterval(() => {
      if (window.puter?.ai?.chat) {
        setAiReady(true);
        clearInterval(checkReady);
        clearTimeout(timer);
      }
    }, 300);

    return () => {
      clearInterval(checkReady);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (content, isUser) => {
    setMessages((prev) => [...prev, { content, isUser, id: Date.now() + Math.random() }]);
  };

  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message || !aiReady) return;

    addMessage(message, true);
    setInputValue("");
    setIsLoading(true);

    try {
      // Cek apakah Puter AI tersedia
      if (window.puter?.ai?.chat) {
        const conversation = [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          ...messages.map((msg) => ({
            role: msg.isUser ? "user" : "assistant",
            content: msg.content
          })),
          { role: "user", content: message }
        ];

        const response = await window.puter.ai.chat(conversation, { model: selectedModel });
        const reply = 
          typeof response === "string"
            ? response
            : response.message?.content || "🤖 No reply received.";
        addMessage(reply, false);
      } else {
        // Simulasi response untuk demo (jika Puter tidak tersedia)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const currentModel = models.find((m) => m.id === selectedModel) || models[0];
        
        const demoResponses = [
          `Halo! Saya adalah ${currentModel.name} dari ${currentModel.provider}. Ini adalah mode demo karena Puter.js API tidak terdeteksi. Pesan Anda: "${message}" telah diterima.`,
          `${currentModel.name} di sini! Untuk menggunakan AI sesungguhnya, aplikasi ini perlu dijalankan di platform Puter.com. Sementara ini, saya dalam mode simulasi.`,
          `Terima kasih atas pesan Anda: "${message}". Saya adalah ${currentModel.name} dalam mode demo. Untuk fitur lengkap, deploy aplikasi ini ke Puter.com.`,
          `Mode simulasi aktif. ${currentModel.name} (${currentModel.provider}) menerima pertanyaan Anda. Untuk respons AI yang sebenarnya, gunakan Puter SDK.`
        ];
        
        const reply = demoResponses[Math.floor(Math.random() * demoResponses.length)];
        addMessage(reply, false);
      }

    } catch (err) {
      console.error("Error:", err);
      addMessage(`❌ Error: ${err.message || "Could not get response from AI"}`, false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleModelChange = (e) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    const model = models.find((m) => m.id === newModel);
    addMessage(`🤖 Switched to ${model.name} (${model.provider})`, false);
  };

  const currentModel = models.find((m) => m.id === selectedModel) || models[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-8">
        <h1 className="text-6xl sm:text-7xl bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent text-center font-bold">
          Multi-Model AI Chat
        </h1>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className={`px-4 py-2 rounded-full text-sm ${aiReady ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/20"}`}>
            {aiReady ? "✅ AI Ready" : "🤖 Waiting for AI..."}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-300 text-sm">Model:</span>
            <select 
              value={selectedModel} 
              onChange={handleModelChange} 
              disabled={!aiReady} 
              className="bg-emerald-950/80 border border-emerald-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {models.map((model) => (
                <option 
                  key={model.id} 
                  value={model.id} 
                  className="bg-emerald-950"
                >
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full max-w-2xl bg-gradient-to-br from-emerald-950/90 to-teal-950/90 backdrop-blur-md border border-emerald-700 rounded-2xl p-6 shadow-2xl shadow-emerald-900/50">
          <div className="flex items-center justify-center mb-4 p-2 bg-gradient-to-r from-emerald-600/20 to-teal-500/20 rounded-xl border border-emerald-500/30">
            <span className="text-emerald-300 text-sm font-medium">
              🤖 Currently using: {currentModel.name} ({currentModel.provider})
            </span>
          </div>

          <div className="h-96 overflow-y-auto border-b border-emerald-700 mb-6 p-4 bg-gradient-to-b from-gray-900/50 to-emerald-950/30 rounded-2xl">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                <p>💬 Start the conversation by typing a message below.</p>
                <br />
                <span className="text-xs text-gray-500 mt-2 block">
                  Try different AI models to see how they respond!
                </span>
              </div>
            )}

            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`p-3 m-2 rounded-2xl w-fit max-w-[80%] ${
                  msg.isUser 
                    ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white ml-auto shadow-lg shadow-emerald-900/30" 
                    : "bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-lg shadow-teal-900/30"
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="p-3 m-2 rounded-2xl max-w-xs bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  {currentModel.name} is thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef}></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              onKeyDown={handleKeyPress} 
              placeholder={aiReady ? `Ask ${currentModel.name} anything...` : "Waiting for AI to be ready..."} 
              disabled={!aiReady || isLoading} 
              className="flex-1 px-4 py-3 bg-emerald-900/30 border border-emerald-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:shadow-xl focus:shadow-emerald-700/50 transition duration-400 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            <button 
              onClick={sendMessage} 
              disabled={!aiReady || isLoading || !inputValue.trim()} 
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-2xl transition shadow-lg shadow-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  Sending
                </div>
              ) : (
                "Send"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 mt-8 border-t border-emerald-800/50 bg-gradient-to-r from-emerald-950/80 to-teal-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <p className="text-center text-emerald-300/80 text-sm">
            © 2024 <span className="font-semibold text-emerald-400">@tonypradipta</span> - All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;