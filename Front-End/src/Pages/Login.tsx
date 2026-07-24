import { Button } from "@/components/ui/button";
import { AlertDestructive } from '@/components/ui/AlertDestructive';
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";
import axios, { AxiosError, AxiosResponse } from "axios";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addUser } from "@/redux/features/userSlice";
import api from "@/lib/axios";
import Waveform from "@/components/Waveform";

type formData = {
    email: string,
    password: string
}

type responseData = {
    email: string
}

type ErrorResponse = {
    error: string | null;
};

function Login(): JSX.Element {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const navigate: NavigateFunction = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.user.user);

    if (user) {
        navigate('/home');
    }

    const handleClick = async () =>{
        try {
            const formInput: formData = {email: email, password: password};
            console.log("Boom");
            const response: AxiosResponse = await api.post('/api/user/login', formInput);
            const dataFromAPI: responseData = response.data;
            
            dispatch(addUser({email: dataFromAPI.email, token: ''})); // no need to store the token in redux
            
            setEmail('');
            setPassword('');
            setError(null);
            navigate('/home');
        } catch(err: unknown) {
            if(axios.isAxiosError(err)){
                const newError = err as AxiosError<ErrorResponse>;
                setError(newError.response?.data?.error ?? 'Unknown error');
            } else {
                console.log("idk");
            }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key == 'Enter') {
            handleClick();
        }
    }

    return (
        <div className='flex flex-col justify-center h-[calc(90vh-90px)] items-center w-full bg-[var(--mm-ink)] px-4'>
            <div className="w-full max-w-[420px] mm-panel p-8">
                <div className="flex items-center gap-2 mb-6">
                    <Waveform bars={10} className="text-[var(--mm-signal)] h-3" />
                    <span className="mm-eyebrow">Session check-in</span>
                </div>
                <h1 className="mm-font-display text-3xl text-[var(--mm-paper)] mb-1">Welcome back</h1>
                <p className="text-sm text-[var(--mm-slate)] mb-8">Sign in to pick up where you left off.</p>

                <div className="grid w-full gap-5">
                    <div className="flex flex-col items-start space-y-2">
                        <Label htmlFor="email" className="mm-font-mono text-xs uppercase tracking-widest text-[var(--mm-slate)]">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={handleKeyDown}
                            value={email}
                            className="bg-[var(--mm-ink)] border-[var(--mm-ink-line)] text-[var(--mm-paper)] rounded-none h-11"
                        />
                    </div>
                    <div className="flex flex-col items-start space-y-2">
                        <Label htmlFor="password" className="mm-font-mono text-xs uppercase tracking-widest text-[var(--mm-slate)]">
                            Password
                        </Label>
                        <Input
                            id="password"
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            type="password"
                            value={password}
                            className="bg-[var(--mm-ink)] border-[var(--mm-ink-line)] text-[var(--mm-paper)] rounded-none h-11"
                        />
                    </div>
                </div>

                <Button className="mm-btn-primary rounded-none w-full h-12 mt-8" onClick={handleClick}>
                    Log in
                </Button>

                <p className="mt-6 text-center text-sm text-[var(--mm-slate)]">
                    New here?{" "}
                    <a href="/signup" className="text-[var(--mm-signal)] hover:underline">
                        Create an account
                    </a>
                </p>
            </div>
            {error && <AlertDestructive error={error} />}
        </div>
    )
}

export default Login;