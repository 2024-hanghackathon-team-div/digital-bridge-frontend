interface ToolUse {
  recipient_name: string;
  parameters: Record<string, any>;
}

interface FunctionCallData {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}
export function parseFunctionCall(
  data: FunctionCallData,
): { functionName: string; parameters: Record<string, any> }[] | null {
  try {
    const toolUses: ToolUse[] = JSON.parse(data.function.arguments).tool_uses;

    const functionCalls: {
      functionName: string;
      parameters: Record<string, any>;
    }[] = [];

    for (const toolUse of toolUses) {
      functionCalls.push({
        functionName: toolUse.recipient_name.split('.').pop() || '',
        parameters: toolUse.parameters,
      });
    }

    return functionCalls;
  } catch (error) {
    console.error('Error parsing data:', error);
  }

  return null;
}

// Example usage
const jsonData: FunctionCallData = {
  id: 'call_ADNQaMVw0xwugAvrZQqTB93l',
  type: 'function',
  function: {
    name: 'multi_tool_use',
    arguments:
      '{"tool_uses":[{"recipient_name":"functions.saveTrainRoute","parameters":{"departure":"서울","destination":"부산"}}]}',
  },
};

const result = parseFunctionCall(jsonData);
console.log(result);
/*
Output:
[
    { functionName: "saveTrainRoute", parameters: { departure: "서울", destination: "부산" } }
]
*/
