import  { useState } from "react";
export const FakeNews = () => {
  const [fileName, setFileName] = useState("");

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setFileName(file.name);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white px-6 md:px-16 py-14">

            {/* Heading */}
            <div className="text-center mb-14">

                <h1 className="text-5xl font-bold mb-5">
                    Fake News <span className="text-purple-500">Detection</span>
                </h1>

                <p className="text-gray-400 max-w-3xl mx-auto text-lg leading-8">
                    Upload a PDF news article and NewsMirror AI will analyze
                    whether the article contains fake, misleading, or trusted
                    information.
                </p>
            </div>

            {/* Upload Section */}
            <div className="max-w-4xl mx-auto">

                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10">

                    {/* Upload Box */}
                    <label
                        htmlFor="pdfUpload"
                        className="border-2 border-dashed border-purple-700 rounded-3xl
                        flex flex-col items-center justify-center text-center
                        py-20 px-6 cursor-pointer hover:bg-gray-800 transition-all duration-300"
                    >

                        {/* Upload Icon */}
                        <div className="text-7xl mb-6">
                            📄
                        </div>

                        <h2 className="text-2xl font-semibold mb-3">
                            Upload PDF Article
                        </h2>

                        <p className="text-gray-400 mb-4">
                            Drag & drop your PDF file here or click to browse
                        </p>

                        <span className="bg-purple-700 hover:bg-purple-800 px-6 py-3 rounded-xl transition-all duration-300">
                            Choose PDF
                        </span>

                        {/* Hidden Input */}
                        <input
                            type="file"
                            id="pdfUpload"
                            accept=".pdf"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>

                    {/* File Name */}
                    {fileName && (
                        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-2xl p-5 flex items-center justify-between">

                            <div className="flex items-center gap-4">

                                <div className="text-4xl">
                                    📑
                                </div>

                                <div>
                                    <h3 className="font-semibold">
                                        {fileName}
                                    </h3>

                                    <p className="text-sm text-gray-400">
                                        PDF Ready For Analysis
                                    </p>
                                </div>
                            </div>

                            <button
                                className="text-red-400 hover:text-red-300"
                                onClick={() => setFileName("")}
                            >
                                Remove
                            </button>
                        </div>
                    )}

                    {/* Analyze Button */}
                    <button
                        className="w-full mt-10 bg-purple-700 hover:bg-purple-800 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-[1.01]"
                    >
                        Analyze News
                    </button>
                </div>
            </div>

            {/* Result Preview UI */}
            <div className="max-w-4xl mx-auto mt-12">

                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">

                    <h2 className="text-2xl font-bold mb-6">
                        Analysis Result
                    </h2>

                    <div className="flex items-center justify-between flex-wrap gap-6">

                        {/* Fake/Real */}
                        <div className="bg-red-900/30 border border-red-700 px-6 py-5 rounded-2xl flex-1 min-w-[250px]">

                            <p className="text-gray-400 mb-2">
                                Prediction
                            </p>

                            <h3 className="text-3xl font-bold text-red-400">
                                FAKE
                            </h3>
                        </div>

                        {/* Confidence */}
                        <div className="bg-green-900/30 border border-green-700 px-6 py-5 rounded-2xl flex-1 min-w-[250px]">

                            <p className="text-gray-400 mb-2">
                                Confidence Score
                            </p>

                            <h3 className="text-3xl font-bold text-green-400">
                                92%
                            </h3>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="mt-8 bg-gray-800 rounded-2xl p-6">

                        <h4 className="text-xl font-semibold mb-3">
                            AI Explanation
                        </h4>

                        <p className="text-gray-400 leading-7">
                            The uploaded article contains misleading claims,
                            sensational language, and unsupported statements
                            commonly associated with misinformation and fake
                            news patterns.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
