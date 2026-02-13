import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Heart, Users, CheckCircle, Smartphone, Globe, Info, Star, ShieldCheck, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const Index = () => {
  // Animated counter hook
  const useCounter = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }, [end, duration]);
    return count;
  };

  const mealsSaved = useCounter(25000);
  const donors = useCounter(500);
  const co2 = useCounter(12); // base value, will append string

  const impactStats = [
    { label: "Meals Saved", value: `${mealsSaved.toLocaleString()}+`, icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Donors Joined", value: `${donors}+`, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "CO₂ Reduced", value: `${co2}.5 Tons`, icon: Leaf, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Register & List",
      description: "Donors easily list surplus food details including quantity, generic type, and pickup window.",
      icon: Smartphone
    },
    {
      step: 2,
      title: "Instant Alerts",
      description: "Nearby verified NGOs receive real-time notifications about available food in their area.",
      icon: Zap
    },
    {
      step: 3,
      title: "Pickup & Serve",
      description: "NGOs claim the donation, pick it up, and distribute it to those in need, completing the cycle.",
      icon: Globe
    },
  ];

  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Restaurant Owner",
      quote: "Surplus2Serve made it incredibly easy for us to donate our extra food. Knowing it goes to people in need instead of the trash is the best feeling.",
      avatar: "SJ"
    },
    {
      name: "Community Hope",
      role: "Local NGO",
      quote: "This platform has been a game-changer for our food sourcing. We can now plan our meals better and reach more families.",
      avatar: "CH"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative w-full py-24 lg:py-32 flex flex-col items-center justify-center overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-accent/20 blur-[100px] animate-pulse delay-700"></div>

        <div className="container px-4 md:px-6 relative z-10 text-center space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary font-medium mb-4 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Revolutionizing Food Rescue
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground drop-shadow-sm">
            Turn Surplus into <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Smiles</span>
          </h1>

          <p className="max-w-[700px] mx-auto text-xl text-muted-foreground md:text-2xl leading-relaxed">
            The smartest way to bridge the gap between food abundance and hunger.
            Join the movement to end food waste today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300" asChild>
              <Link to="/auth">
                Start Donating Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg border-2 hover:bg-accent/10 hover:text-accent hover:border-accent transition-all duration-300" asChild>
              <Link to="/auth?mode=ngo">
                Register as NGO
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-muted/30 border-y border-border/50">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {impactStats.map((stat, idx) => (
              <div key={idx} className="group relative bg-card hover:bg-card/50 p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 text-center">
                <div className={`h-16 w-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <h3 className="text-5xl font-bold mb-2 tracking-tight text-foreground">{stat.value}</h3>
                <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 lg:py-32 relative">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connecting surplus to service in three simple steps.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Connecting line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10 border-t-2 border-dashed border-muted"></div>

            {howItWorks.map((item, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center space-y-6 group">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-background border-4 border-muted group-hover:border-primary transition-colors duration-500 flex items-center justify-center shadow-lg z-10">
                    <item.icon className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors duration-500" />
                  </div>
                  <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md">
                    {item.step}
                  </div>
                </div>
                <div className="space-y-2 max-w-[300px]">
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Why Choose Surplus2Serve?</h2>
              <p className="text-primary-foreground/80 text-lg leading-relaxed">
                We are more than just a platform; we are a movement. By leveraging technology, we make food rescue efficient, transparent, and impactful.
              </p>
              <ul className="space-y-6">
                {[
                  { icon: ShieldCheck, text: "Verified NGOs & Donors" },
                  { icon: Zap, text: "Real-time Availability Updates" },
                  { icon: Leaf, text: "Wait-less, Paper-less, Waste-less" },
                ].map((feature, i) => (
                  <li key={i} className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-medium">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm mr-4">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-bold">{t.name}</div>
                      <div className="text-sm opacity-70">{t.role}</div>
                    </div>
                  </div>
                  <p className="italic opacity-90">"{t.quote}"</p>
                  <div className="flex gap-1 mt-4 text-yellow-400">
                    {[...Array(5)].map((_, starI) => <Star key={starI} className="h-4 w-4 fill-current" />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA Footer */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="container px-4 md:px-6 text-center space-y-6">
          <h2 className="text-2xl font-bold">Ready to make a difference?</h2>
          <div className="flex justify-center gap-6 text-muted-foreground">
            <Link to="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="#" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          <p className="text-sm text-muted-foreground/60">
            © 2026 Surplus2Serve. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
