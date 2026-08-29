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

        # Identify supply hubs
        supply_hubs = [n_id for n_id, data in nodes.items() if data.get('type') == 'supply_hub']
        
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

        # Evaluate district-level arterial passable status
        district_corridor_status = {}
        for edge in G.edges(data=True):
            d_ctx = edge[2].get('district_context', 'East Khasi Hills')
            if d_ctx not in district_corridor_status:
                district_corridor_status[d_ctx] = {'blocked': 0, 'total': 0, 'max_risk': 0.0}
            district_corridor_status[d_ctx]['total'] += 1
            if edge[2].get('is_blocked'):
                district_corridor_status[d_ctx]['blocked'] += 1
            if edge[2].get('risk_score', 0) > district_corridor_status[d_ctx]['max_risk']:
                district_corridor_status[d_ctx]['max_risk'] = edge[2].get('risk_score', 0)

        for node_id, data in nodes.items():
            # Hubs themselves are not counted as isolated settlements
            is_hub = data['type'] == 'supply_hub'
            pop = data['population']
            district = data.get('district', 'East Khasi Hills')
            d_stat = district_corridor_status.get(district, {'blocked': 0, 'total': 1, 'max_risk': 20.0})
            
            # Check edge risks directly connected to this node in full G
            incident_edges = list(G.edges(node_id, data=True))
            max_incident_risk = max([e[2]['risk_score'] for e in incident_edges]) if incident_edges else d_stat['max_risk']
            avg_incident_risk = sum([e[2]['risk_score'] for e in incident_edges]) / max(1, len(incident_edges)) if incident_edges else d_stat['max_risk']
            all_incident_blocked = all([e[2]['is_blocked'] for e in incident_edges]) if incident_edges else False

            # Is node directly reachable via graph BFS or via passable district corridor
            is_bfs_reachable = node_id in reachable_from_hubs
            district_artery_blocked = d_stat['blocked'] > 0 and (d_stat['blocked'] / max(1, d_stat['total'])) >= 0.5

            if all_incident_blocked or (not is_bfs_reachable and district_artery_blocked):
                status = 'ISOLATED'
                color = '#ef4444' # Red
                if not is_hub:
                    isolated_count += 1
                    total_isolated_pop += pop
                # Duration is higher for remote/vulnerable settlements with low supply buffer
                node_type = data.get('type', 'junction')
                buffer_d = data.get('buffer_days', 5)
                if node_type in ('remote_village',) or buffer_d <= 4:
                    isolation_duration_hrs = 24
                elif node_type == 'town' and buffer_d <= 6:
                    isolation_duration_hrs = 18
                else:
                    isolation_duration_hrs = 6
                isolation_reason = 'All arterial road links blocked by severe rainfall/landslides.'
            elif max_incident_risk >= 50.0 or avg_incident_risk >= 40.0:
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

        result = {
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
        IsolationEngine._cache[cache_key] = result
        return result
