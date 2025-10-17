"""
用户认证相关API路由
包括注册、登录、密码重置等功能
"""
from flask import Blueprint, request, jsonify
from models import get_db, hash_password
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """用户注册"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    phone = data.get('phone')

    if not username or not password:
        return jsonify({'success': False, 'message': '用户名和密码不能为空'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # 检查用户名是否已存在
    cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'success': False, 'message': '用户名已存在'}), 400

    # 检查手机号或邮箱是否已注册
    if phone:
        cursor.execute('SELECT id FROM users WHERE phone = ?', (phone,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'success': False, 'message': '该手机号已注册'}), 400

    # 创建新用户
    hashed_password = hash_password(password)
    try:
        cursor.execute(
            'INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)',
            (username, hashed_password, email, phone)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return jsonify({
            'success': True,
            'message': '注册成功',
            'user_id': user_id
        }), 201
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': f'注册失败: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'message': '用户名和密码不能为空'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # 查询用户
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({'success': False, 'message': '用户不存在'}), 404

    # 检查账户是否被锁定
    if user['locked_until']:
        locked_until = datetime.fromisoformat(user['locked_until'])
        if datetime.now() < locked_until:
            conn.close()
            remaining = (locked_until - datetime.now()).seconds // 60
            return jsonify({
                'success': False,
                'message': f'账户已被锁定，请在 {remaining} 分钟后重试'
            }), 403

    # 验证密码
    hashed_password = hash_password(password)
    if user['password'] != hashed_password:
        # 密码错误，增加失败次数
        login_attempts = user['login_attempts'] + 1

        if login_attempts >= 5:
            # 锁定账户15分钟
            locked_until = (datetime.now() + timedelta(minutes=15)).isoformat()
            cursor.execute(
                'UPDATE users SET login_attempts = ?, locked_until = ? WHERE id = ?',
                (login_attempts, locked_until, user['id'])
            )
            conn.commit()
            conn.close()
            return jsonify({
                'success': False,
                'message': '密码错误次数过多，账户已被锁定15分钟'
            }), 403
        else:
            cursor.execute(
                'UPDATE users SET login_attempts = ? WHERE id = ?',
                (login_attempts, user['id'])
            )
            conn.commit()
            conn.close()
            return jsonify({
                'success': False,
                'message': f'密码错误，还可尝试 {5 - login_attempts} 次'
            }), 401

    # 登录成功，重置登录失败次数
    cursor.execute(
        'UPDATE users SET login_attempts = 0, locked_until = NULL WHERE id = ?',
        (user['id'],)
    )
    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': '登录成功',
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'role': user['role'],
            'special_reader_type': user['special_reader_type']
        }
    }), 200

@auth_bp.route('/update-profile', methods=['PUT'])
def update_profile():
    """更新用户信息"""
    data = request.json
    user_id = data.get('user_id')
    email = data.get('email')
    phone = data.get('phone')
    special_reader_type = data.get('special_reader_type')

    if not user_id:
        return jsonify({'success': False, 'message': '用户ID不能为空'}), 400

    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute(
            'UPDATE users SET email = ?, phone = ?, special_reader_type = ? WHERE id = ?',
            (email, phone, special_reader_type, user_id)
        )
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': '信息更新成功'}), 200
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': f'更新失败: {str(e)}'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """重置密码"""
    data = request.json
    username = data.get('username')
    phone = data.get('phone')
    new_password = data.get('new_password')

    if not username or not phone or not new_password:
        return jsonify({'success': False, 'message': '所有字段不能为空'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # 验证用户名和手机号匹配
    cursor.execute('SELECT id FROM users WHERE username = ? AND phone = ?', (username, phone))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({'success': False, 'message': '用户名或手机号不匹配'}), 404

    # 更新密码
    hashed_password = hash_password(new_password)
    try:
        cursor.execute(
            'UPDATE users SET password = ?, login_attempts = 0, locked_until = NULL WHERE id = ?',
            (hashed_password, user['id'])
        )
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': '密码重置成功'}), 200
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': f'重置失败: {str(e)}'}), 500