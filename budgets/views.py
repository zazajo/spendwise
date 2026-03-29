from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from expense_trackerapi.permissions import IsOwner
from .models import Budget, BudgetAlert
from .serializers import (
    BudgetSerializer, BudgetCreateSerializer, 
    BudgetAlertSerializer
)

class BudgetViewSet(viewsets.ModelViewSet):
    """ViewSet for managing budgets"""
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'period', 'is_active']
    search_fields = ['category__name']
    ordering_fields = ['amount', 'start_date', 'percentage_used']
    ordering = ['start_date']

    def get_queryset(self):
        queryset = Budget.objects.filter(user=self.request.user)
        
        # Filter by active status
        if self.request.query_params.get('active_only') == 'true':
            queryset = queryset.filter(is_active=True)
        
        # Filter by date
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        
        if year and month:
            queryset = queryset.filter(
                start_date__year=year,
                start_date__month=month
            )
        elif year:
            queryset = queryset.filter(start_date__year=year)
        
        return queryset.select_related('category')

    def get_serializer_class(self):
        if self.action == 'create':
            return BudgetCreateSerializer
        return BudgetSerializer

    def perform_create(self, serializer):
        budget = serializer.save(user=self.request.user)
        # Initial calculation of spent amount
        budget.update_spent_amount()
    
    def perform_update(self, serializer):
        budget = serializer.save(user=self.request.user)
        budget.update_spent_amount()

    @action(detail=True, methods=['post'])
    def refresh(self, request, pk=None):
        """Refresh budget spent amount"""
        budget = self.get_object()
        budget.update_spent_amount()
        serializer = self.get_serializer(budget)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get budget summary statistics"""
        budgets = self.get_queryset().filter(is_active=True)
        
        total_budget = budgets.aggregate(Sum('amount'))['amount__sum'] or 0
        total_spent = budgets.aggregate(Sum('spent_amount'))['spent_amount__sum'] or 0
        
        # Count budgets by status
        on_track = budgets.filter(percentage_used__lt=50).count()
        warning = budgets.filter(
            percentage_used__gte=50,
            percentage_used__lt=80
        ).count()
        critical = budgets.filter(
            percentage_used__gte=80,
            percentage_used__lt=100
        ).count()
        exceeded = budgets.filter(percentage_used__gte=100).count()
        
        return Response({
            'total_budget': total_budget,
            'total_spent': total_spent,
            'remaining_total': total_budget - total_spent,
            'budgets_count': budgets.count(),
            'status_breakdown': {
                'on_track': on_track,
                'warning': warning,
                'critical': critical,
                'exceeded': exceeded
            }
        })

    @action(detail=False, methods=['get'])
    def alerts(self, request):
        """Get budgets that need attention"""
        budgets = self.get_queryset().filter(
            is_active=True,
            percentage_used__gte=80
        ).order_by('-percentage_used')
        
        serializer = self.get_serializer(budgets, many=True)
        return Response(serializer.data)


class BudgetAlertViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing budget alerts"""
    serializer_class = BudgetAlertSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['alert_type', 'is_read']
    ordering_fields = ['sent_at']
    ordering = ['-sent_at']

    def get_queryset(self):
        return BudgetAlert.objects.filter(
            budget__user=self.request.user
        ).select_related('budget', 'budget__category')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark alert as read"""
        alert = self.get_object()
        alert.is_read = True
        alert.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all alerts as read"""
        self.get_queryset().update(is_read=True)
        return Response({'status': 'all alerts marked as read'})