import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export const MyProfile = () => {
    const { user } = useContext(AppContext);

    return (
        <div className="min-h-screen bg-black text-white px-6 py-12">

            <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-700 rounded-3xl p-10">

                {/* Profile Header */}
                <div className="flex items-center gap-6 mb-10">

                    <div className="w-24 h-24 rounded-full bg-purple-700 flex items-center justify-center text-4xl font-bold">
                        F
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
