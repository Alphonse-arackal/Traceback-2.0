import { useState } from 'react'
import { Search, Paperclip, MoreVertical, Send } from 'lucide-react'
import { conversations } from '../data/mockData'

export default function Messages({ activeChat, setActiveChat }) {
  const [messages, setMessages] = useState({
    0: [
      { from: 'them', text: 'Hi, I think I found the wallet you posted about.' },
      { from: 'me', text: 'Really? Can you send a photo?' },
      {
        from: 'them',
        image:
          'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500',
      },
      { from: 'me', text: "Yes, that's mine! Where can we meet?" },
      { from: 'them', text: 'We can meet near Thrissur bus stand.' },
    ],
  })
  const [draft, setDraft] = useState('')

  const chat = conversations[activeChat]
  const current = messages[activeChat] || []

  const send = () => {
    if (!draft.trim()) return

    setMessages((prevMessages) => ({
      ...prevMessages,
      [activeChat]: [
        ...(prevMessages[activeChat] || []),
        { from: 'me', text: draft },
      ],
    }))
    setDraft('')
  }

  return (
    <section className="messages-page">
      <aside className="chat-list">
        <h2>Chat</h2>

        <label className="chat-search">
          <Search size={15} />
          <input placeholder="Search conversations" />
        </label>

        {conversations.map((conversation, index) => (
          <button
            key={conversation.name}
            onClick={() => setActiveChat(index)}
            className={`conversation ${activeChat === index ? 'active' : ''}`}
          >
            <span className="chat-avatar">{conversation.avatar}</span>
            <span className="conversation-copy">
              <b>{conversation.name}</b>
              <small>{conversation.preview}</small>
            </span>
            <time>{conversation.time}</time>
          </button>
        ))}
      </aside>

      <div className="chat-window">
        <div className="chat-header">
          <span className="chat-avatar"> {chat.avatar} </span>
          <div>
            <b>{chat.name}</b>
            <small>Last seen recently</small>
          </div>
          <button>
            <MoreVertical />
          </button>
        </div>

        <div className="chat-messages">
          {current.map((message, index) => (
            <div className={`message-row ${message.from}`} key={index}>
              {message.text && <p>{message.text}</p>}
              {message.image && <img src={message.image} />}
            </div>
          ))}
        </div>

        <div className="message-composer">
          <button>
            <Paperclip size={18} />
          </button>

          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') send()
            }}
            placeholder="Type a message..."
          />

          <button className="send-button" onClick={send}>
            <Send size={17} />
          </button>
        </div>
      </div>
    </section>
  )
}
