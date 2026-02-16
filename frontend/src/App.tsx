import { useState } from 'react';
import { IntakeValidationPage } from './pages/IntakeValidationPage';
import { EvidenceStatementsPage } from './pages/EvidenceStatementsPage';
import { WorkflowPacketPage } from './pages/WorkflowPacketPage';
import { AuditTimelinePage } from './pages/AuditTimelinePage';

type TabKey = 'intake' | 'evidence' | 'packet' | 'audit';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'intake', label: 'Intake Validation' },
  { key: 'evidence', label: 'Evidence Statements' },
  { key: 'packet', label: 'Workflow Handoff Packet' },
  { key: 'audit', label: 'Audit Timeline' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('intake');

  return (
    <div className="app-shell">
      <header>
        <h1>Medical Device Regulation Workbench</h1>
        <p>Frontend workflows connected to FastAPI validation and audit endpoints.</p>
      </header>

      <nav className="tab-row">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.key}
            className={activeTab === tab.key ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main>
        {activeTab === 'intake' && <IntakeValidationPage />}
        {activeTab === 'evidence' && <EvidenceStatementsPage />}
        {activeTab === 'packet' && <WorkflowPacketPage />}
        {activeTab === 'audit' && <AuditTimelinePage />}
      </main>
    </div>
  );
}
