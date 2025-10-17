"""
管理员功能API路由
包括用户管理、图书管理、统计报表等
"""
from flask import Blueprint, request, jsonify
from models import get_db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/books/add', methods=['POST'])
def add_book():
    """添加图书"""
    data = request.json
    title = data.get('title')
    author = data.get('author')
    isbn = data.get('isbn')
    category = data.get('category')
    publisher = data.get('publisher')
    total_quantity = data.get('total_quantity', 1)
    description = data.get('description', '')

    if not title:
        return jsonify({'success': False, 'message': '图书标题不能为空'}), 400

    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute(
            '''INSERT INTO books (title, author, isbn, category, publisher, total_quantity, available_quantity, description)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
            (title, author, isbn, category, publisher, total_quantity, total_quantity, description)
        )
        conn.commit()
        book_id = cursor.lastrowid
        conn.close()

        return jsonify({
            'success': True,
            'message': '图书添加成功',
            'book_id': book_id
        }), 201
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': f'添加失败: {str(e)}'}), 500

@admin_bp.route('/books/update/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    """更新图书信息"""
    data = request.json
    title = data.get('title')
    author = data.get('author')
    isbn = data.get('isbn')
    category = data.get('category')
    publisher = data.get('publisher')
    total_quantity = data.get('total_quantity')
    description = data.get('description')

    conn = get_db()
    cursor = conn.cursor()

    # 检查图书是否存在
    cursor.execute('SELECT * FROM books WHERE id = ?', (book_id,))
    book = cursor.fetchone()

    if not book:
        conn.close()
        return jsonify({'success': False, 'message': '图书不存在'}), 404

    try:
        # 计算可借数量变化
        borrowed_count = book['total_quantity'] - book['available_quantity']
        new_available = total_quantity - borrowed_count if total_quantity else book['available_quantity']

        cursor.execute(
            '''UPDATE books
               SET title = ?, author = ?, isbn = ?, category = ?, publisher = ?,
                   total_quantity = ?, available_quantity = ?, description = ?
               WHERE id = ?''',
            (title, author, isbn, category, publisher, total_quantity, new_available, description, book_id)
        )
        conn.commit()
        conn.close()

        return jsonify({'success': True, 'message': '图书更新成功'}), 200
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': f'更新失败: {str(e)}'}), 500

@admin_bp.route('/books/delete/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    """删除图书"""
    conn = get_db()
    cursor = conn.cursor()

    # 检查是否有未归还的借阅记录
    cursor.execute(
        'SELECT COUNT(*) as count FROM borrowing_records WHERE book_id = ? AND status = ?',
        (book_id, 'borrowed')
    )
    result = cursor.fetchone()

    if result['count'] > 0:
        conn.close()
        return jsonify({'success': False, 'message': '该图书有未归还的借阅记录，无法删除'}), 400

    try:
        cursor.execute('DELETE FROM books WHERE id = ?', (book_id,))
        conn.commit()
        conn.close()

        return jsonify({'success': True, 'message': '图书删除成功'}), 200
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': f'删除失败: {str(e)}'}), 500

@admin_bp.route('/users/list', methods=['GET'])
def list_users():
    """获取用户列表"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        'SELECT id, username, email, phone, role, special_reader_type, created_at FROM users ORDER BY created_at DESC'
    )
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({'success': True, 'users': users}), 200

@admin_bp.route('/users/statistics', methods=['GET'])
def user_statistics():
    """获取用户统计信息"""
    conn = get_db()
    cursor = conn.cursor()

    # 总用户数
    cursor.execute('SELECT COUNT(*) as count FROM users')
    total_users = cursor.fetchone()['count']

    # 按角色统计
    cursor.execute('SELECT role, COUNT(*) as count FROM users GROUP BY role')
    role_stats = [dict(row) for row in cursor.fetchall()]

    # 特殊读者统计
    cursor.execute(
        '''SELECT special_reader_type, COUNT(*) as count
           FROM users
           WHERE special_reader_type IS NOT NULL
           GROUP BY special_reader_type'''
    )
    special_reader_stats = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return jsonify({
        'success': True,
        'total_users': total_users,
        'role_stats': role_stats,
        'special_reader_stats': special_reader_stats
    }), 200

@admin_bp.route('/borrowings/statistics', methods=['GET'])
def borrowing_statistics():
    """获取借阅统计信息"""
    conn = get_db()
    cursor = conn.cursor()

    # 总借阅次数
    cursor.execute('SELECT COUNT(*) as count FROM borrowing_records')
    total_borrowings = cursor.fetchone()['count']

    # 当前借阅中的图书
    cursor.execute('SELECT COUNT(*) as count FROM borrowing_records WHERE status = ?', ('borrowed',))
    current_borrowings = cursor.fetchone()['count']

    # 最受欢迎的图书
    cursor.execute(
        '''SELECT b.title, b.author, COUNT(*) as borrow_count
           FROM borrowing_records br
           JOIN books b ON br.book_id = b.id
           GROUP BY br.book_id
           ORDER BY borrow_count DESC
           LIMIT 10'''
    )
    popular_books = [dict(row) for row in cursor.fetchall()]

    # 按分类统计借阅
    cursor.execute(
        '''SELECT b.category, COUNT(*) as borrow_count
           FROM borrowing_records br
           JOIN books b ON br.book_id = b.id
           WHERE b.category IS NOT NULL
           GROUP BY b.category
           ORDER BY borrow_count DESC'''
    )
    category_stats = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return jsonify({
        'success': True,
        'total_borrowings': total_borrowings,
        'current_borrowings': current_borrowings,
        'popular_books': popular_books,
        'category_stats': category_stats
    }), 200

@admin_bp.route('/feedback/list', methods=['GET'])
def list_feedback():
    """获取反馈列表"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        '''SELECT f.*, u.username
           FROM feedback f
           JOIN users u ON f.user_id = u.id
           ORDER BY f.created_at DESC'''
    )
    feedbacks = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({'success': True, 'feedbacks': feedbacks}), 200

@admin_bp.route('/feedback/reply/<int:feedback_id>', methods=['PUT'])
def reply_feedback(feedback_id):
    """回复反馈"""
    data = request.json
    admin_reply = data.get('admin_reply')

    if not admin_reply:
        return jsonify({'success': False, 'message': '回复内容不能为空'}), 400

    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute(
            'UPDATE feedback SET admin_reply = ?, status = ? WHERE id = ?',
            (admin_reply, 'replied', feedback_id)
        )
        conn.commit()
        conn.close()

        return jsonify({'success': True, 'message': '回复成功'}), 200
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': f'回复失败: {str(e)}'}), 500