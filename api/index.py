import os
import sys

# Ensure root directory is on the Python module search path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from dashboard import app

# Vercel Middleware to restore original request paths from Vercel rewrites
class VercelMiddleware:
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        # Vercel passes the original user URL in HTTP_X_MATCHED_PATH
        matched_path = environ.get('HTTP_X_MATCHED_PATH', '')
        if matched_path:
            environ['PATH_INFO'] = matched_path.split('?')[0]
        elif environ.get('PATH_INFO', '').startswith('/api/index'):
            clean = environ['PATH_INFO'][len('/api/index'):]
            environ['PATH_INFO'] = clean if clean else '/'
        return self.wsgi_app(environ, start_response)

app.wsgi_app = VercelMiddleware(app.wsgi_app)
