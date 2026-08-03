from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum
from spendwise.permissions import IsOwner
from .models import SpendingPattern, AnomalyRule, FinancialHealthMetric
from .serializers import (
    SpendingPatternSerializer, AnomalyRuleSerializer,
    FinancialHealthMetricSerializer,
)
from .services import AnalyticsService
from expenses.models import Expense
from expenses.serializers import ExpenseSerializer

class AnalyticsViewSet(viewsets.GenericViewSet):
    """ViewSet for analytics and insights"""
    permission_classes = [IsAuthenticated]
    
    def get_analytics_service(self):
        return AnalyticsService(self.request.user)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get analytics dashboard summary"""
        service = self.get_analytics_service()
        
        # Get latest health metric
        health = FinancialHealthMetric.objects.filter(user=request.user).first()
        if health:
            health_serializer = FinancialHealthMetricSerializer(health)
        else:
            health_data = service.calculate_financial_health()
            health_serializer = FinancialHealthMetricSerializer(data=health_data)
            if health_serializer.is_valid():
                health_serializer.save(user=request.user)
        
        # Get spending trends
        trends = service.get_spending_trends(months=6)
        
        # Get recent anomalies
        anomalies = service.detect_anomalies()
        anomaly_data = []
        for anomaly in anomalies[:5]:  # Last 5 anomalies
            anomaly_data.append({
                'expense_id': anomaly['expense'].id,
                'amount': anomaly['expense'].amount,
                'description': anomaly['expense'].description,
                'date': anomaly['expense'].date,
                'category': anomaly['expense'].category.name if anomaly['expense'].category else 'Uncategorized',
                'anomaly_score': anomaly['score'],
                'reason': anomaly['reason'],
                'severity': anomaly['severity']
            })
        
        # Calculate monthly summary
        today = timezone.now().date()
        first_day = today.replace(day=1)
        monthly_expenses = Expense.objects.filter(
            user=request.user,
            date__gte=first_day,
            date__lte=today
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Compare with last month
        last_month = first_day - timezone.timedelta(days=1)
        last_month_start = last_month.replace(day=1)
        last_month_expenses = Expense.objects.filter(
            user=request.user,
            date__gte=last_month_start,
            date__lte=last_month
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        monthly_change = 0
        if last_month_expenses > 0:
            monthly_change = ((float(monthly_expenses) - float(last_month_expenses)) / float(last_month_expenses)) * 100
        
        return Response({
            'financial_health': health_serializer.data if hasattr(health_serializer, 'data') else health_serializer,
            'spending_trends': trends,
            'recent_anomalies': anomaly_data,
            'monthly_summary': {
                'current_month_total': monthly_expenses,
                'previous_month_total': last_month_expenses,
                'change_percentage': monthly_change,
                'trend': 'up' if monthly_change > 0 else 'down' if monthly_change < 0 else 'stable'
            }
        })
    
    @action(detail=False, methods=['post'])
    def refresh_health_score(self, request):
        """Refresh the financial health score"""
        service = self.get_analytics_service()
        health_data = service.calculate_financial_health()
        
        # Create new health metric
        serializer = FinancialHealthMetricSerializer(data=health_data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def detect_anomalies(self, request):
        """Detect anomalies in recent expenses"""
        service = self.get_analytics_service()
        anomalies = service.detect_anomalies()
        
        # Mark expenses as anomalies
        for anomaly in anomalies:
            expense = anomaly['expense']
            expense.is_anomaly = True
            expense.anomaly_score = anomaly['score']
            expense.anomaly_reason = anomaly['reason']
            expense.save()
        
        result_data = []
        for anomaly in anomalies:
            result_data.append({
                'expense_id': anomaly['expense'].id,
                'amount': anomaly['expense'].amount,
                'description': anomaly['expense'].description,
                'date': anomaly['expense'].date,
                'category': anomaly['expense'].category.name if anomaly['expense'].category else 'Uncategorized',
                'category_id': anomaly['expense'].category.id if anomaly['expense'].category else None,
                'anomaly_score': anomaly['score'],
                'reason': anomaly['reason'],
                'severity': anomaly['severity']
            })
        
        return Response({
            'total_anomalies': len(result_data),
            'anomalies': result_data
        })
    
    @action(detail=False, methods=['post'])
    def update_patterns(self, request):
        """Update spending patterns for all categories"""
        categories = request.data.get('categories', [])
        period = request.data.get('period', 'monthly')
        
        service = self.get_analytics_service()
        
        from categories.models import Category
        categories_qs = Category.objects.filter(user=request.user)
        
        if categories:
            categories_qs = categories_qs.filter(id__in=categories)

        if not categories_qs.exists():
            return Response({
                'message': 'No categories found. Please create a category first.',
                'patterns': [],
                'tip': 'Create a category using POST /api/categories/'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        patterns_created = []
        
        for category in categories_qs:
            # Get the pattern data without 'expense_count'
            pattern_data = service.calculate_simple_pattern(category=category, period=period)

            # Remove 'expense_count' if it exists in the data
            if 'expense_count' in pattern_data:
                del pattern_data['expense_count']

            # Create or update the pattern
            _, created = SpendingPattern.objects.update_or_create(
                user=request.user,
                category=category,
                period=period,
                defaults=pattern_data
            )

            patterns_created.append({
                'category': category.name,
                'category_id': category.id,
                'period': period,
                'average_amount': pattern_data.get('average_amount', 0),
                'frequency': pattern_data.get('frequency', 0),
                'status': 'created' if created else 'updated'
            })
        
        total_expenses = Expense.objects.filter(user=request.user).count()
        
        return Response({
            'message': f'Updated {len(patterns_created)} spending patterns',
            'patterns': patterns_created,
            'total_categories': categories_qs.count(),
            'total_expenses': total_expenses,
            'patterns_created_count': len(patterns_created)
        })
    
    @action(detail=False, methods=['get'])
    def category_analysis(self, request):
        """Get category spending analysis"""
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        
        from datetime import datetime, timedelta
        from django.db.models import Sum, Count
        from django.utils import timezone

        today = timezone.now().date()
        if year and month:
            year, month = int(year), int(month)
            start_date = datetime(year, month, 1).date()
            if month == 12:
                end_date = datetime(year + 1, 1, 1).date() - timedelta(days=1)
            else:
                end_date = datetime(year, month + 1, 1).date() - timedelta(days=1)
        else:
            start_date = today.replace(day=1)
            end_date = today
        
        category_spending = Expense.objects.filter(
            user=request.user,
            date__gte=start_date,
            date__lte=end_date
        ).values('category__id', 'category__name', 'category__color').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')
        
        # Calculate percentages
        total_spent = sum(c['total'] for c in category_spending if c['total'])
        
        for category in category_spending:
            category['percentage'] = (float(category['total']) / float(total_spent)) * 100 if total_spent > 0 else 0
        
        return Response({
            'period': {
                'year': year or today.year,
                'month': month or today.month
            },
            'total_spent': total_spent,
            'categories': list(category_spending)
        })


class SpendingPatternViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing spending patterns"""
    serializer_class = SpendingPatternSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        return SpendingPattern.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AnomalyRuleViewSet(viewsets.ModelViewSet):
    """ViewSet for managing anomaly detection rules"""
    serializer_class = AnomalyRuleSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        return AnomalyRule.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FinancialHealthMetricViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing financial health metrics"""
    serializer_class = FinancialHealthMetricSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    
    def get_queryset(self):
        return FinancialHealthMetric.objects.filter(user=self.request.user).order_by('-calculated_at')