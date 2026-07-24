import './App.css';
import { ThemeProvider } from "@/components/theme-provider";
import Login from './Pages/Login';
import Landing from './Pages/Landing';
import { Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './Pages/SignUp';
import Home from './Pages/Home';
import Meeting from './Pages/Meeting';
import Results from './Pages/Results';
import Intake from './Pages/Intake';
import { useEffect, useState } from 'react';
import { useAppDispatch } from './redux/store';
import { addUser, removeUser } from "@/redux/features/userSlice";
import { useAppSelector } from './redux/store';
import api from './lib/axios';
import Waveform from '@/components/Waveform';

type userType = {
  email: string,
  token: string
}

function App(): JSX.Element {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);
  const [isUserChecked, setIsUserChecked] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get('/api/user/session');
        const user: userType = { token: '', email: response.data.email };
        dispatch(addUser(user));
      } catch (error) {
        console.error('No active session');
        dispatch(removeUser());
      } finally {
        setIsUserChecked(true);
      }
    };
    checkSession();
  }, [dispatch]);

  if (!isUserChecked) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-[var(--mm-ink)]">
        <Waveform live bars={20} className="text-[var(--mm-signal)] h-8" />
        <p className="text-xs tracking-[0.15em] uppercase text-[var(--mm-slate)]">
          Cueing up CareerCoach…
        </p>
      </div>
    );
  }

  // Every page now ships its own header (Landing/Login/SignUp have a
  // self-contained nav or brand panel; Home/Intake/Meeting/Results have
  // their own top bar), so there's no shared Navbar rendered here anymore
  // — that used to cause a duplicate nav bar on Landing/Login/SignUp.
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className='min-h-screen w-full bg-[var(--mm-ink)] text-[var(--mm-paper)]'>
        <Routes>
          <Route path='/login' element={!user ? <Login /> : <Navigate to='/home' />} />
          <Route path='/' element={!user ? <Landing /> : <Navigate to='/home' />} />
          <Route path='/signup' element={!user ? <SignUp /> : <Navigate to='/home' />} />
          <Route path='/home' element={user ? <Home /> : <Navigate to='/login' />} />
          <Route path='/intake' element={user ? <Intake /> : <Navigate to='/login' />} />
          <Route
            path='/meeting'
            element={user ? <Meeting /> : <Navigate to='/login' />}
          />
          <Route path='/results' element={user ? <Results /> : <Navigate to='/login' />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;