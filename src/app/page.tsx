import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { Check, Mail, Shield, Zap, Globe, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[100px]" />
          <div className="container mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Protect Your <span className="gradient-text">Digital Privacy</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Generate disposable temporary email addresses in seconds. Stay anonymous,
              avoid spam, and keep your real inbox clean.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-all shadow-lg"
              >
                Create Free Address
              </Link>
              <Link
                href="#pricing"
                className="bg-secondary text-secondary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-all border"
              >
                View Plans
              </Link>
            </div>

            <div className="mt-20 flex justify-center opacity-50 grayscale hover:grayscale-0 transition-all">
              {/* Mock logos or stats */}
              <div className="flex gap-12 flex-wrap justify-center items-center">
                <div className="flex items-center gap-2"><Globe className="w-5 h-5" /> Trusted Globally</div>
                <div className="flex items-center gap-2"><Shield className="w-5 h-5" /> 100% Anonymous</div>
                <div className="flex items-center gap-2"><Clock className="w-5 h-5" /> Instant Delivery</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">Why Choose TempMail?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="text-violet-500" />,
                  title: "Instant Setup",
                  desc: "Get an email address instantly without any registration required for basic use."
                },
                {
                  icon: <Mail className="text-emerald-500" />,
                  title: "Real-time Inbox",
                  desc: "Experience zero latency. Emails appear in your temporary inbox as soon as they are sent."
                },
                {
                  icon: <Shield className="text-blue-500" />,
                  title: "Auto-Deletion",
                  desc: "All emails are securely deleted after 24 hours to ensure your data doesn't reside online."
                }
              ].map((f, i) => (
                <div key={i} className="p-8 bg-background rounded-3xl border shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-6">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Transparent Pricing</h2>
              <p className="text-muted-foreground">Choose the plan that fits your needs.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="p-10 rounded-3xl border bg-background relative overflow-hidden">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="text-4xl font-bold mb-6">$0 <span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                <ul className="space-y-4 mb-10">
                  <li className="flex gap-3"><Check className="text-emerald-500" /> 1 Active Address</li>
                  <li className="flex gap-3"><Check className="text-emerald-500" /> 10 Emails per Day</li>
                  <li className="flex gap-3"><Check className="text-emerald-500" /> 24h Message Retention</li>
                </ul>
                <Link href="/dashboard" className="w-full block py-4 text-center rounded-xl border border-primary font-bold hover:bg-muted transition-colors">
                  Get Started
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="p-10 rounded-3xl border bg-primary text-primary-foreground relative shadow-2xl">
                <div className="absolute top-4 right-4 bg-violet-500 text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold">Recommended</div>
                <h3 className="text-2xl font-bold mb-2 text-white">Pro</h3>
                <div className="text-4xl font-bold mb-6 text-white">$9.99 <span className="text-lg font-normal opacity-70">/mo</span></div>
                <ul className="space-y-4 mb-10">
                  <li className="flex gap-3"><Check className="text-emerald-500" /> Unlimited Addresses</li>
                  <li className="flex gap-3"><Check className="text-emerald-500" /> Unlimited Emails</li>
                  <li className="flex gap-3"><Check className="text-emerald-500" /> Custom Domain Support</li>
                  <li className="flex gap-3"><Check className="text-emerald-500" /> No Ads</li>
                </ul>
                <button className="w-full block py-4 text-center rounded-xl bg-violet-500 text-white font-bold hover:bg-violet-600 transition-colors">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 TempMail SaaS. Built for the modern web.</p>
        </div>
      </footer>
    </div>
  );
}
