
import React from 'react';
import { Cpu, Users, Palette, Activity, ChevronRight, BarChart } from 'lucide-react';

export const EngineInstructions: React.FC = () => {
  const steps = [
    {
      icon: <Cpu className="w-5 h-5" />,
      title: "Synthesize Workflow",
      desc: "Connect tactical agents to existing planning stacks. Automate signal indexing and brief generation.",
      outcome: "Efficiency_Alpha"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Re-Index Talent",
      desc: "Track shifting job market demands. Identify premium skillsets in the AI-orchestrated market.",
      outcome: "Career_Longevity"
    },
    {
      icon: <BarChart className="w-5 h-5" />,
      title: "Data-Driven Brand",
      desc: "Leverage real-time search and retail signals to build brand equity maps that correlate with growth.",
      outcome: "Validated_Creative"
    }
  ];

  return (
    <div className="border border-bureau-border bg-white p-md md:p-lg space-y-lg">
      <div className="max-w-2xl space-y-md">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-bureau-signal" />
          <span className="font-mono text-system-xs text-bureau-slate uppercase font-bold tracking-widest">System_Pillars // OS_KERNEL_0.9</span>
        </div>
        <h2 className="text-display-lg font-black text-bureau-ink uppercase italic tracking-tight leading-none">
          Operational Workspace
        </h2>
        <p className="text-bureau-slate text-body-base font-medium leading-relaxed">
          The PlannerAPI Operating System distills the strategist's workflow into three measurable deployment pillars.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col gap-md p-md border border-bureau-border hover:border-bureau-ink group cursor-pointer bg-bureau-surface">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 border border-bureau-border flex items-center justify-center text-bureau-ink group-hover:bg-bureau-ink group-hover:text-white">
                {step.icon}
              </div>
              <span className="font-mono text-system-xs text-bureau-slate font-bold">NODE_0{idx + 1}</span>
            </div>
            <div className="space-y-sm">
              <h3 className="font-display font-black text-bureau-ink uppercase text-lg italic tracking-tight">{step.title}</h3>
              <p className="font-sans text-system-xs text-bureau-slate leading-relaxed font-medium uppercase tracking-tight">{step.desc}</p>
              
              <div className="pt-sm border-t border-bureau-border flex items-center justify-between">
                <div className="font-mono text-[9px] uppercase tracking-widest text-bureau-signal font-bold">
                   Target: {step.outcome}
                </div>
                <ChevronRight className="w-4 h-4 text-bureau-slate group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
