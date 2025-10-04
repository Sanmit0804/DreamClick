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

export default function Login() {
    return (
        <div className="flex h-screen bg-black">
            {/* Left Image Section */}
            <div className="w-1/2 h-full relative overflow-hidden">
                <img
                    src="https://i.pinimg.com/736x/39/ee/7f/39ee7f4ec3fa453c361b10f28107d799.jpg"
                    alt="Login Illustration"
                    className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/20" />
            </div>


            {/* Divider Line */}
            {/* <div className="w-[0.1px] bg-gray-500 h-full" /> */}

            {/* Right Login Form */}
            <div className="w-1/2 flex items-center justify-center">
                <Card className="w-full max-w-sm shadow-lg borde">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <a
                                            href="#"
                                            className="ml-auto text-sm text-gray-200 hover:underline"
                                        >
                                            Forgot?
                                        </a>
                                    </div>
                                    <Input id="password" type="password" required />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex-col gap-3">
                        <Button type="submit" className="w-full">
                            Login
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">
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
