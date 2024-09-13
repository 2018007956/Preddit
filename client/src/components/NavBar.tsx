import React, { useState } from 'react';
import Link from "next/link"
import { useAuthDispatch, useAuthState } from "../context/auth";
import axios from "axios";
import Image from "next/image";
import { FaSearch, FaMoon, FaSun } from "react-icons/fa";
import Login from '../pages/login';
import Register from '../pages/register';
import styled from 'styled-components';

const ToggleButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.text};
  padding: 8px;
  border-radius: 50%;
  margin-right: 10px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.background};
  }
`;

const NavBar: React.FC<{ toggleTheme: () => void, theme: string }> = ({ toggleTheme, theme }) => {
  const { loading, authenticated } = useAuthState();
  const dispatch = useAuthDispatch();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleLogOut = () => {
    axios.post("/auth/logout")
      .then(() => {
        dispatch("LOGOUT"); // Context에 들어있는 User 정보 Update
        window.location.reload(); // Page Refresh
      })
      .catch((error) => {
        console.log(error);
      })
  }

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeLoginModal = () => setIsLoginModalOpen(false);
  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  return (
    <div className="fixed inset-x-0 top-0 z-10 flex flex-col bg-white">
      <div className="flex items-center justify-between h-13 px-5">
        <span className="text-2xl font-semibold text-gray-400">
          <Link href="/">
            <Image
              src="/reddit-name-logo.png"
              alt="logo"
              width={80}
              height={45}
            >
            </Image>
          </Link>
        </span>

        <div className="searchbar max-w-full px-4">
          <div className="relative flex items-center bg-gray-100 border rounded hover:border-gray-700 hover:bg-white">
            <FaSearch className="ml-2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="px-3 py-1 bg-transparent rounded h-7 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center">
          <ToggleButton onClick={toggleTheme}>
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </ToggleButton>
          {!loading &&
            (authenticated ? (
              <button
                className="w-20 px-2 mr-2 text-sm text-center text-white bg-gray-400 rounded-full h-7"
                onClick={handleLogOut}
              >
                Log Out
              </button>
            ) : (
              <>
                <button
                  className="w-20 px-2 py-1 mr-2 text-sm text-center text-blue-500 border border-blue-500 rounded-full h-7"
                  onClick={openLoginModal}
                >
                  Sign In
                </button>
                <Login 
                  isOpen={isLoginModalOpen}
                  onClose={closeLoginModal}
                  openRegisterModal={openRegisterModal}
                />
                <Register 
                  isOpen={isRegisterModalOpen}
                  onClose={closeRegisterModal}
                  openLoginModal={openLoginModal}
                />
              </>
            ))}
        </div>
      </div>
      <div className="h-px bg-gray-300 w-full"></div>
    </div>
  )
}

export default NavBar