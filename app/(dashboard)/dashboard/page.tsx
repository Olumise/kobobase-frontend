
'use client';

import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CreditCard,
  TrendingUp,
  Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn, formatCurrency } from '@/lib/utils';
import { sampleTransactions, sampleCategories } from '@/lib/mockData';
import { motion } from 'framer-motion';

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
  { name: 'Food', value: 400, color: '#f59e0b' },
  { name: 'Transport', value: 300, color: '#3b82f6' },
  { name: 'Shopping', value: 300, color: '#ec4899' },
  { name: 'Ent.', value: 200, color: '#8b5cf6' },
];

const StatCard = ({ title, value, change, trend, icon: Icon, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-primary/10 rounded-lg text-primary">
        <Icon size={20} />
      </div>
      <div className={cn("flex items-center text-sm font-medium px-2 py-1 rounded-full", 
        trend === 'up' ? "text-emerald-600 bg-emerald-500/10" : "text-rose-600 bg-rose-500/10"
      )}>
        {trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
        {change}
      </div>
    </div>
    <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
    <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
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
          className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-foreground">Income vs Expenses</h2>
            <select className="bg-muted/50 border border-input rounded-lg text-sm px-3 py-1 outline-none focus:ring-2 focus:ring-primary/20">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Area type="monotone" dataKey="income" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Breakdown Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">Spend by Category</h2>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
        </motion.div>
      </div>

      {/* SECTION: Recent Transactions */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-semibold text-foreground">Recent Transactions</h2>
          <button className="text-sm text-primary hover:underline font-medium">View All</button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground font-medium uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sampleTransactions.slice(0, 5).map((txn, i) => {
                  const CategoryIcon = sampleCategories.find(c => c.id === txn.categoryId)?.icon || CreditCard;
                  const categoryColor = sampleCategories.find(c => c.id === txn.categoryId)?.color || '#9ca3af';

                  return (
                    <tr key={txn.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4 bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <CategoryIcon size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{txn.description}</p>
                            <p className="text-xs text-muted-foreground">{txn.merchant}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                          style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}>
                          {sampleCategories.find(c => c.id === txn.categoryId)?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {txn.transactionDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", 
                          txn.status === 'CONFIRMED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
                          txn.status === 'PENDING' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                          "bg-zinc-100 text-zinc-600 border-zinc-200"
                        )}>
                          {txn.status === 'CONFIRMED' ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td className={cn("px-6 py-4 text-right font-semibold", 
                        txn.transactionType === 'INCOME' ? "text-emerald-600" : "text-foreground"
                      )}>
                        {txn.transactionType === 'INCOME' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
