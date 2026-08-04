from django.apps import AppConfig


class BudgetsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'budgets'

    def ready(self):
        # Registers the Expense receivers that keep cached budget totals fresh.
        from . import signals  # noqa: F401
