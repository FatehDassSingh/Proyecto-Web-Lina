from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        import sys
        if 'manage.py' not in sys.argv and 'pytest' not in sys.argv:
            try:
                from django.core.management import call_command
                call_command('migrate', interactive=False)
                call_command('seed_data', interactive=False)
            except Exception as e:
                print(f"[AUTO-MIGRATE / SEED WARNING]: {e}")

