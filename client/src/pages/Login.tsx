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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useEffect, useState } from "react"
import { PasswordInput } from "@/components/ui/passwordInput"
import authService from "@/services/auth"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import useDeviceType from "@/hooks/useDeviceType"
import { useNavigate, useSearchParams } from "react-router-dom"

// ✅ Define Zod schemas for validation
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
})

const signupSchema = z.object({
    // Basic Info
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    
    // Role
    role: z.enum(['end_user', 'content_creator'], {
        message: "Please select a role",
    }),
    
    // Contact Info (Optional)
    phone: z.string().optional().refine((val) => {
        if (!val) return true;
        return /^[6-9]\d{9}$/.test(val);
    }, "Please enter a valid 10-digit Indian phone number"),
    
    // Billing Address (Optional for end_user, but shown for content_creator)
    billingAddress: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional().refine((val) => {
            if (!val) return true;
            return /^\d{6}$/.test(val);
        }, "Please enter a valid 6-digit PIN code"),
    }).optional(),
    
    // Creator Profile (Only for content_creator)
    creatorProfile: z.object({
        bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
        website: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
        socialLinks: z.object({
            youtube: z.string().optional(),
            instagram: z.string().optional(),
            twitter: z.string().optional(),
        }).optional(),
    }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

// ✅ Infer the TypeScript types from Zod schemas
type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

export default function Auth() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const currentDevice = useDeviceType();
    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState("basic");
    const deviceType = useDeviceType();

    // Determine initial mode from URL query parameter
    const getInitialMode = () => {
        const mode = searchParams.get('mode');
        return mode === 'signup' ? false : true;
    }

    const [isLoginScreen, setIsLoginScreen] = useState(getInitialMode());

    // Update URL when mode changes
    const updateUrlMode = (isLogin: boolean) => {
        const newMode = isLogin ? 'login' : 'signup';
        setSearchParams({ mode: newMode });
    }

    // Sync state with URL changes
    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'signup') {
            setIsLoginScreen(false);
        } else if (mode === 'login') {
            setIsLoginScreen(true);
        }
    }, [searchParams]);

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
        watch: watchSignup,
        formState: { errors: signupErrors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            role: 'end_user',
        }
    })

    const selectedRole = watchSignup('role');

    const onLoginSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const response = await authService.login(data);
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            toast.success("Login successful!");
            navigate("/dashboard");
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Login failed. Please check your credentials and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const onSignupSubmit = async (data: SignupFormData) => {
        setIsLoading(true);
        console.log("Signup form submitted:", data)

        try {
            const response = await authService.signup(data);
            toast.success("Account created successfully!");
            console.log("Signup response:", response);

            setIsLoginScreen(true);
            updateUrlMode(true);
            signupReset();
            setCurrentTab("basic");

        } catch (error: any) {
            console.error("Signup error:", error);

            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.message) {
                toast.error(error.message);
            } else if (error.errors) {
                toast.error("Please check your input and try again.");
            } else {
                toast.error("Signup failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    const switchMode = () => {
        const newIsLoginScreen = !isLoginScreen;
        setIsLoginScreen(newIsLoginScreen);
        updateUrlMode(newIsLoginScreen);
        loginReset();
        signupReset();
        setCurrentTab("basic");
    }

    return (
        <div className="flex h-screen bg-white dark:bg-black">
            {/* Left Image Section */}
            {currentDevice == 'laptop' && (
                <div className="w-1/2 h-full relative overflow-hidden floating-astronaut">
                    <img
                        src="./astronaut_copy.png"
                        alt="Login Illustration"
                        className="w-full h-full object-contain -translate-y-6"
                    />
                </div>
            )}

            {/* Right Auth Form */}
            <div className={`relative h-full flex items-center justify-center overflow-y-auto ${currentDevice == 'laptop' ? 'w-1/2' : 'w-full'}`}>
                <div className="absolute top-4 right-4 z-10">
                    <ModeToggle />
                </div>


            <Card style={{ width: '500px'}} className={deviceType == 'mobile' ? 'mx-4 mt-80 mb-10' : ''}>
                    <CardHeader className="text-center px-4 py-4 sm:px-6">
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
                            <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="space-y-4">
                                <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="basic">Basic</TabsTrigger>
                                        <TabsTrigger value="contact">Contact</TabsTrigger>
                                        <TabsTrigger value="additional" disabled={selectedRole === 'end_user'}>
                                            Profile
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Basic Information Tab */}
                                    <TabsContent value="basic" className="space-y-4 mt-4">
                                        {/* Name Field */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="signup-name">Full Name *</Label>
                                            <Input
                                                id="signup-name"
                                                type="text"
                                                placeholder="Enter your full name"
                                                {...registerSignup("name")}
                                                disabled={isLoading}
                                            />
                                            {signupErrors.name && (
                                                <span className="text-xs sm:text-sm text-red-500">
                                                    {signupErrors.name.message}
                                                </span>
                                            )}
                                        </div>

                                        {/* Email Field */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="signup-email">Email *</Label>
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                placeholder="m@example.com"
                                                {...registerSignup("email")}
                                                disabled={isLoading}
                                            />
                                            {signupErrors.email && (
                                                <span className="text-xs sm:text-sm text-red-500">
                                                    {signupErrors.email.message}
                                                </span>
                                            )}
                                        </div>

                                        {/* Password Field */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="signup-password">Password *</Label>
                                            <PasswordInput
                                                id="signup-password"
                                                placeholder="At least 6 characters"
                                                {...registerSignup("password")}
                                                disabled={isLoading}
                                            />
                                            {signupErrors.password && (
                                                <span className="text-xs sm:text-sm text-red-500">
                                                    {signupErrors.password.message}
                                                </span>
                                            )}
                                        </div>

                                        {/* Confirm Password Field */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="signup-confirm-password">Confirm Password *</Label>
                                            <PasswordInput
                                                id="signup-confirm-password"
                                                placeholder="Confirm your password"
                                                {...registerSignup("confirmPassword")}
                                                disabled={isLoading}
                                            />
                                            {signupErrors.confirmPassword && (
                                                <span className="text-xs sm:text-sm text-red-500">
                                                    {signupErrors.confirmPassword.message}
                                                </span>
                                            )}
                                        </div>

                                        {/* Role Selection */}
                                        <div className="grid gap-2">
                                            <Label>Account Type *</Label>
                                            <RadioGroup 
                                                value={selectedRole}
                                                onValueChange={(value) => {
                                                    registerSignup("role").onChange({ target: { name: "role", value } });
                                                }}
                                                disabled={isLoading}
                                            >
                                                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent">
                                                    <RadioGroupItem value="end_user" id="end_user" />
                                                    <Label htmlFor="end_user" className="flex-1 cursor-pointer">
                                                        <div className="font-medium">End User</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Browse and purchase templates
                                                        </div>
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent">
                                                    <RadioGroupItem value="content_creator" id="content_creator" />
                                                    <Label htmlFor="content_creator" className="flex-1 cursor-pointer">
                                                        <div className="font-medium">Content Creator</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Create and sell video templates
                                                        </div>
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                            {signupErrors.role && (
                                                <span className="text-xs sm:text-sm text-red-500">
                                                    {signupErrors.role.message}
                                                </span>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* Contact & Address Tab */}
                                    <TabsContent value="contact" className="space-y-4 mt-4">
                                        {/* Phone */}
                                        <div className="grid gap-2">
                                            <Label htmlFor="signup-phone">Phone Number (Optional)</Label>
                                            <Input
                                                id="signup-phone"
                                                type="tel"
                                                placeholder="9876543210"
                                                {...registerSignup("phone")}
                                                disabled={isLoading}
                                            />
                                            {signupErrors.phone && (
                                                <span className="text-xs sm:text-sm text-red-500">
                                                    {signupErrors.phone.message}
                                                </span>
                                            )}
                                        </div>

                                        <div className="pt-2">
                                            <h3 className="text-sm font-medium mb-3">Billing Address (Optional)</h3>
                                            
                                            <div className="space-y-4">
                                                {/* Street */}
                                                <div className="grid gap-2">
                                                    <Label htmlFor="signup-street">Street Address</Label>
                                                    <Input
                                                        id="signup-street"
                                                        type="text"
                                                        placeholder="Enter street address"
                                                        {...registerSignup("billingAddress.street")}
                                                        disabled={isLoading}
                                                    />
                                                </div>

                                                {/* City & State */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="signup-city">City</Label>
                                                        <Input
                                                            id="signup-city"
                                                            type="text"
                                                            placeholder="City"
                                                            {...registerSignup("billingAddress.city")}
                                                            disabled={isLoading}
                                                        />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label htmlFor="signup-state">State</Label>
                                                        <Input
                                                            id="signup-state"
                                                            type="text"
                                                            placeholder="State"
                                                            {...registerSignup("billingAddress.state")}
                                                            disabled={isLoading}
                                                        />
                                                    </div>
                                                </div>

                                                {/* ZIP Code */}
                                                <div className="grid gap-2">
                                                    <Label htmlFor="signup-zip">PIN Code</Label>
                                                    <Input
                                                        id="signup-zip"
                                                        type="text"
                                                        placeholder="400001"
                                                        {...registerSignup("billingAddress.zipCode")}
                                                        disabled={isLoading}
                                                    />
                                                    {signupErrors.billingAddress?.zipCode && (
                                                        <span className="text-xs sm:text-sm text-red-500">
                                                            {signupErrors.billingAddress.zipCode.message}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Creator Profile Tab */}
                                    <TabsContent value="additional" className="space-y-4 mt-4">
                                        {selectedRole === 'content_creator' && (
                                            <>
                                                {/* Bio */}
                                                <div className="grid gap-2">
                                                    <Label htmlFor="signup-bio">Bio</Label>
                                                    <textarea
                                                        id="signup-bio"
                                                        placeholder="Tell us about yourself and your work..."
                                                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        {...registerSignup("creatorProfile.bio")}
                                                        disabled={isLoading}
                                                    />
                                                    {signupErrors.creatorProfile?.bio && (
                                                        <span className="text-xs sm:text-sm text-red-500">
                                                            {signupErrors.creatorProfile.bio.message}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Website */}
                                                <div className="grid gap-2">
                                                    <Label htmlFor="signup-website">Website</Label>
                                                    <Input
                                                        id="signup-website"
                                                        type="url"
                                                        placeholder="https://yourwebsite.com"
                                                        {...registerSignup("creatorProfile.website")}
                                                        disabled={isLoading}
                                                    />
                                                    {signupErrors.creatorProfile?.website && (
                                                        <span className="text-xs sm:text-sm text-red-500">
                                                            {signupErrors.creatorProfile.website.message}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Social Links */}
                                                <div className="pt-2">
                                                    <h3 className="text-sm font-medium mb-3">Social Links (Optional)</h3>
                                                    
                                                    <div className="space-y-3">
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="signup-youtube">YouTube</Label>
                                                            <Input
                                                                id="signup-youtube"
                                                                type="text"
                                                                placeholder="@yourchannel or channel URL"
                                                                {...registerSignup("creatorProfile.socialLinks.youtube")}
                                                                disabled={isLoading}
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label htmlFor="signup-instagram">Instagram</Label>
                                                            <Input
                                                                id="signup-instagram"
                                                                type="text"
                                                                placeholder="@yourusername"
                                                                {...registerSignup("creatorProfile.socialLinks.instagram")}
                                                                disabled={isLoading}
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label htmlFor="signup-twitter">Twitter/X</Label>
                                                            <Input
                                                                id="signup-twitter"
                                                                type="text"
                                                                placeholder="@yourusername"
                                                                {...registerSignup("creatorProfile.socialLinks.twitter")}
                                                                disabled={isLoading}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </TabsContent>
                                </Tabs>

                                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                                    {currentTab !== "basic" && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                const tabs = ["basic", "contact", "additional"];
                                                const currentIndex = tabs.indexOf(currentTab);
                                                if (currentIndex > 0) {
                                                    setCurrentTab(tabs[currentIndex - 1]);
                                                }
                                            }}
                                            disabled={isLoading}
                                            className="w-full sm:w-auto"
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    
                                    {currentTab === "basic" && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setCurrentTab("contact")}
                                            disabled={isLoading}
                                            className="w-full"
                                        >
                                            Next: Contact Info
                                        </Button>
                                    )}

                                    {currentTab === "contact" && selectedRole === 'content_creator' && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setCurrentTab("additional")}
                                            disabled={isLoading}
                                            className="flex-1"
                                        >
                                            Next: Profile
                                        </Button>
                                    )}

                                    {(currentTab === "contact" && selectedRole === 'end_user') || currentTab === "additional" ? (
                                        <Button 
                                            type="submit" 
                                            className="flex-1" 
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                                                </>
                                            ) : (
                                                "Create Account"
                                            )}
                                        </Button>
                                    ) : null}
                                </div>
                            </form>
                        )}
                    </CardContent>

                    <CardFooter className="flex-col gap-2 sm:gap-3 px-4 sm:px-6 pb-6">
                        <div className="text-sm mt-2 flex flex-col sm:flex-row gap-1 sm:gap-2 items-center justify-center">
                            <p className="text-gray-500">
                                {isLoginScreen ? "Don't have an account?" : "Already have an account?"}
                            </p>
                            <button
                                type="button"
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