
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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
  { name: 'OCR', count: 45, fill: "var(--color-ocr)" },
  { name: 'Detection', count: 45, fill: "var(--color-detection)" },
  { name: 'Extraction', count: 90, fill: "var(--color-extraction)" },
  { name: 'Clarification', count: 35, fill: "var(--color-clarification)" },
  { name: 'Embedding', count: 30, fill: "var(--color-embedding)" },
];

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

const StatCard = ({ title, value, icon: Icon, colorClass, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="h-full"
  >
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-2">
           <div className={cn("p-2 rounded-lg", colorClass)}>
             <Icon size={20} />
           </div>
           <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  </motion.div>
);

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
              <StatCard 
                title="Total Calls" 
                value="245" 
                icon={Zap} 
                colorClass="bg-blue-500/10 text-blue-600" 
                delay={0.1}
              />
              <StatCard 
                title="Total Tokens" 
                value="1.2M" 
                icon={Cpu} 
                colorClass="bg-purple-500/10 text-purple-600" 
                delay={0.2}
              />
              <StatCard 
                title="Total Cost" 
                value="$12.84" 
                icon={Database} 
                colorClass="bg-emerald-500/10 text-emerald-600" 
                delay={0.3}
              />
              <StatCard 
                title="This Month" 
                value="$3.45" 
                icon={Activity} 
                colorClass="bg-amber-500/10 text-amber-600" 
                delay={0.4}
              />
           </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Cost over Time</CardTitle>
                  <CardDescription>Monthly token cost analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ChartContainer config={costChartConfig} className="h-full w-full">
                      <LineChart data={usageData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                </CardContent>
              </Card>

               {/* Operations Chart */}
               <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Operations Breakdown</CardTitle>
                  <CardDescription>Distribution of LLM tasks</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </div>
        </motion.div>
      )}
    </div>
  );
}
