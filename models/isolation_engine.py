import networkx as nx
from .graph_engine import graph_engine

class IsolationEngine:
    @staticmethod
    def compute_isolation_index(horizon=None):
        """
        Computes multi-hop reachability from supply hubs to every settlement.
        Returns isolation status, affected populations, and vulnerability rankings.
        """
        # Ensure graph is evaluated for current horizon
        graph_engine.rebuild_graph(horizon=horizon)
        G = graph_engine.graph
        nodes = graph_engine.nodes

        # Identify supply hubs
        supply_hubs = [n_id for n_id, data in nodes.items() if data['type'] == 'supply_hub']
        
        # Build passable subgraph (excluding blocked edges >= 70.0 risk)
        passable_G = nx.Graph()
        for n_id, data in nodes.items():
            passable_G.add_node(n_id, **data)
            
        for u, v, data in G.edges(data=True):
            if not data.get('is_blocked', False):
                passable_G.add_edge(u, v, **data)

        # Reachability BFS from any supply hub
        reachable_from_hubs = set()
        hub_distances = {}  # node -> min hops to a hub
        
        for hub in supply_hubs:
            if hub in passable_G:
                reachable_nodes = nx.single_source_shortest_path_length(passable_G, hub)
                for node, dist in reachable_nodes.items():
                    reachable_from_hubs.add(node)
                    if node not in hub_distances or dist < hub_distances[node]:
                        hub_distances[node] = dist

        settlement_results = []
        total_isolated_pop = 0
        total_at_risk_pop = 0
        isolated_count = 0
        at_risk_count = 0

        for node_id, data in nodes.items():
            # Hubs themselves are not counted as isolated settlements
            is_hub = data['type'] == 'supply_hub'
            pop = data['population']
            
            # Check edge risks directly connected to this node in full G
            incident_edges = list(G.edges(node_id, data=True))
            max_incident_risk = max([e[2]['risk_score'] for e in incident_edges]) if incident_edges else 0.0
            avg_incident_risk = sum([e[2]['risk_score'] for e in incident_edges]) / max(1, len(incident_edges)) if incident_edges else 0.0
            all_incident_blocked = all([e[2]['is_blocked'] for e in incident_edges]) if incident_edges else False

            if node_id not in reachable_from_hubs or all_incident_blocked:
                status = 'ISOLATED'
                color = '#ef4444' # Red
                if not is_hub:
                    isolated_count += 1
                    total_isolated_pop += pop
                isolation_duration_hrs = 18 if node_id in ['cherrapunjee', 'mawsynram'] else 6
                isolation_reason = 'All arterial road links blocked by severe rainfall/landslides.'
            elif avg_incident_risk >= 45.0 or max_incident_risk >= 60.0:
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
                'status_color': color,
                'is_hub': is_hub,
                'min_hub_hops': hub_distances.get(node_id, -1),
                'isolation_duration_hours': isolation_duration_hrs,
                'isolation_reason': isolation_reason,
                'incident_risk_max': max_incident_risk,
                'incident_risk_avg': round(avg_incident_risk, 1)
            })

        # Sort: ISOLATED first, then AT_RISK, then REACHABLE, ordered by population descending
        order = {'ISOLATED': 0, 'AT_RISK': 1, 'REACHABLE': 2}
        settlement_results.sort(key=lambda x: (order.get(x['status'], 3), -x['population']))

        return {
            'horizon': horizon or 'current',
            'summary': {
                'total_settlements': len(nodes),
                'isolated_count': isolated_count,
                'at_risk_count': at_risk_count,
                'total_isolated_population': total_isolated_pop,
                'total_at_risk_population': total_at_risk_pop,
                'severed_corridors_count': sum([1 for u, v, d in G.edges(data=True) if d.get('is_blocked')])
            },
            'settlements': settlement_results
        }
