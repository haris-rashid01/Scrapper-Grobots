from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0
)

def extract_fields_llm(text, fields):
    """
    text: scraped website text
    fields: list of user-requested fields
    """

    field_list = ", ".join(fields)

    prompt = ChatPromptTemplate.from_messages([
        ("system",
         "You are a data extraction engine. "
         "Extract ONLY factual information from the website text. "
         "If a field is not present, return null."),
        ("user",
         f"""
Extract the following fields from the website text:

FIELDS:
{field_list}

RULES:
- Return STRICT JSON
- Keys must exactly match field names
- No explanations
- If unsure, use null

WEBSITE TEXT:
{text[:12000]}
""")
    ])

    # Invoke LLM to get usage metadata
    formatted_prompt = prompt.invoke({})
    response = llm.invoke(formatted_prompt)
    
    # Parse output
    parser = JsonOutputParser()
    parsed_data = parser.invoke(response)
    
    # Get usage stats
    usage = response.response_metadata.get("token_usage", {})
    
    return {
        "extracted_data": parsed_data,
        "usage": usage,
        "model": "gpt-4o-mini"
    }
