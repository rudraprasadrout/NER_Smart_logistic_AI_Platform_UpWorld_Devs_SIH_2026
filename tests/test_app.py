import unittest
from app import create_app

class PathNERTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_pages_render(self):
        pages = ['/', '/routes', '/field-reporter', '/disaster-mode']
        for page in pages:
            res = self.client.get(page)
            self.assertEqual(res.status_code, 200, f"Failed rendering {page}")

    def test_api_graph_and_forecast(self):
        # 1. Graph accessibility
        res = self.client.get('/api/v1/graph/accessibility')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertTrue(len(data['nodes']) > 0)
        self.assertTrue(len(data['edges']) > 0)

        # 2. 72h Forecast timeline
        res_fc = self.client.get('/api/v1/graph/forecast?horizon=48h')
        self.assertEqual(res_fc.status_code, 200)
        fc_data = res_fc.get_json()
        self.assertEqual(fc_data['status'], 'success')
        self.assertIn('timeline', fc_data)
        self.assertIn('edges', fc_data)

    def test_api_isolation_index(self):
        res = self.client.get('/api/v1/isolation-index')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('summary', data)
        self.assertIn('settlements', data)
        self.assertGreater(data['summary']['total_settlements'], 0)

    def test_api_routing(self):
        res = self.client.get('/api/v1/route/guwahati_hub/silchar_hub')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('ai_recommended_route', data)
        self.assertIn('default_route', data)
        self.assertIn('comparison', data)

    def test_api_vehicles(self):
        res = self.client.get('/api/v1/vehicles')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertTrue(len(data['vehicles']) > 0)
        
        # Test specific vehicle
        v_id = data['vehicles'][0]['id']
        res_v = self.client.get(f'/api/v1/vehicles/{v_id}/location')
        self.assertEqual(res_v.status_code, 200)
        v_data = res_v.get_json()
        self.assertEqual(v_data['status'], 'success')
        self.assertEqual(v_data['vehicle']['id'], v_id)

    def test_api_district_status(self):
        res = self.client.get('/api/v1/district/East-Jaintia-Hills/status')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('total_segments', data)
        self.assertIn('isolated_settlement_count', data)

    def test_api_alerts_and_subscription(self):
        # 1. Multilingual alerts
        for lang in ['en', 'as', 'hi', 'bn']:
            res = self.client.get(f'/api/v1/alerts?lang={lang}')
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertEqual(data['status'], 'success')
            self.assertEqual(data['lang'], lang)
            self.assertTrue(len(data['alerts']) > 0)

        # 2. Alert subscription
        sub_res = self.client.post('/api/v1/alerts/subscribe', json={
            'stakeholder_name': 'Deputy Commissioner Cachar',
            'language': 'bn'
        })
        self.assertEqual(sub_res.status_code, 200)

    def test_api_field_report_submission(self):
        payload = {
            'client_report_id': 'test_uuid_12345',
            'edge_id': 'osm_edge_0001',
            'reporter_name': 'Unit Test Officer',
            'hazard_type': 'Landslide',
            'severity': 'Critical',
            'lat': 25.1147,
            'lon': 92.3619,
            'description': 'Test obstruction report'
        }
        res = self.client.post('/api/v1/reports/incident', json=payload)
        self.assertIn(res.status_code, [200, 201])
        data = res.get_json()
        self.assertIn(data['status'], ['success', 'already_synced'])

    def test_api_ai_advisory(self):
        for lang in ['en', 'as', 'hi', 'bn']:
            res = self.client.get(f'/api/v1/ai/advisory?lang={lang}')
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertEqual(data['status'], 'success')
            self.assertEqual(data['language'], lang)
            self.assertIn('advisory', data)
            self.assertTrue(len(data['advisory']) > 0)

    def test_pkl_model_loading(self):
        import os
        import joblib
        from models.risk_model import risk_model
        
        self.assertTrue(os.path.exists('models/risk_model.pkl'))
        self.assertTrue(risk_model.is_trained)
        
        # Test ML risk evaluation with test edge
        test_edge = {
            'slope_deg': 24.5,
            'base_vulnerability': 0.75,
            'soil_factor': 0.85
        }
        test_weather = {'current_rainfall_mm': 65.0, 'soil_saturation_index': 0.88}
        eval_res = risk_model.calculate_risk(test_edge, test_weather)
        self.assertIn('risk_score', eval_res)
        self.assertGreater(eval_res['risk_score'], 0)
        self.assertLessEqual(eval_res['risk_score'], 100)

if __name__ == '__main__':
    unittest.main()

