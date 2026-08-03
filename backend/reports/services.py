import csv
import json
from io import StringIO
from datetime import datetime, timedelta
from decimal import Decimal
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from django.core.mail import EmailMessage
from expenses.models import Expense
from budgets.models import Budget
from categories.models import Category
from groups.models import GroupExpense, GroupExpenseSplit, Group
from .models import Report, ScheduledReport


class ReportService:
    """Service class for generating reports"""
    
    def __init__(self, user):
        self.user = user
    
    def generate_monthly_summary(self, year=None, month=None):
        """Generate monthly expense summary"""
        today = timezone.now().date()
        year = year or today.year
        month = month or today.month
        
        # Get start and end dates
        start_date = datetime(year, month, 1).date()
        if month == 12:
            end_date = datetime(year + 1, 1, 1).date() - timedelta(days=1)
        else:
            end_date = datetime(year, month + 1, 1).date() - timedelta(days=1)
        
        # Get expenses for the month
        expenses = Expense.objects.filter(
            user=self.user,
            date__gte=start_date,
            date__lte=end_date
        )
        
        total_spent = expenses.aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Category breakdown
        category_breakdown = expenses.values(
            'category__name', 'category__color'
        ).annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')
        
        # Find top category
        top_category = category_breakdown.first()
        
        # Daily spending
        daily_spending = expenses.values('date').annotate(
            daily_total=Sum('amount')
        ).order_by('date')
        
        # Compare with previous month
        if month == 1:
            prev_year = year - 1
            prev_month = 12
        else:
            prev_year = year
            prev_month = month - 1
        
        if prev_month == 12:
            prev_end_date = datetime(prev_year, 12, 31).date()
        else:
            prev_end_date = datetime(prev_year, prev_month + 1, 1).date() - timedelta(days=1)
        prev_start_date = datetime(prev_year, prev_month, 1).date()
        
        prev_expenses = Expense.objects.filter(
            user=self.user,
            date__gte=prev_start_date,
            date__lte=prev_end_date
        )
        prev_total = prev_expenses.aggregate(Sum('amount'))['amount__sum'] or 0
        
        change_percentage = 0
        if prev_total > 0:
            change_percentage = ((total_spent - prev_total) / prev_total) * 100
        
        return {
            'month': start_date.strftime('%B'),
            'year': year,
            'start_date': start_date,
            'end_date': end_date,
            'total_spent': total_spent,
            'top_category': top_category['category__name'] if top_category else 'None',
            'top_category_amount': top_category['total'] if top_category else 0,
            'category_breakdown': list(category_breakdown),
            'daily_spending': list(daily_spending),
            'previous_month_total': prev_total,
            'change_percentage': change_percentage,
            'trend': 'up' if change_percentage > 0 else 'down' if change_percentage < 0 else 'stable'
        }
    
    def generate_category_breakdown(self, start_date=None, end_date=None):
        """Generate category breakdown report"""
        today = timezone.now().date()
        start_date = start_date or today.replace(day=1)
        end_date = end_date or today
        
        expenses = Expense.objects.filter(
            user=self.user,
            date__gte=start_date,
            date__lte=end_date
        )
        
        total = expenses.aggregate(Sum('amount'))['amount__sum'] or 0
        
        categories = []
        for category in Category.objects.filter(user=self.user, category_type='expense'):
            cat_expenses = expenses.filter(category=category)
            cat_total = cat_expenses.aggregate(Sum('amount'))['amount__sum'] or 0
            percentage = (cat_total / total * 100) if total > 0 else 0
            
            categories.append({
                'category_id': category.id,
                'category_name': category.name,
                'color': category.color,
                'total': cat_total,
                'percentage': percentage,
                'transaction_count': cat_expenses.count(),
                'average_amount': cat_expenses.aggregate(Avg('amount'))['amount__avg'] or 0
            })
        
        # Sort by total descending
        categories.sort(key=lambda x: x['total'], reverse=True)
        
        return {
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'total_expenses': total,
            'total_transactions': expenses.count(),
            'categories': categories
        }
    
    def generate_budget_variance(self, year=None, month=None):
        """Generate budget vs actual report"""
        today = timezone.now().date()
        year = year or today.year
        month = month or today.month
        
        start_date = datetime(year, month, 1).date()
        if month == 12:
            end_date = datetime(year + 1, 1, 1).date() - timedelta(days=1)
        else:
            end_date = datetime(year, month + 1, 1).date() - timedelta(days=1)
        
        budgets = Budget.objects.filter(
            user=self.user,
            is_active=True,
            start_date__lte=end_date
        )
        
        expenses = Expense.objects.filter(
            user=self.user,
            date__gte=start_date,
            date__lte=end_date
        )
        
        variance_report = []
        total_budget = 0
        total_actual = 0
        
        for budget in budgets:
            category_expenses = expenses.filter(category=budget.category)
            actual = category_expenses.aggregate(Sum('amount'))['amount__sum'] or 0
            variance = actual - budget.amount
            variance_percentage = (variance / budget.amount * 100) if budget.amount > 0 else 0
            
            total_budget += budget.amount
            total_actual += actual
            
            variance_report.append({
                'category_id': budget.category.id,
                'category_name': budget.category.name,
                'budget_amount': budget.amount,
                'actual_amount': actual,
                'variance': variance,
                'variance_percentage': variance_percentage,
                'status': 'under' if variance < 0 else 'over' if variance > 0 else 'on_track'
            })
        
        total_variance = total_actual - total_budget
        total_variance_percentage = (total_variance / total_budget * 100) if total_budget > 0 else 0
        
        return {
            'period': {
                'year': year,
                'month': month,
                'month_name': start_date.strftime('%B')
            },
            'total_budget': total_budget,
            'total_actual': total_actual,
            'total_variance': total_variance,
            'total_variance_percentage': total_variance_percentage,
            'categories': variance_report
        }
    
    def generate_group_summary(self, group_id):
        """Generate summary report for a group"""
        try:
            group = Group.objects.get(id=group_id, members=self.user)
        except Group.DoesNotExist:
            return None
        
        expenses = GroupExpense.objects.filter(group=group)
        
        total_expenses = expenses.aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Member breakdown
        member_spending = []
        for member in group.members.all():
            paid = expenses.filter(paid_by=member).aggregate(Sum('amount'))['amount__sum'] or 0
            owes = GroupExpenseSplit.objects.filter(
                group_expense__group=group,
                user=member,
                is_paid=False
            ).aggregate(Sum('amount'))['amount__sum'] or 0
            
            member_spending.append({
                'user_id': member.id,
                'username': member.username,
                'paid': paid,
                'owes': owes,
                'net_balance': paid - owes
            })
        
        # Top expenses
        top_expenses = expenses.order_by('-amount')[:5]
        
        return {
            'group_name': group.name,
            'group_id': group.id,
            'total_members': group.members.count(),
            'total_expenses': total_expenses,
            'total_transactions': expenses.count(),
            'member_spending': member_spending,
            'top_expenses': [
                {
                    'description': exp.description,
                    'amount': exp.amount,
                    'paid_by': exp.paid_by.username,
                    'date': exp.date
                }
                for exp in top_expenses
            ]
        }
    
    def export_to_csv(self, data, filename):
        """Export data to CSV"""
        output = StringIO()
        if isinstance(data, dict):
            # Handle dictionary data
            writer = csv.writer(output)
            for key, value in data.items():
                if isinstance(value, list):
                    writer.writerow([key])
                    for item in value:
                        if isinstance(item, dict):
                            writer.writerow([f"  {k}: {v}" for k, v in item.items()])
                        else:
                            writer.writerow([f"  {item}"])
                else:
                    writer.writerow([f"{key}: {value}"])
        elif isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
            # Handle list of dictionaries
            writer = csv.DictWriter(output, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        
        return output.getvalue()
    
    def save_report(self, name, report_type, parameters, format='json'):
        """Save generated report"""
        report = Report.objects.create(
            user=self.user,
            name=name,
            report_type=report_type,
            format=format,
            parameters=parameters,
            is_generated=True
        )
        return report