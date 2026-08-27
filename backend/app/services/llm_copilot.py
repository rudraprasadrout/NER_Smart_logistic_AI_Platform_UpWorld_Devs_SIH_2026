import os
from typing import Dict, List, Any, Optional
from app.core.config import settings
from app.core.graph_network import railway_network
from app.simulator.multi_train_engine import simulator_engine
from app.models.gnn_model import gnn_engine
from app.models.explainability import explainability_engine
from app.models.uncertainty import uncertainty_engine

class RailPulseAICopilot:
    """
    Intelligent Railway AI Copilot powered by Mistral AI LLM.
    Answers passenger journey inquiries and generates OCC dispatcher memos with live GNN grounding.
    """
    def __init__(self):
        self.api_key = settings.MISTRAL_API_KEY or os.getenv("MISTRAL_API_KEY", "")
        self._init_client()

    def _init_client(self):
        self.client = None
        if self.api_key:
            try:
                from mistralai import Mistral
                self.client = Mistral(api_key=self.api_key)
            except Exception as e:
                print(f"Warning: Could not initialize Mistral AI client: {e}")

    def set_api_key(self, key: str):
        self.api_key = key
        self._init_client()

    def generate_passenger_chat_response(
        self,
        user_message: str,
        train_no: Optional[str] = "12301",
        user_api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Answers natural language passenger questions with live train telemetry grounding.
        """
        active_key = user_api_key or self.api_key
        if user_api_key and user_api_key != self.api_key:
            self.set_api_key(user_api_key)

        # 1. Fetch live telemetry & GNN state
        train_meta = railway_network.trains_metadata.get(train_no, {})
        live_state = simulator_engine.active_trains.get(train_no, {})
        
        curr_delay = live_state.get("delay_minutes", 0.0)
        curr_km = live_state.get("current_distance_km", 0.0)
        curr_idx = live_state.get("next_station_idx", 0)
        curr_speed = live_state.get("speed_kmph", 0.0)
        curr_section = live_state.get("current_section", "Mainline")

        # Get GNN Timeline & Explainability
        timeline = gnn_engine.predict_eta_timeline(train_no, curr_delay, curr_idx, simulator_engine.active_trains)
        enriched = uncertainty_engine.enrich_timeline_with_uncertainty(timeline, curr_km)
        explanation = explainability_engine.generate_explanation(train_no, timeline, curr_delay)

        next_stop = None
        for stop in enriched:
            if stop["status"] == "UPCOMING":
                next_stop = stop
                break
        if not next_stop and enriched:
            next_stop = enriched[-1]

        # Context Payload for LLM Grounding
        context = {
            "train_no": train_no,
            "train_name": train_meta.get("train_name", f"Train {train_no}"),
            "route": f"{train_meta.get('source')} -> {train_meta.get('destination')}",
            "speed_kmph": round(curr_speed, 1),
            "current_section": curr_section,
            "delay_minutes": round(curr_delay, 1),
            "next_station": next_stop.get("station_name") if next_stop else "Destination",
            "next_station_code": next_stop.get("station_code") if next_stop else "DEST",
            "next_station_eta": next_stop.get("expected_eta") if next_stop else "On Time",
            "next_station_window": next_stop.get("eta_window") if next_stop else "Confirmed",
            "distance_to_next_km": next_stop.get("dist_remaining_km", 0) if next_stop else 0,
            "delay_factors": explanation.get("factor_percentages", {}),
            "delay_summary": explanation.get("executive_summary", "")
        }

        # If Mistral AI client is ready, query LLM
        if self.client:
            try:
                system_prompt = (
                    "You are RailPulse AI, the official intelligent travel assistant for Indian Railways. "
                    "You are helpful, empathetic, concise, and accurate. "
                    "Use the provided real-time train and GNN network telemetry to answer the passenger's question directly. "
                    "Reply in the same language or script as the passenger's question (e.g. Hindi, Bengali, Marathi, Tamil, Telugu, English, or Hinglish). "
                    "Format key timings or stations in bold. Keep answers under 3-4 sentences."
                )

                user_prompt = f"""
LIVE TELEMETRY CONTEXT:
- Train: {context['train_no']} ({context['train_name']}) on route {context['route']}
- Live Speed: {context['speed_kmph']} km/h (Section: {context['current_section']})
- Current Delay: {context['delay_minutes']} minutes
- Approaching Station: {context['next_station']} ({context['next_station_code']}) at {context['next_station_eta']} (Confidence window: {context['next_station_window']})
- Distance Remaining to next stop: {context['distance_to_next_km']} km
- Delay Cause Breakdown: {context['delay_factors']}
- Delay Operational Summary: {context['delay_summary']}

PASSENGER QUESTION:
"{user_message}"
"""
                response = self.client.chat.complete(
                    model=settings.MISTRAL_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    max_tokens=250,
                    temperature=0.3
                )
                
                reply_text = response.choices[0].message.content
                return {
                    "source": "MISTRAL_AI_LLM",
                    "model": settings.MISTRAL_MODEL,
                    "response": reply_text,
                    "telemetry_context": context
                }
            except Exception as e:
                print(f"Mistral AI call failed, falling back to local NLP: {e}")

        # Intelligent Offline Grounded Fallback
        fallback_reply = self._generate_offline_reply(user_message, context)
        return {
            "source": "OFFLINE_GROUNDED_ENGINE",
            "model": "rule-based-nlp",
            "response": fallback_reply,
            "telemetry_context": context,
            "hint": "Add your Mistral AI API key to enable full LLM conversational intelligence."
        }

    def generate_occ_dispatch_memo(
        self,
        whatif_scenario: Dict[str, Any],
        user_api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generates an official OCC Caution Order & Dispatch Memo for railway controllers.
        """
        active_key = user_api_key or self.api_key
        if user_api_key and user_api_key != self.api_key:
            self.set_api_key(user_api_key)

        if self.client:
            try:
                system_prompt = (
                    "You are the Chief Train Controller (OCC) AI Advisor for Indian Railways. "
                    "Draft a concise, professional operational Dispatch Memo and Caution Order based on the What-If simulation results. "
                    "Include recommended loop-line overtakes and signal block priorities."
                )

                prompt = f"""
SCENARIO DETAILS:
- Target Train: {whatif_scenario.get('scenario_parameters', {}).get('target_train_no')}
- Station: {whatif_scenario.get('scenario_parameters', {}).get('target_station')}
- Additional Delay: +{whatif_scenario.get('scenario_parameters', {}).get('additional_hold_min')} min
- Total Impacted Downstream Trains: {whatif_scenario.get('impact_summary', {}).get('total_trains_impacted')}
- Total Network Delay Burden: +{whatif_scenario.get('impact_summary', {}).get('total_network_delay_minutes')} min
- Impacted Trains List: {[t['train_no'] + ' (+' + str(t['delay_delta_min']) + 'm)' for t in whatif_scenario.get('impacted_trains', [])]}

Generate the operational dispatch action memo now:
"""
                response = self.client.chat.complete(
                    model=settings.MISTRAL_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=300,
                    temperature=0.2
                )
                return {
                    "source": "MISTRAL_AI_LLM",
                    "memo": response.choices[0].message.content
                }
            except Exception as e:
                print(f"Mistral dispatch memo error: {e}")

        # Offline Memo Template
        target_st = whatif_scenario.get('scenario_parameters', {}).get('target_station', 'CNB')
        hold = whatif_scenario.get('scenario_parameters', {}).get('additional_hold_min', 15)
        memo = (
            f"**OFFICIAL OCC DISPATCH ADVISORY MEMO — SECTION CONTROLLER**\n\n"
            f"1. **INCIDENT**: Planned perturbation / hold of +{hold} min applied at **{target_st}**.\n"
            f"2. **CASCADING IMPACT**: {whatif_scenario.get('impact_summary', {}).get('total_trains_impacted', 2)} downstream trains impacted with total +{whatif_scenario.get('impact_summary', {}).get('total_network_delay_minutes', 20)} min delay burden.\n"
            f"3. **ACTION DIRECTIVE**: Regulate preceding freight and express rakes to Loop Line at {target_st}. Grant Green-Wave signal clearance for incoming high-priority rake."
        )
        return {
            "source": "OFFLINE_GROUNDED_ENGINE",
            "memo": memo
        }

    def _generate_offline_reply(self, message: str, ctx: Dict[str, Any]) -> str:
        msg = message.lower()
        if "reach" in msg or "when" in msg or "eta" in msg or "time" in msg or "arrive" in msg:
            return (
                f"Train **{ctx['train_no']} ({ctx['train_name']})** is expected to arrive at **{ctx['next_station']} ({ctx['next_station_code']})** "
                f"at **{ctx['next_station_eta']}** (confidence window: **{ctx['next_station_window']}**). "
                f"It is currently {ctx['distance_to_next_km']} km away cruising at {ctx['speed_kmph']} km/h."
            )
        elif "why" in msg or "delay" in msg or "late" in msg or "slow" in msg or "reason" in msg:
            return (
                f"Train **{ctx['train_no']}** is currently running with a delay of **{ctx['delay_minutes']} minutes**. "
                f"{ctx['delay_summary']} "
                f"Normal track speeds are expected to resume once passing clear blocks ahead."
            )
        elif "platform" in msg or "where" in msg or "track" in msg:
            return (
                f"Train **{ctx['train_no']}** is currently operating on section **{ctx['current_section']}** at **{ctx['speed_kmph']} km/h**. "
                f"It is approaching **{ctx['next_station']}** with arrival expected around **{ctx['next_station_eta']}**."
            )
        else:
            return (
                f"Train **{ctx['train_no']} ({ctx['train_name']})** is en route to **{ctx['next_station']}**, expected at **{ctx['next_station_eta']}** "
                f"with a delay of ~{ctx['delay_minutes']} mins ({ctx['speed_kmph']} km/h). Feel free to ask about delay causes, ETAs, or platform facilities!"
            )

ai_copilot = RailPulseAICopilot()
