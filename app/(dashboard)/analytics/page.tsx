
'use client';

import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
} from 'recharts';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Activity, Cpu, Database, Zap } from 'lucide-react';

// Mock Data
const usageData = [
  { month: 'Aug', tokens: 120000, cost: 1.2 },
  { month: 'Sep', tokens: 150000, cost: 1.5 },
  { month: 'Oct', tokens: 180000, cost: 1.8 },
  { month: 'Nov', tokens: 220000, cost: 2.2 },
  { month: 'Dec', tokens: 280000, cost: 2.8 },
  { month: 'Jan', tokens: 350000, cost: 3.5 },
];

const operationsData = [
  { name: 'OCR', count: 45 },
  { name: 'Detection', count: 45 },
  { name: 'Extraction', count: 90 },
  { name: 'Clarification', count: 35 },
  { name: 'Embedding', count: 30 },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'llm'>('transactions');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
           <p className="text-muted-foreground mt-1">Insights into your finances and system usage</p>
        </div>
        
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

      {activeTab === 'transactions' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid gap-6"
        >
          <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
             <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
               <Activity size={32} />
             </div>
             <h3 className="text-xl font-semibold text-foreground">Transaction Analytics</h3>
             <p className="text-muted-foreground max-w-md mt-2">
               Detailed financial reporting would go here (Income vs Expense trends, Category filtering, etc).
               Currently reusing Dashboard charts as placeholder.
             </p>
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
           {/* Summary Cards */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg"><Zap size={20} /></div>
                   <span className="text-sm font-medium text-muted-foreground">Total Calls</span>
                </div>
                <div className="text-2xl font-semibold">245</div>
              </div>
              <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg"><Cpu size={20} /></div>
                   <span className="text-sm font-medium text-muted-foreground">Total Tokens</span>
                </div>
                <div className="text-2xl font-semibold">1.2M</div>
              </div>
              <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg"><Database size={20} /></div>
                   <span className="text-sm font-medium text-muted-foreground">Total Cost</span>
                </div>
                <div className="text-2xl font-semibold">$12.84</div>
              </div>
              <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg"><Activity size={20} /></div>
                   <span className="text-sm font-medium text-muted-foreground">This Month</span>
                </div>
                <div className="text-2xl font-semibold">$3.45</div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost Chart */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-6">Cost over Time</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                      />
                      <Line type="monotone" dataKey="cost" stroke="#14b8a6" strokeWidth={3} dot={{r: 4, fill: '#14b8a6'}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

               {/* Operations Chart */}
               <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-6">Operations Breakdown</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={operationsData} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'var(--muted-foreground)'}} width={100} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                        cursor={{fill: 'var(--muted)/50'}}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
           </div>
        </motion.div>
      )}
    </div>
  );
}
