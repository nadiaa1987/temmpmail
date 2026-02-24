"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    getDocs,
    setDoc,
    serverTimestamp
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navbar } from "@/components/Navbar";
import {
    Mail,
    RefreshCcw,
    Trash2,
    Plus,
    Copy,
    Inbox,
    Clock,
    ChevronRight,
    User as UserIcon
} from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { formatDistanceToNow } from "date-fns";

interface TempAddress {
    id: string;
    address: string;
    userId: string;
    createdAt?: any;
}

interface Email {
    id: string;
    from: string;
    subject: string;
    text: string;
    html: string;
    recipientEmail: string;
    userId: string;
    createdAt?: any;
}

export default function Dashboard() {
    const [user, loading] = useAuthState(auth);
    const [addresses, setAddresses] = useState<TempAddress[]>([]);
    const [activeAddress, setActiveAddress] = useState<string>("");
    const [emails, setEmails] = useState<Email[]>([]);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch user's temp addresses
    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "temp_addresses"), where("userId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const addrList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as TempAddress));
            setAddresses(addrList);
            if (addrList.length > 0 && !activeAddress) {
                setActiveAddress(addrList[0].address);
            }
        });

        return () => unsubscribe();
    }, [user]);

    // Fetch emails for active address
    useEffect(() => {
        if (!activeAddress || !user) return;

        const q = query(
            collection(db, "emails"),
            where("recipientEmail", "==", activeAddress),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEmails(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Email)));
        });

        return () => unsubscribe();
    }, [activeAddress, user]);

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const generateAddress = async () => {
        if (!user) return;
        setIsRefreshing(true);
        try {
            // In a real app, this calls the Firebase Function
            // For demo, we'll write directly if rules allow (but it's better via Function)
            const randomPrefix = Math.random().toString(36).substring(2, 10);
            const domain = "temp-mail.io"; // Default domain
            const newAddress = `${randomPrefix}@${domain}`;

            await setDoc(doc(collection(db, "temp_addresses")), {
                userId: user.uid,
                address: newAddress,
                createdAt: serverTimestamp(),
            });
            setActiveAddress(newAddress);
        } catch (e) {
            console.error(e);
        } finally {
            setIsRefreshing(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied!");
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    if (!user) {
        return (
            <div className="min-h-screen bg-muted/30">
                <Navbar />
                <div className="container mx-auto max-w-md py-20 px-4">
                    <div className="bg-background p-8 rounded-3xl border shadow-xl text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold mb-4">Welcome Back</h1>
                        <p className="text-muted-foreground mb-8">Sign in to manage your temporary email addresses and access your inbox.</p>
                        <button
                            onClick={handleLogin}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-all"
                        >
                            Sign in with Google
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/10">
            <Navbar />

            <div className="container mx-auto py-8 px-4">
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* Sidebar - Addresses */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-background rounded-3xl border border-border/50 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold flex items-center gap-2">
                                    <Inbox className="w-4 h-4" /> My Addresses
                                </h2>
                                <button
                                    onClick={generateAddress}
                                    disabled={isRefreshing}
                                    className="p-2 bg-secondary rounded-lg hover:bg-muted transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {addresses.map((addr) => (
                                    <button
                                        key={addr.id}
                                        onClick={() => setActiveAddress(addr.address)}
                                        className={`w-full text-left p-3 rounded-xl border transition-all ${activeAddress === addr.address
                                            ? "border-violet-500 bg-violet-500/5 ring-1 ring-violet-500"
                                            : "border-transparent hover:bg-muted"
                                            }`}
                                    >
                                        <div className="text-sm font-medium truncate">{addr.address}</div>
                                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                            <Clock size={10} /> Created {addr.createdAt?.toDate ? formatDistanceToNow(addr.createdAt.toDate()) + " ago" : "just now"}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* User Stats Card */}
                        <div className="bg-primary text-primary-foreground rounded-3xl p-6 shadow-xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                    {user.photoURL ? <img src={user.photoURL} className="rounded-full" /> : <UserIcon />}
                                </div>
                                <div>
                                    <div className="font-bold">{user.displayName}</div>
                                    <div className="text-xs opacity-70">Free Plan</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 p-4 rounded-2xl">
                                    <div className="text-2xl font-bold">{emails.length}</div>
                                    <div className="text-[10px] uppercase tracking-wider opacity-70">Emails</div>
                                </div>
                                <div className="bg-white/10 p-4 rounded-2xl">
                                    <div className="text-2xl font-bold">{addresses.length}</div>
                                    <div className="text-[10px] uppercase tracking-wider opacity-70">Addresses</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Inbox */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-background rounded-3xl border border-border/50 shadow-sm overflow-hidden min-h-[600px] flex flex-col">

                            {/* Inbox Header */}
                            <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/5">
                                <div>
                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">Active Address</div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold">{activeAddress || "No address selected"}</h3>
                                        {activeAddress && (
                                            <button
                                                onClick={() => copyToClipboard(activeAddress)}
                                                className="p-1.5 hover:bg-muted rounded text-muted-foreground"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-muted transition-colors text-sm">
                                        <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} />
                                        Refresh
                                    </button>
                                </div>
                            </div>

                            {/* Emails List */}
                            <div className="flex-1 overflow-y-auto">
                                {emails.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                            <Mail size={32} className="opacity-20" />
                                        </div>
                                        <p>Waiting for incoming emails...</p>
                                        <p className="text-xs">It usually takes 10-30 seconds.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {emails.map((email) => (
                                            <div
                                                key={email.id}
                                                onClick={() => setSelectedEmail(email)}
                                                className={`p-6 cursor-pointer hover:bg-muted/50 transition-colors flex items-start justify-between gap-4 ${selectedEmail?.id === email.id ? "bg-muted" : ""}`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-bold text-sm">{email.from}</span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {email.createdAt?.toDate ? formatDistanceToNow(email.createdAt.toDate()) + " ago" : "just now"}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-medium text-base mb-1 truncate">{email.subject}</h4>
                                                    <p className="text-sm text-muted-foreground line-clamp-1">{email.text}</p>
                                                </div>
                                                <ChevronRight size={18} className="text-muted-foreground mt-4" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Email View Modal */}
            {selectedEmail && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-background w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in">
                        <div className="p-6 border-b flex items-center justify-between bg-muted/20">
                            <div>
                                <h3 className="font-bold text-lg">{selectedEmail.subject}</h3>
                                <p className="text-xs text-muted-foreground">From: {selectedEmail.from}</p>
                            </div>
                            <button
                                onClick={() => setSelectedEmail(null)}
                                className="p-2 hover:bg-muted rounded-full"
                            >
                                <Trash2 size={20} className="text-destructive" />
                            </button>
                        </div>
                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                {/* Fallback to text if HTML is empty */}
                                {selectedEmail.html ? (
                                    <div dangerouslySetInnerHTML={{ __html: selectedEmail.html }} />
                                ) : (
                                    <div className="whitespace-pre-wrap">{selectedEmail.text}</div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 bg-muted/10 border-t flex justify-end">
                            <button
                                onClick={() => setSelectedEmail(null)}
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
