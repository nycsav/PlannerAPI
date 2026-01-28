/**
 * Extract key metrics from text content
 * Returns structured data for metric cards and visualizations
 */

export type ExtractedMetric = {
  value: string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: 'dollar' | 'percent' | 'users' | 'target';
  context?: string;
};

/**
 * Extract surrounding context for a metric to provide better labels
 */
function extractSurroundingContext(text: string, matchIndex: number, matchLength: number): string {
  const before = text.substring(Math.max(0, matchIndex - 60), matchIndex);
  const after = text.substring(matchIndex + matchLength, matchIndex + matchLength + 50);
  
  // Look for meaningful words before and after the number
  const beforeWords = before.split(/\s+/).slice(-4).join(' ').trim();
  const afterWords = after.split(/\s+/).slice(0, 5).join(' ').trim();
  
  // Clean up and combine
  const context = `${beforeWords} ${afterWords}`.replace(/[^\w\s%$'-]/g, '').trim();
  return context.length > 5 ? context : '';
}

/**
 * Determine trend based on surrounding context
 */
function determineTrend(context: string): 'up' | 'down' | 'neutral' {
  const lowerContext = context.toLowerCase();
  if (/(increase|growth|higher|gain|rise|boost|up|grew|growing|improve|surpass|exceed)/i.test(lowerContext)) {
    return 'up';
  }
  if (/(decrease|decline|lower|drop|reduction|down|fell|falling|shrink|reduce|cut)/i.test(lowerContext)) {
    return 'down';
  }
  return 'neutral';
}

/**
 * Create a readable label from context
 */
function createLabel(context: string, fallback: string): string {
  if (!context || context.length < 3) return fallback;
  
  // Key business terms to prioritize (ordered by preference)
  const businessTermPatterns = [
    { pattern: /\b(contract|deal|partnership)\b/i, label: 'Contract Value' },
    { pattern: /\b(adoption)\b/i, label: 'Adoption Rate' },
    { pattern: /\b(revenue|sales)\b/i, label: 'Revenue' },
    { pattern: /\b(cost|spend|budget)\b/i, label: 'Spend' },
    { pattern: /\b(growth|increase)\b/i, label: 'Growth' },
    { pattern: /\b(roi|return)\b/i, label: 'ROI' },
    { pattern: /\b(market)\b/i, label: 'Market' },
    { pattern: /\b(share)\b/i, label: 'Market Share' },
    { pattern: /\b(rate)\b/i, label: 'Rate' },
    { pattern: /\b(users?|employees?|workers?)\b/i, label: 'People' },
    { pattern: /\b(customers?|clients?)\b/i, label: 'Customers' },
    { pattern: /\b(efficiency|productivity)\b/i, label: 'Efficiency' },
    { pattern: /\b(savings?)\b/i, label: 'Savings' },
    { pattern: /\b(reduction|decline|decrease)\b/i, label: 'Reduction' },
    { pattern: /\b(performance)\b/i, label: 'Performance' },
    { pattern: /\b(investment)\b/i, label: 'Investment' },
    { pattern: /\b(profit|margin)\b/i, label: 'Profit' },
  ];
  
  for (const { pattern, label } of businessTermPatterns) {
    if (pattern.test(context)) {
      return label;
    }
  }
  
  // If no business term found, try to extract a meaningful phrase
  // Look for noun phrases after the number
  const words = context.split(/\s+/).filter(w => w.length > 2 && !/^\d/.test(w));
  
  // Skip common prepositions and articles
  const skipWords = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'are', 'was', 'has', 'have', 'been']);
  const meaningfulWords = words.filter(w => !skipWords.has(w.toLowerCase()));
  
  if (meaningfulWords.length >= 2) {
    // Take first two meaningful words as label
    const label = meaningfulWords.slice(0, 2).join(' ');
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
  
  if (meaningfulWords.length === 1) {
    return meaningfulWords[0].charAt(0).toUpperCase() + meaningfulWords[0].slice(1).toLowerCase();
  }
  
  return fallback;
}

export function extractMetrics(text: string): ExtractedMetric[] {
  const metrics: ExtractedMetric[] = [];

  // Extract percentages with context (e.g., "34% increase", "92% adoption rate")
  const percentRegex = /(\d+(?:\.\d+)?)\s*%/gi;
  let match;
  while ((match = percentRegex.exec(text)) !== null) {
    const value = match[1];
    const context = extractSurroundingContext(text, match.index, match[0].length);
    const trend = determineTrend(context);
    
    metrics.push({
      value: `${value}%`,
      label: createLabel(context, 'Percentage'),
      trend,
      icon: 'percent',
      context: context || match[0]
    });
  }

  // Extract dollar amounts with context (e.g., "$4.2B market", "$500K savings")
  const dollarRegex = /\$(\d+(?:\.\d+)?)\s*([KMBT])?(?:illion)?/gi;
  while ((match = dollarRegex.exec(text)) !== null) {
    const value = match[1];
    const suffix = match[2] || '';
    const context = extractSurroundingContext(text, match.index, match[0].length);
    const trend = determineTrend(context);
    
    metrics.push({
      value: `$${value}${suffix}`,
      label: createLabel(context, 'Value'),
      trend,
      icon: 'dollar',
      context: context || match[0]
    });
  }

  // Extract multipliers (e.g., "2.7x higher", "3-5x ROAS")
  const multiplierRegex = /(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?)\s*x\b/gi;
  while ((match = multiplierRegex.exec(text)) !== null) {
    const value = match[1];
    const context = extractSurroundingContext(text, match.index, match[0].length);
    
    metrics.push({
      value: `${value}x`,
      label: createLabel(context, 'Multiplier'),
      trend: 'up',
      icon: 'target',
      context: context || match[0]
    });
  }

  // Extract large numbers (millions, billions) without $ sign
  const largeNumberRegex = /(\d+(?:\.\d+)?)\s*(million|billion|M|B)\b/gi;
  while ((match = largeNumberRegex.exec(text)) !== null) {
    const value = match[1];
    const unit = match[2].toLowerCase();
    const suffix = unit.startsWith('m') ? 'M' : 'B';
    const context = extractSurroundingContext(text, match.index, match[0].length);
    const trend = determineTrend(context);
    
    // Avoid duplicates with dollar amounts
    const fullValue = `${value}${suffix}`;
    if (!metrics.some(m => m.value.includes(value))) {
      metrics.push({
        value: fullValue,
        label: createLabel(context, 'Scale'),
        trend,
        icon: 'users',
        context: context || match[0]
      });
    }
  }

  // Deduplicate by value
  const uniqueMetrics = metrics.filter((metric, index, self) =>
    index === self.findIndex((m) => m.value === metric.value)
  );

  // Sort by value significance (larger percentages/amounts first)
  uniqueMetrics.sort((a, b) => {
    const aNum = parseFloat(a.value.replace(/[^0-9.]/g, '')) || 0;
    const bNum = parseFloat(b.value.replace(/[^0-9.]/g, '')) || 0;
    return bNum - aNum;
  });

  // Return top 6 most significant metrics for dashboard
  return uniqueMetrics.slice(0, 6);
}
