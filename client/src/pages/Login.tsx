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

// ✅ Define Zod schema for validation
const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
})

// ✅ Infer the TypeScript type from Zod schema
type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = (data: LoginFormData) => {
        console.log("Form submitted data:", data)
    }

    return (
        <div className="flex h-screen bg-white dark:bg-black">
            {/* Left Image Section */}
            <div className="w-1/2 h-full relative overflow-hidden floating-astronaut">
                <img
                    src="./astronaut_copy.png"
                    alt="Login Illustration"
                    className="w-full h-full object-contain -translate-y-6"
                />
            </div>

            {/* Right Login Form */}
            <div className="relative w-1/2 flex items-center justify-center">
                <div className="absolute top-4 right-4">
                    <ModeToggle />
                </div>

                <Card className="w-full max-w-sm shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-6">
                                {/* Email Field */}
                                <div className="grid gap-1">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        {...register("email")}
                                    />
                                    {errors.email && (
                                        <span className="text-sm text-red-500">
                                            {errors.email.message}
                                        </span>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className="grid gap-1">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        {...register("password")}
                                    />
                                    {errors.password && (
                                        <span className="text-sm text-red-500">
                                            {errors.password.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" className="w-full mt-6">
                                Login
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex-col gap-3">
                        <p className="text-sm text-gray-500 mt-2 flex gap-2">
                            Don’t have an account?{" "}
                            <a href="#" className="text-gray-200 hover:underline">
                                Sign up
                            </a>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
