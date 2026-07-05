"""
Calculator tool using asteval for safe evaluation.
"""

import math
from asteval import Interpreter

# Create a safe interpreter with limited functions
aeval = Interpreter()
aeval.symtable['math'] = math

def calculate(expression: str) -> str:
    """
    Safely evaluate a mathematical expression.
    
    Args:
        expression: Mathematical expression string (e.g., "2 + 2", "sqrt(16)")
    
    Returns:
        Result as string
    """
    try:
        # Remove any dangerous characters (just to be safe)
        allowed_chars = set("0123456789+-*/()., sqrt log sin cos tan pi e abs")
        cleaned = ''.join(c for c in expression if c in allowed_chars or c.isspace())
        
        # Evaluate
        result = aeval(cleaned)
        
        if result is None:
            return "Error: Could not evaluate expression"
        
        # Format the result
        if isinstance(result, float):
            # Round to avoid floating point issues
            if result == int(result):
                result_str = str(int(result))
            else:
                result_str = f"{result:.4f}".rstrip('0').rstrip('.')
        else:
            result_str = str(result)
        
        # Return formatted result with context
        return f"The result of {expression} is {result_str}"
        
    except Exception as e:
        return f"Error calculating: {str(e)}"

# Tool definition for LLM
calculator_tool = {
    "type": "function",
    "function": {
        "name": "calculate",
        "description": "Perform mathematical calculations. Use this for any math operations like addition, subtraction, multiplication, division, square root, trigonometry, etc.",
        "parameters": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "The mathematical expression to evaluate (e.g., '2 + 2', 'sqrt(16)', 'sin(30)', '10 * (5 + 3)')"
                }
            },
            "required": ["expression"]
        }
    }
}