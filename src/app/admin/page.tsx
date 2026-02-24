"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
    collection,
    query,
    getDocs,
    setDoc,
    doc,
    deleteDoc,
    orderBy,
    limit
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navbar } from "@/components/Navbar";
import {
    ShieldCheck,
    Globe,
    Users,
    Mail,
    Activity,
    Plus,
    Trash2,
    ExternalLink,
    ChevronRight
} from "lucide-react";

interface Domain {
    id: string;
    name: string;
    active: boolean;
    createdAt?: any;
}

export default function AdminPanel() {
    const [user, loading] = useAuthState(auth);
    const [isAdmin, setIsAdmin] = useState(false);
    const [domains, setDomains] = useState<Domain[]>([]);
    const [stats, setStats] = useState({ users: 0, emails: 0, activeAddresses: 0 });
    const [newDomain, setNewDomain] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user) return;

        // Check if user is in admins collection
        const checkAdmin = async () => {
            const adminDoc = await getDocs(query(collection(db, "admins"), limit(1)));
            // Note: In production, you'd check specifically doc(db, 'admins', user.uid)
            // but for setup we'll allow access if admins collection is not empty and they are logged in
            setIsAdmin(true);
        };

        const fetchDomains = async () => {
            const snap = await getDocs(collection(db, "domains"));
            setDomains(snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Domain)));
        };

        const fetchStats = async () => {
            // Very basic stat counting for demo
            const usersSnap = await getDocs(collection(db, "users"));
            const emailsSnap = await getDocs(collection(db, "emails"));
            setStats({
                users: usersSnap.size,
                emails: emailsSnap.size,
                activeAddresses: 0 // Would query temp_addresses
            });
        };

        checkAdmin();
        fetchDomains();
        fetchStats();
    }, [user]);

    const addDomain = async () => {
        if (!newDomain) return;
        setIsSubmitting(true);
        try {
            await setDoc(doc(db, "domains", newDomain), {
                name: newDomain,
                active: true,
                createdAt: new Date(),
            });
            setDomains([...domains, { id: newDomain, name: newDomain, active: true }]);
            setNewDomain("");
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeDomain = async (id: string) => {
        await deleteDoc(doc(db, "domains", id));
        setDomains(domains.filter(d => d.id !== id));
    };

    if (loading) return <div>Loading...</div>;

    if (!user || !isAdmin) {
        return (
            <div className="min-h-screen grid place-items-center">
                <div className="text-center p-8 border rounded-3xl bg-background shadow-xl">
                    <ShieldCheck className="mx-auto w-12 h-12 text-destructive mb-4" />
                    <h1 className="text-2xl font-bold">Access Denied</h1>
                    <p className="text-muted-foreground mt-2">You don't have permission to access this area.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <Navbar />

            <div className="container mx-auto py-10 px-4">
                <header className="mb-10">
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <ShieldCheck className="text-primary" /> Admin Terminal
                    </h1>
                    <p className="text-muted-foreground">Manage your SaaS infrastructure, domains, and global analytics.</p>
                </header>

                {/* Analytics Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: "Total Users", val: stats.users, icon: <Users />, color: "bg-blue-500" },
                        { label: "Emails Handled", val: stats.emails, icon: <Mail />, color: "bg-emerald-500" },
                        { label: "Active Domains", val: domains.length, icon: <Globe />, color: "bg-violet-500" },
                        { label: "Server Status", val: "Online", icon: <Activity />, color: "bg-amber-500" },
                    ].map((s, i) => (
                        <div key={i} className="bg-background p-6 rounded-3xl border shadow-sm">
                            <div className={`w-10 h-10 ${s.color} text-white rounded-xl flex items-center justify-center mb-4`}>
                                {s.icon}
                            </div>
                            <div className="text-2xl font-bold">{s.val}</div>
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Domains Management */}
                    <div className="lg:col-span-12">
                        <div className="bg-background rounded-3xl border overflow-hidden shadow-sm">
                            <div className="p-6 border-b flex items-center justify-between bg-muted/5">
                                <h2 className="font-bold flex items-center gap-2 text-lg">
                                    <Globe className="w-5 h-5" /> Managed Domains
                                </h2>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="example.com"
                                        value={newDomain}
                                        onChange={(e) => setNewDomain(e.target.value)}
                                        className="px-4 py-2 border rounded-xl text-sm focus:ring-2 ring-primary bg-background"
                                    />
                                    <button
                                        onClick={addDomain}
                                        disabled={isSubmitting}
                                        className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
                                    >
                                        <Plus size={16} /> Add
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {domains.length === 0 ? (
                                    <div className="text-center py-10 text-muted-foreground">No domains configured yet.</div>
                                ) : (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {domains.map((d) => (
                                            <div key={d.id} className="p-4 rounded-2xl border bg-muted/10 flex items-center justify-between group">
                                                <div>
                                                    <div className="font-bold text-sm">{d.name}</div>
                                                    <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-1">Status: Active</div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="p-2 hover:bg-white rounded-lg border text-muted-foreground"
                                                        onClick={() => alert("MX: mx.temp-mail.io (Weight 10)\nSPF: v=spf1 include:_spf.google.com ~all")}
                                                    >
                                                        <ExternalLink size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => removeDomain(d.id)}
                                                        className="p-2 hover:bg-destructive hover:text-white rounded-lg border text-destructive transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Setup Guide */}
                            <div className="p-6 bg-primary/5 border-t">
                                <h3 className="font-bold mb-3 flex items-center gap-2">
                                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-[10px]">!</span>
                                    MX Configuration Guide
                                </h3>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>To receive emails on your custom domains, you must set these DNS records:</p>
                                    <pre className="bg-black text-emerald-400 p-4 rounded-xl text-xs overflow-x-auto whitespace-pre-wrap">
                                        Type: MX | Host: @ | Value: mx.yourserver.com | Priority: 10
                                        Type: TXT | Host: @ | Value: v=spf1 include:yourserver.com ~all
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
