from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from rest_framework.permissions import IsAuthenticated
from spendwise.date_ranges import month_start
from spendwise.permissions import IsOwner
from spendwise.viewsets import ReadSerializerResponseMixin
from .models import PaymentMethod, Expense
from .serializers import (
    PaymentMethodSerializer, ExpenseSerializer, ExpenseCreateSerializer,
)

class PaymentMethodViewSet(viewsets.ModelViewSet):
    """ViewSet for managing payment methods"""
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def set_default(self, request, pk=None):
        """Set this payment method as default"""
        payment_method = self.get_object()
        
        # Unset any existing default
        PaymentMethod.objects.filter(user=request.user, is_default=True).update(is_default=False)
        
        # Set this as default
        payment_method.is_default = True
        payment_method.save()
        
        return Response({'status': 'default payment method set'})


class ExpenseViewSet(ReadSerializerResponseMixin, viewsets.ModelViewSet):
    """ViewSet for managing expenses"""
    read_serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'payment_method', 'payment_status', 'is_group_expense', 'is_anomaly']
    search_fields = ['description', 'notes', 'location']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date', '-created_at']

    def get_queryset(self):
        """Filter expenses to current user only"""
        # ExpenseSerializer reads user.username, category (nested serializer),
        # and payment_method.name, so without these joins a list page costs
        # three extra queries per row.
        queryset = Expense.objects.filter(user=self.request.user).select_related(
            'user', 'category', 'payment_method'
        )

        # Date filtering
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Year/Month filtering
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        
        if year and month:
            queryset = queryset.filter(date__year=year, date__month=month)
        elif year:
            queryset = queryset.filter(date__year=year)
        
        # Category filtering
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        
        return queryset.select_related('category', 'payment_method', 'group')

    def get_serializer_class(self):
        if self.action == 'create':
            return ExpenseCreateSerializer
        return ExpenseSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        """Ensure user can't change ownership"""
        serializer.save(user=self.request.user)

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        # If it's a group expense, also check group membership
        if obj.is_group_expense and obj.group:
            if not obj.group.members.filter(id=request.user.id).exists():
                self.permission_denied(request, "You must be a group member to access this expense.")

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get expense summary statistics"""
        queryset = self.get_queryset()
        
        total_amount = queryset.aggregate(Sum('amount'))['amount__sum'] or 0
        expense_count = queryset.count()
        average_amount = total_amount / expense_count if expense_count > 0 else 0
        
        # Category breakdown
        category_breakdown = queryset.values(
            'category__id', 'category__name', 'category__color'
        ).annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('-total')
        
        # Daily totals for the current month
        today = timezone.now().date()
        first_day = month_start(today)
        daily_totals = queryset.filter(
            date__gte=first_day,
            date__lte=today
        ).values('date').annotate(
            daily_total=Sum('amount')
        ).order_by('date')
        
        return Response({
            'total_amount': total_amount,
            'expense_count': expense_count,
            'average_amount': average_amount,
            'category_breakdown': category_breakdown,
            'daily_totals': daily_totals
        })

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent expenses (last 30 days)"""
        thirty_days_ago = timezone.now().date() - timedelta(days=30)
        expenses = self.get_queryset().filter(date__gte=thirty_days_ago)[:20]
        serializer = self.get_serializer(expenses, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get monthly expense summary for the year"""
        year = request.query_params.get('year', timezone.now().year)
        
        monthly_totals = self.get_queryset().filter(
            date__year=year
        ).values('date__month').annotate(
            total=Sum('amount'),
            count=Count('id')
        ).order_by('date__month')
        
        # Format month names
        months = []
        for item in monthly_totals:
            month_num = item['date__month']
            months.append({
                'month': month_num,
                'month_name': timezone.datetime(int(year), month_num, 1).strftime('%B'),
                'total': item['total'],
                'count': item['count']
            })
        
        return Response(months)

    @action(detail=True, methods=['get'])
    def group_details(self, request, pk=None):
        """Get group details for a group expense"""
        expense = self.get_object()
        if expense.is_group_expense and expense.group:
            from groups.serializers import GroupSerializer
            serializer = GroupSerializer(expense.group, context={'request': request})
            return Response(serializer.data)
        return Response({'error': 'Not a group expense'}, status=status.HTTP_400_BAD_REQUEST)