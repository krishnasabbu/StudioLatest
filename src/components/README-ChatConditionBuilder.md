# Chat-Based Condition Builder

## Overview

An interactive, conversational AI assistant that guides users through creating complex conditions via natural language processing and intuitive chat interface. The system provides real-time bidirectional synchronization between chat interactions and form state.

## Architecture

### Components

#### 1. **ChatConditionBuilder.tsx**
Main chat interface component that manages the conversational flow.

**Key Features:**
- Real-time message streaming with bot and user messages
- Dynamic chip-based selections for quick interaction
- Natural language processing integration
- Multi-step guided workflow
- Loading states and error handling
- Accessibility-compliant with ARIA labels and keyboard navigation

**Props:**
```typescript
interface ChatConditionBuilderProps {
  variables: Variable[];
  onConditionUpdate: (data: ConditionData) => void;
  onClose: () => void;
}
```

#### 2. **llmService.ts**
Natural language processing service for interpreting user input.

**Key Functions:**
- `processNaturalLanguage()`: Analyzes user messages and extracts intent
- Intent detection: variable selection, operator choice, value entry, etc.
- Keyword extraction for operators (equals, contains, greater than, etc.)
- Variable name matching with fuzzy logic
- Context-aware response generation

### State Machine Flow

The chat follows a structured state machine:

```
welcome
  ↓
condition_name
  ↓
select_variable
  ↓
select_operator
  ↓
enter_value
  ↓
enter_content
  ↓
ask_else
  ↓ (if yes)
enter_else_content
  ↓
ask_add_clause
  ↓ (if yes, loop back to select_variable)
complete
```

## Features

### 1. Conversational Interface

**Greeting & Onboarding:**
- Welcoming message explains the process
- Step-by-step guidance through condition creation

**Dynamic Chip Selection:**
- Variables displayed as clickable chips
- Operators presented as action buttons
- Quick selection without typing

**Natural Language Input:**
- Users can type free-form text
- LLM service extracts intent and data
- Intelligent parsing of commands like "name equals John"

### 2. Form Synchronization

**Real-time Updates:**
- Every chat selection updates the underlying form state
- Condition clauses built incrementally
- Logic operators (AND/OR) managed automatically

**Bidirectional Sync:**
- Chat selections → Form state (automatic)
- Form state → Condition object (on completion)

### 3. LLM Integration

**Intent Recognition:**
- `select_variable`: User choosing a variable
- `select_operator`: Comparison operator selection
- `enter_value`: Value input for comparison
- `add_else`: ELSE condition handling
- `add_clause`: Adding multiple conditions
- `complete`: Finishing the condition

**Operator Mapping:**
Natural language → Operator symbols
```typescript
"equals" → "=="
"greater than" → ">"
"contains" → "contains"
"not equals" → "!="
```

**Context-Aware Responses:**
- Tracks current step in conversation
- Provides relevant suggestions
- Handles errors gracefully

### 4. Accessibility Features

**ARIA Labels:**
- All interactive elements properly labeled
- Screen reader compatible
- Semantic HTML structure

**Keyboard Navigation:**
- Enter key to send messages
- Tab navigation through chips
- Focus management for modal

**Visual Feedback:**
- Loading indicators during processing
- Clear message distinction (bot vs user)
- Status updates throughout flow

## Usage

### Integration Example

```typescript
import ChatConditionBuilder from './ChatConditionBuilder';

function ConditionPanel() {
  const [showChatBuilder, setShowChatBuilder] = useState(false);

  const handleConditionUpdate = (data) => {
    // Create condition from chat data
    const condition = {
      id: Date.now().toString(),
      name: data.name,
      clauses: data.clauses,
      logicOperator: data.logicOperator,
      content: data.content,
      hasElse: data.hasElse,
      elseContent: data.elseContent,
    };

    // Add to conditions list
    onConditionsChange([...conditions, condition]);
  };

  return (
    <>
      <button onClick={() => setShowChatBuilder(true)}>
        Open Chat Builder
      </button>

      {showChatBuilder && (
        <ChatConditionBuilder
          variables={variables}
          onConditionUpdate={handleConditionUpdate}
          onClose={() => setShowChatBuilder(false)}
        />
      )}
    </>
  );
}
```

### User Flow Example

1. **User clicks "Chat Builder" button**
   - Modal opens with greeting message

2. **Bot asks for condition name**
   - User types: "Check Premium Status"

3. **Bot displays variable chips**
   - User clicks "accountType" chip

4. **Bot displays operator chips**
   - User clicks "equals" chip

5. **Bot asks for value**
   - User types: "premium"

6. **Bot asks for TRUE content**
   - User types: "Welcome, Premium Member!"

7. **Bot asks about ELSE condition**
   - User clicks "Yes" chip

8. **Bot asks for FALSE content**
   - User types: "Upgrade to Premium"

9. **Bot asks to add another clause**
   - User clicks "No, finish" chip

10. **Condition created and synced**
    - Modal closes
    - Condition appears in list

## API Reference

### ChatConditionBuilder Component

**Methods:**
- `addBotMessage(content, chips)`: Add bot message with optional chips
- `addUserMessage(content)`: Add user message
- `handleChipClick(value, type)`: Process chip selection
- `handleSendMessage()`: Process text input
- `completeCondition()`: Finalize and return condition

**State:**
```typescript
messages: ChatMessage[]          // Chat history
currentStep: ChatStep           // Current flow state
currentClause: Partial<Clause>  // Clause being built
clauses: ConditionClause[]      // All completed clauses
conditionName: string           // Condition identifier
content: string                 // TRUE content
hasElse: boolean               // ELSE flag
elseContent: string            // FALSE content
```

### LLM Service

**processNaturalLanguage(request)**

Input:
```typescript
{
  message: string;
  context: {
    variables: Array<{name, type}>;
    conditions: Array<{name}>;
    currentStep: string;
  };
}
```

Output:
```typescript
{
  intent: 'select_variable' | 'select_operator' | ...;
  extractedData?: {
    variable?: string;
    operator?: string;
    value?: string;
    valueType?: 'literal' | 'variable' | 'condition';
    addElse?: boolean;
  };
  suggestions?: string[];
  message: string;
}
```

## Error Handling

**Graceful Degradation:**
- Network errors show retry option
- Invalid selections prompt for correction
- Missing data triggers validation messages

**User Feedback:**
- Loading spinners during processing
- Error messages in chat format
- Success confirmation on completion

## Testing

### Unit Tests

```typescript
// Test intent detection
test('detects variable selection intent', () => {
  const result = processNaturalLanguage({
    message: 'I want to use accountType',
    context: { currentStep: 'select_variable', ... }
  });
  expect(result.intent).toBe('select_variable');
  expect(result.extractedData.variable).toBe('accountType');
});

// Test operator extraction
test('extracts operator from natural language', () => {
  const result = processNaturalLanguage({
    message: 'check if it equals premium',
    context: { currentStep: 'select_operator', ... }
  });
  expect(result.extractedData.operator).toBe('==');
});
```

### Integration Tests

1. Complete flow from start to finish
2. Multiple clause creation
3. ELSE condition handling
4. Error recovery scenarios

## Performance Considerations

**Optimization:**
- Debounced LLM calls (500ms delay)
- Memoized chip rendering
- Virtual scrolling for long chat histories
- Lazy loading of components

**Memory Management:**
- Message history pruning after 100 messages
- Cleanup on component unmount
- Event listener removal

## Future Enhancements

1. **Advanced NLP:**
   - Integration with OpenAI/Anthropic APIs
   - Multi-turn context understanding
   - Spelling correction and suggestions

2. **Enhanced UI:**
   - Voice input support
   - Multi-language support
   - Theme customization

3. **Collaboration:**
   - Share chat sessions
   - Export conversations
   - Condition templates library

4. **Analytics:**
   - Track user interactions
   - Identify pain points
   - A/B testing for prompts

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18.3+
- TypeScript 5.9+
- lucide-react (icons)
- Tailwind CSS (styling)

## License

Internal use only - Wells Fargo proprietary
