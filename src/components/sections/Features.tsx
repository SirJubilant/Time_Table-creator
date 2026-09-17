import { motion } from "framer-motion";
import { Code2, Smartphone, Users, Zap } from "lucide-react";

const features = [
  {
    title: "AI-Generated Code",
    description: "Our advanced AI agents generate clean, performant, and maintainable TypeScript code instantly.",
    icon: Code2,
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/15e7be9b-7a1f-4dd9-b43d-3db46889e6dc/feature-ai-code-5fad1b19-1780625454392.webp",
  },
  {
    title: "Mobile-First Design",
    description: "Every component is built with mobile responsiveness at its core, ensuring perfect look and feel on any device.",
    icon: Smartphone,
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/15e7be9b-7a1f-4dd9-b43d-3db46889e6dc/feature-mobile-first-02115dca-1780625454094.webp",
  },
  {
    title: "Real-time Collaboration",
    description: "Work together with your team in a seamless digital workspace with live updates and feedback.",
    icon: Users,
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/15e7be9b-7a1f-4dd9-b43d-3db46889e6dc/feature-collaboration-61319b48-1780625454682.webp",
  },
  {
    title: "Instant Deployment",
    description: "Go from idea to production in minutes with our automated CI/CD pipelines and edge hosting.",
    icon: Zap,
    image: null,
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose Gebeya Dala?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We provide the tools and infrastructure needed to build world-class digital products
            at the speed of thought.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background rounded-2xl border p-8 flex flex-col gap-6 hover:shadow-lg transition-shadow"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
              {feature.image && (
                <div className="mt-auto pt-6 border-t overflow-hidden rounded-xl">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full aspect-video object-cover rounded-lg hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
