// "5m ago", "3h ago", "2d ago", or a date for older times
export const timeAgo = (iso) => {
    if (!iso) return "";
    const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ago`;
    if (minutes < 60 * 24 * 7) return `${Math.floor(minutes / (60 * 24))}d ago`;
    return new Date(iso).toLocaleDateString();
};
