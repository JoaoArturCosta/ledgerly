export interface ChartValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  debugInfo?: {
    dataLength: number;
    hasValidStructure: boolean;
    fieldAnalysis: Record<string, { type: string; sampleValues: unknown[] }>;
  };
}

export interface ChartDataPoint {
  [key: string]: string | number;
}

/**
 * Validates chart data and provides detailed error messages and debugging info
 */
export function validateChartData(
  data: unknown[],
  requiredFields: string[] = [],
  options: {
    allowEmpty?: boolean;
    minDataPoints?: number;
    maxDataPoints?: number;
  } = {},
): ChartValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data exists
  if (!data) {
    errors.push("Chart data is null or undefined");
    return { isValid: false, errors, warnings };
  }

  // Check if data is array
  if (!Array.isArray(data)) {
    errors.push("Chart data must be an array");
    return { isValid: false, errors, warnings };
  }

  // Check for empty data
  if (data.length === 0) {
    if (!options.allowEmpty) {
      errors.push("Chart data is empty");
      return { isValid: false, errors, warnings };
    }
  }

  // Check data point limits
  if (options.minDataPoints && data.length < options.minDataPoints) {
    errors.push(
      `Chart data must have at least ${options.minDataPoints} data points, got ${data.length}`,
    );
  }

  if (options.maxDataPoints && data.length > options.maxDataPoints) {
    warnings.push(
      `Chart data has ${data.length} points, which may impact performance (max recommended: ${options.maxDataPoints})`,
    );
  }

  // Analyze data structure
  const fieldAnalysis: Record<
    string,
    { type: string; sampleValues: unknown[] }
  > = {};
  let hasValidStructure = true;

  data.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      errors.push(`Data point at index ${index} is not a valid object`);
      hasValidStructure = false;
      return;
    }

    const typedItem = item as Record<string, unknown>;

    // Analyze fields
    Object.entries(typedItem).forEach(([key, value]) => {
      if (!fieldAnalysis[key]) {
        fieldAnalysis[key] = {
          type: typeof value,
          sampleValues: [],
        };
      }

      // Store sample values for debugging (max 3)
      if (fieldAnalysis[key].sampleValues.length < 3) {
        fieldAnalysis[key].sampleValues.push(value);
      }

      // Check for type consistency
      if (
        typeof value !== fieldAnalysis[key].type &&
        value !== null &&
        value !== undefined
      ) {
        warnings.push(
          `Inconsistent data type for field '${key}' at index ${index}. Expected ${fieldAnalysis[key].type}, got ${typeof value}`,
        );
      }
    });
  });

  // Check required fields
  requiredFields.forEach((field) => {
    if (!fieldAnalysis[field]) {
      errors.push(`Required field '${field}' is missing from data`);
      hasValidStructure = false;
    } else if (
      fieldAnalysis[field].type !== "number" &&
      fieldAnalysis[field].type !== "string"
    ) {
      warnings.push(
        `Field '${field}' should be a number or string, got ${fieldAnalysis[field].type}`,
      );
    }
  });

  // Check for floating-point precision issues
  Object.entries(fieldAnalysis).forEach(([key, analysis]) => {
    if (analysis.type === "number") {
      const sampleNumbers = analysis.sampleValues.filter(
        (v) => typeof v === "number",
      ) as number[];
      const hasFloatingPointIssues = sampleNumbers.some(
        (num) =>
          (num % 1 !== 0 && num.toString().includes("99999")) ||
          num.toString().includes("00000"),
      );

      if (hasFloatingPointIssues) {
        warnings.push(
          `Field '${key}' may have floating-point precision issues. Consider rounding values.`,
        );
      }
    }
  });

  const debugInfo = {
    dataLength: data.length,
    hasValidStructure,
    fieldAnalysis,
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    debugInfo,
  };
}

/**
 * Fixes floating-point precision issues in numeric data
 */
export function fixFloatingPointPrecision(
  data: ChartDataPoint[],
  numericFields: string[],
  decimalPlaces: number = 2,
): ChartDataPoint[] {
  return data.map((item) => {
    const fixedItem = { ...item };

    numericFields.forEach((field) => {
      const value = item[field];
      if (typeof value === "number") {
        fixedItem[field] =
          Math.round(value * Math.pow(10, decimalPlaces)) /
          Math.pow(10, decimalPlaces);
      }
    });

    return fixedItem;
  });
}

/**
 * Creates debug information for development
 */
export function createChartDebugInfo(
  data: unknown[],
  config: Record<string, unknown>,
) {
  return {
    timestamp: new Date().toISOString(),
    dataPreview: Array.isArray(data) ? data.slice(0, 3) : data,
    dataLength: Array.isArray(data) ? data.length : 0,
    config,
    environment: process.env.NODE_ENV,
  };
}
