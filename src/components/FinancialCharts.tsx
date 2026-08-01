import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/cryptoUtils';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

interface FinancialChartsProps {
  transactions: Transaction[];
}

const COLORS = ['#10b981', '#0284c7', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ transactions }) => {
  
  // Aggregate daily transactions for area chart
  const cashFlowData = useMemo(() => {
    const map: Record<string, { date: string; pemasukan: number; pengeluaran: number }> = {};
    
    // Sort transactions by date ascending
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

    sorted.forEach(t => {
      const shortDate = t.date.substring(5); // MM-DD
      if (!map[shortDate]) {
        map[shortDate] = { date: shortDate, pemasukan: 0, pengeluaran: 0 };
      }
      if (t.type === 'pemasukan') {
        map[shortDate].pemasukan += t.amount;
      } else {
        map[shortDate].pengeluaran += t.amount;
      }
    });

    return Object.values(map);
  }, [transactions]);

  // Aggregate category breakdown for pie chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'pemasukan') {
        map[t.category] = (map[t.category] || 0) + t.amount;
      }
    });

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Aggregate expenses for bar chart
  const expenseCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'pengeluaran') {
        map[t.category] = (map[t.category] || 0) + t.amount;
      }
    });

    return Object.entries(map).map(([name, amount]) => ({ name, amount }));
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Chart 1: Cash Flow Trend (Area Chart Bento Tile) */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Grafik Arus Kas Pemasukan vs Pengeluaran Real-time
            </h3>
            <p className="text-xs text-slate-500">Tren perkembangan pergerakan dana kas masjid per hari</p>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Live Stream
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.7} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                tickLine={false} 
                tickFormatter={(v) => `${v / 1000000}JT`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', color: '#0f172a', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                formatter={(val: any) => [formatRupiah(Number(val) || 0), '']}
              />
              <Area type="monotone" dataKey="pemasukan" name="Pemasukan (+)" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="pengeluaran" name="Pengeluaran (-)" stroke="#e11d48" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Category Income Distribution (Pie Chart Bento Tile) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
            <PieChartIcon className="w-5 h-5 text-sky-600" />
            Sumber Infaq & Donasi
          </h3>
          <p className="text-xs text-slate-500 mb-4">Persentase kontribusi sumber dana kas</p>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  formatter={(val: any) => [formatRupiah(Number(val) || 0), 'Jumlah']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-3 border-t border-slate-100 text-[11px]">
          {categoryData.slice(0, 4).map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-slate-600 truncate">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
              <span className="truncate font-medium">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
