"""Keep cached budget totals in step with the expenses behind them.

`Budget.spent_amount`, `remaining_amount`, and `percentage_used` are stored
columns rather than values derived on read, so they only ever change when
something calls `update_spent_amount()`. The viewset does that on
create/update/refresh, which left every other path stale: adding, editing, or
deleting an expense silently invalidated the numbers on any budget covering it,
and `summary()`/the analytics dashboard inherited the drift because they just
sum the cached column.

These receivers close that gap by recalculating the budgets an expense actually
falls into - on both sides of an edit, so moving an expense between categories
or months repairs the budget it left as well as the one it joined.
"""

from django.db.models import Q
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from expenses.models import Expense

from .models import Budget

# Stashed on the in-memory Expense by pre_save so post_save can still see where
# the row sat before the update overwrote it.
PREVIOUS_PLACEMENT_ATTR = '_budget_previous_placement'


def _refresh_budgets_covering(placements):
    """Recalculate every budget whose window contains one of these placements.

    `placements` is an iterable of `(user_id, category_id, date)` triples - one
    per position the expense has occupied.
    """
    covered = Q()
    for user_id, category_id, date in set(placements):
        # Expense.category is nullable (SET_NULL), and an uncategorised expense
        # belongs to no budget.
        if not (user_id and category_id and date):
            continue
        covered |= Q(user_id=user_id, category_id=category_id, start_date__lte=date) & (
            Q(end_date__isnull=True) | Q(end_date__gte=date)
        )

    # An empty Q() matches everything, so bail out rather than sweeping the
    # whole table when nothing was worth refreshing.
    if not covered:
        return

    for budget in Budget.objects.filter(covered):
        budget.update_spent_amount()


@receiver(pre_save, sender=Expense)
def remember_previous_placement(sender, instance, **kwargs):
    """Record where this expense sat before the edit, if it already existed."""
    previous = None
    if instance.pk:
        previous = (
            Expense.objects.filter(pk=instance.pk)
            .values_list('user_id', 'category_id', 'date')
            .first()
        )
    setattr(instance, PREVIOUS_PLACEMENT_ATTR, previous)


@receiver(post_save, sender=Expense)
def refresh_budgets_on_expense_save(sender, instance, **kwargs):
    placements = [(instance.user_id, instance.category_id, instance.date)]

    previous = getattr(instance, PREVIOUS_PLACEMENT_ATTR, None)
    if previous:
        placements.append(previous)

    _refresh_budgets_covering(placements)


@receiver(post_delete, sender=Expense)
def refresh_budgets_on_expense_delete(sender, instance, **kwargs):
    _refresh_budgets_covering([(instance.user_id, instance.category_id, instance.date)])
