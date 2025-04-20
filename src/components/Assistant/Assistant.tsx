"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import styles from "./styles.module.scss";
import { generateAIResponse } from "../../services/assistant";
import { usePreview } from "../../context/PreviewContext";
import { Card } from "../Card";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MovieRecommendation {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  year?: string;
}

interface MovieItem {
  id: number;
  poster_path: string;
  title: string;
  [key: string]: any;
}

// Speech Recognition type definitions
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function NetflixAssistant() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I can recommend movies or shows. Try asking for something like 'Give me action movies.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { onUpdatePreview } = usePreview();

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onstart = () => {
          console.log("Result>>>");
          setIsListening(true);
          setTranscript("");
        };

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const result = event.results[current];
          console.log("Result>>>", result);
          const transcript = result[0].transcript;
          setTranscript(transcript);

          if (result.isFinal) {
            setInput(transcript);
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const createMessage = (
    role: "user" | "assistant",
    content: string,
  ): Message => ({
    role,
    content,
  });

  const appendMessage = (newMessage: Message) => {
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    setInput("");
    const userMessage = createMessage("user", trimmedInput);
    appendMessage(userMessage);
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse([...messages, userMessage]);
      appendMessage(createMessage("assistant", aiResponse));
    } catch (error) {
      console.error("Error getting recommendations:", error);
      appendMessage(
        createMessage(
          "assistant",
          "Sorry, I had trouble finding recommendations. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
    if (isMinimized) setIsMinimized(false);
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  const toggleVoiceRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        alert("Speech recognition is not supported in your browser.");
      }
    }
  };

  const isJson = (str: string): boolean => {
    if (typeof str !== "string") return false;
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const updatePreviewCB = (item: MovieItem): void => {
    onUpdatePreview(item);
    setIsOpen(false);
  };

  const MovieRow: React.FC<{ movies: MovieItem[] }> = ({ movies }) => (
    <div className={styles.movieRow}>
      <div className={styles.movieRowListArea}>
        <div className={styles.movieRowList} style={{ maxWidth: 200 }}>
          {movies.map((item, index) => (
            <Card
              key={`${item.id}_${index}`}
              poster_path={item.poster_path}
              onClick={() => updatePreviewCB(item)}
              title={item.title}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const processMessageContent = (content: string): React.ReactNode => {
    if (!isJson(content)) return content;

    try {
      const movieList = JSON.parse(content);
      if (Array.isArray(movieList) && movieList.length > 0) {
        return <MovieRow movies={movieList} />;
      }
    } catch {
      // If there's any error parsing or processing the JSON, return original content
      console.warn("Failed to process message content as movie list");
    }

    return content;
  };

  return (
    <>
      <button
        onClick={toggleAssistant}
        className={`${styles.chatButton} ${
          isOpen ? styles.chatButtonHidden : ""
        }`}
      >
        <svg
          className={styles.chatIcon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          ></path>
        </svg>
      </button>

      <div
        className={`
        ${styles.chatWindow} 
        ${isOpen ? styles.chatWindowOpen : styles.chatWindowClosed}
        ${isMinimized ? styles.chatWindowMinimized : ""}
      `}
      >
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderLeft}>
            <div className={styles.chatLogo}>
              <svg
                className={styles.chatLogoIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                ></path>
              </svg>
            </div>
            <h3 className={styles.chatTitle}>Netflix Assistant</h3>
          </div>
          <div className={styles.chatHeaderRight}>
            <button
              onClick={toggleMinimize}
              className={styles.chatHeaderButton}
            >
              {isMinimized ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.chatHeaderIcon}
                >
                  <path
                    d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.chatHeaderIcon}
                >
                  <path
                    d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={toggleAssistant}
              className={styles.chatHeaderButton}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.chatHeaderIcon}
              >
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {!isMinimized && (
          <div className={styles.chatMessages}>
            <div className={styles.messagesContainer}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`${styles.message} ${
                    message.role === "user"
                      ? styles.userMessage
                      : styles.assistantMessage
                  }`}
                >
                  <div className={styles.messageContent}>
                    {processMessageContent(message.content)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={`${styles.message} ${styles.assistantMessage}`}>
                  <div className={styles.messageContent}>
                    <div className={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              {isListening && (
                <div className={`${styles.message} ${styles.userMessage}`}>
                  <div className={styles.messageContent}>
                    <div className={styles.listeningIndicator}>
                      <div className={styles.listeningDot}></div>
                      <p>{transcript || "Listening..."}</p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {!isMinimized && (
          <div className={styles.chatInputContainer}>
            <div className={styles.chatInputWrapper}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for movie recommendations..."
                className={styles.chatInput}
              />
              <button
                className={`${styles.voiceButton} ${
                  isListening ? styles.voiceButtonActive : ""
                }`}
                onClick={toggleVoiceRecognition}
              >
                {isListening ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.voiceIcon}
                  >
                    <path
                      d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 3l18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.voiceIcon}
                  >
                    <path
                      d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className={styles.sendButton}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.sendIcon}
              >
                <path
                  d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isListening && (
              <div className={styles.voiceStatus}>
                <div className={styles.voiceStatusIndicator}>
                  <span className={styles.voiceStatusDot}></span>
                  Voice recognition active
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
