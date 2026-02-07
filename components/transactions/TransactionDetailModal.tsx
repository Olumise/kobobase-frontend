'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TransactionDetail } from "@/lib/types/transaction";
import { formatCurrency, cn } from "@/lib/utils";
import { Edit, Trash2 } from "lucide-react";

interface TransactionDetailModalProps {
  transaction: TransactionDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (transaction: TransactionDetail) => void;
  onDelete: (transaction: TransactionDetail) => void;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function TransactionDetailModal({
  transaction,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Complete information for this transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Amount" value={formatCurrency(transaction.amount, transaction.currency)} />
            <DetailField label="Type" value={transaction.transactionType} />
            <DetailField label="Date" value={formatDate(transaction.transactionDate)} />
            <DetailField label="Status" value={
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                transaction.status === 'CONFIRMED' ? "bg-emerald-500/10 text-emerald-600" :
                transaction.status === 'PENDING' ? "bg-amber-500/10 text-amber-600" :
                "bg-rose-500/10 text-rose-600"
              )}>
                {transaction.status}
              </span>
            } />
          </div>

          {/* Description */}
          <DetailField label="Description" value={transaction.description || '-'} />
          <DetailField label="Summary" value={transaction.summary || '-'} />

          {/* Category & Contact */}
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Category" value={transaction.category?.name || '-'} />
            <DetailField label="Contact" value={transaction.contact?.name || '-'} />
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-2 gap-4">
            <DetailField label="Payment Method" value={transaction.paymentMethod || '-'} />
            <DetailField label="Reference" value={transaction.referenceNumber || '-'} />
          </div>

          {/* Bank Accounts */}
          {transaction.userBankAccount && (
            <DetailField
              label="From Account"
              value={`${transaction.userBankAccount.accountName} - ${transaction.userBankAccount.bankName}`}
            />
          )}
          {transaction.toBankAccount && (
            <DetailField
              label="To Account"
              value={`${transaction.toBankAccount.accountName} - ${transaction.toBankAccount.bankName}`}
            />
          )}

          {/* AI Confidence */}
          {transaction.aiConfidence !== undefined && (
            <DetailField
              label="AI Confidence"
              value={`${(transaction.aiConfidence * 100).toFixed(0)}%`}
            />
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={() => onEdit(transaction)}>
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => onDelete(transaction)}>
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
