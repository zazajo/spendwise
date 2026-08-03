from datetime import timedelta

from dateutil.relativedelta import relativedelta
from django.utils import timezone
from rest_framework import serializers

from .models import Report, ScheduledReport


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'name', 'report_type', 'format', 'parameters', 
                  'file', 'created_at', 'is_generated']
        read_only_fields = ['id', 'created_at', 'is_generated']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ScheduledReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledReport
        fields = ['id', 'name', 'report_type', 'format', 'frequency',
                  'parameters', 'last_sent', 'next_send', 'is_active', 'email']
        read_only_fields = ['id', 'last_sent', 'next_send']

    # next_send has no model default, so it must be computed here - mirrors
    # RecurringExpense.calculate_next_date()'s approach for the same problem.
    def _calculate_next_send(self, frequency):
        now = timezone.now()
        if frequency == 'daily':
            return now + timedelta(days=1)
        elif frequency == 'weekly':
            return now + timedelta(weeks=1)
        elif frequency == 'monthly':
            return now + relativedelta(months=1)
        return now + timedelta(days=1)

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['next_send'] = self._calculate_next_send(validated_data.get('frequency'))
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'frequency' in validated_data and validated_data['frequency'] != instance.frequency:
            validated_data['next_send'] = self._calculate_next_send(validated_data['frequency'])
        return super().update(instance, validated_data)