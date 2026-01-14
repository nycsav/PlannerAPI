
import React from 'react';
import { Cpu, Users, BarChart, ChevronRight } from 'lucide-react';

export const EngineInstructions: React.FC = () => {
  const workflows = [
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "Workflow Automation",
      desc: "Connect AI agents to your existing planning tools. Automate market signal indexing and intelligence brief generation."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Talent Intelligence",
      desc: "Track shifting job market demands and identify premium skillsets emerging in AI-driven marketing landscapes."
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: "Brand Performance Analytics",
      desc: "Leverage real-time search and retail signals to build brand equity maps correlated with revenue growth."
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 md:p-12 space-y-8">
      <div className="max-w-3xl space-y-4">
        <h2 className="font-display text-3xl md:text-4xl font-black text-bureau-ink italic tracking-tight">
          HOW IT WORKS
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Three core capabilities that transform how marketing leaders access and act on strategic intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workflows.map((workflow, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-4 p-6 border border-gray-200 hover:border-bureau-ink hover:shadow-lg transition-all cursor-pointer bg-white group"
          >
            <div className="w-12 h-12 border-2 border-gray-200 flex items-center justify-center text-bureau-ink group-hover:bg-bureau-ink group-hover:text-white group-hover:border-bureau-ink transition-all">
              {workflow.icon}
            </div>

            <div className="space-y-3 flex-grow">
              <h3 className="font-display text-xl font-black text-bureau-ink italic">
                {workflow.title}
              </h3>
              <p className="text-base text-gray-600 leading-relaxed">
                {workflow.desc}
              </p>
            </div>

            <div className="flex items-center text-bureau-signal font-semibold text-sm group-hover:gap-2 transition-all">
              Learn more <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
