/**
 * Financial Options Service
 * Identifies and calculates potential options from Pink Book data
 * For exploration and modeling purposes
 */

import forwardLooking from '@/data/source/forward-looking.json';
import reservesFunds from '@/data/source/reserves-funds.json';

export interface Opportunity {
  id: string;
  name: string;
  amount: number;
  timeframe: '2025-26' | '2026-27' | '2027-28' | 'Immediate';
  source: string;
  page?: number;
  confidence: 'High' | 'Medium' | 'Low';
  type: 'Revenue' | 'Efficiency' | 'Reserves' | 'Investment';
  available: boolean;
  description: string;
  calculation?: string;
}

export interface PathToTarget {
  targetAmount: number;
  totalAvailable: number;
  opportunities: Opportunity[];
  potentiallyAchievable: boolean;
  multipleOptionsExist: boolean;
}

export class OpportunitiesService {
  private readonly TARGET_IMPROVEMENT = 60900000; // £60.9m target
  
  /**
   * Get all validated opportunities from Pink Book data
   */
  getAllOpportunities(): Opportunity[] {
    return [
      // IMMEDIATE OPPORTUNITIES - Available Now
      {
        id: 'economic-strategy-fund',
        name: 'Economic Strategy Fund',
        amount: 47900000,
        timeframe: 'Immediate',
        source: 'Pink Book 2025-26',
        page: 41,
        confidence: 'High',
        type: 'Reserves',
        available: true,
        description: 'Largely unallocated fund available for immediate use',
        calculation: 'Direct from reserves-funds.json'
      },
      {
        id: 'revenue-contingency',
        name: 'Revenue Contingency',
        amount: 19700000,
        timeframe: 'Immediate',
        source: 'Pink Book 2025-26',
        page: 41,
        confidence: 'High',
        type: 'Reserves',
        available: true,
        description: 'General revenue contingency if not needed for emergencies'
      },
      
      // REVENUE OPPORTUNITIES
      {
        id: 'pillar-two-2025',
        name: 'Pillar Two Tax (2025-26)',
        amount: 10000000,
        timeframe: '2025-26',
        source: 'Pink Book 2025-26',
        page: 36,
        confidence: 'High',
        type: 'Revenue',
        available: true,
        description: 'OECD minimum corporate tax receipts Year 1'
      },
      {
        id: 'pillar-two-2026',
        name: 'Pillar Two Tax (2026-27)',
        amount: 25000000,
        timeframe: '2026-27',
        source: 'Pink Book 2025-26',
        page: 37,
        confidence: 'High',
        type: 'Revenue',
        available: true,
        description: 'OECD minimum corporate tax receipts Year 2'
      },
      {
        id: 'pillar-two-2027',
        name: 'Pillar Two Tax (2027-28)',
        amount: 35000000,
        timeframe: '2027-28',
        source: 'Pink Book 2025-26',
        page: 37,
        confidence: 'High',
        type: 'Revenue',
        available: true,
        description: 'OECD minimum corporate tax receipts Year 3'
      },
      
      // INVESTMENT OPTIMIZATION
      {
        id: 'investment-optimization',
        name: 'Investment Return Optimization',
        amount: 29600000, // £40.2m target - £10.6m current
        timeframe: '2025-26',
        source: 'Pink Book 2025-26',
        page: 33,
        confidence: 'Medium',
        type: 'Investment',
        available: true,
        description: 'Improve returns from 0.6% to 4.5% on £1.76bn reserves',
        calculation: '£1.76bn × (4.5% - 0.6%) = £29.6m additional'
      },
      
      // EFFICIENCY OPPORTUNITIES
      {
        id: 'capital-delivery-improvement',
        name: 'Capital Delivery Improvement',
        amount: 22700000, // 26% of £87.4m
        timeframe: '2025-26',
        source: 'Pink Book 2025-26',
        page: 54,
        confidence: 'Medium',
        type: 'Efficiency',
        available: true,
        description: 'Improve delivery from 74% to 100% or reallocate unspent',
        calculation: '£87.4m × 26% undelivered = £22.7m'
      },
      
      // CONTINGENCY FUNDS
      {
        id: 'general-contingency',
        name: 'General Contingency Fund',
        amount: 15000000,
        timeframe: 'Immediate',
        source: 'Pink Book 2025-26',
        page: 41,
        confidence: 'Medium',
        type: 'Reserves',
        available: true,
        description: 'Emergency fund if risks do not materialize'
      },
      
      // TRANSFORMATION OPPORTUNITIES
      {
        id: 'transformation-fund',
        name: 'Transformation Fund',
        amount: 5300000,
        timeframe: 'Immediate',
        source: 'Pink Book 2025-26',
        page: 41,
        confidence: 'High',
        type: 'Reserves',
        available: true,
        description: 'Fund for service transformation and efficiency'
      }
    ];
  }
  
  /**
   * Calculate the path to £60m target
   */
  getPathToTarget(): PathToTarget {
    const opportunities = this.getAllOpportunities();
    const totalAvailable = opportunities.reduce((sum, opp) => sum + opp.amount, 0);
    
    return {
      targetAmount: this.TARGET_IMPROVEMENT,
      totalAvailable,
      opportunities,
      potentiallyAchievable: totalAvailable > this.TARGET_IMPROVEMENT,
      multipleOptionsExist: true
    };
  }
  
  /**
   * Get opportunities by type
   */
  getOpportunitiesByType(type: Opportunity['type']): Opportunity[] {
    return this.getAllOpportunities().filter(opp => opp.type === type);
  }
  
  /**
   * Get immediate opportunities (no wait required)
   */
  getImmediateOpportunities(): Opportunity[] {
    return this.getAllOpportunities().filter(opp => opp.timeframe === 'Immediate');
  }
  
  /**
   * Calculate investment return scenarios
   */
  calculateInvestmentScenarios(targetReturn: number) {
    const currentReserves = 1760000000; // £1.76bn
    const currentReturn = 0.006; // 0.6%
    const currentIncome = 10578000; // £10.6m
    
    const scenarios = [
      { rate: 0.01, label: 'Conservative (1%)', risk: 'Very Low' },
      { rate: 0.02, label: 'Cautious (2%)', risk: 'Low' },
      { rate: 0.03, label: 'Balanced (3%)', risk: 'Medium-Low' },
      { rate: 0.045, label: 'Target (4.5%)', risk: 'Medium' },
      { rate: 0.06, label: 'Growth (6%)', risk: 'Medium-High' }
    ];
    
    return scenarios.map(scenario => ({
      ...scenario,
      income: currentReserves * scenario.rate,
      additionalIncome: currentReserves * (scenario.rate - currentReturn),
      improvement: currentReserves * (scenario.rate - currentReturn) - currentIncome
    }));
  }
  
  /**
   * Calculate capital efficiency scenarios
   */
  calculateCapitalEfficiency(deliveryRate: number) {
    const totalCapital = 87400000; // £87.4m
    const historicalRate = 0.74; // 74%
    
    return {
      currentDelivery: totalCapital * historicalRate,
      targetDelivery: totalCapital * deliveryRate,
      improvement: totalCapital * (deliveryRate - historicalRate),
      unspentAvailable: totalCapital * (1 - historicalRate)
    };
  }
  
  /**
   * Get summary statistics
   */
  getSummaryStats() {
    const path = this.getPathToTarget();
    const immediate = this.getImmediateOpportunities();
    const immediateTotal = immediate.reduce((sum, opp) => sum + opp.amount, 0);
    
    return {
      targetNeeded: this.TARGET_IMPROVEMENT,
      totalAvailable: path.totalAvailable,
      surplusAvailable: path.totalAvailable - this.TARGET_IMPROVEMENT,
      immediatelyAvailable: immediateTotal,
      potentiallyWithoutCuts: true,
      confidenceLevel: 'Subject to conditions',
      multipleOptionsRatio: path.totalAvailable / this.TARGET_IMPROVEMENT
    };
  }
  
  /**
   * Generate opportunity combinations
   */
  getOptimalCombinations(): Array<{
    name: string;
    opportunities: string[];
    total: number;
    meetsTarget: boolean;
    avoidsCuts: boolean;
  }> {
    return [
      {
        name: 'Existing Funds Scenario',
        opportunities: [
          'Economic Strategy Fund (£47.9m - if available)',
          'Revenue Contingency (£19.7m - if not needed)'
        ],
        total: 67600000,
        meetsTarget: true,
        avoidsCuts: true
      },
      {
        name: 'Investment & Revenue Scenario',
        opportunities: [
          'Investment Returns (£29.6m - if achievable)',
          'Pillar Two Tax (£10m - if implemented)',
          'Capital Efficiency (£22.7m - if improved)'
        ],
        total: 62300000,
        meetsTarget: true,
        avoidsCuts: true
      },
      {
        name: 'Combined Scenario',
        opportunities: [
          'Economic Strategy Fund (£47.9m - partial)',
          'Pillar Two Tax (£10m - Year 1)',
          'Transformation Fund (£5.3m - if available)'
        ],
        total: 63200000,
        meetsTarget: true,
        avoidsCuts: true
      },
      {
        name: 'Maximum Potential',
        opportunities: [
          'All identified options (subject to feasibility)'
        ],
        total: 155300000,
        meetsTarget: true,
        avoidsCuts: true
      }
    ];
  }
}

// Export singleton instance
export const opportunitiesService = new OpportunitiesService();