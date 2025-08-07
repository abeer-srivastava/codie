import { useState, useRef, useEffect } from "react";

// Icon components using Unicode symbols
const PlayIcon = () => <span>▶</span>;
const SaveIcon = () => <span>💾</span>;
const UploadIcon = () => <span>📤</span>;
const CopyIcon = () => <span>📋</span>;
const UsersIcon = () => <span>👥</span>;
const SettingsIcon = () => <span>⚙️</span>;
const FileTextIcon = () => <span>📄</span>;
const MaximizeIcon = () => <span>⛶</span>;
const MinimizeIcon = () => <span>⊟</span>;
const UndoIcon = () => <span>↶</span>;
const RedoIcon = () => <span>↷</span>;
const PaletteIcon = () => <span>🎨</span>;
const MoonIcon = () => <span>🌙</span>;
const SunIcon = () => <span>☀️</span>;

// Mock Socket.io functionality for demo purposes
interface MockSocket {
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string) => void;
}

const mockSocket: MockSocket = {
  emit: (event: string, data?: any) => {
    console.log(`Emitting ${event}:`, data);
  },
  on: (event: string, callback: (...args: any[]) => void) => {
    console.log(`Listening for ${event}`);
  },
  off: (event: string) => {
    console.log(`Stopped listening for ${event}`);
  }
};
export default function CodeEditor() {
  const [code, setCode] = useState(`// Welcome to the Enhanced Code Editor
function greetUser(name) {
  return \`Hello, \${name}! Welcome to collaborative coding.\`;
}

const user = "Developer";
console.log(greetUser(user));

// Try running this code!`);
  
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [output, setOutput] = useState("");
  const [isOutputVisible, setIsOutputVisible] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState(3);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  const [minimap, setMinimap] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(true);

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "json", label: "JSON" },
    { value: "markdown", label: "Markdown" }
  ];

  const themes = [
    { value: "vs-dark", label: "Dark" },
    { value: "light", label: "Light" },
    { value: "hc-black", label: "High Contrast" }
  ];

  useEffect(() => {
    // Mock socket connection
    mockSocket.on("code-change", (newCode) => {
      setCode(newCode);
    });

    mockSocket.on("user-count", (count) => {
      setConnectedUsers(count);
    });

    return () => {
      mockSocket.off("code-change");
      mockSocket.off("user-count");
    };
  }, []);

  const handleChange = (value) => {
    if (value !== undefined) {
      // Add to undo stack
      setUndoStack(prev => [...prev.slice(-19), code]); // Keep last 20 states
      setRedoStack([]); // Clear redo stack on new change
      
      setCode(value);
      mockSocket.emit("code-change", value);
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.updateOptions({
      fontSize: fontSize,
      wordWrap: wordWrap ? "on" : "off",
      minimap: { enabled: minimap },
      lineNumbers: lineNumbers ? "on" : "off",
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      detectIndentation: false,
    });
  };

  const runCode = () => {
    setIsOutputVisible(true);
    
    if (language === "javascript") {
      try {
        // Create a mock console for capturing output
        const logs = [];
        const mockConsole = {
          log: (...args) => logs.push(args.join(" ")),
          error: (...args) => logs.push("Error: " + args.join(" ")),
          warn: (...args) => logs.push("Warning: " + args.join(" "))
        };
        
        // Create a function with mock console
        const func = new Function("console", code);
        func(mockConsole);
        
        setOutput(logs.join("\n") || "Code executed successfully (no output)");
      } catch (error) {
        setOutput(`Error: ${error.message}`);
      }
    } else {
      setOutput(`Code execution simulation for ${language}:\n\nCode would be executed on server...\n\n${code.slice(0, 100)}${code.length > 100 ? "..." : ""}`);
    }
  };

  const saveFile = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${language === "javascript" ? "js" : language === "typescript" ? "ts" : language === "python" ? "py" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileLoad = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === "string") {
          setCode(content);
          mockSocket.emit("code-change", content);
        }
      };
      reader.readAsText(file);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const previous = undoStack[undoStack.length - 1];
      setRedoStack(prev => [code, ...prev.slice(0, 19)]);
      setUndoStack(prev => prev.slice(0, -1));
      setCode(previous);
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[0];
      setUndoStack(prev => [...prev, code]);
      setRedoStack(prev => prev.slice(1));
      setCode(next);
    }
  };

  const formatCode = () => {
    // Basic formatting simulation
    if (language === "javascript" || language === "typescript") {
      const formatted = code
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .replace(/;/g, ';\n')
        .replace(/{/g, ' {\n')
        .replace(/}/g, '\n}');
      setCode(formatted);
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full'} ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl overflow-hidden shadow-2xl flex flex-col`}>
      {/* Header Bar */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border-b p-3 flex items-center justify-between`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border rounded px-2 py-1 text-sm`}
            >
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
            
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className={`${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border rounded px-2 py-1 text-sm`}
            >
              {themes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={undo}
              disabled={undoStack.length === 0}
              className={`p-2 rounded hover:bg-opacity-80 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} ${undoStack.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Undo"
            >
              <UndoIcon />
            </button>
            
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className={`p-2 rounded hover:bg-opacity-80 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} ${redoStack.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Redo"
            >
              <RedoIcon />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <UsersIcon />
            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{connectedUsers}</span>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded hover:bg-opacity-80 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            title="Toggle Theme"
          >
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded hover:bg-opacity-80 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            title="Settings"
          >
            <SettingsIcon />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-2 rounded hover:bg-opacity-80 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {isSettingsOpen && (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border-b p-4`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <label className={`block mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Font Size</label>
              <input
                type="range"
                min="10"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
              />
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{fontSize}px</span>
            </div>
            
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={wordWrap}
                  onChange={(e) => setWordWrap(e.target.checked)}
                  className="rounded"
                />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Word Wrap</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={minimap}
                  onChange={(e) => setMinimap(e.target.checked)}
                  className="rounded"
                />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Minimap</span>
              </label>
            </div>
            
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={lineNumbers}
                  onChange={(e) => setLineNumbers(e.target.checked)}
                  className="rounded"
                />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Line Numbers</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className={`${isDarkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-300'} border-b p-2 flex items-center space-x-2`}>
        <button
          onClick={runCode}
          className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
        >
          <PlayIcon />
          <span>Run</span>
        </button>
        
        <div className="w-px h-6 bg-gray-300"></div>
        
        <button
          onClick={saveFile}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
          title="Save File"
        >
          <SaveIcon />
          <span>Save</span>
        </button>
        
        <button
          onClick={loadFile}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
          title="Load File"
        >
          <UploadIcon />
          <span>Load</span>
        </button>
        
        <button
          onClick={copyCode}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
          title="Copy Code"
        >
          <CopyIcon />
          <span>Copy</span>
        </button>
        
        <button
          onClick={formatCode}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
          title="Format Code"
        >
          <PaletteIcon />
          <span>Format</span>
        </button>
        
        <div className="flex-1"></div>
        
        <button
          onClick={() => setIsOutputVisible(!isOutputVisible)}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} ${isOutputVisible ? 'bg-blue-600 text-white' : ''}`}
        >
          <FileTextIcon />
          <span>Output</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Editor */}
        <div className={`${isOutputVisible ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
          <div className="w-full h-full">
            {/* Mock Monaco Editor */}
            <textarea
              value={code}
              onChange={(e) => handleChange(e.target.value)}
              className={`w-full h-full p-4 font-mono text-sm resize-none border-none outline-none ${
                isDarkMode 
                  ? 'bg-gray-900 text-gray-100' 
                  : 'bg-white text-gray-900'
              }`}
              style={{ fontSize: `${fontSize}px` }}
              spellCheck={false}
              placeholder="// Start coding..."
            />
          </div>
        </div>

        {/* Output Panel */}
        {isOutputVisible && (
          <div className={`w-1/3 border-l ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'} flex flex-col`}>
            <div className={`p-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-300 bg-gray-100'} flex items-center justify-between`}>
              <h3 className={`font-medium text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Output</h3>
              <button
                onClick={() => setOutput("")}
                className={`text-xs px-2 py-1 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
              >
                Clear
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <pre className={`text-sm font-mono whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {output || "No output yet. Run your code to see results."}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileLoad}
        accept=".js,.ts,.py,.java,.cpp,.html,.css,.json,.md,.txt"
        style={{ display: "none" }}
      />
    </div>
  );
}