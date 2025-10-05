import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { PasswordInput } from "@/components/ui/passwordInput"
import authService from "@/services/auth"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import useDeviceType from "@/hooks/useDeviceType"

// ✅ Define Zod schemas for validation
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
})

const signupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

// ✅ Infer the TypeScript types from Zod schemas
type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

export default function Auth() {
    const [isLoginScreen, setIsLoginScreen] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const currentDevice = useDeviceType();

    // Login form
    const {
        register: registerLogin,
        handleSubmit: handleLoginSubmit,
        reset: loginReset,
        formState: { errors: loginErrors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    // Signup form
    const {
        register: registerSignup,
        handleSubmit: handleSignupSubmit,
        reset: signupReset,
        formState: { errors: signupErrors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    })

    const onLoginSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        console.log("Login form submitted:", data)

        try {
            const response = await authService.login(data);
            toast.success("Login successful!");
            console.log("Login response:", response);

            // Handle successful login (redirect, store user data, etc.)
            // Example: router.push('/dashboard');

        } catch (error: any) {
            console.error("Login error:", error);

            // Handle different error types
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.message) {
                toast.error(error.message);
            } else {
                toast.error("Login failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    const onSignupSubmit = async (data: SignupFormData) => {
        setIsLoading(true);
        console.log("Signup form submitted:", data)

        try {
            const response = await authService.signup(data);
            toast.success("Account created successfully!");
            console.log("Signup response:", response);

            // Optionally switch to login screen after successful signup
            setIsLoginScreen(true);
            signupReset();
            toast.info("Please login with your new credentials");

        } catch (error: any) {
            console.error("Signup error:", error);

            // Handle different error types
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.message) {
                toast.error(error.message);
            } else if (error.errors) {
                // Handle Zod validation errors from service
                toast.error("Please check your input and try again.");
            } else {
                toast.error("Signup failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    const switchMode = () => {
        setIsLoginScreen(!isLoginScreen);
        loginReset();
        signupReset();
    }

    return (
        <div className="flex h-screen bg-white dark:bg-black">
            {/* Left Image Section */}
            {currentDevice !== 'mobile' && (
                <div className="w-1/2 h-full relative overflow-hidden floating-astronaut">
                    <img
                        src="./astronaut_copy.png"
                        alt="Login Illustration"
                        className="w-full h-full object-contain -translate-y-6"
                    />
                </div>
            )}

            {/* Right Auth Form */}
            <div className={`relative h-full flex items-center justify-center ${currentDevice !== 'mobile' ? 'w-1/2' : 'w-full'}`}>
                <div className="absolute top-4 right-4">
                    <ModeToggle />
                </div>

                <Card className="w-full max-w-md mx-4 sm:mx-auto shadow-lg">
                    <CardHeader className="text-center px-4 py-2 sm:px-6">
                        <CardTitle className="text-xl sm:text-2xl font-semibold">
                            {isLoginScreen ? "Welcome Back" : "Create Account"}
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            {isLoginScreen
                                ? "Enter your credentials to access your account"
                                : "Enter your details to create a new account"}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-4 sm:px-6">
                        {isLoginScreen ? (
                            <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="flex flex-col gap-4 sm:gap-6">
                                {/* Email Field */}
                                <div className="grid gap-1 sm:gap-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="m@example.com"
                                        {...registerLogin("email")}
                                        disabled={isLoading}
                                    />
                                    {loginErrors.email && (
                                        <span className="text-xs sm:text-sm text-red-500 -mt-1">
                                            {loginErrors.email.message}
                                        </span>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className="grid gap-1 sm:gap-2">
                                    <Label htmlFor="login-password">Password</Label>
                                    <PasswordInput
                                        id="login-password"
                                        placeholder="Enter your password"
                                        {...registerLogin("password")}
                                        disabled={isLoading}
                                    />
                                    {loginErrors.password && (
                                        <span className="text-xs sm:text-sm text-red-500 -mt-1">
                                            {loginErrors.password.message}
                                        </span>
                                    )}
                                </div>

                                <Button type="submit" className="w-full mt-4 sm:mt-6" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                                        </>
                                    ) : (
                                        "Login"
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="flex flex-col gap-4 sm:gap-6">
                                {/* Name Field */}
                                <div className="grid gap-1 sm:gap-2">
                                    <Label htmlFor="signup-name">Full Name</Label>
                                    <Input
                                        id="signup-name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        {...registerSignup("name")}
                                        disabled={isLoading}
                                    />
                                    {signupErrors.name && (
                                        <span className="text-xs sm:text-sm text-red-500 -mt-1">
                                            {signupErrors.name.message}
                                        </span>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div className="grid gap-1 sm:gap-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="m@example.com"
                                        {...registerSignup("email")}
                                        disabled={isLoading}
                                    />
                                    {signupErrors.email && (
                                        <span className="text-xs sm:text-sm text-red-500 -mt-1">
                                            {signupErrors.email.message}
                                        </span>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className="grid gap-1 sm:gap-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <PasswordInput
                                        id="signup-password"
                                        placeholder="At least 6 characters"
                                        {...registerSignup("password")}
                                        disabled={isLoading}
                                    />
                                    {signupErrors.password && (
                                        <span className="text-xs sm:text-sm text-red-500 -mt-1">
                                            {signupErrors.password.message}
                                        </span>
                                    )}
                                </div>

                                {/* Confirm Password Field */}
                                <div className="grid gap-1 sm:gap-2">
                                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                                    <PasswordInput
                                        id="signup-confirm-password"
                                        placeholder="Confirm your password"
                                        {...registerSignup("confirmPassword")}
                                        disabled={isLoading}
                                    />
                                    {signupErrors.confirmPassword && (
                                        <span className="text-xs sm:text-sm text-red-500 -mt-1">
                                            {signupErrors.confirmPassword.message}
                                        </span>
                                    )}
                                </div>

                                <Button type="submit" className="w-full mt-4 sm:mt-6" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>

                    <CardFooter className="flex-col gap-2 sm:gap-3 px-4 sm:px-6">
                        <div className="text-sm mt-2 flex flex-col sm:flex-row gap-1 sm:gap-2 items-center justify-center">
                            <p className="text-gray-500">
                                {isLoginScreen ? "Don't have an account?" : "Already have an account?"}
                            </p>
                            <button
                                className="hover:cursor-pointer font-medium disabled:opacity-50"
                                onClick={switchMode}
                                disabled={isLoading}
                            >
                                {isLoginScreen ? 'Sign up' : 'Login'}
                            </button>
                        </div>
                    </CardFooter>
                </Card>

            </div>
        </div>
    )
}