"""
智慧图书馆 (E-Librarian) - Flask 后端主程序
轻量级图书馆管理系统 - React Version
"""
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from models import init_db, insert_sample_books
from routes.auth import auth_bp
from routes.books import books_bp
from routes.admin import admin_bp
import os

# 创建 Flask 应用（配置静态文件目录为 React build）
app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
CORS(app)  # 启用跨域支持

# 注册蓝图（路由模块）
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(books_bp, url_prefix='/api/books')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    """Serve React frontend"""
    dist_dir = os.path.join(os.path.dirname(__file__), '../frontend/dist')

    # If it's an API request, let it fall through
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404

    # If file exists, serve it
    if path and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)

    # Otherwise serve index.html (for client-side routing)
    return send_from_directory(dist_dir, 'index.html')

@app.route('/api')
def api_index():
    """API 根路径"""
    return jsonify({
        'name': '智慧图书馆 API',
        'version': '2.0.0 (React)',
        'description': '无人值守图书馆管理系统',
        'endpoints': {
            'auth': '/api/auth',
            'books': '/api/books',
            'admin': '/api/admin'
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'healthy',
        'message': '系统运行正常'
    }), 200

@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    return jsonify({
        'success': False,
        'message': '请求的资源不存在'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """500错误处理"""
    return jsonify({
        'success': False,
        'message': '服务器内部错误'
    }), 500

def initialize_system():
    """初始化系统"""
    print("=" * 50)
    print("智慧图书馆 (E-Librarian) 系统启动中...")
    print("=" * 50)

    # 检查数据库是否存在
    db_exists = os.path.exists('library.db')

    if not db_exists:
        print("\n首次启动，正在初始化数据库...")
        init_db()
        insert_sample_books()
        print("\n✓ 数据库初始化完成")
        print("✓ 示例图书数据已导入")
        print("\n默认管理员账户:")
        print("  用户名: admin")
        print("  密码: admin123")
    else:
        print("\n数据库已存在，跳过初始化")

    print("\n" + "=" * 50)
    print("系统启动成功!")
    print("=" * 50)
    print("\n访问地址: http://localhost:5000")
    print("前端页面: http://localhost:5000 (打开 frontend/index.html)")
    print("\n按 Ctrl+C 停止服务器")
    print("=" * 50 + "\n")

if __name__ == '__main__':
    # 初始化系统
    initialize_system()

    # 启动 Flask 服务器
    app.run(
        host='0.0.0.0',  # 允许外部访问
        port=5000,
        debug=True  # 开发模式，自动重载
    )