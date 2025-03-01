# accounts/migrations/0005_merge_20250301_0000.py

from django.db import migrations, models


class Migration(migrations.Migration):
    """
    This migration merges the conflicting migrations:
    - 0004_auto_20250224_1821 (fullname field update)
    - 0005_update_email_field (making email optional)
    """

    dependencies = [
        ('accounts', '0004_auto_20250224_1821'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='email',
            field=models.EmailField(blank=True, max_length=100, null=True, unique=True),
        ),
    ]