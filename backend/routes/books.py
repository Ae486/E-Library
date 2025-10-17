"""
图书管理相关API路由
包括搜索、借阅、归还、续借等功能
"""
from flask import Blueprint, request, jsonify
from models import get_db
from datetime import datetime, timedelta

books_bp = Blueprint('books', __name__)

@books_bp.route('/search', methods=['GET'])
def search_books():
    """搜索图书"""
    query = request.args.get('query', '')
    category = request.args.get('category', '')

    conn = get_db()
    cursor = conn.cursor()

    if category:
        cursor.execute(
            'SELECT * FROM books WHERE category = ? ORDER BY title',
            (category,)
        )
    elif query:
        search_pattern = f'%{query}%'
        cursor.execute(
            '''SELECT * FROM books
               WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?
               ORDER BY title''',
            (search_pattern, search_pattern, search_pattern)
        )
    else:
        cursor.execute('SELECT * FROM books ORDER BY title LIMIT 50')

    books = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({'success': True, 'books': books}), 200

@books_bp.route('/list', methods=['GET'])
def list_books():
    """获取所有图书列表"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM books ORDER BY created_at DESC')
    books = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({'success': True, 'books': books}), 200

@books_bp.route('/detail/<int:book_id>', methods=['GET'])
def get_book_detail(book_id):
    """获取图书详情"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM books WHERE id = ?', (book_id,))
    book = cursor.fetchone()
    conn.close()

    if book:
        return jsonify({'success': True, 'book': dict(book)}), 200
    else:
        return jsonify({'success': False, 'message': '图书不存在'}), 404

@books_bp.route('/borrow', methods=['POST'])
def borrow_book():
    """借阅图书"""
    data = request.json
    user_id = data.get('user_id')
    book_id = data.get('book_id')

    if not user_id or not book_id:
        return jsonify({'success': False, 'message': '用户ID和图书ID不能为空'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # 检查图书是否可借
    cursor.execute('SELECT * FROM books WHERE id = ?', (book_id,))
    book = cursor.fetchone()

    if not book:
        conn.close()
        return jsonify({'success': False, 'message': '图书不存在'}), 404

    if book['available_quantity'] <= 0:
        conn.close()
        return jsonify({'success': False, 'message': '图书库存不足'}), 400

    # 检查用户是否已借阅该书且未归还
    cursor.execute(
        'SELECT * FROM borrowing_records WHERE user_id = ? AND book_id = ? AND status = ?',
        (user_id, book_id, 'borrowed')
    )
    if cursor.fetchone():
        conn.close()
        return jsonify({'success': False, 'message': '您已借阅该图书，请先归还'}), 400

    # 创建借阅记录
    borrow_date = datetime.now().isoformat()
    due_date = (datetime.now() + timedelta(days=30)).isoformat()

    try:
        cursor.execute(
            '''INSERT INTO borrowing_records (user_id, book_id, borrow_date, due_date, status)
               VALUES (?, ?, ?, ?, ?)''',
            (user_id, book_id, borrow_date, due_date, 'borrowed')
        )

        # 更新图书库存
        cursor.execute(
            'UPDATE books SET available_quantity = available_quantity - 1 WHERE id = ?',
            (book_id,)
        )

        conn.commit()
        record_id = cursor.lastrowid
        conn.close()

        return jsonify({
            'success': True,
            'message': '借阅成功',
            'record_id': record_id,
            'due_date': due_date
        }), 201
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': f'借阅失败: {str(e)}'}), 500

@books_bp.route('/return', methods=['POST'])
def return_book():
    """归还图书"""
    data = request.json
    record_id = data.get('record_id')

    if not record_id:
        return jsonify({'success': False, 'message': '借阅记录ID不能为空'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # 查询借阅记录
    cursor.execute('SELECT * FROM borrowing_records WHERE id = ?', (record_id,))
    record = cursor.fetchone()

    if not record:
        conn.close()
        return jsonify({'success': False, 'message': '借阅记录不存在'}), 404

    if record['status'] == 'returned':
        conn.close()
        return jsonify({'success': False, 'message': '该图书已归还'}), 400

    # 更新借阅记录
    return_date = datetime.now().isoformat()

    try:
        cursor.execute(
            'UPDATE borrowing_records SET return_date = ?, status = ? WHERE id = ?',
            (return_date, 'returned', record_id)
        )

        # 更新图书库存
        cursor.execute(
            'UPDATE books SET available_quantity = available_quantity + 1 WHERE id = ?',
            (record['book_id'],)
        )

        conn.commit()
        conn.close()

        return jsonify({'success': True, 'message': '归还成功'}), 200
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': f'归还失败: {str(e)}'}), 500

@books_bp.route('/renew', methods=['POST'])
def renew_book():
    """续借图书"""
    data = request.json
    record_id = data.get('record_id')

    if not record_id:
        return jsonify({'success': False, 'message': '借阅记录ID不能为空'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # 查询借阅记录
    cursor.execute('SELECT * FROM borrowing_records WHERE id = ?', (record_id,))
    record = cursor.fetchone()

    if not record:
        conn.close()
        return jsonify({'success': False, 'message': '借阅记录不存在'}), 404

    if record['status'] != 'borrowed':
        conn.close()
        return jsonify({'success': False, 'message': '该图书不在借阅状态'}), 400

    # 续借：延长30天
    current_due_date = datetime.fromisoformat(record['due_date'])
    new_due_date = (current_due_date + timedelta(days=30)).isoformat()

    try:
        cursor.execute(
            'UPDATE borrowing_records SET due_date = ? WHERE id = ?',
            (new_due_date, record_id)
        )
        conn.commit()
        conn.close()

        return jsonify({
            'success': True,
            'message': '续借成功',
            'new_due_date': new_due_date
        }), 200
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': f'续借失败: {str(e)}'}), 500

@books_bp.route('/my-borrowings/<int:user_id>', methods=['GET'])
def get_my_borrowings(user_id):
    """获取用户的借阅记录"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        '''SELECT br.*, b.title, b.author, b.isbn
           FROM borrowing_records br
           JOIN books b ON br.book_id = b.id
           WHERE br.user_id = ?
           ORDER BY br.borrow_date DESC''',
        (user_id,)
    )

    records = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({'success': True, 'records': records}), 200

@books_bp.route('/categories', methods=['GET'])
def get_categories():
    """获取所有图书分类"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT DISTINCT category FROM books WHERE category IS NOT NULL ORDER BY category')
    categories = [row['category'] for row in cursor.fetchall()]
    conn.close()

    return jsonify({'success': True, 'categories': categories}), 200

@books_bp.route('/rate', methods=['POST'])
def rate_book():
    """对已归还的图书进行评分"""
    data = request.json
    record_id = data.get('record_id')
    rating = data.get('rating')

    if not record_id or not rating:
        return jsonify({'success': False, 'message': '借阅记录ID和评分不能为空'}), 400

    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({'success': False, 'message': '评分必须是1-5之间的整数'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # 检查借阅记录是否存在且已归还
    cursor.execute('SELECT * FROM borrowing_records WHERE id = ?', (record_id,))
    record = cursor.fetchone()

    if not record:
        conn.close()
        return jsonify({'success': False, 'message': '借阅记录不存在'}), 404

    if record['status'] != 'returned':
        conn.close()
        return jsonify({'success': False, 'message': '只能对已归还的图书进行评分'}), 400

    try:
        cursor.execute(
            'UPDATE borrowing_records SET rating = ? WHERE id = ?',
            (rating, record_id)
        )
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': '评分成功'}), 200
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': f'评分失败: {str(e)}'}), 500

@books_bp.route('/feedback/submit', methods=['POST'])
def submit_feedback():
    """用户提交反馈"""
    data = request.json
    user_id = data.get('user_id')
    feedback_type = data.get('type')
    content = data.get('content')

    if not user_id or not content:
        return jsonify({'success': False, 'message': '用户ID和反馈内容不能为空'}), 400

    if not feedback_type or feedback_type not in ['suggestion', 'complaint', 'request']:
        feedback_type = 'suggestion'

    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute(
            '''INSERT INTO feedback (user_id, type, content, status, created_at)
               VALUES (?, ?, ?, ?, ?)''',
            (user_id, feedback_type, content, 'pending', datetime.now().isoformat())
        )
        conn.commit()
        feedback_id = cursor.lastrowid
        conn.close()

        return jsonify({
            'success': True,
            'message': '反馈提交成功，我们会尽快处理',
            'feedback_id': feedback_id
        }), 201
    except Exception as e:
        conn.close()
        return jsonify({'success': False, 'message': f'提交失败: {str(e)}'}), 500

@books_bp.route('/feedback/my/<int:user_id>', methods=['GET'])
def get_my_feedbacks(user_id):
    """获取用户的反馈记录"""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        '''SELECT * FROM feedback
           WHERE user_id = ?
           ORDER BY created_at DESC''',
        (user_id,)
    )

    feedbacks = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({'success': True, 'feedbacks': feedbacks}), 200