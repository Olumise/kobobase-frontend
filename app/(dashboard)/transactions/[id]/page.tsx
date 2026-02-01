
'use client';

import { useParams, useRouter } from 'next/navigation';
import { sampleTransactions, sampleCategories } from '@/lib/mockData';
import { ArrowLeft, CheckCircle2, Clock, Calendar, CreditCard, Tag, User } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function TransactionDetailPage() {
    // This is a placeholder since the route is static in this demo without dynamic linking configured everywhere
    // But structure supports [id]
    const params = useParams();
    const router = useRouter();
    const txn = sampleTransactions[0]; // Mock specific logic

    return (
        <div className="max-w-2xl mx-auto py-8">
            <Link href="/transactions" className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft size={18} className="mr-2" /> Back to Transactions
            </Link>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-8 border-b border-border text-center bg-muted/20">
                    <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                        <CreditCard size={32} />
                    </div>
                    <h1 className="text-3xl font-semibold text-foreground mb-1">{formatCurrency(txn.amount)}</h1>
                    <p className="text-muted-foreground">{txn.description}</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
                            <div className="flex items-center text-emerald-600 font-medium">
                                <CheckCircle2 size={16} className="mr-2" /> Confirmed
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Date</label>
                            <div className="flex items-center text-foreground font-medium">
                                <Calendar size={16} className="mr-2 text-muted-foreground" /> {txn.transactionDate}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
                            <div className="flex items-center text-foreground font-medium">
                                <Tag size={16} className="mr-2 text-muted-foreground" /> Shopping
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase">Merchant</label>
                            <div className="flex items-center text-foreground font-medium">
                                <User size={16} className="mr-2 text-muted-foreground" /> {txn.merchant}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-muted/30 text-center">
                    <button className="text-sm font-medium text-destructive hover:underline">Delete Transaction</button>
                </div>
            </div>
        </div>
    )
}
