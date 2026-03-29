from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from django.utils import timezone
from .models import Report, ScheduledReport
from .serializers import ReportSerializer, ScheduledReportSerializer
from .services import ReportService
from expense_trackerapi.permissions import IsOwner


class ReportViewSet(viewsets.ModelViewSet):
    """ViewSet for managing reports"""
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['report_type', 'format']
    search_fields = ['name']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Report.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate a new report"""
        report_type = request.data.get('report_type')
        name = request.data.get('name', f"{report_type.replace('_', ' ').title()} Report")
        parameters = request.data.get('parameters', {})
        format_type = request.data.get('format', 'json')
        
        service = ReportService(request.user)
        
        if report_type == 'monthly_summary':
            year = parameters.get('year')
            month = parameters.get('month')
            data = service.generate_monthly_summary(year, month)
        elif report_type == 'category_analysis':
            start_date = parameters.get('start_date')
            end_date = parameters.get('end_date')
            data = service.generate_category_breakdown(start_date, end_date)
        elif report_type == 'budget_variance':
            year = parameters.get('year')
            month = parameters.get('month')
            data = service.generate_budget_variance(year, month)
        elif report_type == 'group_summary':
            group_id = parameters.get('group_id')
            data = service.generate_group_summary(group_id)
        else:
            return Response(
                {'error': f'Unknown report type: {report_type}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save the report
        report = service.save_report(name, report_type, parameters, format_type)
        
        # Export if needed
        if format_type == 'csv':
            csv_data = service.export_to_csv(data, name)
            response = HttpResponse(csv_data, content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{name}.csv"'
            return response
        
        return Response({
            'report_id': report.id,
            'data': data,
            'generated_at': report.created_at
        })

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download a report"""
        report = self.get_object()
        
        if not report.is_generated:
            return Response(
                {'error': 'Report not generated yet'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Re-generate the report data
        service = ReportService(request.user)
        
        if report.report_type == 'monthly_summary':
            data = service.generate_monthly_summary(
                report.parameters.get('year'),
                report.parameters.get('month')
            )
        elif report.report_type == 'category_analysis':
            data = service.generate_category_breakdown(
                report.parameters.get('start_date'),
                report.parameters.get('end_date')
            )
        elif report.report_type == 'budget_variance':
            data = service.generate_budget_variance(
                report.parameters.get('year'),
                report.parameters.get('month')
            )
        elif report.report_type == 'group_summary':
            data = service.generate_group_summary(
                report.parameters.get('group_id')
            )
        else:
            data = {}
        
        if report.format == 'csv':
            csv_data = service.export_to_csv(data, report.name)
            response = HttpResponse(csv_data, content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{report.name}.csv"'
            return response
        
        return Response(data)

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Quick monthly summary endpoint"""
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        
        service = ReportService(request.user)
        data = service.generate_monthly_summary(year, month)
        
        return Response(data)

    @action(detail=False, methods=['get'])
    def category_breakdown(self, request):
        """Quick category breakdown endpoint"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        service = ReportService(request.user)
        data = service.generate_category_breakdown(start_date, end_date)
        
        return Response(data)

    @action(detail=False, methods=['get'])
    def budget_variance(self, request):
        """Quick budget variance endpoint"""
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        
        service = ReportService(request.user)
        data = service.generate_budget_variance(year, month)
        
        return Response(data)


class ScheduledReportViewSet(viewsets.ModelViewSet):
    """ViewSet for managing scheduled reports"""
    serializer_class = ScheduledReportSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['report_type', 'frequency', 'is_active']
    ordering_fields = ['next_send', 'created_at']
    ordering = ['next_send']

    def get_queryset(self):
        return ScheduledReport.objects.filter(user=self.request.user)