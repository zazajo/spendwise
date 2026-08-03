"""Month-boundary helpers.

Several apps need "the first and last day of month X". Doing that inline
invites the classic off-by-a-month bugs - `replace(day=31)` blows up in
February, and `date - timedelta(days=30)` drifts. Route it through here
instead.
"""

from calendar import monthrange
from datetime import date, timedelta


def month_bounds(year: int, month: int) -> tuple[date, date]:
    """First and last day of the given month, inclusive."""
    last_day = monthrange(year, month)[1]
    return date(year, month, 1), date(year, month, last_day)


def month_start(reference: date) -> date:
    """First day of the month `reference` falls in."""
    return reference.replace(day=1)


def previous_month_bounds(reference: date) -> tuple[date, date]:
    """First and last day of the month before the one `reference` falls in."""
    last_day_of_previous = month_start(reference) - timedelta(days=1)
    return month_bounds(last_day_of_previous.year, last_day_of_previous.month)


def month_offset(reference: date, months_back: int) -> tuple[date, date]:
    """Bounds of the month `months_back` months before `reference`'s month.

    Counts calendar months rather than subtracting 30-day blocks, so a
    six-month window lands on six distinct months regardless of their length.
    """
    month_index = reference.year * 12 + (reference.month - 1) - months_back
    return month_bounds(month_index // 12, month_index % 12 + 1)
