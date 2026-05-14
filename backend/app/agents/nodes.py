# backend/app/agents/nodes.py
import json
from app.agents.state import AgentState
from app.services.llm_router import LLMRouter


def planner_node(state: AgentState) -> AgentState:
    """Figures out the user intent."""
    messages = state["messages"]
    user_input = messages[-1].content
    
    prompt = f"""
    Analyze the user input and determine the intent.
    Choose exactly one from: ["qa", "lead_capture", "automation", "general"]
    
    DEFINITIONS:
    - qa: ONLY for specific questions about our business, pricing, software, or services.
    - lead_capture: User is providing contact info or explicitly asking for a demo/sales.
    - general: Small talk, greetings, roleplay, hypothetical questions, or unrelated topics.
    
    User Input: {user_input}
    Respond ONLY with the exact intent string.
    """.strip()
    
    intent = LLMRouter.generate_response("You are a helpful intent classifier.", prompt).strip().lower()
    
    # clean up intent just in case
    valid_intents = ["qa", "lead_capture", "automation", "general"]
    if intent not in valid_intents:
        intent = "general"
        
    return {**state, "intent": intent}


from app.rag.retriever import retrieve_relevant_chunks

def retriever_node(state: AgentState) -> AgentState:
    """Pulls relevant document chunks for QA intent."""
    messages = state["messages"]
    user_input = messages[-1].content
    
    intent = state.get("intent")
    if intent != "qa":
        return {**state, "context_chunks": []}
        
    chunks = retrieve_relevant_chunks(user_input)
    return {**state, "context_chunks": chunks}


def executor_node(state: AgentState) -> AgentState:
    """Generates the final response based on intent, context, and chat history."""
    intent = state.get("intent", "general")
    context = "\n".join(state.get("context_chunks", []))
    
    messages = state.get("messages", [])
    user_input = messages[-1].content
    
    # ---------------------------------------------------------
    # FIX: Format previous messages to give the AI context
    # ---------------------------------------------------------
    history_str = ""
    if len(messages) > 1:
        history_lines = []
        # Loop through all messages EXCEPT the very last one
        for msg in messages[:-1]:
            role = "User" if msg.type == "human" else "Assistant"
            history_lines.append(f"{role}: {msg.content}")
        history_str = "\n".join(history_lines)

    extracted_lead = None
    
    if intent == "qa":
        sys_prompt = "You are a helpful business assistant. Use the following context to answer the user's question:\n" + context
    elif intent == "lead_capture":
        # Extract details quietly
        extract_prompt = "Extract lead info from this message. Output valid JSON strictly with keys: 'name', 'email', 'company', 'budget', 'urgency_score' (1-100). If unknown, use null."
        extraction = LLMRouter.generate_response(extract_prompt, user_input)
        try:
            clean_json = extraction.strip().strip('```json').strip('```')
            import json
            extracted_lead = json.loads(clean_json)
        except:
            extracted_lead = None
            
        sys_prompt = "You are a sales assistant. Politely ask the user for their contact information to proceed if you don't have it, or acknowledge receipt if they provided it."
    else:
        sys_prompt = "You are a friendly business assistant."
        
    # INJECT HISTORY INTO THE PROMPT
    if history_str:
        sys_prompt += f"\n\nHere is the recent conversation history for context:\n{history_str}"
        
    # Check for retries from the validator node
    retries = state.get("retry_count", 0)
    if retries > 0:
        sys_prompt += "\n\nWARNING: Your previous answer hallucinated or was not grounded in the context. Please strictly use ONLY the provided context."
        
    response = LLMRouter.generate_response(sys_prompt, user_input)
    
    return {**state, "final_response": response, "extracted_lead": extracted_lead}
def validator_node(state: AgentState) -> AgentState:
    """Checks grounding and hallucination risk using strict JSON validation."""
    intent = state.get("intent", "general")
    if intent != "qa":
        return {**state, "is_grounded": True}
        
    response = state.get("final_response", "")
    context = "\n".join(state.get("context_chunks", []))
    
    sys_prompt = """
    You are an evaluation unit checking an AI response for hallucination.
    Compare the Response to the provided Context.
    Output a JSON object with exactly two keys:
    - "grounded": true or false (boolean, true if response relies ONLY on context)
    - "issues": string (briefly explain why it failed, or leave empty if grounded)
    """
    
    user_input = f"Context: {context}\n\nResponse: {response}"
    
    # Use our new structured JSON generator
    evaluation = LLMRouter.generate_structured(sys_prompt, user_input)
    
    # Safely extract boolean
    is_grounded = evaluation.get("grounded", False)
    
    current_retries = state.get("retry_count", 0)
    
    return {
        **state, 
        "is_grounded": is_grounded, 
        "retry_count": current_retries + 1
    }