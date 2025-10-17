"""
数据库模型定义
包含用户、图书、借阅记录三个核心表
"""
import sqlite3
import hashlib
from datetime import datetime, timedelta
import json

DATABASE = 'library.db'

def get_db():
    """获取数据库连接"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """初始化数据库，创建表结构"""
    conn = get_db()
    cursor = conn.cursor()

    # 用户表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            role TEXT DEFAULT 'reader',
            special_reader_type TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            login_attempts INTEGER DEFAULT 0,
            locked_until TEXT
        )
    ''')

    # 图书表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT,
            isbn TEXT UNIQUE,
            category TEXT,
            publisher TEXT,
            total_quantity INTEGER DEFAULT 1,
            available_quantity INTEGER DEFAULT 1,
            description TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 借阅记录表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS borrowing_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            book_id INTEGER NOT NULL,
            borrow_date TEXT DEFAULT CURRENT_TIMESTAMP,
            due_date TEXT NOT NULL,
            return_date TEXT,
            status TEXT DEFAULT 'borrowed',
            rating INTEGER,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (book_id) REFERENCES books(id)
        )
    ''')

    # 反馈表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            content TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            admin_reply TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    conn.commit()

    # 检查是否已有管理员账户，没有则创建默认管理员
    cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
    if cursor.fetchone()[0] == 0:
        admin_password = hash_password('admin123')
        cursor.execute(
            "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)",
            ('admin', admin_password, 'admin@library.com', 'admin')
        )
        conn.commit()

    conn.close()
    print("数据库初始化完成！")

def hash_password(password):
    """密码哈希加密"""
    return hashlib.sha256(password.encode()).hexdigest()

def insert_sample_books():
    """插入示例图书数据"""
    conn = get_db()
    cursor = conn.cursor()

    # 检查是否已有图书数据
    cursor.execute("SELECT COUNT(*) FROM books")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    sample_books = [
        ('Python编程：从入门到实践', 'Eric Matthes', '9787115428028', '编程', '人民邮电出版社', 5, 5, 'Python编程入门经典教材'),
        ('深入理解计算机系统', 'Randal E. Bryant', '9787111544937', '计算机科学', '机械工业出版社', 3, 3, '计算机系统经典教材'),
        ('算法导论', 'Thomas H. Cormen', '9787111407010', '算法', '机械工业出版社', 4, 4, '算法领域权威著作'),
        ('人工智能：一种现代方法', 'Stuart Russell', '9787115452122', '人工智能', '人民邮电出版社', 3, 3, 'AI领域经典教材'),
        ('数据库系统概念', 'Abraham Silberschatz', '9787111391920', '数据库', '机械工业出版社', 4, 4, '数据库系统经典教材'),
        ('软件工程：实践者的研究方法', 'Roger S. Pressman', '9787111562979', '软件工程', '机械工业出版社', 3, 3, '软件工程经典教材'),
        ('计算机网络', 'Andrew S. Tanenbaum', '9787115441492', '网络', '人民邮电出版社', 4, 4, '计算机网络权威教材'),
        ('操作系统概念', 'Abraham Silberschatz', '9787111544203', '操作系统', '机械工业出版社', 3, 3, '操作系统经典教材'),
    ]

    cursor.executemany(
        'INSERT INTO books (title, author, isbn, category, publisher, total_quantity, available_quantity, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        sample_books
    )

    conn.commit()
    conn.close()
    print("示例图书数据插入完成！")

if __name__ == '__main__':
    init_db()
    insert_sample_books()