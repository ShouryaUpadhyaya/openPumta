import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface BurnoutRiskAssessmentProps {
  data: {
    level: 'low' | 'moderate' | 'high';
    score: number;
    reasons: string[];
  };
}

export default function BurnoutRiskAssessment({ data }: BurnoutRiskAssessmentProps) {
  const getLevelConfig = () => {
    switch (data.level) {
      case 'high':
        return {
          color: 'text-red-500',
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          title: 'High Risk',
          icon: <AlertTriangle className="w-10 h-10 text-red-500" />,
          message:
            'Take a break immediately. You are pushing too hard and performance is slipping.',
        };
      case 'moderate':
        return {
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          title: 'Moderate Risk',
          icon: <Info className="w-10 h-10 text-yellow-500" />,
          message: 'Watch out. Some negative patterns are emerging. Prioritize recovery today.',
        };
      default:
        return {
          color: 'text-green-500',
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          title: 'Low Risk',
          icon: <CheckCircle className="w-10 h-10 text-green-500" />,
          message: 'You are maintaining a healthy balance. Keep it up!',
        };
    }
  };

  const config = getLevelConfig();

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col w-full h-[400px]">
      <h3 className="text-lg font-bold text-foreground mb-4">Burnout Assessment</h3>

      <div
        className={`flex flex-col items-center justify-center p-6 rounded-xl border ${config.bg} ${config.border} mb-6`}
      >
        {config.icon}
        <h4 className={`text-xl font-bold mt-2 ${config.color}`}>{config.title}</h4>
        <p className="text-sm text-muted-foreground text-center mt-2 max-w-[250px]">
          {config.message}
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <h5 className="text-sm font-semibold text-foreground mb-3">Contributing Factors:</h5>
        {data.reasons.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No negative factors detected.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span
                  className={`shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-current ${config.color}`}
                />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
