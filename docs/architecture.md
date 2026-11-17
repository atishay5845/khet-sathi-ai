# KhetSathi AI — Architecture Notes

## Control pattern

The application uses a blackboard-style shared state with fan-out specialist execution. Intake creates a normalized farmer record. Weather, market and scheme agents run independently. Crop and risk agents consume the weather result. The advisor coordinator reads the complete board and assembles the final advisory.

## Agent roster

| Agent | Main responsibility | Python tools |
|---|---|---|
| Intake | Validate and normalize farmer inputs | `validate_farmer_input`, `normalize_farmer_data` |
| Weather | Retrieve weather by location | `geocode_location`, `fetch_weather_forecast` |
| Market | Retrieve mandi prices and compute price direction | `fetch_mandi_prices`, `calculate_price_trend` |
| Scheme | Retrieve local scheme evidence and evaluate potential relevance | `retrieve_scheme_documents`, `check_scheme_eligibility` |
| Crop | Match crop and growth stage to cautious field guidance | `load_crop_rules`, `calculate_crop_action` |
| Risk Alert | Detect forecast thresholds and produce a risk summary | `assess_weather_risk`, `create_risk_alert` |
| Advisor Coordinator | Read the board, check completeness and compile the final report | `read_advisory_board`, `validate_and_compile_report` |

## Shared blackboard sections

`farmer`, `weather`, `market`, `crop_advice`, `schemes`, `risk_alerts`, `agent_status`, `sources`, and `final_advisory`.

## Event contract

The SSE API emits JSON event frames with `type`, `agent`, `message`, `run_id` and optional `tool`, `result` or `report` properties. Event types include `workflow_started`, `agent_started`, `tool_call`, `agent_completed`, `workflow_completed` and `workflow_error`.

## Persistence

The database contains `advisory_runs` and `agent_events`. The event table is append-only at application level: a new row is inserted for each trace event rather than updating an existing event.
