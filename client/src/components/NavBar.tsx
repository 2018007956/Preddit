import Link from "next/link"
import { useAuthDispatch, useAuthState } from "../context/auth";
import axios from "axios";

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
    <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between h-16 px-5 bg-white">
      <span className="text-2xl font-semibold text-gray-400">
        <Link href="/">Community</Link>
      </span>

      <div className="max-w-full px-4">
        <div className="relative flex items-center bg-gray-100 border rounded hover:border-gray-700 hover:bg-white">
          <input
            type="text"
            placeholder="Search"
            className="px-3 py-1 bg-transparent rounded focus:outline-none"
          />
        </div>
      </div>

      <div className="flex">
        {!loading &&
          (authenticated ? (
            <button
              className="w-20 p-2 mr-2 text-center text-white bg-gray-400 rounded"
              onClick={handleLogOut}
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login">
                <span className="w-20 p-2 mr-2 text-center text-blue-500 border border-blue-500 rounded">
                  sign in
                </span>
              </Link>
              <Link href="/register">
                <span className="w-20 p-2 text-center text-white bg-gray-400 rounded">sign up</span>
              </Link>
            </>
          ))}
      </div>
    </div>
  )
}

export default NavBar