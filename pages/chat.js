// pages/chat.js
import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim()) {
      const newMessages = [...messages, { text: input, sender: "user" }];
      
      // Check for special command to render iframe
      if (input.toLowerCase() === "art-tour") {
        newMessages.push({
          text: "",
          sender: "iframe",
        });
      }

      setMessages(newMessages);
      setInput("");
    }
  };

  return (
    <div style={styles.container}>
      {/* Chat Header */}
      <div style={styles.header}>
        <h3>Chat Room</h3>
      </div>

      {/* Chat Messages */}
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              ...(msg.sender === "user" ? styles.userMessage : styles.botMessage),
            }}
          >
            {msg.sender === "iframe" ? (
              <iframe
                src="/art-tour.html"
                style={styles.iframe}
                title="Art Tour"
                frameBorder="0"
              ></iframe>
            ) : (
              msg.text
            )}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div style={styles.inputBox}>
        <input
          style={styles.input}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.sendButton} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    maxWidth: "600px",
    margin: "0 auto",
    border: "1px solid #ddd",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  header: {
    padding: "10px",
    backgroundColor: "#007BFF",
    color: "white",
    textAlign: "center",
  },
  chatBox: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    backgroundColor: "#f9f9f9",
  },
  message: {
    margin: "5px 0",
    padding: "10px",
    borderRadius: "10px",
    maxWidth: "80%",
    wordWrap: "break-word",
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  botMessage: {
    
  },
  iframe: {
  },
  inputBox: {
    display: "flex",
    padding: "10px",
    backgroundColor: "white",
    borderTop: "1px solid #ddd",
  },
  input: {
    flex: 1,
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "5px",
  },
  sendButton: {
    marginLeft: "10px",
    padding: "10px 15px",
    fontSize: "16px",
    color: "white",
    backgroundColor: "#007BFF",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};
