import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-primary text-primary-foreground rounded-3xl p-10 md:p-20 text-center relative overflow-hidden"
        >
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-6xl font-bold mb-6 tracking-tight">
              Ready to transform your vision <br className="hidden md:block" />
              into a digital reality?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of developers and entrepreneurs who are already building
              the future of the web with Gebeya Dala.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
              />
              <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 h-12 font-bold">
                Get Early Access
              </Button>
            </div>
            <p className="mt-6 text-sm text-primary-foreground/60">
              No credit card required. Start for free.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
