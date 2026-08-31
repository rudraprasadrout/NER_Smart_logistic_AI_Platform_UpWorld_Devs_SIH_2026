import os
from flask import Flask, render_template, request
from flask_cors import CORS
from config import Config

# Import REST API blueprints
from routes.api_graph import api_graph_bp
from routes.api_isolation import api_isolation_bp
from routes.api_routes import api_routes_bp
from routes.api_reports import api_reports_bp
from routes.api_vehicles import api_vehicles_bp
from routes.api_alerts import api_alerts_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    # Register API Blueprints
    app.register_blueprint(api_graph_bp)
    app.register_blueprint(api_isolation_bp)
    app.register_blueprint(api_routes_bp)
    app.register_blueprint(api_reports_bp)
    app.register_blueprint(api_vehicles_bp)
    app.register_blueprint(api_alerts_bp)

    # Frontend View Routes
    @app.route('/')
    def index():
        return render_template('landing.html', active_page='home')

    @app.route('/dashboard')
    def dashboard():
        return render_template('dashboard.html', active_page='dashboard')

    @app.route('/routes')
    def route_planner():
        return render_template('route_planner.html', active_page='routes')

    @app.route('/field-reporter')
    def field_reporter():
        return render_template('field_app.html', active_page='field')

    @app.route('/disaster-mode')
    def disaster_view():
        return render_template('disaster_view.html', active_page='disaster')

    # Automatic High-Speed Gzip Compression Middleware for Low-Network Operation
    @app.after_request
    def compress_response(response):
        accept_encoding = request.headers.get('Accept-Encoding', '')
        if 'gzip' not in accept_encoding.lower() or response.status_code < 200 or response.status_code >= 300:
            return response
        if response.direct_passthrough or 'Content-Encoding' in response.headers:
            return response
        
        content_type = response.headers.get('Content-Type', '')
        if any(ct in content_type for ct in ['application/json', 'text/', 'application/javascript']):
            data = response.get_data()
            if len(data) > 400:
                from io import BytesIO
                import gzip
                gzip_buffer = BytesIO()
                with gzip.GzipFile(mode='wb', fileobj=gzip_buffer, compresslevel=6) as gzip_file:
                    gzip_file.write(data)
                response.set_data(gzip_buffer.getvalue())
                response.headers['Content-Encoding'] = 'gzip'
                response.headers['Content-Length'] = len(response.get_data())
        return response

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
