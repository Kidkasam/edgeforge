import sqlite3

def inspect_db():
    conn = sqlite3.connect('db.sqlite3')
    cursor = conn.cursor()
    
    with open('db_inspection.txt', 'w') as f:
        f.write("--- TABLES ---\n")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        for table in tables:
            f.write(f"\nTable: {table}\n")
            cursor.execute(f"PRAGMA table_info({table});")
            for col in cursor.fetchall():
                f.write(f"  {col}\n")
            
            f.write("  Data (top 5):\n")
            try:
                cursor.execute(f"SELECT * FROM {table} LIMIT 5;")
                for row in cursor.fetchall():
                    f.write(f"    {row}\n")
            except Exception as e:
                f.write(f"    Error reading data: {e}\n")
    
    conn.close()

if __name__ == "__main__":
    inspect_db()
    print("Inspection complete. See db_inspection.txt")
