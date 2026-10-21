import React, { useMemo } from 'react';
import type { ProjectDesign } from '../../types/project.ts';
import { auditProject, ENGINEERING_DISCLAIMER } from '../../engine/investigator/investigatorEngine.ts';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  Info,
  Building2,
  FileText
} from 'lucide-react';

interface Step06VerificationProps {
  project: ProjectDesign;
  onProceedToExport: () => void;
}

export const Step06Verification: React.FC<Step06VerificationProps> = ({
  project,
  onProceedToExport,
}) => {
  const report = useMemo(
    () => auditProject(project, project.briefSnapshot),
    [project]
  );

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto w-full">
      {/* Top Status Banner */}
      <div className={`p-6 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        report.overallStatus === 'PASS'
          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
          : report.overallStatus === 'PASS_WITH_WARNINGS'
          ? 'bg-amber-50/70 border-amber-300 text-amber-950'
          : 'bg-red-50/70 border-red-300 text-red-950'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-full bg-white shadow-xs">
            {report.overallStatus === 'PASS' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            ) : report.overallStatus === 'PASS_WITH_WARNINGS' ? (
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                Verification Verdict: {report.overallStatus.replace(/_/g, ' ')}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white border border-current font-bold">
                {report.scorePercent}% Compliance Score
              </span>
            </div>
            <h2 className="font-serif text-2xl text-[var(--color-ink)] mt-0.5">
              Independent Investigator Audit Report
            </h2>
            <p className="text-xs text-[var(--color-muted)] font-sans mt-0.5">
              Audited against {project.briefSnapshot.regulations.codeProfile} and NBC 2016 safety standards.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onProceedToExport}
          className="flex items-center gap-2 px-6 py-3 rounded text-xs font-mono uppercase tracking-wider font-bold bg-[var(--color-accent)] text-white hover:opacity-95 shadow-sm cursor-pointer whitespace-nowrap"
        >
          <span>Issue Drawing Set Export</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Semantic Architectural Critic Notes */}
      {report.semanticCriticNotes && report.semanticCriticNotes.length > 0 && (
        <div className="p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            <Sparkles className="w-4 h-4" />
            <span>Independent Architectural Critic Assessment</span>
          </div>
          <div className="space-y-1.5 text-xs text-[var(--color-muted)] font-sans">
            {report.semanticCriticNotes.map((note, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[var(--color-accent)] font-bold">•</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comprehensive Verification Items Table */}
      <div className="p-5 bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg text-[var(--color-ink)]">
            Detailed Statutory &amp; Geometric Audit Table
          </h3>
          <span className="text-xs font-mono text-[var(--color-muted)]">
            {report.items.length} Engineering Checks Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-rule)] bg-[var(--color-paper-3)] text-[var(--color-muted)]">
                <th className="p-2.5">Domain</th>
                <th className="p-2.5">Check Description</th>
                <th className="p-2.5">Clause / Standard</th>
                <th className="p-2.5">Required Value</th>
                <th className="p-2.5">Actual Measured</th>
                <th className="p-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.items.map((item) => (
                <tr key={item.id} className="border-b border-[var(--color-rule-2)] hover:bg-[var(--color-paper)]">
                  <td className="p-2.5 font-bold text-[10px] text-[var(--color-accent)]">
                    {item.category}
                  </td>
                  <td className="p-2.5 font-sans">
                    <div className="font-semibold text-[var(--color-ink)]">{item.name}</div>
                    <div className="text-[11px] text-[var(--color-muted)]">{item.description}</div>
                  </td>
                  <td className="p-2.5 text-[10px] text-[var(--color-muted)]">
                    {item.clauseReference || 'Design Brief'}
                  </td>
                  <td className="p-2.5 text-[var(--color-muted)]">{item.requiredValue}</td>
                  <td className="p-2.5 font-bold text-[var(--color-ink)]">{item.actualValue}</td>
                  <td className="p-2.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'PASS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'WARNING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Engineering Disclaimer */}
      <div className="p-4 rounded-lg bg-[var(--color-paper-3)] border border-[var(--color-rule-2)] text-[11px] font-mono text-[var(--color-muted)]">
        <span className="font-bold text-[var(--color-ink)] uppercase">Legal Engineering Notice: </span>
        <span>{report.disclaimer}</span>
      </div>
    </div>
  );
};
