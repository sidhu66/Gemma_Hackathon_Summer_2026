import { Button } from "./ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
    navigationMenuTriggerStyle
  } from "./ui/navigation-menu";

import { Link, NavigateFunction } from "react-router-dom";
import { useAppSelector } from "@/redux/store";
import { User } from "@/redux/features/userSlice";
import { useLogout, LogoutHook } from "@/hooks/useLogout";
import { useNavigate } from "react-router-dom";
import Waveform from "./Waveform";

export default function Navbar(): JSX.Element{
    const user: User | null = useAppSelector<User | null>(state=>state.user.user);
    const {logout}: LogoutHook = useLogout();
    const navigate: NavigateFunction = useNavigate();

    function handleClick(e: React.SyntheticEvent<HTMLButtonElement>): void {
        e.preventDefault();
        logout();
        navigate('/');
    }

    return(
        <div className="border-b border-[var(--mm-ink-line)] bg-[var(--mm-ink)]">
            <nav className='w-full flex flex-row justify-between items-center px-6 md:px-10 py-5'>
                <Link to="/" className="flex flex-row items-center gap-2">
                    <Waveform bars={10} className="text-[var(--mm-signal)] h-4" />
                    <p className="mm-font-display text-xl text-[var(--mm-paper)]">
                        MockMate
                    </p>
                </Link>

                <div className="flex flex-row items-center">
                    <NavigationMenu className="lg:hidden flex">
                        <NavigationMenuList>
                            <NavigationMenuItem>
                            <NavigationMenuTrigger className="bg-transparent text-[var(--mm-paper)] mm-font-mono text-xs uppercase tracking-widest">Details</NavigationMenuTrigger>
                            <NavigationMenuContent className="bg-[var(--mm-ink-soft)] border border-[var(--mm-ink-line)]">
                                <Link to="/login" >
                                    <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-transparent text-[var(--mm-paper)]`}>Deets</NavigationMenuLink>
                                </Link>
                                <Link to="/login" >
                                    <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-transparent text-[var(--mm-paper)]`}>something else</NavigationMenuLink>
                                </Link>
                            </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                    { user ? (
                        <Button onClick={handleClick} className="mm-btn-ghost rounded-none h-10 px-5 hidden md:flex">Log out</Button>
                    ) : (
                        <>
                            <Link to='/login'>
                                <Button className="mm-btn-ghost rounded-none h-10 px-5 mr-3 hidden md:flex border-transparent">Log in</Button>
                            </Link>
                            <Link to="/signup">
                                <Button className="mm-btn-primary rounded-none h-10 px-5 hidden md:flex">Sign up</Button>
                            </Link>
                        </>
                    )}

                    {/* <ModeToggle /> */}
                </div>
            </nav>
        </div>
    )
};