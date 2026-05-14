# backend/app/agents/graph.py
from langgraph.graph import StateGraph, END
from app.agents.state import AgentState
from app.agents.nodes import planner_node, retriever_node, executor_node, validator_node

def route_planner(state: AgentState):
    """Determine the next step after the planner."""
    intent = state.get("intent")
    if intent == "qa":
        return "retriever"
    else:
        return "executor"

def route_validator(state: AgentState):
    """Determine if we need to retry or if we can end."""
    is_grounded = state.get("is_grounded")
    retries = state.get("retry_count", 0)
    
    if is_grounded or retries >= 2:
        return END
    else:
        # If not grounded, we could re-execute with a strict warning
        return "executor"

# Build the graph
workflow = StateGraph(AgentState)

workflow.add_node("planner", planner_node)
workflow.add_node("retriever", retriever_node)
workflow.add_node("executor", executor_node)
workflow.add_node("validator", validator_node)

workflow.set_entry_point("planner")

# Add edges
workflow.add_conditional_edges("planner", route_planner)
workflow.add_edge("retriever", "executor")
workflow.add_edge("executor", "validator")
workflow.add_conditional_edges("validator", route_validator)

# Compile
app_graph = workflow.compile()
