import networkx as nx
from .data_loader import load_nodes, load_edges, load_weather
from .risk_model import risk_model

class GraphEngine:
    def __init__(self):
        self.nodes = load_nodes()
        self.edges = load_edges()
        self.weather = load_weather()
        self.field_reports = {}  # edge_id -> list of reports
        self.graph = nx.Graph()
        self.rebuild_graph()

    def add_field_report(self, report):
        edge_id = report.get('edge_id')
        if edge_id:
            if edge_id not in self.field_reports:
                self.field_reports[edge_id] = []
            self.field_reports[edge_id].append(report)

    def rebuild_graph(self, horizon=None):
        """Reconstructs the NetworkX graph with updated dynamic risk weights."""
        self.graph.clear()
        
        # Add nodes
        for node_id, data in self.nodes.items():
            self.graph.add_node(node_id, **data)
            
        # Add edges with evaluated risk & weights
        evaluated_edges = []
        for edge in self.edges:
            district = edge.get('district_context', 'East Khasi Hills')
            w = self.weather.get(district, {
                'current_rainfall_mm': 15.0,
                'forecast_24h_mm': 25.0,
                'forecast_48h_mm': 35.0,
                'forecast_72h_mm': 20.0,
                'soil_saturation_index': 0.5
            })
            
            active_rep_count = len(self.field_reports.get(edge['id'], []))
            risk_eval = risk_model.calculate_risk(edge, w, active_reports=active_rep_count, horizon=horizon)
            
            risk_score = risk_eval['risk_score']
            dist = edge['distance_km']
            speed = edge['avg_speed_kmh']
            
            # Risk weight penalty: higher risk exponentially increases traversal cost
            # Blocked edges (risk >= 70) receive prohibitive penalty
            if risk_score >= 70.0:
                cost_weight = dist * 25.0 + 1000.0  # severely penalized
                is_blocked = True
            else:
                cost_weight = dist * (1.0 + 3.5 * ((risk_score / 100.0) ** 2))
                is_blocked = False

            base_time_hours = round(dist / max(10, speed), 2)
            # Estimated time with delays
            risk_time_hours = round(base_time_hours * (1.0 + (risk_score / 100.0) * 1.5), 2)

            edge_attrs = {
                **edge,
                'risk_score': risk_score,
                'status': risk_eval['status'],
                'severity': risk_eval['severity'],
                'rainfall_mm': risk_eval['rainfall_mm'],
                'factors': risk_eval['factors'],
                'cost_weight': cost_weight,
                'is_blocked': is_blocked,
                'base_time_hours': base_time_hours,
                'risk_time_hours': risk_time_hours
            }
            
            self.graph.add_edge(edge['u'], edge['v'], **edge_attrs)
            evaluated_edges.append(edge_attrs)
            
        return evaluated_edges

    def get_accessibility_graph(self, horizon=None):
        """Returns nodes and evaluated edges ready for Leaflet map & UI."""
        evaluated_edges = self.rebuild_graph(horizon=horizon)
        return {
            'nodes': list(self.nodes.values()),
            'edges': evaluated_edges
        }

    def compute_route(self, from_node, to_node):
        """
        Computes both:
        1. Default Shortest Path (ignoring risk)
        2. AI-Optimized Safest Path (risk-weighted)
        Returns path segments, distance, travel time, and safety metrics.
        """
        if from_node not in self.graph or to_node not in self.graph:
            return {'error': f'Invalid node endpoints {from_node} or {to_node}'}

        # 1. Default Shortest Route (weight='distance_km')
        try:
            default_path = nx.shortest_path(self.graph, source=from_node, target=to_node, weight='distance_km')
            default_info = self._summarize_path(default_path)
        except nx.NetworkXNoPath:
            default_path = []
            default_info = None

        # 2. AI Safest Route (weight='cost_weight')
        try:
            safe_path = nx.shortest_path(self.graph, source=from_node, target=to_node, weight='cost_weight')
            safe_info = self._summarize_path(safe_path)
        except nx.NetworkXNoPath:
            safe_path = []
            safe_info = None

        # Calculate time and risk comparison
        comparison = {}
        if default_info and safe_info:
            time_diff_min = round((safe_info['total_time_hours'] - default_info['total_time_hours']) * 60)
            risk_reduction = round(default_info['avg_risk_score'] - safe_info['avg_risk_score'], 1)
            is_rerouted = default_path != safe_path
            
            comparison = {
                'is_rerouted': is_rerouted,
                'time_difference_minutes': time_diff_min,
                'risk_reduction_percentage': max(0.0, risk_reduction),
                'blocked_segments_avoided': default_info['blocked_segments_count'] - safe_info['blocked_segments_count'],
                'recommendation': 'REROUTE_RECOMMENDED' if (is_rerouted and default_info['blocked_segments_count'] > 0) else 'DIRECT_ROUTE_SAFE'
            }

        return {
            'from': self.nodes.get(from_node),
            'to': self.nodes.get(to_node),
            'default_route': default_info,
            'ai_recommended_route': safe_info,
            'comparison': comparison
        }

    def _summarize_path(self, path_nodes):
        if not path_nodes or len(path_nodes) < 2:
            return None
            
        segments = []
        total_dist = 0.0
        total_time = 0.0
        total_risk = 0.0
        blocked_count = 0
        all_coords = []

        for i in range(len(path_nodes) - 1):
            u, v = path_nodes[i], path_nodes[i+1]
            edge_data = self.graph.get_edge_data(u, v)
            
            total_dist += edge_data['distance_km']
            total_time += edge_data['risk_time_hours']
            total_risk += edge_data['risk_score']
            if edge_data.get('is_blocked', False):
                blocked_count += 1
                
            segments.append({
                'edge_id': edge_data['id'],
                'name': edge_data['name'],
                'u': u,
                'v': v,
                'u_name': self.nodes[u]['name'],
                'v_name': self.nodes[v]['name'],
                'distance_km': edge_data['distance_km'],
                'risk_score': edge_data['risk_score'],
                'status': edge_data['status'],
                'time_hours': edge_data['risk_time_hours'],
                'geometry': edge_data.get('geometry', [])
            })
            
            # Collect geometry for route polyline
            if edge_data.get('geometry'):
                if u == edge_data['u']:
                    all_coords.extend(edge_data['geometry'])
                else:
                    all_coords.extend(list(reversed(edge_data['geometry'])))

        avg_risk = round(total_risk / max(1, len(segments)), 1)
        
        return {
            'node_sequence': path_nodes,
            'node_names': [self.nodes[n]['name'] for n in path_nodes],
            'segments': segments,
            'total_distance_km': round(total_dist, 1),
            'total_time_hours': round(total_time, 2),
            'avg_risk_score': avg_risk,
            'blocked_segments_count': blocked_count,
            'polyline_geometry': all_coords
        }

# Global singleton graph instance
graph_engine = GraphEngine()
