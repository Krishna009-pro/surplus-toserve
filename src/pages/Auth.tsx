import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate, useSearchParams } from "react-router-dom";

import { toast } from "sonner";
import { Loader2, Heart, ShieldCheck, Zap } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@backend/firebase";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("mode") === "ngo" ? "register" : "login";

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register form state
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("donor");

  // NGO specific state
  const [organizationName, setOrganizationName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      const user = userCredential.user;

      const userData: any = {
        uid: user.uid,
        email: user.email,
        role,
        createdAt: new Date().toISOString(),
        phone,
      };

      if (role === 'donor') {
        userData.firstName = firstName;
        userData.lastName = lastName;
        userData.approved = true; // Donors are auto-approved
      } else if (role === 'ngo') {
        userData.organizationName = organizationName;
        userData.registrationNumber = registrationNumber;
        userData.address = address;
        userData.website = website;
        userData.firstName = firstName; // Point of contact
        userData.lastName = lastName;   // Point of contact
        userData.approved = false; // NGOs need approval
      }

      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), userData);

      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Rotating testimonials or impactful messages
  const [activeMessage, setActiveMessage] = useState(0);
  const messages = [
    { text: "Together, we can end hunger.", icon: Heart },
    { text: "Verified impact, real change.", icon: ShieldCheck },
    { text: "Instant connections, zero waste.", icon: Zap },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMessage((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">

      {/* Visual Side (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 text-white p-10 relative overflow-hidden">
        {/* Background Overlay Image - "Live Giving Food" Concept */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-60 animate-kenburns"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop')"
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

        <div className="relative z-10 animate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Surplus2Serve</h1>
          <p className="text-zinc-300 text-lg">Connecting surplus to smiles.</p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="h-24 relative">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`absolute bottom-0 left-0 transition-all duration-700 transform ${idx === activeMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/10">
                    <msg.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-2xl font-medium tracking-tight text-white">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          <blockquote className="space-y-2 border-l-2 border-primary/50 pl-6">
            <p className="text-lg text-zinc-300 italic">
              "Every meal saved is a step towards a hunger-free world. Join our community of 500+ donors making a difference today."
            </p>
          </blockquote>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-4 lg:p-8 bg-background">
        <div className="mx-auto w-full max-w-[450px] space-y-6">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Get Started</h2>
            <p className="text-muted-foreground">Enter your details below to create your account or sign in.</p>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="animate-fade-in">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button className="w-full h-11 text-lg font-medium shadow-md" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="grid animate-fade-in gap-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-3 pb-2">
                  <Label className="text-base font-medium">I am a...</Label>
                  <RadioGroup defaultValue="donor" value={role} onValueChange={setRole} className="grid grid-cols-2 gap-4">
                    <div>
                      <RadioGroupItem value="donor" id="donor" className="peer sr-only" />
                      <Label
                        htmlFor="donor"
                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                      >
                        <Heart className="mb-2 h-6 w-6" />
                        <span className="font-semibold">Donor</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="ngo" id="ngo" className="peer sr-only" />
                      <Label
                        htmlFor="ngo"
                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                      >
                        <ShieldCheck className="mb-2 h-6 w-6" />
                        <span className="font-semibold">NGO</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                {role === 'ngo' && (
                  <>
                    <div className="space-y-2 animate-fade-in-up">
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input
                        id="orgName"
                        required
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        placeholder="e.g. City Food Bank"
                      />
                    </div>
                    <div className="space-y-2 animate-fade-in-up">
                      <Label htmlFor="regNumber">Registration Number</Label>
                      <Input
                        id="regNumber"
                        required
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="NGO Registration / Tax ID"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regEmail">Email</Label>
                  <Input
                    id="regEmail"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="regPassword">Password</Label>
                  <Input
                    id="regPassword"
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>

                <Button className="w-full h-11 text-lg mt-4 font-medium shadow-md" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link to="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
