import networkx as nx
from .graph_engine import graph_engine

class IsolationEngine:
    _cache = {}

    @classmethod
    def clear_cache(cls):
        cls._cache.clear()

    @staticmethod
    def compute_isolation_index(horizon=None):
        """
        Computes multi-hop reachability from supply hubs to every settlement.
        Returns isolation status, affected populations, and vulnerability rankings.
        """
        cache_key = str(horizon)
        if cache_key in IsolationEngine._cache:
            return IsolationEngine._cache[cache_key]

        # Ensure graph is evaluated for current horizon
        graph_engine.rebuild_graph(horizon=horizon)
        G = graph_engine.graph
        nodes = {k: v for k, v in graph_engine.nodes.items() if not k.startswith('_')}

        # Identify all strategic regional logistics nodes & district supply centers
        supply_nodes = set([
            n_id for n_id, data in nodes.items() 
            if data.get('type') in ('supply_hub', 'town') or data.get('alias')
        ])

        # Build baseline graph and passable subgraph (excluding blocked edges >= 70.0 risk)
        passable_G = nx.Graph()
        baseline_G = nx.Graph()

        for n_id, data in nodes.items():
            passable_G.add_node(n_id, **data)
            baseline_G.add_node(n_id, **data)
            
        for u, v, data in G.edges(data=True):
            baseline_G.add_edge(u, v, **data)
            if not data.get('is_blocked', False):
                passable_G.add_edge(u, v, **data)

        # Multi-source reachability BFS in passable network vs baseline network
        passable_reachable = set()
        for hub in supply_nodes:
            if hub in passable_G:
                passable_reachable.update(nx.single_source_shortest_path_length(passable_G, hub, cutoff=25).keys())

        baseline_reachable = set()
        for hub in supply_nodes:
            if hub in baseline_G:
                baseline_reachable.update(nx.single_source_shortest_path_length(baseline_G, hub, cutoff=25).keys())

        # Count severed corridors
        severed_corridors_count = sum(1 for _, _, d in G.edges(data=True) if d.get('is_blocked', False))

        settlement_results = []
        total_isolated_pop = 0
        total_at_risk_pop = 0
        isolated_count = 0
        at_risk_count = 0

        # District-level risk status
        district_corridor_status = {}
        for edge in G.edges(data=True):
            d_ctx = edge[2].get('district_context', 'East Khasi Hills')
            if d_ctx not in district_corridor_status:
                district_corridor_status[d_ctx] = {'blocked': 0, 'total': 0, 'max_risk': 0.0, 'avg_risk_sum': 0.0}
            district_corridor_status[d_ctx]['total'] += 1
            district_corridor_status[d_ctx]['avg_risk_sum'] += edge[2].get('risk_score', 0)
            if edge[2].get('is_blocked'):
                district_corridor_status[d_ctx]['blocked'] += 1
            if edge[2].get('risk_score', 0) > district_corridor_status[d_ctx]['max_risk']:
                district_corridor_status[d_ctx]['max_risk'] = edge[2].get('risk_score', 0)

        for node_id, data in nodes.items():
            is_hub = data['type'] == 'supply_hub'
            pop = data['population']
            district = data.get('district', 'East Khasi Hills')
            d_stat = district_corridor_status.get(district, {'blocked': 0, 'total': 1, 'max_risk': 20.0, 'avg_risk_sum': 20.0})
            d_avg_risk = d_stat['avg_risk_sum'] / max(1, d_stat['total'])

            incident_edges = list(G.edges(node_id, data=True))
            max_incident_risk = max([e[2]['risk_score'] for e in incident_edges]) if incident_edges else d_avg_risk
            avg_incident_risk = sum([e[2]['risk_score'] for e in incident_edges]) / max(1, len(incident_edges)) if incident_edges else d_avg_risk
            all_incident_blocked = all([e[2]['is_blocked'] for e in incident_edges]) if incident_edges else False
            any_incident_blocked = any([e[2]['is_blocked'] for e in incident_edges]) if incident_edges else False

            # Isolation check: lost reachability due to active corridor blockage
            lost_access_due_to_hazard = (node_id in baseline_reachable) and (node_id not in passable_reachable)

            # Node Classification
            if all_incident_blocked or lost_access_due_to_hazard:
                status = 'ISOLATED'
                color = '#ef4444' # Red
                if not is_hub:
                    isolated_count += 1
                    total_isolated_pop += pop
                isolation_duration_hrs = 24 if data.get('buffer_days', 5) <= 4 else 12
                isolation_reason = 'Direct arterial access corridors severed by active landslide blockages.'
            elif (max_incident_risk >= 62.0 and not is_hub) or any_incident_blocked or (d_stat['blocked'] > 0 and avg_incident_risk >= 48.0 and not is_hub):
                status = 'AT_RISK'
                color = '#f59e0b' # Amber
                if not is_hub:
                    at_risk_count += 1
                    total_at_risk_pop += pop
                isolation_duration_hrs = 0
                isolation_reason = 'Primary corridor degrading; vulnerable to impending cut-off within 24-48h.'
            else:
                status = 'REACHABLE'
                color = '#10b981' # Green
                isolation_duration_hrs = 0
                isolation_reason = 'Passable corridors active from nearest logistics depot.'

            settlement_results.append({
                'node_id': node_id,
                'name': data['name'],
                'district': data['district'],
                'state': data['state'],
                'lat': data['lat'],
                'lon': data['lon'],
                'type': data['type'],
                'population': pop,
                'buffer_days': data['buffer_days'],
                'status': status,
                'color': color,
                'isolation_duration_hours': isolation_duration_hrs,
                'isolation_reason': isolation_reason,
                'is_hub': is_hub
            })

        # Sort settlements by severity
        settlement_results.sort(key=lambda s: (0 if s['status'] == 'ISOLATED' else 1 if s['status'] == 'AT_RISK' else 2, -s['population']))

        summary = {
            'total_settlements': len(settlement_results),
            'isolated_count': isolated_count,
            'at_risk_count': at_risk_count,
            'total_isolated_population': total_isolated_pop,
            'total_at_risk_population': total_at_risk_pop,
            'severed_corridors_count': severed_corridors_count
        }

        result = {
            'status': 'success',
            'horizon': horizon or 'current',
            'summary': summary,
            'settlements': settlement_results
        }

        IsolationEngine._cache[cache_key] = result
        return result
