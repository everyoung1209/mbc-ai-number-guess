
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { GuessRecord } from '../types';

interface StatsProps {
  guesses: GuessRecord[];
  target: number;
}

const Stats: React.FC<StatsProps> = ({ guesses, target }) => {
  const data = guesses.map((g, idx) => ({
    turn: idx + 1,
    value: g.value,
    distance: Math.abs(g.value - target)
  }));

  if (data.length === 0) return null;

  return (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mt-6">
      <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Guess Proximity Trend</h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="turn" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <ReferenceLine y={target} label={{ value: 'Target', fill: '#fbbf24', position: 'right' }} stroke="#fbbf24" strokeDasharray="5 5" />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#6366f1" 
              strokeWidth={3}
              dot={{ fill: '#6366f1', r: 4 }}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Stats;
