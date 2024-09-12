import Link from "next/link"
import { useAuthDispatch, useAuthState } from "../context/auth";
import axios from "axios";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";

const NavBar: React.FC = () => {
  const { loading, authenticated } = useAuthState();
  const dispatch = useAuthDispatch();

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

        <div className="max-w-full px-4">
          <div className="relative flex items-center bg-gray-100 border rounded hover:border-gray-700 hover:bg-white">
            <FaSearch className="ml-2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="px-3 py-1 bg-transparent rounded h-7 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex">
          {!loading &&
            (authenticated ? (
              <button
                className="w-20 px-2 mr-2 text-sm text-center text-white bg-gray-400 rounded h-7"
                onClick={handleLogOut}
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login">
                  <span className="w-20 px-2 pt-1 mr-2 text-sm text-center text-blue-500 border border-blue-500 rounded h-7">
                    sign in
                  </span>
                </Link>
                <Link href="/register">
                  <span className="w-20 px-2 pt-1 text-sm text-center text-white bg-gray-400 rounded h-7">
                    sign up
                  </span>
                </Link>
              </>
            ))}
        </div>
      </div>
      <div className="h-px bg-gray-300 w-full"></div>
    </div>
  )
}

export default NavBar