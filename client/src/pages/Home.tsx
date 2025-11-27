import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Camera, Video, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center px-6 py-12 bg-background text-foreground">
            {/* Hero Section */}
            <motion.div
                className="text-center max-w-2xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
                    Welcome to <span className="text-primary">DreamClick</span>
                </h1>
                <p className="text-muted-foreground mb-6 text-lg">
                    Explore stunning photos, cinematic videos, and premium Video templates.
                </p>
                <Button className="group" onClick={() => navigate('/video-templates')}>
                    Explore Gallery
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full max-w-5xl">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Card className="cursor-pointer hover:shadow-xl transition-all">
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
                    <Card className="cursor-pointer hover:shadow-xl transition-all">
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
