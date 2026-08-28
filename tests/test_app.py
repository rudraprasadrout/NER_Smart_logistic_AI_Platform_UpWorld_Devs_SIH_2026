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

    def test_api_graph(self):
        res = self.client.get('/api/v1/graph/accessibility')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertTrue(len(data['nodes']) > 0)
        self.assertTrue(len(data['edges']) > 0)

    def test_api_isolation_index(self):
        res = self.client.get('/api/v1/isolation-index')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('summary', data)
        self.assertIn('settlements', data)

    def test_api_routing(self):
        res = self.client.get('/api/v1/route/guwahati_hub/silchar_hub')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('ai_recommended_route', data)
        self.assertIn('default_route', data)

    def test_api_vehicles(self):
        res = self.client.get('/api/v1/vehicles')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertTrue(len(data['vehicles']) > 0)

    def test_api_alerts(self):
        res = self.client.get('/api/v1/alerts?lang=as')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'success')
        self.assertTrue(len(data['alerts']) > 0)

    def test_api_field_report_submission(self):
        payload = {
            'client_report_id': 'test_uuid_12345',
            'edge_id': 'e_lumshnong_sonapur',
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

if __name__ == '__main__':
    unittest.main()
