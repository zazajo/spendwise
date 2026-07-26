from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum
from rest_framework.permissions import IsAuthenticated
from spendwise.permissions import IsOwnerOrReadOnly
from .models import Category
from .serializers import CategorySerializer
from expenses.models import Expense

class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing categories.
    Users can only access their own categories.
    """
    serializer_class = CategorySerializer
    # IsOwnerOrReadOnly only guards object-level writes; without IsAuthenticated
    # here too, anonymous requests were reaching get_queryset() and blowing up
    # trying to filter by AnonymousUser.
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category_type', 'is_active', 'is_default']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['name']

    def get_queryset(self):
        """Filter categories to show only the current user's categories"""
        return Category.objects.filter(user=self.request.user).annotate(
            expense_count=Count('expenses'),
            total_spent=Sum('expenses__amount')
        )

    def perform_create(self, serializer):
        """Set the user to the current user when creating"""
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """Ensure user can't change the owner"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def expense_categories(self, request):
        """Get only expense-type categories"""
        categories = self.get_queryset().filter(category_type='expense')
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def income_categories(self, request):
        """Get only income-type categories"""
        categories = self.get_queryset().filter(category_type='income')
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get category summary with spending totals"""
        categories = self.get_queryset()
        
        # Get date filters
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        data = []
        for category in categories:
            expenses = Expense.objects.filter(
                user=request.user,
                category=category
            )
            
            if year and month:
                expenses = expenses.filter(date__year=year, date__month=month)
            elif year:
                expenses = expenses.filter(date__year=year)
                
            total_spent = expenses.aggregate(Sum('amount'))['amount__sum'] or 0
            
            data.append({
                'id': category.id,
                'name': category.name,
                'color': category.color,
                'icon': category.icon,
                'total_spent': total_spent,
                'expense_count': expenses.count()
            })
        
        return Response(data)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive a category (soft delete)"""
        category = self.get_object()
        category.is_active = False
        category.save()
        return Response({'status': 'archived'})

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Restore an archived category"""
        category = self.get_object()
        category.is_active = True
        category.save()
        return Response({'status': 'restored'})