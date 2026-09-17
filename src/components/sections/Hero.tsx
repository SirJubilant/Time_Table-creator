import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Teleprompter } from "@/components/ui/teleprompter";
import { ChevronRight, Sparkles } from "lucide-react";

export function Hero() {
  const messages = [
    "AI-Powered Development",
    "Mobile-First Experiences",
    "Tailored for Africa",
    "Production-Ready Code",
  ];

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
          >
            <Sparkles className="h-4 w-4" />
            <span>The Future of Web Development is Here</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Build your next big idea <br />
            <span className="text-muted-foreground">with Gebeya Dala</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Teleprompter
              messages={messages}
              speed={2500}
              className="h-10 text-xl md:text-2xl justify-center"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Experience the most intuitive way to build, deploy, and scale web applications
            optimized for diverse markets and mobile devices.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="px-8 h-12 text-base">
              Start Building Now
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-base">
              View Showcase
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none opacity-20">
        <img
          src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/15e7be9b-7a1f-4dd9-b43d-3db46889e6dc/hero-bg-b2632739-1780625454614.webp"
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
      </div>
    </section>
  );
}
