
'use client';

import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CreditCard,
  TrendingUp,
  Activity,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn, formatCurrency } from '@/lib/utils';
import { sampleTransactions, sampleCategories } from '@/lib/mockData';
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

// Mock Chart Data
const chartData = [
  { month: 'Jan', income: 4000, expense: 2400 },
  { month: 'Feb', income: 3000, expense: 1398 },
  { month: 'Mar', income: 2000, expense: 9800 },
  { month: 'Apr', income: 2780, expense: 3908 },
  { month: 'May', income: 1890, expense: 4800 },
  { month: 'Jun', income: 2390, expense: 3800 },
];

const pieData = [
  { name: 'Food', value: 400, color: "var(--chart-1)", fill: "var(--color-food)" },
  { name: 'Transport', value: 300, color: "var(--chart-2)", fill: "var(--color-transport)" },
  { name: 'Shopping', value: 300, color: "var(--chart-3)", fill: "var(--color-shopping)" },
  { name: 'Ent.', value: 200, color: "var(--chart-4)", fill: "var(--color-ent)" },
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

const StatCard = ({ title, value, change, trend, icon: Icon, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="h-full"
  >
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardContent className="">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Icon size={20} />
          </div>
         
        </div>
        <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
        <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
      </CardContent>
    </Card>
  </motion.div>
);

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* SECTION: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Income" 
          value="$12,450.00" 
          change="15%" 
          trend="up" 
          icon={TrendingUp} 
          delay={0.1}
        />
        <StatCard 
          title="Total Expenses" 
          value="$8,320.50" 
          change="8%" 
          trend="down" 
          icon={CreditCard} 
          delay={0.2}
        />
        <StatCard 
          title="Net Balance" 
          value="$4,129.50" 
          change="+4.5%" 
          trend="up" 
          icon={DollarSign} 
          delay={0.3}
        />
        <StatCard 
          title="Total Transactions" 
          value="87" 
          change="+12" 
          trend="up" 
          icon={Activity} 
          delay={0.4}
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
              <Select defaultValue="6months">
                <SelectTrigger className="w-40 bg-muted/50">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ChartContainer config={areaChartConfig} className="h-80 w-full">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} />
                  <ChartTooltip 
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" stroke="var(--color-expense)" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ChartContainer>
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
              <div className="h-64 w-full relative">
                <ChartContainer config={pieChartConfig} className="h-full w-full">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                  </PieChart>
                </ChartContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-muted-foreground uppercase font-medium">Top Spend</span>
                  <span className="text-xl font-semibold text-foreground">Food</span>
                </div>
              </div>
              
              <div className="space-y-3 mt-4">
                {pieData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{item.value/10}%</span>
                  </div>
                ))}
              </div>
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
                {sampleTransactions.slice(0, 5).map((txn, i) => {
                  const CategoryIcon = sampleCategories.find(c => c.id === txn.categoryId)?.icon || CreditCard;
                  const categoryColor = sampleCategories.find(c => c.id === txn.categoryId)?.color || '#9ca3af';

                  return (
                    <TableRow key={txn.id} className="hover:bg-muted/20 transition-colors group">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4 bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <CategoryIcon size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{txn.description}</p>
                            <p className="text-xs text-muted-foreground">{txn.merchant}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="outline" className="font-medium" style={{ 
                          backgroundColor: `${categoryColor}15`, 
                          color: categoryColor,
                          borderColor: `${categoryColor}30` 
                        }}>
                          {sampleCategories.find(c => c.id === txn.categoryId)?.name || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {txn.transactionDate}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="outline" className={cn(
                          "font-medium",
                          txn.status === 'CONFIRMED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
                          txn.status === 'PENDING' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                          "bg-zinc-100 text-zinc-600 border-zinc-200"
                        )}>
                          {txn.status === 'CONFIRMED' ? 'Completed' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn("px-6 py-4 text-right font-semibold", 
                        txn.transactionType === 'INCOME' ? "text-emerald-600" : "text-foreground"
                      )}>
                        {txn.transactionType === 'INCOME' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
