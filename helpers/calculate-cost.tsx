import type { Variable } from "@/types/proposals";

export function calculateCost(formula: string, variables: Variable[]): number {
  // Create a simplified formula parser
  // This is a basic implementation and would need to be more robust in a real application

  // If formula is undefined or empty, return 0
  if (!formula) return 0;

  // Replace variable names with their values
  let calculationFormula = formula;

  // Sort variables by name length (longest first) to avoid partial replacements
  const sortedVariables = [...variables].sort(
    (a, b) => (b.name?.length || 0) - (a.name?.length || 0)
  );

  sortedVariables.forEach((variable) => {
    if (!variable.name || !variable.value) return;

    // Use word boundary regex to ensure we're replacing whole variable names
    const regex = new RegExp(`\\b${variable.name}\\b`, "g");
    calculationFormula = calculationFormula.replace(regex, variable.value);
  });

  // Handle basic operations
  try {
    // Clean up the formula - remove any remaining variable names
    calculationFormula = calculationFormula.replace(
      /[A-Za-z_][A-Za-z0-9_]*/g,
      "0"
    );

    // Use Function constructor to evaluate the formula
    // Note: In a production app, you'd want a more secure approach
    const result = new Function(`return ${calculationFormula}`)();
    return typeof result === "number" ? result : 0;
  } catch (error) {
    console.error(
      "Error calculating cost:",
      error,
      "Formula:",
      calculationFormula
    );
    return 0;
  }
}

export const checkFormulaErrors = (
  formula: string,
  variables: Variable[]
): boolean => {
  const variablePattern = /\b[A-Za-z_][A-Za-z0-9_ ]*[A-Za-z0-9_]\b/g;
  const matches = formula.match(variablePattern) || [];
  console.log(variables)
  const validVariableNames = variables.map((v) => v.name);
  return matches.some((match) => !validVariableNames.includes(match));
};


