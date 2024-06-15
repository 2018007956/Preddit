import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router';
import InputGroup from '../components/InputGroup'

const Login = () => {
    let router = useRouter();

    return (
        <div className="bg-white">
            <div className="flex flex-col items-center justify-content h-screen p-6">
                <div className="w-10/12 mx-auto md:w-96">
                    <h1 className="mb-2 text-lg font-medium">로그인</h1>
                    <form>
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
                        <button className={`w-full py-2 mb-1 text-xs font-bold text-white uppercase bg-gray-400 border border-gray-400 rounded`}>
                            Sign In
                        </button>
                    </form>
                    <small>
                        아직 아이디가 없나요?
                        <Link href="/register">
                            <span className="ml-1 text-blue-500 uppercase">회원가입</span>
                        </Link>
                    </small>
                </div>
            </div>
        </div>
    )
}

export default Login