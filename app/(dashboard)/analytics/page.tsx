
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Activity, Cpu, Database, Zap, TrendingUp, TrendingDown, DollarSign, Receipt, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { transactionStatsApi, usageApi } from '@/lib/api';
import { TransactionStatsData, UsageStatsData, UsageSession } from '@/lib/types/stats';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const costChartConfig = {
  cost: {
    label: "Cost",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const operationsChartConfig = {
  ocr: {
    label: "OCR",
    color: "var(--chart-1)",
  },
  detection: {
    label: "Detection",
    color: "var(--chart-2)",
  },
  extraction: {
    label: "Extraction",
    color: "var(--chart-3)",
  },
  clarification: {
    label: "Clarification",
    color: "var(--chart-4)",
  },
  embedding: {
    label: "Embedding",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

const incomeExpenseChartConfig = {
  income: {
    label: "Income",
    color: "hsl(142, 76%, 36%)",
  },
  expense: {
    label: "Expense",
    color: "hsl(0, 84%, 60%)",
  },
} satisfies ChartConfig

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)', 'hsl(217, 91%, 60%)'];

const StatCard = ({ title, value, icon: Icon, colorClass, delay, isLoading }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="h-full"
  >
    <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow h-full">
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

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'llm'>('transactions');

  // Transaction stats state
  const [transactionStats, setTransactionStats] = useState<TransactionStatsData | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  // Usage stats state
  const [usageStats, setUsageStats] = useState<UsageStatsData | null>(null);
  const [usageSessions, setUsageSessions] = useState<UsageSession[]>([]);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [usageError, setUsageError] = useState<string | null>(null);

  // Fetch transaction stats
  const fetchTransactionStats = async () => {
    try {
      setIsLoadingTransactions(true);
      setTransactionError(null);

      const response = await transactionStatsApi.getTransactionStats();
      const stats = response.data?.data || response.data;
      setTransactionStats(stats);

      // Fetch monthly trends for last 12 months
      const monthlyData = [];
      for (let i = 11; i >= 0; i--) {
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
              income: data.totalIncome || 0,
              expense: data.totalExpense || 0,
            };
          } catch (err) {
            return { month, income: 0, expense: 0 };
          }
        })
      );

      setMonthlyTrends(monthlyResults);
    } catch (err: any) {
      console.error('Error fetching transaction stats:', err);
      setTransactionError(err.response?.data?.message || 'Failed to load transaction statistics');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // Fetch usage stats
  const fetchUsageStats = async () => {
    try {
      setIsLoadingUsage(true);
      setUsageError(null);

      const [statsRes, sessionsRes] = await Promise.all([
        usageApi.getMyUsage('all-time'),
        usageApi.getMySessions(100),
      ]);

      const stats = statsRes.data?.data || statsRes.data;
      const sessions = sessionsRes.data?.data || sessionsRes.data;

      setUsageStats(stats);
      setUsageSessions(Array.isArray(sessions) ? sessions : []);
    } catch (err: any) {
      console.error('Error fetching usage stats:', err);
      setUsageError(err.response?.data?.message || 'Failed to load usage statistics');
    } finally {
      setIsLoadingUsage(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactionStats();
    } else {
      fetchUsageStats();
    }
  }, [activeTab]);

  // Calculate monthly usage data from sessions
  const monthlyUsageData = useMemo(() => {
    if (!usageSessions.length) return [];

    const monthlyMap = new Map<string, { tokens: number; cost: number }>();

    usageSessions.forEach(session => {
      const month = format(new Date(session.createdAt), 'MMM yyyy');
      const existing = monthlyMap.get(month) || { tokens: 0, cost: 0 };
      monthlyMap.set(month, {
        tokens: existing.tokens + session.totalTokens,
        cost: existing.cost + session.totalCostUsd,
      });
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month: month.split(' ')[0], ...data }))
      .slice(-6); // Last 6 months
  }, [usageSessions]);

  // Calculate operations data from breakdown
  const operationsData = useMemo(() => {
    if (!usageStats?.callCounts) return [];

    const counts = usageStats.callCounts;
    return [
      { name: 'OCR', count: counts.ocr || 0, fill: "var(--color-ocr)" },
      { name: 'Detection', count: counts.detection || 0, fill: "var(--color-detection)" },
      { name: 'Extraction', count: counts.extraction || 0, fill: "var(--color-extraction)" },
      { name: 'Clarification', count: counts.clarification || 0, fill: "var(--color-clarification)" },
      { name: 'Embedding', count: counts.embedding || 0, fill: "var(--color-embedding)" },
    ];
  }, [usageStats]);

  // Calculate total calls
  const totalCalls = useMemo(() => {
    if (!usageStats?.callCounts) return 0;
    const counts = usageStats.callCounts;
    return (counts.ocr || 0) + (counts.detection || 0) + (counts.extraction || 0) +
           (counts.clarification || 0) + (counts.embedding || 0);
  }, [usageStats]);

  // Format tokens display
  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  // Transaction type breakdown for pie chart
  const transactionTypeData = useMemo(() => {
    if (!transactionStats?.transactionsByType) return [];

    return transactionStats.transactionsByType.map((item, index) => ({
      name: item.transactionType,
      value: item._count,
      amount: item._sum.amount,
      fill: COLORS[index % COLORS.length],
    }));
  }, [transactionStats]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
           <p className="text-muted-foreground mt-1">Insights into your finances and system usage</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={activeTab === 'transactions' ? fetchTransactionStats : fetchUsageStats}
            disabled={activeTab === 'transactions' ? isLoadingTransactions : isLoadingUsage}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2",
              (activeTab === 'transactions' ? isLoadingTransactions : isLoadingUsage) && "animate-spin"
            )} />
            Refresh
          </Button>

          <div className="bg-muted p-1 rounded-lg flex">
             <button
               onClick={() => setActiveTab('transactions')}
               className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                 activeTab === 'transactions' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
               )}
             >
               Transactions
             </button>
             <button
               onClick={() => setActiveTab('llm')}
               className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                 activeTab === 'llm' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
               )}
             >
               LLM Usage
             </button>
          </div>
        </div>
      </div>

      {activeTab === 'transactions' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {transactionError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{transactionError}</AlertDescription>
            </Alert>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Income"
              value={transactionStats ? formatCurrency(transactionStats.totalIncome) : '$0.00'}
              icon={TrendingUp}
              colorClass="bg-emerald-500/10 text-emerald-600"
              delay={0.1}
              isLoading={isLoadingTransactions}
            />
            <StatCard
              title="Total Expense"
              value={transactionStats ? formatCurrency(transactionStats.totalExpense) : '$0.00'}
              icon={TrendingDown}
              colorClass="bg-red-500/10 text-red-600"
              delay={0.2}
              isLoading={isLoadingTransactions}
            />
            <StatCard
              title="Net Balance"
              value={transactionStats ? formatCurrency(transactionStats.netBalance) : '$0.00'}
              icon={DollarSign}
              colorClass="bg-blue-500/10 text-blue-600"
              delay={0.3}
              isLoading={isLoadingTransactions}
            />
            <StatCard
              title="Total Transactions"
              value={transactionStats?.totalTransactions || 0}
              icon={Receipt}
              colorClass="bg-purple-500/10 text-purple-600"
              delay={0.4}
              isLoading={isLoadingTransactions}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Income vs Expense Trend */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-8">
                <CardTitle className="text-lg font-semibold">Income vs Expense (12 Months)</CardTitle>
                <CardDescription>Monthly financial trends</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTransactions ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <div className="h-80 w-full">
                    <ChartContainer config={incomeExpenseChartConfig} className="h-full w-full">
                      <AreaChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.05}/>
                          </linearGradient>
                          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                          tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent
                            indicator="dot"
                            formatter={(value) => formatCurrency(Number(value))}
                          />}
                        />
                        <Area
                          type="monotone"
                          dataKey="income"
                          stroke="var(--color-income)"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorIncome)"
                          dot={{ fill: 'var(--color-income)', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="expense"
                          stroke="var(--color-expense)"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorExpense)"
                          dot={{ fill: 'var(--color-expense)', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transaction Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Transaction Type Breakdown</CardTitle>
                <CardDescription>Distribution by type</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTransactions ? (
                  <Skeleton className="h-80 w-full" />
                ) : transactionTypeData.length === 0 ? (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    No transaction data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="h-64 w-full relative">
                      <ChartContainer config={{}} className="h-full w-full">
                        <PieChart>
                          <Pie
                            data={transactionTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {transactionTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
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
                                    <p className="text-sm text-muted-foreground">Count: {data.value}</p>
                                    <p className="text-sm text-muted-foreground">Amount: {formatCurrency(data.amount)}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </PieChart>
                      </ChartContainer>
                      {/* Center Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs text-muted-foreground uppercase font-medium tracking-wide">Total</span>
                        <span className="text-xl font-semibold text-foreground">
                          {transactionStats?.totalTransactions || 0}
                        </span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-3 mt-4">
                      {transactionTypeData.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: item.fill }}
                            />
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-semibold">{formatCurrency(item.amount)}</span>
                            <span className="text-xs text-muted-foreground">{item.value} transactions</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {activeTab === 'llm' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {usageError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{usageError}</AlertDescription>
            </Alert>
          )}

           {/* Summary Cards */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Calls"
                value={totalCalls.toLocaleString()}
                icon={Zap}
                colorClass="bg-blue-500/10 text-blue-600"
                delay={0.1}
                isLoading={isLoadingUsage}
              />
              <StatCard
                title="Total Tokens"
                value={usageStats ? formatTokens(usageStats.tokensUsed) : '0'}
                icon={Cpu}
                colorClass="bg-purple-500/10 text-purple-600"
                delay={0.2}
                isLoading={isLoadingUsage}
              />
              <StatCard
                title="Total Cost"
                value={usageStats ? `$${usageStats.costUsd.toFixed(2)}` : '$0.00'}
                icon={Database}
                colorClass="bg-emerald-500/10 text-emerald-600"
                delay={0.3}
                isLoading={isLoadingUsage}
              />
              <StatCard
                title="This Month"
                value={usageStats?.currentMonth ? `$${usageStats.currentMonth.costUsd.toFixed(2)}` : '$0.00'}
                icon={Activity}
                colorClass="bg-amber-500/10 text-amber-600"
                delay={0.4}
                isLoading={isLoadingUsage}
              />
           </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Cost over Time</CardTitle>
                  <CardDescription>Monthly token cost analysis (Last 6 months)</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUsage ? (
                    <Skeleton className="h-80 w-full" />
                  ) : monthlyUsageData.length === 0 ? (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                      No usage data available
                    </div>
                  ) : (
                    <div className="h-80 w-full">
                      <ChartContainer config={costChartConfig} className="h-full w-full">
                        <LineChart data={monthlyUsageData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} />
                          <ChartTooltip
                            content={<ChartTooltipContent indicator="line" />}
                          />
                          <Line type="monotone" dataKey="cost" stroke="var(--color-cost)" strokeWidth={3} dot={{r: 4, fill: 'var(--color-cost)'}} activeDot={{r: 6}} />
                        </LineChart>
                      </ChartContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

               {/* Operations Chart */}
               <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Operations Breakdown</CardTitle>
                  <CardDescription>Distribution of LLM tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUsage ? (
                    <Skeleton className="h-80 w-full" />
                  ) : operationsData.length === 0 || operationsData.every(d => d.count === 0) ? (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                      No operations data available
                    </div>
                  ) : (
                    <div className="h-80 w-full">
                      <ChartContainer config={operationsChartConfig} className="h-full w-full">
                        <BarChart data={operationsData} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} width={100} />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Bar dataKey="count" fill="var(--color-extraction)" radius={[0, 4, 4, 0]} barSize={30} />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Sessions Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Sessions</CardTitle>
                <CardDescription>Last 10 processing sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUsage ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : usageSessions.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    No sessions found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-left text-sm text-muted-foreground">
                          <th className="pb-3 pr-4">Mode</th>
                          <th className="pb-3 pr-4">Transactions</th>
                          <th className="pb-3 pr-4">Tokens</th>
                          <th className="pb-3 pr-4">Cost</th>
                          <th className="pb-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {usageSessions.slice(0, 10).map((session) => (
                          <tr key={session.id} className="border-b border-border last:border-0">
                            <td className="py-3 pr-4">
                              <span className={cn(
                                "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                                session.processingMode === 'sequential' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                session.processingMode === 'batch' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                                session.processingMode === 'clarification' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              )}>
                                {session.processingMode}
                              </span>
                            </td>
                            <td className="py-3 pr-4">{session.transactionCount}</td>
                            <td className="py-3 pr-4">{formatTokens(session.totalTokens)}</td>
                            <td className="py-3 pr-4">${session.totalCostUsd.toFixed(2)}</td>
                            <td className="py-3">{format(new Date(session.createdAt), 'MMM d, yyyy')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
        </motion.div>
      )}
    </div>
  );
}
