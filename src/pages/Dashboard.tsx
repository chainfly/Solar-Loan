import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, User, LogOut, ShieldCheck, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BankVerification } from "@/components/loan/BankVerification";
import { MandateSetup } from "@/components/loan/MandateSetup";

interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    is_verified: boolean;
    is_active: boolean;
}

const Dashboard = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await authApi.getMe();
                if (response.data) {
                    setUser(response.data as UserProfile);
                } else {
                    throw new Error("Failed to load profile");
                }
            } catch (error) {
                console.error("Profile fetch error:", error);
                toast({
                    variant: "destructive",
                    title: "Session Expired",
                    description: "Please login again.",
                });
                navigate("/auth/login");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate, toast]);

    const handleLogout = async () => {
        try {
            await authApi.logout();
            navigate("/");
            toast({
                title: "Logged Out",
                description: "You have been successfully logged out.",
            });
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                            <Sun className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold">ChainFly Dashboard</h1>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>

                {/* Profile Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            User Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                <p className="text-lg font-semibold">{user?.full_name || "N/A"}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                <p className="text-lg font-semibold">{user?.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <div className="flex items-center gap-2 mt-1">
                                    {user?.is_verified ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <ShieldCheck className="w-3 h-3 mr-1" />
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <ShieldAlert className="w-3 h-3 mr-1" />
                                            Unverified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/solar-predictor")}>
                        <CardHeader>
                            <CardTitle className="text-lg">Solar Predictor</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Calculate your potential savings with solar energy.</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/eligibility-advisor")}>
                        <CardHeader>
                            <CardTitle className="text-lg">Eligibility Check</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Check your eligibility for solar loans instantly.</p>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/journey-tracker")}>
                        <CardHeader>
                            <CardTitle className="text-lg">Application Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Track the progress of your loan application.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Financial Verification Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Financial Verification</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BankVerification onVerified={(data) => {
                            toast({
                                title: "Bank Verified",
                                description: `Account verified for ${data.verification_result.account_holder_name}`,
                            });
                        }} />

                        <MandateSetup
                            amount={5000}
                            onComplete={(data) => {
                                toast({
                                    title: "Mandate Initiated",
                                    description: `Mandate ID: ${data.mandate_id}`,
                                });
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
