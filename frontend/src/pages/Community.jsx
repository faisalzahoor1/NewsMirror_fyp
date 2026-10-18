import { useContext, useState, useEffect, useRef } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

export const Community = () => {
    const { backend_url, token, user, fetchNotifications, openChatWithUser } = useContext(AppContext)

    const [comments, setComments] = useState([])
    const [commentInputs, setCommentInputs] = useState({})
    const [submittingArticleId, setSubmittingArticleId] = useState(null)
    const [loadingComments, setLoadingComments] = useState(true)

    // Replies state
    const [replyingToId, setReplyingToId] = useState(null)
    const [replyInputs, setReplyInputs] = useState({})
    const [submittingReplyId, setSubmittingReplyId] = useState(null)

    // Like and Dislike reactions from MongoDB
    const [reactions, setReactions] = useState({})
    const [reactingArticleId, setReactingArticleId] = useState(null)

    // Interactive AI Bot chat
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: 'Hello! I am your NewsMirror AI Assistant. Ask me about any news — the latest NewsMirror headlines, a topic, current events, or details of a specific story.'
        }
    ])
    const [botInput, setBotInput] = useState('')
    const [botLoading, setBotLoading] = useState(false)
    const chatEndRef = useRef(null)

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, [messages, botLoading])

    const articles = [
        {
            id: "1",
            title: "AI Detects Bias in Political Coverage",
            source: "Global News",
            content:
                "NewsMirror AI analyzed multiple political articles and identified differences in sentiment and framing across mainstream media outlets.",
            likes: 120,
            dislikes: 12,
        },
        {
            id: "2",
            title: "Sports News Sentiment Analysis Released",
            source: "Sports Daily",
            content:
                "The platform analyzed emotional trends in sports journalism using advanced NLP and sentiment classification models.",
            likes: 87,
            dislikes: 5,
        },
        {
            id: "3",
            title: "Technology Innovations & AI Ethics Debate",
            source: "Tech Journal",
            content:
                "Industry leaders and researchers discuss the balance between rapid AI adoption and ethical journalism standards in global media.",
            likes: 142,
            dislikes: 8,
        },
    ]

    // Fetch all comments from MongoDB
    const fetchComments = async () => {
        try {
            setLoadingComments(true)
            const { data } = await axios.get(`${backend_url}/api/community/comments`)
            if (data.success) {
                setComments(data.comments || [])
            }
        } catch (error) {
            console.error("Failed to load comments from database:", error)
        } finally {
            setLoadingComments(false)
        }
    }

    // Fetch all reactions from MongoDB
    const fetchReactions = async () => {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {}
            const { data } = await axios.get(`${backend_url}/api/community/reactions`, { headers })
            if (data.success && data.reactions) {
                setReactions(data.reactions)
            }
        } catch (error) {
            console.error("Failed to load reactions from database:", error)
        }
    }

    useEffect(() => {
        fetchComments()
        fetchReactions()
    }, [backend_url, token])

    // Handle Like / Dislike click with MongoDB persistence
    const handleReaction = async (articleId, reactionType) => {
        if (!token) {
            toast.warning("Please login to react to articles")
            return
        }

        try {
            setReactingArticleId(articleId)
            const { data } = await axios.post(
                `${backend_url}/api/community/react`,
                {
                    article_id: String(articleId),
                    reaction_type: reactionType
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (data.success) {
                setReactions(prev => ({
                    ...prev,
                    [articleId]: {
                        likes: data.likes,
                        dislikes: data.dislikes,
                        user_reaction: data.user_reaction
                    }
                }))
            } else {
                toast.error(data.message || "Failed to update reaction")
            }
        } catch (error) {
            console.error("Reaction error:", error)
            const msg = error.response?.data?.detail || "Failed to update reaction"
            toast.error(msg)
        } finally {
            setReactingArticleId(null)
        }
    }

    const handleInputChange = (articleId, text) => {
        setCommentInputs(prev => ({
            ...prev,
            [articleId]: text
        }))
    }

    const handleReplyInputChange = (commentId, text) => {
        setReplyInputs(prev => ({
            ...prev,
            [commentId]: text
        }))
    }

    const handlePostComment = async (articleId) => {
        const text = (commentInputs[articleId] || '').trim()
        if (!text) {
            toast.warning("Please enter a comment before posting")
            return
        }

        if (!token) {
            toast.error("Please login to participate in discussions")
            return
        }

        try {
            setSubmittingArticleId(articleId)
            const { data } = await axios.post(
                `${backend_url}/api/community/comments`,
                {
                    article_id: String(articleId),
                    text: text
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (data.success && data.comment) {
                toast.success("Comment posted successfully!")
                setComments(prev => [...prev, data.comment])
                setCommentInputs(prev => ({
                    ...prev,
                    [articleId]: ''
                }))
            } else {
                toast.error(data.message || "Failed to post comment")
            }
        } catch (error) {
            console.error(error)
            const msg = error.response?.data?.detail || error.response?.data?.message || error.message || "Failed to post comment"
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg))
        } finally {
            setSubmittingArticleId(null)
        }
    }

    // Post Reply to a specific parent comment
    const handlePostReply = async (articleId, parentCommentId) => {
        const text = (replyInputs[parentCommentId] || '').trim()
        if (!text) {
            toast.warning("Please enter a reply before posting")
            return
        }

        if (!token) {
            toast.error("Please login to reply")
            return
        }

        try {
            setSubmittingReplyId(parentCommentId)
            const { data } = await axios.post(
                `${backend_url}/api/community/comments`,
                {
                    article_id: String(articleId),
                    parent_comment_id: String(parentCommentId),
                    text: text
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (data.success && data.comment) {
                toast.success("Reply posted successfully!")
                setComments(prev => [...prev, data.comment])
                setReplyInputs(prev => ({
                    ...prev,
                    [parentCommentId]: ''
                }))
                setReplyingToId(null)
                if (fetchNotifications) fetchNotifications()
            } else {
                toast.error(data.message || "Failed to post reply")
            }
        } catch (error) {
            console.error(error)
            const msg = error.response?.data?.detail || error.response?.data?.message || error.message || "Failed to post reply"
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg))
        } finally {
            setSubmittingReplyId(null)
        }
    }

    const handleDeleteComment = async (commentId) => {
        if (!token) return
        try {
            const { data } = await axios.delete(
                `${backend_url}/api/community/comments/${commentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            if (data.success) {
                toast.success("Comment deleted")
                // Remove comment and any replies to it
                setComments(prev => prev.filter(c => c._id !== commentId && c.parent_comment_id !== commentId))
            }
        } catch (error) {
            const msg = error.response?.data?.detail || "Could not delete comment"
            toast.error(msg)
        }
    }

    const formatDate = (isoString) => {
        if (!isoString) return ''
        try {
            const d = new Date(isoString)
            return d.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return isoString
        }
    }

    // Ask the Gemini-powered AI News Assistant (backend)
    const handleSendBotMessage = async () => {
        const q = botInput.trim()
        if (!q || botLoading) return

        if (!token) {
            toast.warning("Please login to chat with the AI assistant")
            return
        }

        // Last 10 messages as conversation context (skip the greeting)
        const history = messages
            .slice(1)
            .slice(-10)
            .map(m => ({ role: m.sender, text: m.text }))

        setMessages(prev => [...prev, { sender: 'user', text: q }])
        setBotInput('')

        try {
            setBotLoading(true)
            const { data } = await axios.post(
                `${backend_url}/api/community/bot/chat`,
                { message: q, history },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            setMessages(prev => [...prev, { sender: 'bot', text: data.reply, sources: data.sources || [] }])
        } catch (error) {
            const detail = error.response?.data?.detail
            const text = typeof detail === 'string' ? detail : "Sorry, I couldn't reach the AI assistant. Please try again."
            setMessages(prev => [...prev, { sender: 'bot', text, isError: true }])
        } finally {
            setBotLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white px-6 py-10">

            {/* PAGE TITLE */}
            <div className="mb-10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-purple-500">
                            Community Discussions
                        </h1>
                        <p className="mt-2 text-gray-400 max-w-2xl">
                            Join verified discussions on trending news. Reply to comments, react, and get notified whenever someone replies to your thoughts!
                        </p>
                    </div>

                    {user && (
                        <div className="flex items-center gap-3 bg-zinc-900 border border-purple-800/60 px-4 py-2 rounded-xl">
                            <div className="w-9 h-9 rounded-full bg-purple-700 flex items-center justify-center font-bold text-white shadow overflow-hidden">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    (user.name || 'U').charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-white leading-tight">
                                    {user.name}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MAIN LAYOUT */}
            <div className="flex flex-col lg:flex-row gap-8">

                {/* LEFT SIDE → ARTICLES & COMMENTS */}
                <div className="flex-[1.5] space-y-8">

                    {articles.map((article) => {
                        const articleComments = comments.filter(c => String(c.article_id) === String(article.id))
                        const topLevelComments = articleComments.filter(c => !c.parent_comment_id)
                        const articleReaction = reactions[article.id] || {
                            likes: article.likes,
                            dislikes: article.dislikes,
                            user_reaction: null
                        }
                        const isLiked = articleReaction.user_reaction === 'like'
                        const isDisliked = articleReaction.user_reaction === 'dislike'
                        const isReacting = reactingArticleId === article.id

                        return (
                            <div
                                key={article.id}
                                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl transition-all duration-300"
                            >
                                {/* ARTICLE HEADER */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-purple-400">
                                            {article.title}
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Source: {article.source}
                                        </p>
                                    </div>

                                    <span className="bg-purple-900/40 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-700">
                                        Community Article #{article.id}
                                    </span>
                                </div>

                                {/* ARTICLE CONTENT */}
                                <p className="text-gray-300 leading-7 mb-6">
                                    {article.content}
                                </p>

                                {/* LIKE / DISLIKE BUTTONS WITH MONGODB PERSISTENCE */}
                                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-zinc-800">
                                    <button
                                        onClick={() => handleReaction(article.id, 'like')}
                                        disabled={isReacting}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                                            isLiked
                                                ? 'bg-green-600 text-white ring-2 ring-green-400 shadow-lg shadow-green-900/50 scale-105'
                                                : 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                                        }`}
                                        title={isLiked ? "Remove like" : "Like this article"}
                                    >
                                        <span>👍</span>
                                        <span>Like</span>
                                        <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-black/40 font-mono">
                                            {articleReaction.likes}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => handleReaction(article.id, 'dislike')}
                                        disabled={isReacting}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                                            isDisliked
                                                ? 'bg-red-600 text-white ring-2 ring-red-400 shadow-lg shadow-red-900/50 scale-105'
                                                : 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                                        }`}
                                        title={isDisliked ? "Remove dislike" : "Dislike this article"}
                                    >
                                        <span>👎</span>
                                        <span>Dislike</span>
                                        <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-black/40 font-mono">
                                            {articleReaction.dislikes}
                                        </span>
                                    </button>
                                </div>

                                {/* COMMENTS SECTION */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
                                            💬 Discussion Comments
                                            <span className="text-xs font-normal text-purple-400 bg-purple-950/60 border border-purple-800 px-2 py-0.5 rounded-full font-mono">
                                                {articleComments.length}
                                            </span>
                                        </h3>
                                    </div>

                                    {/* COMMENTS & REPLIES THREAD */}
                                    <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-1">
                                        {loadingComments ? (
                                            <p className="text-xs text-zinc-500 italic">
                                                Loading discussion from database...
                                            </p>
                                        ) : topLevelComments.length > 0 ? (
                                            topLevelComments.map((comment) => {
                                                const replies = articleComments.filter(c => c.parent_comment_id === comment._id)
                                                const isReplying = replyingToId === comment._id

                                                return (
                                                    <div
                                                        key={comment._id}
                                                        className="bg-black/80 border border-zinc-800/80 rounded-xl p-4 transition-all hover:border-purple-900/50"
                                                    >
                                                        {/* Parent Comment Header */}
                                                        <div className="flex items-center justify-between gap-2 mb-2">
                                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                                <div
                                                                    onClick={() => {
                                                                        if (user?._id !== comment.user_id) {
                                                                            openChatWithUser({ _id: comment.user_id, name: comment.user_name })
                                                                        }
                                                                    }}
                                                                    className={`w-8 h-8 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow transition-all ${
                                                                        user?._id !== comment.user_id
                                                                            ? 'cursor-pointer hover:scale-110 hover:ring-2 hover:ring-purple-400'
                                                                            : ''
                                                                    }`}
                                                                    title={user?._id !== comment.user_id ? `Message ${comment.user_name}` : comment.user_name}
                                                                >
                                                                    {(comment.user_name || 'U').charAt(0).toUpperCase()}
                                                                </div>

                                                                <span
                                                                    onClick={() => {
                                                                        if (user?._id !== comment.user_id) {
                                                                            openChatWithUser({ _id: comment.user_id, name: comment.user_name })
                                                                        }
                                                                    }}
                                                                    className={`font-semibold text-sm transition-colors ${
                                                                        user?._id !== comment.user_id
                                                                            ? 'text-purple-300 hover:text-white hover:underline cursor-pointer'
                                                                            : 'text-purple-300'
                                                                    }`}
                                                                    title={user?._id !== comment.user_id ? `Click to direct message ${comment.user_name}` : ''}
                                                                >
                                                                    {comment.user_name}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-zinc-500">
                                                                    {formatDate(comment.created_at)}
                                                                </span>

                                                                {user && (user._id === comment.user_id) && (
                                                                    <button
                                                                        onClick={() => handleDeleteComment(comment._id)}
                                                                        className="text-zinc-500 hover:text-red-400 text-xs px-1.5 py-0.5 rounded hover:bg-red-950/40 transition-colors"
                                                                        title="Delete your comment"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Comment Text */}
                                                        <p className="text-gray-200 text-sm pl-10 leading-relaxed break-words mb-3">
                                                            {comment.text}
                                                        </p>

                                                        {/* Comment Action Bar */}
                                                        <div className="pl-10 flex items-center gap-2.5 flex-wrap">
                                                            <button
                                                                onClick={() => setReplyingToId(isReplying ? null : comment._id)}
                                                                className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/50 transition-colors cursor-pointer"
                                                            >
                                                                <span>↩️</span>
                                                                <span>{isReplying ? 'Cancel' : 'Reply'}</span>
                                                            </button>

                                                            {user?._id !== comment.user_id && (
                                                                <button
                                                                    onClick={() => openChatWithUser({ _id: comment.user_id, name: comment.user_name })}
                                                                    className="text-xs font-medium text-indigo-300 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/50 transition-colors cursor-pointer"
                                                                    title={`Direct message ${comment.user_name}`}
                                                                >
                                                                    <span>✉️</span>
                                                                    <span>Message</span>
                                                                </button>
                                                            )}

                                                            {replies.length > 0 && (
                                                                <span className="text-xs text-zinc-500 font-mono">
                                                                    💬 {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* INLINE REPLY FORM */}
                                                        {isReplying && (
                                                            <form
                                                                onSubmit={(e) => {
                                                                    e.preventDefault()
                                                                    handlePostReply(article.id, comment._id)
                                                                }}
                                                                className="mt-3 ml-10 flex gap-2 animate-fadeIn"
                                                            >
                                                                <input
                                                                    type="text"
                                                                    value={replyInputs[comment._id] || ''}
                                                                    onChange={(e) => handleReplyInputChange(comment._id, e.target.value)}
                                                                    placeholder={`Reply to ${comment.user_name}...`}
                                                                    className="flex-1 bg-zinc-950 border border-purple-700/60 rounded-lg px-3 py-2 text-xs outline-none focus:border-purple-500 text-white placeholder-zinc-500"
                                                                    disabled={submittingReplyId === comment._id}
                                                                    autoFocus
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    disabled={submittingReplyId === comment._id}
                                                                    className="bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer"
                                                                >
                                                                    {submittingReplyId === comment._id ? 'Sending...' : 'Send'}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setReplyingToId(null)}
                                                                    className="bg-zinc-800 hover:bg-zinc-700 text-xs px-3 py-2 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </form>
                                                        )}

                                                        {/* NESTED REPLIES LIST */}
                                                        {replies.length > 0 && (
                                                            <div className="mt-3 ml-6 sm:ml-10 pl-3 border-l-2 border-purple-800/40 space-y-2.5">
                                                                {replies.map((reply) => (
                                                                    <div
                                                                        key={reply._id}
                                                                        className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-3 transition-all hover:border-purple-900/40"
                                                                    >
                                                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                                <div
                                                                                    onClick={() => {
                                                                                        if (user?._id !== reply.user_id) {
                                                                                            openChatWithUser({ _id: reply.user_id, name: reply.user_name })
                                                                                        }
                                                                                    }}
                                                                                    className={`w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-700 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow transition-all ${
                                                                                        user?._id !== reply.user_id
                                                                                            ? 'cursor-pointer hover:scale-110 hover:ring-2 hover:ring-purple-400'
                                                                                            : ''
                                                                                    }`}
                                                                                    title={user?._id !== reply.user_id ? `Message ${reply.user_name}` : reply.user_name}
                                                                                >
                                                                                    {(reply.user_name || 'U').charAt(0).toUpperCase()}
                                                                                </div>
                                                                                <span
                                                                                    onClick={() => {
                                                                                        if (user?._id !== reply.user_id) {
                                                                                            openChatWithUser({ _id: reply.user_id, name: reply.user_name })
                                                                                        }
                                                                                    }}
                                                                                    className={`font-semibold text-xs transition-colors ${
                                                                                        user?._id !== reply.user_id
                                                                                            ? 'text-purple-300 hover:text-white hover:underline cursor-pointer'
                                                                                            : 'text-purple-300'
                                                                                    }`}
                                                                                    title={user?._id !== reply.user_id ? `Click to direct message ${reply.user_name}` : ''}
                                                                                >
                                                                                    {reply.user_name}
                                                                                </span>
                                                                            </div>

                                                                            <div className="flex items-center gap-2">
                                                                                {user?._id !== reply.user_id && (
                                                                                    <button
                                                                                        onClick={() => openChatWithUser({ _id: reply.user_id, name: reply.user_name })}
                                                                                        className="text-[10px] font-medium text-indigo-300 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/50 transition-colors cursor-pointer"
                                                                                        title={`Direct message ${reply.user_name}`}
                                                                                    >
                                                                                        <span>✉️</span>
                                                                                        <span>Message</span>
                                                                                    </button>
                                                                                )}

                                                                                <span className="text-[10px] text-zinc-500">
                                                                                    {formatDate(reply.created_at)}
                                                                                </span>

                                                                                {user && (user._id === reply.user_id) && (
                                                                                    <button
                                                                                        onClick={() => handleDeleteComment(reply._id)}
                                                                                        className="text-zinc-500 hover:text-red-400 text-xs px-1 rounded hover:bg-red-950/40 transition-colors"
                                                                                        title="Delete your reply"
                                                                                    >
                                                                                        ✕
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <p className="text-gray-200 text-xs pl-8 leading-relaxed break-words">
                                                                            {reply.text}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="bg-black/40 border border-dashed border-zinc-800 rounded-xl p-4 text-center">
                                                <p className="text-sm text-zinc-500">
                                                    No comments yet on this article. Be the first to start the discussion!
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* ADD TOP-LEVEL COMMENT INPUT */}
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault()
                                            handlePostComment(article.id)
                                        }}
                                        className="flex gap-2"
                                    >
                                        <input
                                            type="text"
                                            value={commentInputs[article.id] || ''}
                                            onChange={(e) => handleInputChange(article.id, e.target.value)}
                                            placeholder={`Start a discussion as ${user?.name || 'verified user'}...`}
                                            className="flex-1 bg-black border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-purple-600 transition-colors text-white placeholder-zinc-500"
                                            disabled={submittingArticleId === article.id}
                                        />

                                        <button
                                            type="submit"
                                            disabled={submittingArticleId === article.id}
                                            className="bg-purple-700 hover:bg-purple-800 disabled:opacity-50 transition-all duration-300 px-5 rounded-lg text-sm font-semibold cursor-pointer shadow-md hover:shadow-purple-900/40"
                                        >
                                            {submittingArticleId === article.id ? 'Posting...' : 'Post'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )
                    })}

                </div>

                {/* RIGHT SIDE → AI BOT */}
                <div className="flex-1">

                    <div className="sticky top-6 bg-zinc-900 border border-purple-700/60 rounded-2xl p-5 shadow-xl h-[85vh] flex flex-col">

                        <h2 className="text-2xl font-semibold text-purple-400 mb-2 flex items-center gap-2">
                            🤖 AI News Assistant
                        </h2>
                        <p className="text-xs text-gray-400 mb-4">
                            Ask about any news, the latest NewsMirror articles, or get details on a specific story.
                        </p>

                        {/* CHAT AREA */}
                        <div className="flex-1 bg-black rounded-xl p-4 overflow-y-auto border border-zinc-800 text-sm text-gray-300 space-y-3">

                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`p-3 rounded-lg border leading-relaxed whitespace-pre-wrap break-words ${
                                        msg.sender === 'user'
                                            ? 'bg-purple-900/40 border-purple-700 ml-auto w-fit max-w-[85%] text-white'
                                            : msg.isError
                                                ? 'bg-red-950/40 border-red-800 text-red-300'
                                                : 'bg-zinc-900 border-zinc-800 text-gray-300'
                                    }`}
                                >
                                    {msg.text}

                                    {msg.sources?.length > 0 && (
                                        <div className="mt-3 pt-2 border-t border-zinc-800 space-y-1 whitespace-normal">
                                            <p className="text-xs text-purple-400 font-semibold">Sources</p>
                                            {msg.sources.map((src) => (
                                                <a
                                                    key={src.url}
                                                    href={src.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block text-xs text-purple-300 hover:text-purple-200 underline truncate"
                                                    title={src.headline}
                                                >
                                                    {src.headline}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {botLoading && (
                                <div className="p-3 rounded-lg border bg-zinc-900 border-zinc-800 text-gray-400 w-fit animate-pulse">
                                    Thinking…
                                </div>
                            )}

                            <div ref={chatEndRef} />

                        </div>

                        {/* INPUT */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSendBotMessage()
                            }}
                            className="mt-4 flex gap-2"
                        >
                            <input
                                type="text"
                                value={botInput}
                                onChange={(e) => setBotInput(e.target.value)}
                                placeholder="Ask about any news..."
                                maxLength={1000}
                                disabled={botLoading}
                                className="flex-1 bg-black border border-zinc-700 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-purple-600 text-white placeholder-zinc-500 disabled:opacity-60"
                            />

                            <button
                                type="submit"
                                disabled={botLoading || !botInput.trim()}
                                className="bg-purple-700 hover:bg-purple-800 transition-all duration-300 px-5 rounded-lg text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {botLoading ? '...' : 'Send'}
                            </button>
                        </form>

                    </div>

                </div>

            </div>

        </div>
    )
}
