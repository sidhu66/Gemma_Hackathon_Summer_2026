import { Button } from "@/components/ui/button";
import { AlertDestructive } from "@/components/ui/AlertDestructive";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import axios, { AxiosError, AxiosResponse } from "axios";
import { useMemo, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { addUser } from '@/redux/features/userSlice';
import api from "@/lib/axios";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";

type formData = {
    email: string,
    password: string,
    passwordConfirm: string
}

type responseData = {
    email: string
}

type ErrorResponse = {
    error: string | null;
};

const strengthLabel = (score: number) => {
    if (score <= 1) return { label: "Weak", color: "bg-red-400" };
    if (score === 2) return { label: "Okay", color: "bg-amber-400" };
    if (score === 3) return { label: "Good", color: "bg-emerald-400" };
    return { label: "Strong", color: "bg-emerald-500" };
};

function SignUp(): JSX.Element {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate: NavigateFunction = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.user.user);

    if (user) {
        navigate('/home');
    }

    const strengthScore = useMemo(() => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }, [password]);

    const strength = strengthLabel(strengthScore);
    const passwordsMatch = passwordConfirm.length > 0 && password === passwordConfirm;
    const passwordsMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

    const handleClick = async () => {
        if (loading) return;
        try {
            setLoading(true);
            const formInput: formData = { email: email, password: password, passwordConfirm: passwordConfirm };

            const response: AxiosResponse = await api.post('/api/user/register', formInput);
            const dataFromAPI: responseData = response.data;

            dispatch(addUser({ email: dataFromAPI.email, token: '' })); // no need to store the token in redux
            setEmail('');
            setPassword('');
            setPasswordConfirm('');
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
        <div className='flex min-h-[calc(90vh-90px)] w-full bg-slate-50'>
            {/* Brand panel */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-indigo-600 text-white px-16 py-16">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20" />
                    <span className="font-semibold tracking-tight">MockMate</span>
                </div>
                <div>
                    <p className="text-3xl font-semibold tracking-tight leading-snug max-w-md">
                        Your first mock interview is a minute away.
                    </p>
                    <p className="text-indigo-200 mt-4 max-w-sm">
                        Tell us the role, run the call, get a scored debrief right after.
                    </p>
                </div>
                <p className="text-sm text-indigo-200">© 2026 MockMate</p>
            </div>

            {/* Form panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-[400px]">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">Create your account</h1>
                    <p className="text-sm text-slate-500 mb-8">Takes under a minute.</p>

                    <div className="grid w-full gap-5">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                            <Input
                                id="email"
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                type="email"
                                placeholder="you@example.com"
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
                            {password.length > 0 && (
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            className={`h-full ${strength.color} transition-all`}
                                            style={{ width: `${(strengthScore / 4) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-slate-500">{strength.label}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="passwordConfirm" className="text-sm font-medium text-slate-700">Verify password</Label>
                            <div className="relative">
                                <Input
                                    id="passwordConfirm"
                                    onChange={e => setPasswordConfirm(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    type={showPassword ? "text" : "password"}
                                    value={passwordConfirm}
                                    className={`border-slate-300 rounded-lg h-11 pr-10 focus-visible:ring-1 focus-visible:ring-offset-0 ${
                                        passwordsMismatch ? "border-red-300 focus-visible:ring-red-400" : "focus-visible:ring-indigo-500"
                                    }`}
                                />
                                {passwordConfirm.length > 0 && (
                                    <div className="absolute right-3 top-0 h-11 flex items-center">
                                        {passwordsMatch ? (
                                            <Check className="w-4 h-4 text-emerald-500" />
                                        ) : (
                                            <X className="w-4 h-4 text-red-400" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleClick}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg w-full h-11 mt-8 gap-2"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Creating account…" : "Create account"}
                    </Button>

                    {error && <div className="mt-4"><AlertDestructive error={error} /></div>}

                    <p className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <a href="/login" className="text-indigo-600 hover:underline font-medium">
                            Log in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignUp;