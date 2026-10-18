import { useContext, useState, useEffect, useRef } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

export const InboxModal = () => {
    const {
        backend_url,
        token,
        user,
        isInboxOpen,
        setIsInboxOpen,
        activeChatPartner,
        setActiveChatPartner,
        fetchUnreadDmCount,
        fetchNotifications
    } = useContext(AppContext)

    const [conversations, setConversations] = useState([])
    const [messages, setMessages] = useState([])
    const [loadingConversations, setLoadingConversations] = useState(false)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [messageText, setMessageText] = useState('')
    const [sending, setSending] = useState(false)

    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    // Fetch conversation list
    const loadConversations = async () => {
        if (!token) return
        try {
            setLoadingConversations(true)
            const { data } = await axios.get(
                `${backend_url}/api/chat/conversations`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                setConversations(data.conversations || [])
            }
        } catch (error) {
            console.error("Failed to load conversations:", error)
        } finally {
            setLoadingConversations(false)
        }
    }

    // Fetch messages for active partner
    const loadMessages = async (partnerId, isSilent = false) => {
        if (!token || !partnerId) return
        try {
            if (!isSilent) setLoadingMessages(true)
            const { data } = await axios.get(
                `${backend_url}/api/chat/messages/${partnerId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (data.success) {
                setMessages(data.messages || [])
                // Refresh unread counts since messages with this partner are marked as read
                fetchUnreadDmCount()
                if (fetchNotifications) fetchNotifications()
            }
        } catch (error) {
            console.error("Failed to load messages:", error)
        } finally {
            if (!isSilent) setLoadingMessages(false)
        }
    }

    // Load conversations when modal opens
    useEffect(() => {
        if (isInboxOpen && token) {
            loadConversations()
        }
    }, [isInboxOpen, token])

    // Load messages when activeChatPartner changes
    useEffect(() => {
        if (activeChatPartner && activeChatPartner._id && isInboxOpen) {
            loadMessages(activeChatPartner._id)
        } else {
            setMessages([])
        }
    }, [activeChatPartner, isInboxOpen])

    // Scroll to bottom when messages update
    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Live polling for new messages every 3.5s while active chat is open
    useEffect(() => {
        if (!isInboxOpen || !activeChatPartner?._id || !token) return

        const interval = setInterval(() => {
            loadMessages(activeChatPartner._id, true)
            loadConversations()
        }, 3500)

        return () => clearInterval(interval)
    }, [isInboxOpen, activeChatPartner, token])

    const handleSelectConversation = (conv) => {
        setActiveChatPartner({
            _id: conv.partner_id,
            name: conv.partner_name,
            email: conv.partner_email
        })
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        const text = messageText.trim()
        if (!text || !activeChatPartner?._id || !token) return

        try {
            setSending(true)
            const recipientId = activeChatPartner._id

            // Optimistic update
            const tempMessage = {
                _id: 'temp_' + Date.now(),
                sender_id: user?._id,
                sender_name: user?.name,
                recipient_id: recipientId,
                recipient_name: activeChatPartner.name,
                text: text,
                created_at: new Date().toISOString(),
                is_read: false
            }
            setMessages(prev => [...prev, tempMessage])
            setMessageText('')

            const { data } = await axios.post(
                `${backend_url}/api/chat/send`,
                {
                    recipient_id: recipientId,
                    text: text
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (data.success && data.message) {
                // Replace temp message with server saved message
                setMessages(prev => prev.map(m => m._id === tempMessage._id ? data.message : m))
                loadConversations()
            } else {
                toast.error(data.message || "Failed to send message")
            }
        } catch (error) {
            console.error("Send message error:", error)
            const msg = error.response?.data?.detail || "Failed to send message"
            toast.error(msg)
        } finally {
            setSending(false)
        }
    }

    if (!isInboxOpen) return null

    return (
        <div className="fixed inset-0 sm:inset-auto sm:right-6 sm:bottom-6 sm:w-[780px] sm:h-[600px] bg-zinc-950/95 border border-purple-800/60 sm:rounded-3xl shadow-2xl backdrop-blur-2xl z-50 flex flex-col overflow-hidden animate-fadeIn text-white">

            {/* TOP HEADER */}
            <div className="px-5 py-3.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-sm shadow">
                        💬
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            Direct Messages
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        </h2>
                        <p className="text-xs text-zinc-400">
                            Private personal talks with verified community members
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsInboxOpen(false)}
                        className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-semibold"
                        title="Close Inbox"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* MAIN TWO-COLUMN CONTAINER */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT COLUMN: CONVERSATIONS LIST */}
                <div className={`w-full sm:w-72 bg-zinc-900/50 border-r border-zinc-800/80 flex flex-col ${activeChatPartner ? 'hidden sm:flex' : 'flex'}`}>
                    <div className="p-3.5 border-b border-zinc-800/60 bg-zinc-950/40 flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                            Conversations
                        </span>
                        <span className="text-xs font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-800/40">
                            {conversations.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/50">
                        {loadingConversations ? (
                            <p className="p-4 text-xs text-zinc-500 italic text-center">
                                Loading chats...
                            </p>
                        ) : conversations.length > 0 ? (
                            conversations.map((conv) => {
                                const isSelected = activeChatPartner?._id === conv.partner_id
                                return (
                                    <div
                                        key={conv.conversation_id}
                                        onClick={() => handleSelectConversation(conv)}
                                        className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all hover:bg-zinc-800/60 ${
                                            isSelected ? 'bg-purple-950/40 border-l-4 border-purple-600' : ''
                                        }`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow">
                                                {(conv.partner_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            {conv.unread_count > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-black shadow">
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <p className="text-xs font-semibold text-white truncate">
                                                    {conv.partner_name}
                                                </p>
                                                {conv.last_message?.created_at && (
                                                    <span className="text-[10px] text-zinc-500 shrink-0">
                                                        {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-zinc-400 truncate mt-0.5 leading-tight">
                                                {conv.last_message?.sender_id === user?._id && <span className="text-purple-400 font-medium">You: </span>}
                                                {conv.last_message?.text || 'Started a conversation'}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="p-6 text-center text-xs text-zinc-500 space-y-2">
                                <p>No conversations yet.</p>
                                <p className="text-zinc-400 text-[11px]">
                                    Click <span className="text-purple-400 font-semibold">"💬 Message"</span> next to any commenter in Community to start chatting!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: ACTIVE CHAT THREAD */}
                <div className={`flex-1 flex flex-col bg-zinc-950/60 ${!activeChatPartner ? 'hidden sm:flex' : 'flex'}`}>
                    {activeChatPartner ? (
                        <>
                            {/* ACTIVE CHAT TOP BAR */}
                            <div className="px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setActiveChatPartner(null)}
                                        className="sm:hidden text-zinc-400 hover:text-white text-sm font-bold p-1 cursor-pointer"
                                        title="Back to conversations"
                                    >
                                        ← Back
                                    </button>

                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow">
                                        {(activeChatPartner.name || 'U').charAt(0).toUpperCase()}
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-white leading-tight">
                                            {activeChatPartner.name}
                                        </p>
                                        <p className="text-[10px] font-mono text-zinc-500">
                                            ID: {activeChatPartner._id ? activeChatPartner._id.slice(-6) : 'Partner'}
                                        </p>
                                    </div>
                                </div>

                                <span className="text-[11px] text-green-400 bg-green-950/60 border border-green-800/50 px-2.5 py-0.5 rounded-full font-medium">
                                    Encrypted DM
                                </span>
                            </div>

                            {/* MESSAGES SCROLL AREA */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-black/40">
                                {loadingMessages ? (
                                    <p className="text-xs text-zinc-500 italic text-center py-6">
                                        Loading messages...
                                    </p>
                                ) : messages.length > 0 ? (
                                    messages.map((msg) => {
                                        const isMine = String(msg.sender_id) === String(user?._id)
                                        return (
                                            <div
                                                key={msg._id}
                                                className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md break-words ${
                                                        isMine
                                                            ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white rounded-tr-xs'
                                                            : 'bg-zinc-850 text-zinc-100 rounded-tl-xs border border-zinc-750'
                                                    }`}
                                                >
                                                    {msg.text}
                                                </div>

                                                <span className="text-[10px] text-zinc-500 mt-1 px-1">
                                                    {msg.created_at
                                                        ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        : ''}
                                                    {isMine && (
                                                        <span className="ml-1 text-purple-400">
                                                            {msg.is_read ? '✓✓' : '✓'}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="py-12 text-center text-xs text-zinc-500 space-y-2">
                                        <div className="text-2xl">👋</div>
                                        <p className="font-semibold text-zinc-300">
                                            Say hello to {activeChatPartner.name}!
                                        </p>
                                        <p className="text-[11px]">
                                            This is the start of your private direct messaging history.
                                        </p>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* CHAT INPUT FORM */}
                            <form
                                onSubmit={handleSendMessage}
                                className="p-3 bg-zinc-900/90 border-t border-zinc-800 flex gap-2 items-center"
                            >
                                <input
                                    type="text"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    placeholder={`Message ${activeChatPartner.name}...`}
                                    className="flex-1 bg-black border border-zinc-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-purple-600 transition-colors"
                                    disabled={sending}
                                    autoFocus
                                />

                                <button
                                    type="submit"
                                    disabled={sending || !messageText.trim()}
                                    className="bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md hover:shadow-purple-900/40 flex items-center gap-1.5 shrink-0"
                                >
                                    <span>Send</span>
                                    <span>➤</span>
                                </button>
                            </form>
                        </>
                    ) : (
                        /* WELCOME EMPTY STATE WHEN NO CHAT SELECTED */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 space-y-3">
                            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-purple-800/40 flex items-center justify-center text-3xl shadow-inner">
                                ✉️
                            </div>
                            <h3 className="text-base font-bold text-white">
                                Your Inbox
                            </h3>
                            <p className="text-xs max-w-sm leading-relaxed text-zinc-400">
                                Select a conversation from the left, or click <span className="text-purple-400 font-semibold">"💬 Message"</span> next to any user in Community Discussions to start a direct message!
                            </p>
                        </div>
                    )}
                </div>

            </div>

        </div>
    )
}

export default InboxModal
