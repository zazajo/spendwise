"""One-off repair for budgets whose cached totals drifted.

Until the signals in budgets/signals.py landed, nothing recalculated
spent_amount/remaining_amount/percentage_used when an expense was added,
edited, or deleted - so any budget written before this migration can be
carrying numbers that never matched its expenses. The signals only cover
writes from here on, so sweep the existing rows once.
"""

from datetime import date

from django.db import migrations
from django.db.models import Sum


def recalculate_totals(apps, schema_editor):
    Budget = apps.get_model('budgets', 'Budget')
    Expense = apps.get_model('expenses', 'Expense')

    today = date.today()

    for budget in Budget.objects.all().iterator():
        # Mirrors Budget.update_spent_amount(); historical models built by
        # migrations don't carry custom methods, so the logic is repeated here.
        spent = Expense.objects.filter(
            user_id=budget.user_id,
            category_id=budget.category_id,
            date__gte=budget.start_date,
            date__lte=budget.end_date or today,
        ).aggregate(total=Sum('amount'))['total'] or 0

        budget.spent_amount = spent
        budget.remaining_amount = budget.amount - spent
        budget.percentage_used = float((spent / budget.amount) * 100) if budget.amount > 0 else 0
        budget.save(update_fields=['spent_amount', 'remaining_amount', 'percentage_used'])


class Migration(migrations.Migration):

    dependencies = [
        ('budgets', '0001_initial'),
        ('expenses', '0001_initial'),
    ]

    operations = [
        # Nothing to undo - the totals are a cache, and the reverse direction
        # would just be recomputing them again.
        migrations.RunPython(recalculate_totals, migrations.RunPython.noop),
    ]
