import { useState, useEffect } from "react";
import { AppContext } from "./AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const AppContextProvider = (props) => {

    const backend_url = import.meta.env.VITE_BACKEND_URL
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Direct Messaging (Inbox) state
    const [isInboxOpen, setIsInboxOpen] = useState(false);
    const [activeChatPartner, setActiveChatPartner] = useState(null);
    const [unreadDmCount, setUnreadDmCount] = useState(0);

    // Fetch User Info
    const loadUser = async () => {
        try {
            const { data } = await axios.get(
                `${backend_url}/api/user/myinfo`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUser(data);
        } catch (error) {
            console.log(error);
            setUser(null);
        }
    };

    // Fetch Notifications
    const fetchNotifications = async () => {
        if (!token) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }
        try {
            const { data } = await axios.get(
                `${backend_url}/api/community/notifications`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (data.success) {
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            }
        } catch (error) {
            console.error("Failed to load notifications:", error);
        }
    };

    // Fetch total unread direct messages count
    const fetchUnreadDmCount = async () => {
        if (!token) {
            setUnreadDmCount(0);
            return;
        }
        try {
            const { data } = await axios.get(
                `${backend_url}/api/chat/unread-count`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (data.success) {
                setUnreadDmCount(data.unread_count || 0);
            }
        } catch (error) {
            console.error("Failed to load unread DM count:", error);
        }
    };

    // Open chat with a specific user (from comments, notifications, or inbox)
    const openChatWithUser = (partner) => {
        if (!token) {
            toast.info("Please sign in to send direct messages.");
            return;
        }
        if (!partner || !partner._id) return;
        if (user && partner._id === user._id) {
            toast.info("You cannot direct message yourself.");
            return;
        }
        setActiveChatPartner(partner);
        setIsInboxOpen(true);
    };

    // Mark single notification as read
    const markAsRead = async (notificationId) => {
        if (!token) return;
        try {
            await axios.put(
                `${backend_url}/api/community/notifications/${notificationId}/read`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification read:", error);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        if (!token) return;
        try {
            await axios.put(
                `${backend_url}/api/community/notifications/read-all`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all read:", error);
        }
    };

    useEffect(() => {
        if (token) {
            loadUser();
            fetchNotifications();
            fetchUnreadDmCount();
        } else {
            setUser(null);
            setNotifications([]);
            setUnreadCount(0);
            setUnreadDmCount(0);
            setIsInboxOpen(false);
            setActiveChatPartner(null);
        }
    }, [token]);

    const value = {
        backend_url,
        token,
        setToken,
        user,
        setUser,
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        // Inbox & Chat exports
        isInboxOpen,
        setIsInboxOpen,
        activeChatPartner,
        setActiveChatPartner,
        unreadDmCount,
        setUnreadDmCount,
        fetchUnreadDmCount,
        openChatWithUser,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider