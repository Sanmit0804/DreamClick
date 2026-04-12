'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Camera, Video, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Threads = dynamic(() => import("@/components/backgrounds/Threads"), {
  ssr: false,
  loading: () => null,
});

const Home = () => {
    const router = useRouter();

    return (
        <div className="min-h-[calc(100vh-8rem)] overflow-hidden flex flex-col items-center justify-center px-6 py-12 bg-background text-foreground">
            <div className="absolute inset-0 opacity-70">
                <Threads
                    color={[0.62, 0.82, 1]}
                    amplitude={1.1}
                    distance={0.12}
                    enableMouseInteraction
                />
            </div>
            <div className="absolute inset-0 pointer-events-none bg-background/70" />

            {/* Hero Section */}
            <div className="relative z-10 text-center max-w-2xl animate-page-enter">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
                    Welcome to <span className="text-primary">DreamClick</span>
                </h1>
                <p className="text-muted-foreground mb-6 text-lg">
                    Explore stunning photos, cinematic videos, and premium Video templates.
                </p>
                <div className="flex gap-5 justify-center">
                    <Button size="lg" className="group" onClick={() => router.push('/video-templates')}>
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <Button size="lg" variant="outline" className="group" onClick={() => router.push('/about')}>
                        Learn more
                    </Button>
                </div>
            </div>

            {/* Feature Cards */}
            <div className="relative z-10 hidden grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full max-w-5xl">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card className="cursor-pointer hover:shadow-xl transition-all" onClick={() => router.push('/explore')}>
                        <CardContent className="flex flex-col items-center justify-center py-10">
                            <Camera className="h-10 w-10 text-primary mb-3" />
                            <h3 className="font-semibold text-lg mb-2">Photos</h3>
                            <p className="text-sm text-muted-foreground text-center">
                                Browse and download high-quality images for free.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card className="cursor-pointer hover:shadow-xl transition-all">
                        <CardContent className="flex flex-col items-center justify-center py-10">
                            <Video className="h-10 w-10 text-primary mb-3" />
                            <h3 className="font-semibold text-lg mb-2">Videos</h3>
                            <p className="text-sm text-muted-foreground text-center">
                                Watch and Download sample videos and cinematic edits.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card className="cursor-pointer hover:shadow-xl transition-all" onClick={() => router.push('/video-templates')}>
                        <CardContent className="flex flex-col items-center justify-center py-10">
                            <Sparkles className="h-10 w-10 text-primary mb-3" />
                            <h3 className="font-semibold text-lg mb-2">Video Templates</h3>
                            <p className="text-sm text-muted-foreground text-center">
                                Buy Video templates and receive them instantly.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
