#!/usr/bin/env python3
"""
系统测试脚本 - 验证所有组件是否正常
"""
import sys
import os

def check_files():
    """检查必要文件是否存在"""
    print("=" * 50)
    print("检查项目文件...")
    print("=" * 50)

    required_files = [
        'backend/app.py',
        'backend/models.py',
        'backend/requirements.txt',
        'backend/routes/auth.py',
        'backend/routes/books.py',
        'backend/routes/admin.py',
        'frontend/login.html',
        'frontend/index.html',
        'frontend/css/style.css',
        'start.sh',
        'start.bat',
        'README.md'
    ]

    missing_files = []
    for file in required_files:
        if os.path.exists(file):
            print(f"✓ {file}")
        else:
            print(f"✗ {file} (缺失)")
            missing_files.append(file)

    if missing_files:
        print(f"\n错误: 缺失 {len(missing_files)} 个文件")
        return False
    else:
        print(f"\n所有文件检查通过！")
        return True

def check_python_version():
    """检查 Python 版本"""
    print("\n" + "=" * 50)
    print("检查 Python 版本...")
    print("=" * 50)

    version = sys.version_info
    print(f"当前版本: Python {version.major}.{version.minor}.{version.micro}")

    if version.major >= 3 and version.minor >= 7:
        print("✓ Python 版本符合要求 (>= 3.7)")
        return True
    else:
        print("✗ Python 版本过低，需要 3.7 或更高版本")
        return False

def check_dependencies():
    """检查依赖是否可导入"""
    print("\n" + "=" * 50)
    print("检查 Python 依赖...")
    print("=" * 50)

    dependencies = {
        'flask': 'Flask',
        'flask_cors': 'Flask-CORS',
        'werkzeug': 'Werkzeug',
        'sqlite3': 'SQLite3 (内置)'
    }

    missing_deps = []
    for module, name in dependencies.items():
        try:
            __import__(module)
            print(f"✓ {name}")
        except ImportError:
            print(f"✗ {name} (未安装)")
            missing_deps.append(name)

    if missing_deps:
        print(f"\n提示: 运行以下命令安装依赖:")
        print("  cd backend")
        print("  pip install -r requirements.txt")
        return False
    else:
        print("\n所有依赖已安装！")
        return True

def test_database():
    """测试数据库初始化"""
    print("\n" + "=" * 50)
    print("测试数据库初始化...")
    print("=" * 50)

    sys.path.insert(0, 'backend')

    try:
        from models import init_db, insert_sample_books

        # 清理旧数据库
        if os.path.exists('backend/library.db'):
            os.remove('backend/library.db')
            print("✓ 清理旧数据库")

        # 初始化数据库
        os.chdir('backend')
        init_db()
        print("✓ 数据库结构创建成功")

        insert_sample_books()
        print("✓ 示例数据导入成功")

        os.chdir('..')
        return True
    except Exception as e:
        print(f"✗ 数据库初始化失败: {e}")
        return False

def main():
    print("\n")
    print("╔" + "=" * 48 + "╗")
    print("║  云端书舍 (E-Librarian) - 系统测试           ║")
    print("╚" + "=" * 48 + "╝")
    print()

    results = []

    # 运行所有测试
    results.append(("文件检查", check_files()))
    results.append(("Python版本", check_python_version()))
    results.append(("依赖检查", check_dependencies()))

    # 如果前面都通过，测试数据库
    if all(r[1] for r in results):
        results.append(("数据库测试", test_database()))

    # 输出总结
    print("\n" + "=" * 50)
    print("测试结果汇总")
    print("=" * 50)

    for name, passed in results:
        status = "✓ 通过" if passed else "✗ 失败"
        print(f"{name}: {status}")

    print("=" * 50)

    if all(r[1] for r in results):
        print("\n🎉 所有测试通过！系统可以正常运行。")
        print("\n启动方法:")
        print("  Windows: 双击 start.bat")
        print("  Linux/Mac: ./start.sh")
        print("\n然后在浏览器中打开 frontend/login.html")
        return 0
    else:
        print("\n⚠️  部分测试失败，请检查上述错误信息。")
        return 1

if __name__ == '__main__':
    sys.exit(main())