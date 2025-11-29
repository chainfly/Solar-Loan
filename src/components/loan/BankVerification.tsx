import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { apiClient } from '@/lib/api';

interface BankVerificationProps {
    onVerified: (data: any) => void;
}

export const BankVerification: React.FC<BankVerificationProps> = ({ onVerified }) => {
    const [accountNumber, setAccountNumber] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [verifiedName, setVerifiedName] = useState<string>('');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Call backend API which calls Decentro
            const response = await apiClient.post<any>('/kyc/bank', {
                account_number: accountNumber,
                ifsc: ifsc,
                name: name
            });

            if (response.data && response.data.is_verified) {
                setSuccess(true);
                setVerifiedName(response.data.verification_result.account_holder_name || name);
                onVerified(response.data);
            } else {
                setError('Bank verification failed. Please check details.');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M3 21h18" /><path d="M5 21V7" /><path d="M19 21V7" /><path d="M4 7h16" /><path d="M12 21V7" /><path d="M2 7l10-5 10 5" /></svg>
                    </div>
                    Bank Verification
                </CardTitle>
            </CardHeader>
            <CardContent>
                {success ? (
                    <div className="space-y-4">
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Verified Successfully</AlertTitle>
                            <AlertDescription className="text-green-700">
                                Account Holder: <strong>{verifiedName}</strong>
                                <br />
                                Account is active and valid.
                            </AlertDescription>
                        </Alert>
                        <Button className="w-full" variant="outline" disabled>
                            Verification Complete
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Account Holder Name</Label>
                            <Input
                                id="name"
                                placeholder="As per bank records"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account">Account Number</Label>
                            <Input
                                id="account"
                                placeholder="Enter account number"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ifsc">IFSC Code</Label>
                            <Input
                                id="ifsc"
                                placeholder="e.g., HDFC0001234"
                                value={ifsc}
                                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                                required
                                maxLength={11}
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify Account (Penny Drop)'
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            We will deposit ₹1 to verify your account instantly.
                        </p>
                    </form>
                )}
            </CardContent>
        </Card>
    );
};
