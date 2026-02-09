'use client';

import { TransactionDetail } from '@/lib/types/transaction';
import { formatCurrency, cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionResultItemProps {
  transaction: TransactionDetail;
  onClick: () => void;
}

export function TransactionResultItem({ transaction, onClick }: TransactionResultItemProps) {
  // Determine icon and color based on transaction type
  const getTypeConfig = () => {
    switch (transaction.transactionType) {
      case 'INCOME':
        return {
          icon: ArrowUpRight,
          iconColor: 'text-emerald-600',
          iconBg: 'bg-emerald-500/10',
          amountColor: 'text-emerald-600',
          prefix: '+',
        };
      case 'EXPENSE':
        return {
          icon: ArrowDownLeft,
          iconColor: 'text-rose-600',
          iconBg: 'bg-rose-500/10',
          amountColor: 'text-rose-600',
          prefix: '-',
        };
      case 'TRANSFER':
        return {
          icon: ArrowLeftRight,
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-500/10',
          amountColor: 'text-blue-600',
          prefix: '',
        };
      default:
        return {
          icon: ArrowUpRight,
          iconColor: 'text-muted-foreground',
          iconBg: 'bg-muted',
          amountColor: 'text-foreground',
          prefix: '',
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  // Truncate description to 40 characters
  const truncatedDescription = transaction.description && transaction.description.length > 40
    ? transaction.description.substring(0, 40) + '...'
    : transaction.description || 'No description';

  // Format date
  const formattedDate = format(new Date(transaction.transactionDate), 'MMM dd, yyyy');

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors text-left"
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center', config.iconBg)}>
        <Icon className={cn('w-5 h-5', config.iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {truncatedDescription}
        </p>
        <p className="text-xs text-muted-foreground">
          {transaction.contact?.name || 'Unknown'} • {formattedDate}
        </p>
      </div>

      {/* Amount */}
      <div className="flex-shrink-0 text-right">
        <p className={cn('text-sm font-semibold', config.amountColor)}>
          {config.prefix}{formatCurrency(transaction.amount, transaction.currency)}
        </p>
        <p className="text-xs text-muted-foreground">
          {transaction.currency}
        </p>
      </div>
    </button>
  );
}
