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
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate: NavigateFunction = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.user.user);

    if (user) {
        navigate('/home');
    }

    const handleClick = async () => {
        if (loading) return;
        try {
            setLoading(true);
            const formInput: formData = { email: email, password: password };
            const response: AxiosResponse = await api.post('/api/user/login', formInput);
            const dataFromAPI: responseData = response.data;

            dispatch(addUser({ email: dataFromAPI.email, token: '' })); // no need to store the token in redux

            setEmail('');
            setPassword('');
            setError(null);
            navigate('/home');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const newError = err as AxiosError<ErrorResponse>;
                setError(newError.response?.data?.error ?? 'Unknown error');
            } else {
                console.log("idk");
            }
        } finally {
            setLoading(false);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key == 'Enter') {
            handleClick();
        }
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-slate-50">
            <div className="flex flex-1 w-full">
                {/* Brand panel */}
                <div className="hidden lg:flex flex-col justify-between w-1/2 bg-indigo-600 text-white px-16 py-16">
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left"
                        aria-label="MockMate home"
                    >
                        <div className="w-7 h-7 rounded-lg bg-white/20" />
                        <span className="font-semibold tracking-tight">MockMate</span>
                    </button>
                    <div>
                        <p className="text-3xl font-semibold tracking-tight leading-snug max-w-md">
                            Practice out loud, get scored, walk in ready.
                        </p>
                        <p className="text-indigo-200 mt-4 max-w-sm">
                            Pick up your progress and run another session before the real thing.
                        </p>
                    </div>
                    <div />
                </div>

                {/* Form panel */}
                <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16">
                    <div className="w-full max-w-[400px]">
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="lg:hidden flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity"
                            aria-label="MockMate home"
                        >
                            <div className="w-7 h-7 rounded-lg bg-indigo-600" />
                            <span className="font-semibold tracking-tight text-slate-900">MockMate</span>
                        </button>

                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">Welcome back</h1>
                        <p className="text-sm text-slate-500 mb-8">Sign in to pick up where you left off.</p>

                        <div className="grid w-full gap-5">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    onChange={e => setEmail(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    value={email}
                                    className="border-slate-300 rounded-lg h-11 focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:ring-offset-0"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        onChange={e => setPassword(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        className="border-slate-300 rounded-lg h-11 pr-10 focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:ring-offset-0"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        className="absolute right-3 top-0 h-11 flex items-center text-slate-400 hover:text-slate-600"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg w-full h-11 mt-8 gap-2"
                            onClick={handleClick}
                            disabled={loading}
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? "Signing in…" : "Log in"}
                        </Button>

                        {error && <div className="mt-4"><AlertDestructive error={error} /></div>}

                        <p className="mt-6 text-center text-sm text-slate-500">
                            New here?{" "}
                            <a href="/signup" className="text-indigo-600 hover:underline font-medium">
                                Create an account
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <footer className="flex flex-col md:flex-row gap-4 w-full justify-between px-6 py-8 items-center border-t border-slate-200 bg-white text-sm text-slate-500">
                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    aria-label="MockMate home"
                >
                    <div className="w-6 h-6 rounded-md bg-indigo-600" />
                    <span className="font-medium text-slate-900 text-sm">MockMate</span>
                </button>
                <p className="text-center md:text-right text-xs">
                    © 2026 MockMate. All rights reserved.
                </p>
            </footer>
        </div>
    )
}

export default Login;