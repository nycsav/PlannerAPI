import React from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts'
import { MoreHorizontalIcon } from 'lucide-react'

const DATA = [
  { name: 'Google', value: 48, color: '#4285f4' },
  { name: 'Microsoft', value: 44, color: '#00a4ef' },
  { name: 'Amazon', value: 39, color: '#ff9900' },
  { name: 'Meta', value: 32, color: '#0668e1' },
]

export function DataCard() {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-xl rounded-2xl border border-[rgba(255,255,255,0.08)] overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:scale-[1.01] hover:border-[rgba(255,255,255,0.15)] relative flex flex-col h-full p-5">
      {/* Hover Menu */}
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-8 h-8 rounded-full bg-[rgba(0,0,0,0.5)] backdrop-blur-md flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.2)] transition-colors">
          <MoreHorizontalIcon size={16} />
        </button>
      </div>

      <h3 className="text-base font-semibold text-white mb-1">AI Infrastructure Spending</h3>
      <p className="text-xs text-[#8b8fa3] mb-4">Q1 2026 Capital Expenditure (Billions USD)</p>

      <div className="h-[160px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA} layout="vertical" margin={{ top: 0, right: 30, left: -20, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8b8fa3', fontSize: 12 }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} background={{ fill: 'rgba(255,255,255,0.05)', radius: [0, 4, 4, 0] }}>
              {DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList dataKey="value" position="right" fill="#e8eaed" fontSize={12} formatter={(val: number) => `$${val}B`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto pt-3 border-t border-[rgba(255,255,255,0.08)]">
        <p className="text-xs text-[#8b8fa3]">Sources: Company filings, analyst estimates</p>
      </div>
    </div>
  )
}
