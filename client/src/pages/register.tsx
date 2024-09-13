import axios from 'axios';
import Link from 'next/link'
import { useRouter } from 'next/router';
import React, { FormEvent, useState } from 'react'
import InputGroup from '../components/InputGroup'
import { useAuthState } from '../context/auth';
import Modal from '../components/Modal';

interface RegisterProps {
    isOpen: boolean;
    onClose: () => void;
    openModal: () => void;
    openLoginModal: () => void;
}

const Register: React.FC<RegisterProps> = ({ isOpen, onClose, openModal, openLoginModal }) => {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<any>({});    
    const {authenticated} = useAuthState();

    let router = useRouter();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        try {
            const res = await axios.post('/auth/register', {
                email,
                password,
                username
            })
            console.log('res', res);
            onClose();
            openLoginModal();
        } catch (error: any) {
            console.log('error', error);
            setErrors(error.response.data || {});
        }
    }

    const registerForm = (
        <div className="w-full">
            <h1 className="mb-2 text-lg font-medium">Sign Up</h1>
            <form onSubmit={handleSubmit}>
                <InputGroup
                    placeholder="Email"
                    value={email}
                    setValue={setEmail}
                    error={errors.email}
                />
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
                        Sign Up
                </button>
            </form>
            <small>
                Already a predditor?
                <span className="ml-1 text-blue-500 cursor-pointer" onClick={() => {
                    onClose();
                    openLoginModal();
                }}>Sign in</span>
            </small>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            {registerForm}
        </Modal>
    );
}

export default Register;