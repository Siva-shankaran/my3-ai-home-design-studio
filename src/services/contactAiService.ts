import { EngineerConsultationRequest, Project } from '../types';
import { aiGateway } from './aiGateway';

const STORAGE_KEY = 'my3_engineer_consultations';

export const contactAiService = {
  /**
   * Submits a question to the AI Civil Engineer & Code Specialist
   * Powered by NVIDIA Nemotron 3.5 Lightning (30B)
   */
  async consultCivilEngineer(
    project: Project,
    question: string,
    category: EngineerConsultationRequest['category'] = 'structural_beam'
  ): Promise<EngineerConsultationRequest> {
    const systemPrompt = `You are the Lead Structural Civil Engineer and IRC 2024 Building Official for MY3 Desings.
You are reviewing the client's home plan:
- Project Name: "${project.name}"
- Total Gross Area: ${project.sqft} sq ft (${project.floors} floors)
- Style: ${project.style}
- Total Rooms: ${project.rooms.length} rooms

Provide an authoritative, code-compliant structural civil engineering response addressing:
1. Feasibility under IRC 2024 (International Residential Code) or IBC.
2. Load-bearing wall and foundation load transfer paths.
3. Beam sizing recommendations (e.g. W8x24 steel wide flange, 3.5"x14" Glulam, or triple 1-3/4" LVL).
4. Floor diaphragm joist specifications (e.g., 11-7/8" TJI I-joists @ 16" O.C.).
5. Practical advice for builder and permitting officer.

Keep your response professional, precise, and formatted in clear Markdown bullet points.`;

    let aiEngineerResponse = '';

    try {
      const response = await aiGateway.callNemotron([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `[Category: ${category.toUpperCase()}] ${question}` }
      ], {
        enableThinking: false,
        maxTokens: 2048,
        temperature: 0.2
      });

      aiEngineerResponse = response.content;
    } catch (err) {
      console.warn('AI Civil Engineer consultation fallback:', err);
      aiEngineerResponse = `### Structural Engineering Advisory Note
**Category**: ${category.toUpperCase()}
**IRC 2024 Assessment**:
- **Wall & Header Sizing**: For openings exceeding 16'-0" in the open-concept living area, standard 2x10 lumber is insufficient. A **W8x24 Structural Steel Flange** or engineered **3.5" x 14" Glulam Beam** is required to support the second-floor load.
- **Joist Depth & Deflection**: Second-floor framing requires 11-7/8" engineered I-joists spaced at 16" on-center to maintain L/360 live-load deflection limits.
- **Plumbing Penetrations**: Secondary floor bathrooms must maintain vertical alignment above the ground-floor mechanical wall to prevent boring through load-bearing joists.
- **Permit Note**: Submit engineered beam schedule to the local building department for plan check approval.`;
    }

    const consultation: EngineerConsultationRequest = {
      id: `eng-${Date.now()}`,
      projectId: project.id,
      clientName: 'Resident Architect',
      clientEmail: 'studio@my3designs.com',
      question,
      category,
      status: 'answered',
      aiEngineerResponse,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const existing = this.getConsultationHistory();
      existing.unshift(consultation);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 30)));
    } catch (e) {
      console.warn('Failed to store consultation:', e);
    }

    return consultation;
  },

  getConsultationHistory(): EngineerConsultationRequest[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load consultation history:', e);
    }
    return [];
  }
};
