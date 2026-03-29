from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import viewsets

@method_decorator(csrf_exempt, name='dispatch')
class CsrfExemptViewSet(viewsets.ModelViewSet):
    """Base ViewSet that disables CSRF protection"""
    pass

@method_decorator(csrf_exempt, name='dispatch')
class CsrfExemptReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    """Base ReadOnly ViewSet that disables CSRF protection"""
    pass