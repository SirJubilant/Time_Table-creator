import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const projects = [
  {
    title: "E-Commerce Suite",
    category: "Marketplace",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=1600",
    tags: ["React", "Stripe", "Tailwind"],
  },
  {
    title: "FinTech Dashboard",
    category: "Banking",
    image: "https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=1600",
    tags: ["Charts", "Dashboard", "Real-time"],
  },
  {
    title: "HealthConnect App",
    category: "Healthcare",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1600",
    tags: ["Mobile", "IoT", "Data"],
  },
];

export function Showcase() {
  return (
    <section id="showcase" className="py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Built with Dala</h2>
            <p className="text-muted-foreground text-lg">
              Explore a collection of high-performance applications and platforms
              built using our AI-assisted development tools.
            </p>
          </div>
          <Badge variant="outline" className="px-4 py-1 text-sm">
            324+ Projects Launched
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-6 shadow-md group-hover:shadow-xl transition-shadow duration-300">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Badge className="bg-white text-black hover:bg-white/90">View Case Study</Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">
                      {project.category}
                    </span>
                    <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-sm text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
