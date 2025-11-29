import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2, QrCode } from "lucide-react";
import { apiClient } from '@/lib/api';

interface MandateSetupProps {
    amount: number;
    onComplete: (data: any) => void;
}

export const MandateSetup: React.FC<MandateSetupProps> = ({ amount, onComplete }) => {
    const [frequency, setFrequency] = useState('MONTHLY');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mandateData, setMandateData] = useState<any>(null);

    const handleInitiate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.post<any>('/collections/mandate/initiate', {
                amount: amount,
                frequency: frequency,
                start_date: startDate,
                end_date: endDate,
                payer_name: "Test User", // Ideally from context
                payer_account: "1234567890", // Ideally from context
                payer_ifsc: "HDFC0001234" // Ideally from context
            });

            setMandateData(response.data);
            onComplete(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Mandate setup failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-full">
                        <QrCode className="h-5 w-5 text-purple-600" />
                    </div>
                    Setup Auto-Repayment
                </CardTitle>
            </CardHeader>
            <CardContent>
                {mandateData ? (
                    <div className="space-y-4 text-center">
                        <Alert className="bg-green-50 border-green-200 text-left">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Mandate Initiated</AlertTitle>
                            <AlertDescription className="text-green-700">
                                Please approve the request on your UPI app.
                            </AlertDescription>
                        </Alert>

                        <div className="p-4 border rounded-lg bg-gray-50">
                            <p className="text-sm font-medium text-gray-500">Mandate ID</p>
                            <p className="text-lg font-mono">{mandateData.mandate_id}</p>
                        </div>

                        <Button className="w-full" variant="outline" onClick={() => window.location.reload()}>
                            Check Status
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleInitiate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>EMI Amount</Label>
                            <div className="text-2xl font-bold">₹{amount.toLocaleString()}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Select value={frequency} onValueChange={setFrequency}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Setting up...
                                </>
                            ) : (
                                'Setup UPI Autopay'
                            )}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
    );
};
