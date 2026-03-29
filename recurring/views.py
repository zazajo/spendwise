from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from expense_trackerapi.permissions import IsOwner
from .models import RecurringExpense, RecurringExpenseLog
from .serializers import (
    RecurringExpenseSerializer, 
    RecurringExpenseLogSerializer,
    RecurringExpenseBatchSerializer
)
from expense_trackerapi.views import CsrfExemptViewSet, CsrfExemptReadOnlyViewSet

class RecurringExpenseViewSet(CsrfExemptViewSet):
    """ViewSet for managing recurring expenses"""
    serializer_class = RecurringExpenseSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'payment_method', 'frequency', 'is_active']
    search_fields = ['description']
    ordering_fields = ['next_occurrence', 'amount', 'start_date']
    ordering = ['next_occurrence']

    def get_queryset(self):
        return RecurringExpense.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def generate_next(self, request, pk=None):
        """
        Generate an expense from this recurring template (next occurrence)
        """
        recurring = self.get_object()
        
        if not recurring.is_active:
            return Response(
                {'error': 'This recurring expense is inactive'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if recurring.end_date and recurring.next_occurrence > recurring.end_date:
            return Response(
                {'error': 'This recurring expense has ended'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            expense = recurring.generate_expense()
            from expenses.serializers import ExpenseSerializer
            serializer = ExpenseSerializer(expense, context={'request': request})
            return Response({
                'message': 'Expense generated successfully',
                'expense': serializer.data,
                'next_occurrence': recurring.next_occurrence
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def generate_for_date(self, request, pk=None):
        """
        Generate an expense for a specific date
        """
        recurring = self.get_object()
        expense_date = request.data.get('date')
        
        if not expense_date:
            return Response(
                {'error': 'Date is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from datetime import datetime
            expense_date = datetime.strptime(expense_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            expense = recurring.generate_expense(expense_date)
            from expenses.serializers import ExpenseSerializer
            serializer = ExpenseSerializer(expense, context={'request': request})
            return Response({
                'message': 'Expense generated successfully',
                'expense': serializer.data
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def upcoming(self, request, pk=None):
        """
        Preview upcoming dates without generating expenses
        """
        recurring = self.get_object()
        count = int(request.query_params.get('count', 5))
        
        upcoming_dates = recurring.get_upcoming_dates(count)
        
        dates_data = []
        for d in upcoming_dates:
            dates_data.append({
                'date': d,
                'amount': recurring.amount,
                'description': recurring.description,
                'days_until': (d - timezone.now().date()).days
            })
        
        return Response({
            'recurring_expense_id': recurring.id,
            'description': recurring.description,
            'amount': recurring.amount,
            'frequency': recurring.frequency,
            'upcoming_count': len(dates_data),
            'upcoming_dates': dates_data
        })

    @action(detail=False, methods=['post'])
    def generate_due(self, request):
        """
        Generate all expenses that are due (next_occurrence <= today)
        This is useful for a "Generate all due now" button
        """
        today = timezone.now().date()
        
        due_expenses = self.get_queryset().filter(
            is_active=True,
            next_occurrence__lte=today
        )
        
        if not due_expenses.exists():
            return Response({
                'message': 'No expenses are due',
                'generated_count': 0
            })
        
        generated = []
        errors = []
        
        for recurring in due_expenses:
            try:
                expense = recurring.generate_expense()
                from expenses.serializers import ExpenseSerializer
                generated.append(ExpenseSerializer(expense, context={'request': request}).data)
            except Exception as e:
                errors.append({
                    'id': recurring.id,
                    'description': recurring.description,
                    'error': str(e)
                })
        
        return Response({
            'message': f'Generated {len(generated)} expenses',
            'generated_count': len(generated),
            'generated': generated,
            'errors': errors if errors else None
        })

    @action(detail=False, methods=['post'])
    def generate_range(self, request):
        """
        Generate expenses for a date range
        """
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        recurring_ids = request.data.get('recurring_ids', [])
        
        if not start_date or not end_date:
            return Response(
                {'error': 'start_date and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from datetime import datetime
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get recurring expenses to process
        queryset = self.get_queryset().filter(is_active=True)
        if recurring_ids:
            queryset = queryset.filter(id__in=recurring_ids)
        
        if not queryset.exists():
            return Response({
                'message': 'No recurring expenses found',
                'generated_count': 0
            })
        
        generated = []
        errors = []
        
        for recurring in queryset:
            current_date = recurring.next_occurrence
            while current_date <= end:
                if current_date >= start:
                    try:
                        # Clone the recurring to avoid modifying the original
                        from copy import deepcopy
                        temp_recurring = deepcopy(recurring)
                        temp_recurring.next_occurrence = current_date
                        expense = temp_recurring.generate_expense()
                        
                        from expenses.serializers import ExpenseSerializer
                        generated.append(ExpenseSerializer(expense, context={'request': request}).data)
                    except Exception as e:
                        errors.append({
                            'id': recurring.id,
                            'description': recurring.description,
                            'date': current_date,
                            'error': str(e)
                        })
                
                # Calculate next date
                if recurring.frequency == 'daily':
                    current_date += timedelta(days=recurring.interval)
                elif recurring.frequency == 'weekly':
                    current_date += timedelta(weeks=recurring.interval)
                elif recurring.frequency == 'monthly':
                    from dateutil.relativedelta import relativedelta
                    current_date += relativedelta(months=recurring.interval)
                else:
                    break  # Stop for complex frequencies
        
        return Response({
            'message': f'Generated {len(generated)} expenses',
            'generated_count': len(generated),
            'generated': generated,
            'errors': errors if errors else None
        })

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Get dashboard summary of recurring expenses
        """
        queryset = self.get_queryset()
        
        # Summary stats
        total_active = queryset.filter(is_active=True).count()
        total_inactive = queryset.filter(is_active=False).count()
        
        # Upcoming this month
        today = timezone.now().date()
        end_of_month = today.replace(day=28) + timedelta(days=4)  # This will get us to next month
        end_of_month = end_of_month.replace(day=1) - timedelta(days=1)  # Last day of current month
        
        upcoming_this_month = queryset.filter(
            is_active=True,
            next_occurrence__lte=end_of_month,
            next_occurrence__gte=today
        ).order_by('next_occurrence')
        
        # Overdue
        overdue = queryset.filter(
            is_active=True,
            next_occurrence__lt=today
        ).order_by('next_occurrence')
        
        # Monthly total
        monthly_total = 0
        for rec in queryset.filter(is_active=True, frequency='monthly'):
            monthly_total += rec.amount
        
        upcoming_serializer = self.get_serializer(upcoming_this_month, many=True)
        overdue_serializer = self.get_serializer(overdue, many=True)
        
        return Response({
            'summary': {
                'total_active': total_active,
                'total_inactive': total_inactive,
                'estimated_monthly_total': monthly_total,
                'upcoming_this_month_count': upcoming_this_month.count(),
                'overdue_count': overdue.count()
            },
            'upcoming_this_month': upcoming_serializer.data,
            'overdue': overdue_serializer.data
        })

    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause a recurring expense"""
        recurring = self.get_object()
        recurring.is_active = False
        recurring.save()
        return Response({'status': 'paused'})

    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Resume a paused recurring expense"""
        recurring = self.get_object()
        recurring.is_active = True
        recurring.save()
        return Response({'status': 'resumed'})

    @action(detail=False, methods=['post'])
    def batch_action(self, request):
        """Perform batch actions on multiple recurring expenses"""
        serializer = RecurringExpenseBatchSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            ids = serializer.validated_data['recurring_expense_ids']
            action = serializer.validated_data['action']
            
            if action == 'activate':
                RecurringExpense.objects.filter(id__in=ids).update(is_active=True)
            elif action == 'deactivate':
                RecurringExpense.objects.filter(id__in=ids).update(is_active=False)
            elif action == 'delete':
                RecurringExpense.objects.filter(id__in=ids).delete()
            
            return Response({'status': f'{action} completed'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def upcoming_list(self, request):
        """Get upcoming recurring expenses (renamed from 'upcoming' to avoid conflict)"""
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date() + timedelta(days=days)
        
        upcoming = self.get_queryset().filter(
            is_active=True,
            next_occurrence__lte=end_date
        ).order_by('next_occurrence')
        
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)


class RecurringExpenseLogViewSet(CsrfExemptReadOnlyViewSet):
    """ViewSet for viewing recurring expense logs"""
    serializer_class = RecurringExpenseLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'scheduled_date']
    ordering_fields = ['scheduled_date', 'processed_date']
    ordering = ['-scheduled_date']

    def get_queryset(self):
        return RecurringExpenseLog.objects.filter(
            recurring_expense__user=self.request.user
        ).select_related('recurring_expense', 'expense')