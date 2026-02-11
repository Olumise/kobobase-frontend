
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  TrendingUp,
  Activity,
  ChevronRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { transactionStatsApi, transactionsApi, categoriesApi } from '@/lib/api';
import type { TransactionStatsData } from '@/lib/types/stats';
import type { TransactionDetail } from '@/lib/types/transaction';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// Chart colors for category spending
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const areaChartConfig = {
  income: {
    label: "Income",
    color: "var(--primary)",
  },
  expense: {
    label: "Expense",
    color: "var(--destructive)",
  },
} satisfies ChartConfig

const pieChartConfig = {
  food: {
    label: "Food",
    color: "var(--chart-1)",
  },
  transport: {
    label: "Transport",
    color: "var(--chart-2)",
  },
  shopping: {
    label: "Shopping",
    color: "var(--chart-3)",
  },
  ent: {
    label: "Ent.",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

const StatCard = ({ title, value, icon: Icon, delay, isLoading, colorClass }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">{title}</p>
        {isLoading ? (
          <Skeleton className="h-7 w-24 mt-1" />
        ) : (
          <p className="text-xl font-semibold mt-1">{value}</p>
        )}
      </div>
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", colorClass)}>
        <Icon size={20} />
      </div>
    </div>
  </motion.div>
);

export default function Dashboard() {
  // State management
  const [transactionStats, setTransactionStats] = useState<TransactionStatsData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<TransactionDetail[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'6months' | 'year' | '2years'>('6months');

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch data in parallel
      const [statsRes, transactionsRes, categoriesRes] = await Promise.all([
        transactionStatsApi.getTransactionStats(),
        transactionsApi.getAllTransactions({ limit: 5, offset: 0 }),
        categoriesApi.getAllCategories(),
      ]);

      // Extract data with proper nesting
      const stats = statsRes.data?.data || statsRes.data;
      const txnData = transactionsRes.data;
      const catData = categoriesRes.data?.data?.categories || categoriesRes.data?.categories || [];

      setTransactionStats(stats);
      setRecentTransactions(txnData?.data?.transactions || []);
      setCategories(catData);

      // Fetch monthly trends
      await fetchMonthlyTrends(selectedPeriod);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch monthly trends based on selected period
  const fetchMonthlyTrends = async (period: '6months' | 'year' | '2years') => {
    try {
      const monthsToFetch = period === '6months' ? 6 : period === 'year' ? 12 : 24;
      const monthlyData = [];

      for (let i = monthsToFetch - 1; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const startDate = format(startOfMonth(monthDate), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');

        monthlyData.push({ month: format(monthDate, 'MMM'), startDate, endDate });
      }

      // Fetch all months in parallel
      const monthlyResults = await Promise.all(
        monthlyData.map(async ({ month, startDate, endDate }) => {
          try {
            const res = await transactionStatsApi.getTransactionStats({ startDate, endDate });
            const data = res.data?.data || res.data;
            return {
              month,
              income: Number(data.totalIncome) || 0,
              expense: Number(data.totalExpense) || 0,
            };
          } catch (err) {
            return { month, income: 0, expense: 0 };
          }
        })
      );

      setMonthlyTrends(monthlyResults);
    } catch (err) {
      console.error('Error fetching monthly trends:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refetch trends when period changes
  useEffect(() => {
    if (!isLoading && monthlyTrends.length > 0) {
      fetchMonthlyTrends(selectedPeriod);
    }
  }, [selectedPeriod]);

  // Calculate category spending for pie chart
  const categorySpendingData = useMemo(() => {
    if (!recentTransactions.length) return [];

    const categoryMap = new Map<string, { name: string; value: number }>();

    recentTransactions.forEach((txn) => {
      if (txn.transactionType === 'EXPENSE' && txn.category) {
        const existing = categoryMap.get(txn.category.id) || {
          name: txn.category.name,
          value: 0,
        };
        categoryMap.set(txn.category.id, {
          name: txn.category.name,
          value: existing.value + Number(txn.amount),
        });
      }
    });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 4)
      .map((item, index) => ({
        ...item,
        color: CHART_COLORS[index % CHART_COLORS.length],
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }));
  }, [recentTransactions]);

  const topCategory = categorySpendingData.length > 0 ? categorySpendingData[0].name : 'N/A';
  const totalCategorySpending = categorySpendingData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-8">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* SECTION: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          value={transactionStats ? formatCurrency(transactionStats.totalIncome) : formatCurrency(0)}
          icon={TrendingUp}
          colorClass="bg-primary/10 text-primary"
          delay={0.1}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Expenses"
          value={transactionStats ? formatCurrency(transactionStats.totalExpense) : formatCurrency(0)}
          icon={CreditCard}
          colorClass="bg-primary/10 text-primary"
          delay={0.2}
          isLoading={isLoading}
        />
        <StatCard
          title="Net Balance"
          value={transactionStats ? formatCurrency(transactionStats.netBalance) : formatCurrency(0)}
          icon={DollarSign}
          colorClass="bg-primary/10 text-primary"
          delay={0.3}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Transactions"
          value={transactionStats?.totalTransactions || 0}
          icon={Activity}
          colorClass="bg-primary/10 text-primary"
          delay={0.4}
          isLoading={isLoading}
        />
      </div>

      {/* SECTION: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-8">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold">Income vs Expenses</CardTitle>
                <CardDescription>Visual breakdown of your flow</CardDescription>
              </div>
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger className="w-40 bg-muted/50">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="year">Last 12 Months</SelectItem>
                  <SelectItem value="2years">Past 2 Years</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : monthlyTrends.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ChartContainer config={areaChartConfig} className="h-80 w-full">
                  <AreaChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} dy={10} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--muted-foreground)' }}
                      domain={[0, 'auto']}
                      tickFormatter={(value) => {
                        if (value >= 1000) return `₦${(value / 1000).toFixed(0)}k`;
                        return `₦${value}`;
                      }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent
                        indicator="dot"
                        formatter={(value) => formatCurrency(Number(value))}
                      />}
                    />
                    <Area type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" stroke="var(--color-expense)" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Breakdown Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="h-full"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Spend by Category</CardTitle>
              <CardDescription>Top spending categories</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : categorySpendingData.length === 0 ? (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No expense data available
                </div>
              ) : (
                <>
                  <div className="h-64 w-full relative">
                    <ChartContainer config={pieChartConfig} className="h-full w-full">
                      <PieChart>
                        <Pie
                          data={categorySpendingData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categorySpendingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          cursor={false}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                                  <p className="font-semibold">{data.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatCurrency(data.value)}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ChartContainer>
                    {/* Center Text - positioned absolutely with z-index */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none z-10">
                      <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Top Spend</span>
                      <span className="text-base font-bold text-foreground mt-0.5 max-w-[100px] text-center truncate">{topCategory}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    {categorySpendingData.map((item, i) => {
                      const percentage = totalCategorySpending > 0
                        ? ((item.value / totalCategorySpending) * 100).toFixed(1)
                        : '0';
                      return (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                            <span className="text-muted-foreground">{item.name}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium text-foreground">{formatCurrency(item.value)}</span>
                            <span className="text-xs text-muted-foreground">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* SECTION: Recent Transactions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground tracking-tight">Recent Transactions</h2>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10" asChild>
            <Link href="/transactions">
              View All
              <ChevronRight size={16} className="ml-1" />
            </Link>
          </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="px-6 py-4">Transaction</TableHead>
                  <TableHead className="px-6 py-4">Category</TableHead>
                  <TableHead className="px-6 py-4">Date</TableHead>
                  <TableHead className="px-6 py-4">Status</TableHead>
                  <TableHead className="px-6 py-4 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="px-6 py-4" colSpan={5}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : recentTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No transactions found. Upload a receipt to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentTransactions.map((txn, i) => {
                    const Icon = txn.transactionType === 'INCOME' ? ArrowUpRight : ArrowDownRight;

                    return (
                      <TableRow key={txn.id} className="hover:bg-muted/20 transition-colors group">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4 bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <Icon size={18} />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{txn.description || 'No description'}</p>
                              <p className="text-xs text-muted-foreground">{txn.contact?.name || '-'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {txn.category ? (
                            <Badge variant="outline" className="font-medium bg-primary/10 text-primary border-primary/20">
                              {txn.category.name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                          {new Date(txn.transactionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge variant="outline" className={cn(
                            "font-medium",
                            txn.status === 'CONFIRMED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                            txn.status === 'PENDING' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                            "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          )}>
                            {txn.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn("px-6 py-4 text-right font-semibold",
                          txn.transactionType === 'INCOME' ? "text-emerald-600" : "text-foreground"
                        )}>
                          {txn.transactionType === 'INCOME' ? '+' : '-'}{formatCurrency(txn.amount, txn.currency)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
