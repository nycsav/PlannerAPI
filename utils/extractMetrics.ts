/**
 * Extract key metrics from text content
 * Returns structured data for metric cards
 */

export type ExtractedMetric = {
  value: string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: 'dollar' | 'percent' | 'users' | 'target';
  context?: string;
};

export function extractMetrics(text: string): ExtractedMetric[] {
  const metrics: ExtractedMetric[] = [];

  // Extract percentages (e.g., "34% increase", "92% automation")
  const percentRegex = /(\d+(?:\.\d+)?)\s*%\s*(\w+)?/gi;
  let match;
  while ((match = percentRegex.exec(text)) !== null) {
    const value = match[1];
    const context = match[2] || '';

    // Determine trend based on context words
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (/(increase|growth|higher|gain|rise|boost)/i.test(context)) {
      trend = 'up';
    } else if (/(decrease|decline|lower|drop|reduction)/i.test(context)) {
      trend = 'down';
    }

    metrics.push({
      value: `${value}%`,
      label: context.charAt(0).toUpperCase() + context.slice(1) || 'Metric',
      trend,
      icon: 'percent',
      context: match[0]
    });
  }

  // Extract dollar amounts (e.g., "$4.2B", "$500K")
  const dollarRegex = /\$(\d+(?:\.\d+)?)\s*([KMBT])?/gi;
  while ((match = dollarRegex.exec(text)) !== null) {
    const value = match[1];
    const suffix = match[2] || '';
    metrics.push({
      value: `$${value}${suffix}`,
      label: 'Value',
      trend: 'neutral',
      icon: 'dollar',
      context: match[0]
    });
  }

  // Extract multipliers (e.g., "2.7x higher", "3-5x ROAS")
  const multiplierRegex = /(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?)\s*x\s*(\w+)?/gi;
  while ((match = multiplierRegex.exec(text)) !== null) {
    const value = match[1];
    const context = match[2] || '';
    metrics.push({
      value: `${value}x`,
      label: context.charAt(0).toUpperCase() + context.slice(1) || 'Multiplier',
      trend: 'up',
      icon: 'target',
      context: match[0]
    });
  }

  // Deduplicate and limit to top 3-4 most significant
  const uniqueMetrics = metrics.filter((metric, index, self) =>
    index === self.findIndex((m) => m.value === metric.value && m.label === metric.label)
  );

  return uniqueMetrics.slice(0, 4);
}
