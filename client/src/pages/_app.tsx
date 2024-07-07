import '../styles/globals.css'
import Axios from "axios";
import type { AppProps } from "next/app";
import { AuthProvider } from '../context/auth';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';
import { SWRConfig } from 'swr';
import axios from 'axios';

export default function App({ Component, pageProps }: AppProps) {
  Axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/api";
  Axios.defaults.withCredentials = true;

  const { pathname } = useRouter();
  const authRoutes = ["/register", "/login"];
  const authRoute = authRoutes.includes(pathname);

  const fetcher = async (url: string) => {
    try {
        const res = await axios.get(url);
        return res.data;
    } catch (error: any) {
        throw error.response.data;
    }
  }

  return <SWRConfig value={{fetcher}}>
    <AuthProvider>
      {!authRoute && <NavBar />}
      <div className={authRoute ? "" : "pt-16"}>
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  </SWRConfig>
}