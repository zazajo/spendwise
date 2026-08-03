# analytics/services.py
from django.db.models import Sum, Avg, Count
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import statistics
from expenses.models import Expense
from budgets.models import Budget
from spendwise.date_ranges import month_offset, month_start, previous_month_bounds
from .models import SpendingPattern, AnomalyRule, FinancialHealthMetric


class AnalyticsService:
    """Service class for analytics calculations"""
    
    def __init__(self, user):
        self.user = user
    
    def calculate_spending_patterns(self, category=None, period='monthly'):
        """Calculate spending patterns for anomaly detection"""
        # Determine date range
        today = timezone.now().date()
        if period == 'daily':
            start_date = today - timedelta(days=30)
        elif period == 'weekly':
            start_date = today - timedelta(weeks=12)
        else:  # monthly
            start_date = today - timedelta(days=365)
        
        # Get expenses
        expenses = Expense.objects.filter(
            user=self.user,
            date__gte=start_date,
            date__lte=today
        )
        
        if category:
            expenses = expenses.filter(category=category)
        
        # Even if no expenses, still create a pattern with default values
        if not expenses.exists():
            return {
                'average_amount': Decimal('0'),
                'median_amount': Decimal('0'),
                'std_deviation': 0,
                'frequency': 0,
                'trend_direction': 0
            }
        
        # Get amounts list
        amounts = [float(exp.amount) for exp in expenses]
        
        # Calculate statistics
        avg_amount = sum(amounts) / len(amounts)
        
        # Calculate median
        sorted_amounts = sorted(amounts)
        n = len(sorted_amounts)
        median = sorted_amounts[n//2] if n % 2 else (sorted_amounts[n//2 - 1] + sorted_amounts[n//2]) / 2
        
        # Calculate standard deviation
        if len(amounts) > 1:
            variance = sum((x - avg_amount) ** 2 for x in amounts) / len(amounts)
            std_dev = variance ** 0.5
        else:
            std_dev = 0
        
        # Calculate frequency
        frequency = len(amounts)
        
        # Calculate trend
        if len(amounts) >= 2:
            x = list(range(len(amounts)))
            slope = self._calculate_slope(x, amounts)
            trend_direction = slope
        else:
            trend_direction = 0
        
        return {
            'average_amount': Decimal(str(round(avg_amount, 2))),
            'median_amount': Decimal(str(round(median, 2))),
            'std_deviation': std_dev,
            'frequency': frequency,
            'trend_direction': trend_direction
        }
    
    def calculate_simple_pattern(self, category=None, period='monthly'):
        """Simplified pattern calculation that always returns data"""
        # Get expenses for this user
        expenses = Expense.objects.filter(user=self.user)
        
        if category:
            expenses = expenses.filter(category=category)
        
        # Calculate statistics
        stats = expenses.aggregate(
            avg=Avg('amount'),
            count=Count('id')
        )
        
        avg_amount = stats['avg'] if stats['avg'] else Decimal('0')
        expense_count = stats['count'] if stats['count'] else 0
        
        # Return only fields that exist in the SpendingPattern model
        return {
            'average_amount': avg_amount,
            'median_amount': avg_amount,
            'std_deviation': 0,
            'frequency': expense_count,
            'trend_direction': 0,
        }
    
    def detect_anomalies(self, expense=None):
        """Detect anomalies in expenses"""
        anomalies = []
        
        # Get active rules
        rules = AnomalyRule.objects.filter(user=self.user, is_active=True)
        
        # Get expenses to check
        if expense:
            expenses = [expense]
        else:
            thirty_days_ago = timezone.now().date() - timedelta(days=30)
            expenses = Expense.objects.filter(
                user=self.user,
                date__gte=thirty_days_ago,
                is_anomaly=False
            )
        
        for expense in expenses:
            # Skip if amount is below min threshold
            min_amount_rules = rules.filter(min_amount__lte=expense.amount)
            if not min_amount_rules.exists():
                continue
            
            # Get pattern for this category
            pattern = SpendingPattern.objects.filter(
                user=self.user,
                category=expense.category
            ).first()
            
            if not pattern:
                # No pattern yet, use default rule
                for rule in min_amount_rules:
                    anomaly_score = float(expense.amount) / float(rule.threshold_multiplier * 100)
                    if anomaly_score > 1:
                        anomalies.append({
                            'expense': expense,
                            'score': anomaly_score,
                            'reason': f'Amount exceeds threshold multiplier of {rule.threshold_multiplier}',
                            'severity': rule.severity
                        })
            else:
                # Compare with pattern
                avg_amount = float(pattern.average_amount)
                if avg_amount > 0:
                    upper_bound = avg_amount * 2
                    if float(expense.amount) > upper_bound:
                        anomaly_score = float(expense.amount) / upper_bound
                        anomalies.append({
                            'expense': expense,
                            'score': anomaly_score,
                            'reason': f'Amount ${expense.amount} is {anomaly_score:.1f}x higher than average (${avg_amount:.2f})',
                            'severity': 'high' if anomaly_score > 2 else 'medium'
                        })
        
        return anomalies
    
    def calculate_financial_health(self):
        """Calculate financial health score"""
        today = timezone.now().date()
        first_day_of_month = month_start(today)

        # Get this month's expenses
        expenses_this_month = Expense.objects.filter(
            user=self.user,
            date__gte=first_day_of_month,
            date__lte=today
        )
        
        total_expenses = expenses_this_month.aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        total_expenses_float = float(total_expenses)
        
        # 1. Budget Adherence Score
        budgets = Budget.objects.filter(
            user=self.user,
            is_active=True,
            start_date__lte=today
        )
        
        if budgets.exists():
            total_budget = budgets.aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
            total_budget_float = float(total_budget)
            if total_budget_float > 0:
                budget_used_percentage = (total_expenses_float / total_budget_float) * 100
                if budget_used_percentage <= 100:
                    budget_adherence = 100 - (budget_used_percentage * 0.5)
                else:
                    budget_adherence = max(0, 100 - (budget_used_percentage - 100))
            else:
                budget_adherence = 50
        else:
            budget_adherence = 50
        
        # 2. Spending Stability Score
        thirty_days_ago = today - timedelta(days=30)
        daily_spending = expenses_this_month.filter(
            date__gte=thirty_days_ago
        ).values('date').annotate(
            daily_total=Sum('amount')
        )
        
        daily_amounts = [float(d['daily_total']) for d in daily_spending if d['daily_total']]
        if len(daily_amounts) > 1:
            cv = statistics.stdev(daily_amounts) / (sum(daily_amounts) / len(daily_amounts))
            spending_stability = max(0, min(100, 100 - (cv * 50)))
        else:
            spending_stability = 70
        
        # 3. Savings Rate Score
        monthly_income = getattr(self.user.profile, 'monthly_income', None)
        if monthly_income and monthly_income > 0:
            savings_rate = max(0, (float(monthly_income) - total_expenses_float) / float(monthly_income) * 100)
            savings_score = min(100, savings_rate * 5)
        else:
            savings_score = 50
        
        # 4. Expense Consistency Score
        last_month_start, last_month_end = previous_month_bounds(today)
        last_month_expenses = Expense.objects.filter(
            user=self.user,
            date__gte=last_month_start,
            date__lte=last_month_end
        ).aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
        
        if last_month_expenses > 0:
            change = abs(float(total_expenses) - float(last_month_expenses)) / float(last_month_expenses)
            consistency_score = max(0, 100 - (change * 100))
        else:
            consistency_score = 50
        
        # Calculate overall score
        overall = (
            budget_adherence * 0.35 +
            spending_stability * 0.25 +
            savings_score * 0.25 +
            consistency_score * 0.15
        )
        
        # Generate recommendations
        recommendations = []
        if budget_adherence < 70:
            recommendations.append("You're exceeding your budget. Consider reviewing your spending categories.")
        if spending_stability < 60:
            recommendations.append("Your spending varies significantly. Try to create a more consistent spending pattern.")
        if savings_score < 50:
            recommendations.append("Consider increasing your savings rate by reducing non-essential expenses.")
        if consistency_score < 60:
            recommendations.append("Your expenses fluctuate month-to-month. Look for opportunities to stabilize your spending.")
        if total_expenses_float == 0:
            recommendations.append("Start tracking your expenses to get personalized recommendations.")
        
        if not recommendations:
            recommendations.append("Great job! You're managing your finances well. Keep it up!")
        
        return {
            'budget_adherence_score': int(budget_adherence),
            'spending_stability_score': int(spending_stability),
            'savings_rate_score': int(savings_score),
            'expense_consistency_score': int(consistency_score),
            'overall_score': int(overall),
            'total_monthly_expenses': total_expenses,
            'average_daily_spending': total_expenses / 30 if total_expenses > 0 else Decimal('0'),
            'expense_volatility': statistics.stdev(daily_amounts) if len(daily_amounts) > 1 else 0,
            'recommendations': recommendations
        }
    
    def get_spending_trends(self, months=6):
        """Get spending trends over time"""
        trends = []
        today = timezone.now().date()
        
        for i in range(months):
            # Step back whole calendar months. Subtracting 30-day blocks drifts
            # and can skip a short month entirely (from 1 March, i=1 lands in
            # January, dropping February from the series).
            month_start, month_end = month_offset(today, i)

            expenses = Expense.objects.filter(
                user=self.user,
                date__gte=month_start,
                date__lte=month_end
            )
            
            total = expenses.aggregate(Sum('amount'))['amount__sum'] or Decimal('0')
            
            category_breakdown = {}
            for expense in expenses:
                cat_name = expense.category.name if expense.category else 'Uncategorized'
                category_breakdown[cat_name] = category_breakdown.get(cat_name, 0) + float(expense.amount)
            
            trends.append({
                'year': month_start.year,
                'month': month_start.month,
                'month_name': month_start.strftime('%B'),
                'total_spent': total,
                'category_breakdown': category_breakdown
            })
        
        return trends
    
    def _calculate_slope(self, x, y):
        """Calculate slope for trend line"""
        n = len(x)
        if n == 0:
            return 0
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(x[i] * y[i] for i in range(n))
        sum_x2 = sum(x[i] ** 2 for i in range(n))
        
        try:
            slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
        except ZeroDivisionError:
            slope = 0
        return slope