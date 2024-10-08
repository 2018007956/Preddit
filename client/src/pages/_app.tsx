import '../styles/globals.css'
import type { AppProps } from "next/app";
import { AuthProvider } from '../context/auth';
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';
import { SWRConfig } from 'swr';
import axios from 'axios';
import MainSidebar from '../components/MainSidebar';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../styles/theme';
import { GlobalStyles } from '../styles/global-styles';
import { useState, useEffect } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/api";
  axios.defaults.withCredentials = true;

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

  return <>
    <script defer src="https://use.fontawesome.com/releases/v6.1.1/js/all.js" integrity="sha384-xBXmu0dk1bEoiwd71wOonQLyH+VpgR1XcDH3rtxrLww5ajNTuMvBdL5SOiFZnNdp" crossOrigin="anonymous"></script>
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <GlobalStyles />
      <SWRConfig value={{fetcher}}>
        <AuthProvider>
          {!authRoute && <NavBar toggleTheme={toggleTheme} theme={theme} />}
          <div className={`flex ${theme}`}>
            {!authRoute && <MainSidebar />}
            <div className={authRoute ? "w-full" : `w-full ml-64 pt-12 min-h-screen`}>
              <Component {...pageProps} />
            </div>
          </div>
        </AuthProvider>
      </SWRConfig>
    </ThemeProvider>
  </>
}