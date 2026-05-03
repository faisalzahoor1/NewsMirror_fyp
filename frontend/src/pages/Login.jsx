import { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import loginImage from '../assets/login_page_img.jpg'
import axios from 'axios'

export const Login = () => {

    const { backend_url, token, setToken } = useContext(AppContext)
    const navigate = useNavigate()
    const [state, setState] = useState('Sign up');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const onSubmit = async (event) => {
        event.preventDefault();

        try {
            if (state === 'Sign up') {
                const { data } = await axios.post(backend_url + '/api/user/register', { name, email, password }, { withCredentials: true })
                if (data.success) {
                    localStorage.setItem('token', data.token)
                    setToken(data.token)
                    toast.success("Successfully Registered")
                } else {
                    toast.error(data.message)
                }
            } else {
                const { data } = await axios.post(backend_url + '/api/user/login', { email, password }, { withCredentials: true })
                if (data.success) {
                    localStorage.setItem('token', data.token)
                    setToken(data.token)
                    toast.success("Successfully Login")
                } else {
                    toast.error(data.message)
                }
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }
    useEffect(() => {
        if (token) {
            navigate('/')
        }
    }, [token])
    return (
        <div className='flex items-center justify-center gap-8 px-10 py-10 min-h-screen '>
            <div className="flex-1 flex justify-center shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-2xl'">
                <form onSubmit={onSubmit} className='min-h-[80vh] '>
                    <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
                        <p className='text-white text-2xl font-semibold'>{state === 'Sign up' ? "Create account" : "Sign in"}</p>
                        <p className='text-white'>Please {state === 'Sign up' ? "sign up" : "sign in"} </p>
                        {state === 'Sign up' &&
                            <div className='w-full'>
                                <p className='text-white'>Full Name</p>
                                <input className='text-white border border-zinc-300 rounded w-full p-2 mt-1' type="text" required onChange={(e) => setName(e.target.value)} value={name} />
                            </div>
                        }
                        <div className='w-full'>
                            <p className='text-white'>Email</p>
                            <input className='text-white border border-zinc-300 rounded w-full p-2 mt-1' type="email" required onChange={(e) => setEmail(e.target.value)} value={email} />
                        </div>
                        <div className='w-full'>
                            <p className='text-white'>Password</p>
                            <input className='text-white border border-zinc-300 rounded w-full p-2 mt-1' type="password" required onChange={(e) => setPassword(e.target.value)} value={password} />
                        </div>
                        <button type='submit' className='bg-purple-700 text-white w-full py-2 rounded-md text-base cursor-pointer'>{state === 'Sign up' ? "Create account" : "Sign in"}</button>
                        {
                            state === 'Sign up' ? <p className='text-white'>Already have an account? <span className='text-blue-500 underline cursor-pointer' onClick={() => setState('Sign in')}>Sign in here</span></p> : <p>Create an account? <span className='text-blue-500 underline cursor-pointer' onClick={() => setState('Sign up')}>Click here</span></p>
                        }
                    </div>
                </form>
            </div>
            <div className="flex-[1.6] transition-transform duration-300 hover:scale-105">
                <img className="w-full h-full object-cover " src={loginImage} alt="" />
            </div>
        </div>
    )
}