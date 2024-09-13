import React, { FormEvent, useState } from 'react'
import axios from 'axios';
import InputGroup from '../components/InputGroup'
import { useAuthDispatch } from '../context/auth';
import Modal from '../components/Modal';

interface LoginProps {
    isOpen: boolean;
    onClose: () => void;
    openRegisterModal: () => void;
}

const Login: React.FC<LoginProps> = ({ isOpen, onClose, openRegisterModal }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<any>({});  
    const dispatch = useAuthDispatch();
    
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        try {
            const res = await axios.post('/auth/login', { password, username }, { withCredentials: true });
            dispatch("LOGIN", res.data?.user); // save user data into context
            onClose(); // Close the modal after successful login
        } catch (error: any) {
            console.log('error', error);
            setErrors(error?.response?.data || {});
        }
    } 

    const loginForm = (
        <div className="w-full">
            <h1 className="mb-2 text-lg font-medium">Sign In</h1>
            <form onSubmit={handleSubmit}>
                <InputGroup
                    placeholder="Username"
                    value={username}
                    setValue={setUsername}
                    error={errors.username}
                />
                <InputGroup
                    placeholder="Password"
                    value={password}
                    type="password"
                    setValue={setPassword}
                    error={errors.password}
                />
                <button className={`w-full py-2 mb-1 text-xs font-bold text-white bg-gray-400 border border-gray-400 rounded`}>
                    Sign In
                </button>
            </form>
            <small>
                New to Preddit?
                <span className="ml-1 text-blue-500 cursor-pointer" onClick={() => {
                    onClose();
                    openRegisterModal();
                }}>Sign Up</span>
            </small>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            {loginForm}
        </Modal>
    )
}

export default Login