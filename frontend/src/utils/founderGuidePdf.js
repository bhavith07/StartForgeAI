function list(values) {
  return Array.isArray(values) ? values : [];
}

export function addFounderGuidePdf(guide, addSection, addWrapped, addList, colors) {
  if (!guide) return;
  const market = guide.marketPotential || {};
  const costs = guide.costEstimates || {};
  const competition = guide.competitorResearch || {};
  const technical = guide.technicalSolution || {};
  addSection("Technology Founder Guide");
  addWrapped("Planning estimates for a college demo and early product. Cost ranges and market assumptions are directional, not quotes or verified forecasts.", { color: colors.muted });
  addSection("Problem, Use Case and Users");
  addWrapped(guide.problemUseCase);
  addWrapped(`Target users: ${guide.targetUsers || "Not provided"}`);
  addSection("Technical Solution and Architecture");
  addWrapped(technical.overview);
  addList(list(technical.architectureComponents).map((item) => `${item.component}: ${item.responsibility}`));
  addSection("Core MVP Features");
  addList(guide.coreMvpFeatures);
  addSection("Recommended Technology Stack");
  addList(list(guide.recommendedTechStack).map((item) => `${item.layer}: ${item.recommendation}. ${item.reason}`));
  addSection("Development Phases and Milestones");
  addList(list(guide.developmentPhases).map((item) => `${item.phase} (${item.duration}): ${list(item.deliverables).join("; ")}`));
  addSection("Estimated Development and Operating Costs", colors.cyan);
  addWrapped(`One-time MVP development estimate: ${costs.developmentRange || "Not provided"} ${costs.currency || "INR"}`);
  addWrapped("Development assumptions:");
  addList(costs.developmentAssumptions);
  addList(list(costs.monthlyOperatingCosts).map((item) => `${item.category}: ${item.range}. Assumption: ${item.assumption}`));
  addSection("Risks, Security and Scalability", colors.red);
  addList(list(guide.risks).map((item) => `${item.risk} (${item.severity}): Mitigation — ${item.mitigation}`), colors.red);
  addSection("Market Potential and Validation");
  addWrapped(market.opportunity);
  addWrapped("Assumptions:");
  addList(market.assumptions);
  addWrapped("Validation steps:");
  addList(market.validationSteps);
  addSection("Competitor Research and Alternatives", colors.purple);
  addWrapped(`Evidence status: ${competition.evidenceStatus || "Unverified"}`, { color: colors.amber, bold: true });
  addWrapped(competition.limitation || "This assessment did not perform live web research. Competitor details below are unverified AI-generated candidates.");
  addList(list(competition.candidates).map((item) => `${item.name}: ${item.offering}. Users: ${item.targetUsers}. Possible strengths: ${list(item.strengths).join("; ")}. Possible weaknesses: ${list(item.weaknesses).join("; ")}. Differentiation: ${list(item.differentiationOpportunities).join("; ")}. Evidence: ${item.evidenceStatus || "Unverified"}. Sources: ${list(item.sourceUrls).join(", ") || "None"}`), colors.purple);
  addWrapped(competition.followUp);
  addSection("Assumptions and Items to Verify", colors.amber);
  addList(guide.assumptions, colors.amber);
}
