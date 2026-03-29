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
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)