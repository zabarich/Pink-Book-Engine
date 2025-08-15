/**
 * Data Citation Components
 * Shows source of every displayed number
 */

import { cn } from '@/lib/utils';
import { Info, CheckCircle, Calculator, User } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type DataSource = 'Pink Book' | 'User Input' | 'Derived' | 'Estimate';

interface DataBadgeProps {
  value: number | string;
  source: DataSource;
  page?: number;
  formula?: string;
  confidence?: 'High' | 'Medium' | 'Low';
  className?: string;
}

/**
 * Badge showing data source and citation
 */
export function DataBadge({
  value,
  source,
  page,
  formula,
  confidence,
  className
}: DataBadgeProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      if (val >= 1_000_000_000) {
        return `£${(val / 1_000_000_000).toFixed(2)}bn`;
      }
      if (val >= 1_000_000) {
        return `£${(val / 1_000_000).toFixed(1)}m`;
      }
      if (val >= 1_000) {
        return `£${(val / 1_000).toFixed(0)}k`;
      }
      return `£${val.toFixed(0)}`;
    }
    return val;
  };

  const getIcon = () => {
    switch (source) {
      case 'Pink Book':
        return <CheckCircle className="h-3 w-3" />;
      case 'User Input':
        return <User className="h-3 w-3" />;
      case 'Derived':
        return <Calculator className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const getColor = () => {
    switch (source) {
      case 'Pink Book':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'User Input':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Derived':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Estimate':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCitation = () => {
    if (source === 'Pink Book' && page) {
      return `Pink Book 2025-26, p.${page}`;
    }
    if (source === 'Derived' && formula) {
      return `Calculation: ${formula}`;
    }
    if (source === 'User Input') {
      return 'Your input';
    }
    return source;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium",
            getColor(),
            className
          )}>
            {getIcon()}
            <span className="font-semibold">{formatValue(value)}</span>
            {confidence && source === 'Derived' && (
              <span className="text-[10px] opacity-75">
                ({confidence})
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{getCitation()}</p>
          {source === 'Derived' && (
            <p className="text-xs mt-1 text-gray-400">
              This is a calculated value
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface CitedValueProps {
  label: string;
  value: number;
  source: DataSource;
  page?: number;
  formula?: string;
  confidence?: 'High' | 'Medium' | 'Low';
  className?: string;
  showDifference?: {
    from: number;
    label: string;
  };
}

/**
 * Display a value with its label and citation
 */
export function CitedValue({
  label,
  value,
  source,
  page,
  formula,
  confidence,
  className,
  showDifference
}: CitedValueProps) {
  const difference = showDifference ? value - showDifference.from : 0;
  const percentChange = showDifference 
    ? ((value - showDifference.from) / showDifference.from * 100)
    : 0;

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-sm text-gray-600">{label}</p>
      <div className="flex items-center gap-2">
        <DataBadge
          value={value}
          source={source}
          page={page}
          formula={formula}
          confidence={confidence}
        />
        {showDifference && difference !== 0 && (
          <span className={cn(
            "text-xs",
            difference > 0 ? "text-green-600" : "text-red-600"
          )}>
            {difference > 0 ? '+' : ''}{(difference / 1_000_000).toFixed(1)}m
            ({percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%)
            <span className="text-gray-400 ml-1">vs {showDifference.label}</span>
          </span>
        )}
      </div>
    </div>
  );
}

interface TransparencyPanelProps {
  title: string;
  calculation: string;
  inputs: Array<{
    label: string;
    value: number;
    source: DataSource;
  }>;
  result: number;
  confidence: 'High' | 'Medium' | 'Low';
  assumptions?: string[];
  limitations?: string[];
}

/**
 * Panel showing calculation transparency
 */
export function TransparencyPanel({
  title,
  calculation,
  inputs,
  result,
  confidence,
  assumptions,
  limitations
}: TransparencyPanelProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <Calculator className="h-4 w-4" />
        {title}
      </h4>
      
      <div className="space-y-2">
        <p className="text-xs text-gray-600">Calculation:</p>
        <code className="text-xs bg-white px-2 py-1 rounded border">
          {calculation}
        </code>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-gray-600">Inputs:</p>
        {inputs.map((input, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span>{input.label}:</span>
            <DataBadge
              value={input.value}
              source={input.source}
              className="scale-90"
            />
          </div>
        ))}
      </div>

      <div className="pt-2 border-t">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Result:</span>
          <DataBadge
            value={result}
            source="Derived"
            confidence={confidence}
          />
        </div>
      </div>

      {assumptions && assumptions.length > 0 && (
        <div className="text-xs space-y-1 pt-2 border-t">
          <p className="font-medium text-gray-600">Assumptions:</p>
          <ul className="list-disc list-inside text-gray-500">
            {assumptions.map((assumption, i) => (
              <li key={i}>{assumption}</li>
            ))}
          </ul>
        </div>
      )}

      {limitations && limitations.length > 0 && (
        <div className="text-xs space-y-1 pt-2 border-t">
          <p className="font-medium text-gray-600">Limitations:</p>
          <ul className="list-disc list-inside text-gray-500">
            {limitations.map((limitation, i) => (
              <li key={i}>{limitation}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface DisclaimerProps {
  type: 'exploration' | 'calculation' | 'behavioral';
  className?: string;
}

/**
 * Disclaimer for user-generated scenarios
 */
export function Disclaimer({ type, className }: DisclaimerProps) {
  const getMessage = () => {
    switch (type) {
      case 'exploration':
        return 'This is an exploration tool. Results show what could happen based on your inputs, not recommendations.';
      case 'calculation':
        return 'This calculation uses simplified assumptions and may not reflect all real-world complexities.';
      case 'behavioral':
        return 'Behavioral responses are estimates based on economic theory and may vary significantly in practice.';
    }
  };

  return (
    <div className={cn(
      "bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-800",
      className
    )}>
      <div className="flex gap-2">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>{getMessage()}</p>
      </div>
    </div>
  );
}