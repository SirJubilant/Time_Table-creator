import { Github, Twitter, Linkedin, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <img src="/gebeya.webp" alt="Gebeya Logo" className="h-8 w-auto" />
              <span className="font-bold text-xl tracking-tight">Dala</span>
            </div>
            <p className="text-muted-foreground text-base max-w-xs mb-8">
              Empowering the next generation of builders with AI-driven development tools
              optimized for global scale.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm">Features</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm">Components</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm">Templates</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm">Community</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm">Showcase</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground text-sm">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2024 Gebeya Dala. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
            <a href="#" className="hover:text-foreground">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
