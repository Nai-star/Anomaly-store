import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

with open('db_views/views.sql', 'r') as f:
    sql = f.read()

statements = sql.split(';')
with connection.cursor() as cursor:
    for statement in statements:
        if statement.strip():
            cursor.execute(statement)

print("Views created successfully!")
