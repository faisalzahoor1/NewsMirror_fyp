import favicon from '../assets/favicon.svg'

export const Footer = () => {
    return (
        <div className='md:mx-10 '>
            <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-20 pt-2 text-sm border-t border-gray-600'>
                <div>
                    <img className='mb-5 w-40' src={favicon} alt="" />
                    <p className='text-white w-full md:w-2/3 text-gray-600 leading-6'>NewsMirror is an intelligent web-based platform that aggregates and analyzes news from multiple sources to improve how users consume information.It categorizes articles and uses custom-trained machine learning models to detect bias, analyze sentiment, and identify fake news. Additionally, it includes an AI chatbot and community discussion feature.</p>
                </div>


                <div>
                    <p className='text-xl font-medium mb-5'>COMPANY</p>
                    <ul className='flex flex-col text-gray-600 gap-2'>
                        <li className='text-white'>Home</li>
                        <li className='text-white'>About Us</li>
                        <li className='text-white'>Privacy Policy</li>
                    </ul>
                </div>


                <div>
                    <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
                    <ul className='flex flex-col text-gray-600 gap-2'>
                        <li className='text-white'>+92-3181982143</li>
                        <li className='text-white'>faisalzahoor96@gmail.com</li>
                    </ul>
                </div>
            </div>
            <div>
                <hr />
                <p className='py-5 text-sm text-center'>Copyright 2025 @ muhammad-faisal-zahoor - All Right Reserved.</p>
            </div>
        </div>
    )
}
