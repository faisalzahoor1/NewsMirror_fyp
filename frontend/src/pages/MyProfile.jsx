import { useContext, useRef, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const AVATAR_SIZE = 256;

// Center-crop the picked image to a square and shrink it, so uploads stay small
const resizeImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
            const side = Math.min(img.width, img.height);
            const canvas = document.createElement("canvas");
            canvas.width = AVATAR_SIZE;
            canvas.height = AVATAR_SIZE;
            canvas.getContext("2d").drawImage(
                img,
                (img.width - side) / 2, (img.height - side) / 2, side, side,
                0, 0, AVATAR_SIZE, AVATAR_SIZE
            );
            resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
});

export const MyProfile = () => {
    const { user, setUser, backend_url, token } = useContext(AppContext);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
            toast.error("Please choose a PNG, JPEG or WebP image");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error("Image is too large (max 10 MB)");
            return;
        }

        setUploading(true);
        try {
            const avatar = await resizeImage(file);
            const { data } = await axios.put(
                `${backend_url}/api/user/avatar`,
                { avatar },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                setUser(prev => ({ ...prev, avatar: data.avatar }));
                toast.success("Profile photo updated");
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || "Could not upload photo");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        setUploading(true);
        try {
            const { data } = await axios.delete(
                `${backend_url}/api/user/avatar`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                setUser(prev => ({ ...prev, avatar: undefined }));
                toast.success("Profile photo removed");
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || "Could not remove photo");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white px-6 py-12">

            <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-700 rounded-3xl p-10">

                {/* Profile Header */}
                <div className="flex items-center gap-6 mb-10">

                    <div className="flex flex-col items-center gap-3">
                        <div className="w-24 h-24 rounded-full bg-purple-700 flex items-center justify-center text-4xl font-bold overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                            ) : (
                                (user?.name || "U").charAt(0).toUpperCase()
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="text-xs bg-purple-700 hover:bg-purple-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                            >
                                {uploading ? "Saving..." : user?.avatar ? "Change" : "Upload photo"}
                            </button>
                            {user?.avatar && (
                                <button
                                    onClick={handleRemove}
                                    disabled={uploading}
                                    className="text-xs bg-gray-800 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold">
                            {user?.name}
                        </h1>

                        <p className="text-gray-400 mt-1">
                            {user?.email}
                        </p>
                    </div>
                </div>

                {/* User Info */}
                <div className="space-y-6">

                    <div className="bg-gray-800 rounded-xl p-5">
                        <p className="text-gray-400 text-sm mb-1">
                            Full Name
                        </p>

                        <h2 className="text-lg font-semibold">
                            {user?.name}
                        </h2>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-5">
                        <p className="text-gray-400 text-sm mb-1">
                            Email Address
                        </p>

                        <h2 className="text-lg font-semibold">
                            {user?.email}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
}
