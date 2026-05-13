

export const About = () => {
  return (
    <div className="min-h-screen bg-black text-white">

            {/* Hero Section */}
            <section className="px-6 md:px-16 py-20 text-center border-b border-gray-800">

                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                    About <span className="text-purple-500">NewsMirror</span>
                </h1>

                <p className="max-w-4xl mx-auto text-gray-400 text-lg leading-8">
                    NewsMirror is an AI-powered news aggregation and analysis
                    platform designed to help users explore news from multiple
                    perspectives in one place. Our mission is to provide
                    transparent, intelligent, and bias-aware journalism through
                    advanced AI technologies and community engagement.
                </p>
            </section>

            {/* Mission Section */}
            <section className="px-6 md:px-16 py-20">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left */}
                    <div>

                        <h2 className="text-4xl font-bold mb-6 text-purple-500">
                            Our Mission
                        </h2>

                        <p className="text-gray-400 leading-8 mb-6">
                            In today’s digital world, misinformation, political
                            bias, and fake news spread rapidly across the
                            internet. NewsMirror was created to solve this
                            problem by bringing together trusted news from
                            multiple sources and analyzing it using Artificial
                            Intelligence.
                        </p>

                        <p className="text-gray-400 leading-8">
                            We believe readers deserve balanced information,
                            transparent reporting, and intelligent tools that
                            help them understand the complete picture behind
                            every story.
                        </p>
                    </div>

                    {/* Right */}
                    <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10">

                        <h3 className="text-2xl font-semibold mb-8">
                            What NewsMirror Provides
                        </h3>

                        <div className="space-y-6">

                            <div className="flex gap-4">
                                <div className="text-purple-500 text-2xl">
                                    📰
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-1">
                                        News Aggregation
                                    </h4>

                                    <p className="text-gray-400 text-sm">
                                        Collects news from multiple trusted
                                        sources automatically.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="text-purple-500 text-2xl">
                                    🤖
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-1">
                                        AI Summarization
                                    </h4>

                                    <p className="text-gray-400 text-sm">
                                        Generates concise summaries using Large
                                        Language Models.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="text-purple-500 text-2xl">
                                    ⚖️
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-1">
                                        Bias Detection
                                    </h4>

                                    <p className="text-gray-400 text-sm">
                                        Identifies political leaning and
                                        sentiment in articles.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="text-purple-500 text-2xl">
                                    💬
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-1">
                                        Community Discussions
                                    </h4>

                                    <p className="text-gray-400 text-sm">
                                        Allows users to discuss and validate
                                        news collaboratively.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="text-purple-500 text-2xl">
                                    🛡️
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-1">
                                        AI Moderation
                                    </h4>

                                    <p className="text-gray-400 text-sm">
                                        Detects toxic comments and misinformation
                                        automatically.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision Section */}
            <section className="px-6 md:px-16 py-20 bg-gray-950">

                <div className="max-w-5xl mx-auto text-center">

                    <h2 className="text-4xl font-bold mb-8 text-purple-500">
                        Our Vision
                    </h2>

                    <p className="text-gray-400 text-lg leading-8">
                        Our vision is to build a smarter and more transparent
                        digital news ecosystem where readers can easily compare
                        viewpoints, verify information, and make informed
                        decisions without manipulation or misinformation.
                    </p>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="px-6 md:px-16 py-20">

                <h2 className="text-4xl font-bold text-center mb-14 text-purple-500">
                    Technologies Used
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

                    {[
                        "React",
                        "Tailwind CSS",
                        "Node.js",
                        "Express.js",
                        "MongoDB",
                        "Python",
                        "FastAPI",
                        "AI / NLP Models",
                    ].map((tech, index) => (
                        <div
                            key={index}
                            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center hover:border-purple-600 transition-all duration-300"
                        >
                            <h3 className="font-semibold text-lg">
                                {tech}
                            </h3>
                        </div>
                    ))}
                </div>
            </section>
        </div>
  )
}
