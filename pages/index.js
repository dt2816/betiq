import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const SPORTS = [
  { id: 'MLB', icon: '⚾' },
  { id: 'NBA', icon: '🏀' },
  { id: 'NFL', icon: '🏈' },
  { id: 'NHL', icon: '🏒' },
  { id: 'MMA', icon: '🥊' },
  { id: 'Golf', icon: '⛳' },
];

const FOCUS_AREAS = ['Player Props', 'Game Totals', 'Spreads', 'Parlays', 'EV Finder'];
const PLATFORMS = ['FanDuel', 'PrizePicks', 'Both'];
const PLATFORM_COLOR = { FanDuel: '#1E90FF', PrizePicks: '#00E676', Both: '#F5C518' };

const QUICK_PROMPTS = {
  MLB: ['Best strikeout props tonight', 'Top hitting props for today\'s slate', 'Starting pitcher matchup values', 'Best total bases plays'],
  NBA: ['Best scoring props tonight', 'Top assist props', 'Rebound value plays', 'Best 3-pointer props'],
  NFL: ['Top passing yard props', 'Best TD scorer props', 'Receiving yard values', 'Rushing prop edges'],
  NHL: ['Best goal scorer props', 'Top assist plays', 'Goalie save props', 'Power play angles'],
  MMA: ['Fight method props', 'Round betting values', 'Finish props tonight', 'Underdog value plays'],
  Golf: ['Top 10 finish values', 'Round leader props', 'Birdie prop plays', 'Cut make values'],
};

function ConfidenceDots({ level }) {
  const map = { High: 3, Med: 2, Low: 1 };
  const n = map[level] || 1;
  const color = n === 3 ? 'var(--green)' : n === 2 ? 'var(--gold)' : 'var(--red)';
  return (
    <span style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {[1,2,3].map(i => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i <= n ? color : 'var(--surface2)', display: 'inline-block' }} />
      ))}
    </span>
  );
}

function SlipCard({ item, onRemove }) {
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.player || item.game}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{item.prop}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
            <span style={{ background: item.pick === 'Over' ? 'rgba(0,230,118,0.12)' : 'rgba(255,61,87,0.12)', color: item.pick === 'Over' ? 'var(--green)' : 'var(--red)', border: `1px solid ${item.pick === 'Over' ? 'rgba(0,230,118,0.25)' : 'rgba(255,61,87,0.25)'}`, borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>{item.pick}</span>
            <span style={{ background: `${PLATFORM_COLOR[item.platform]}18`, color: PLATFORM_COLOR[item.platform], borderRadius: 5, padding: '2px 7px', fontSize: 10, fontWeight: 600 }}>{item.platform}</span>
            <ConfidenceDots level={item.confidence} />
          </div>
        </div>
        <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 16, padding: '0 4px' }}>×</button>
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 18 }}>
      {!isUser && (
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), #ff8c00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, marginRight: 10, marginTop: 2 }}>⚡</div>
      )}
      <div style={{ maxWidth: '80%', background: isUser ? 'linear-gradient(135deg, rgba(30,144,255,0.15), rgba(30,144,255,0.08))' : 'var(--surface)', border: `1px solid ${isUser ? 'rgba(30,144,255,0.2)' : 'var(--border)'}`, borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '12px 16px', fontSize: 13.5, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {msg.content}
      </div>
    </div>
  );
}

function BankrollTracker() {
  const [bankroll, setBankroll] = useState('');
  const [bets, setBets] = useState([]);
  const [form, setForm] = useState({ desc: '', stake: '', odds: '', result: 'pending' });
  const addBet = () => {
    if (!form.desc || !form.stake || !form.odds) return;
    const odds = parseInt(form.odds);
    const stake = parseFloat(form.stake);
    const profit = odds > 0 ? (odds / 100) * stake : (100 / Math.abs(odds)) * stake;
    setBets(prev => [...prev, { ...form, id: Date.now(), stake, profit: parseFloat(profit.toFixed(2)) }]);
    setForm({ desc: '', stake: '', odds: '', result: 'pending' });
  };
  const totalStaked = bets.reduce((a, b) => a + b.stake, 0);
  const totalWon = bets.filter(b => b.result === 'win').reduce((a, b) => a + b.profit, 0);
