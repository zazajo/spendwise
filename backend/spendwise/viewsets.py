"""Shared viewset behaviour."""

from rest_framework import status
from rest_framework.response import Response


class ReadSerializerResponseMixin:
    """Render write responses with the full read serializer.

    Several viewsets swap in a slimmed-down `*CreateSerializer` for writes.
    That is the right call for *parsing* input - it keeps the writable surface
    small - but it makes a poor response body: DRF echoes the same serializer
    back, so the client gets only the fields it just sent. No `id`, no computed
    fields, no nested category or splits, which leaves callers unable to store
    or navigate to the thing they just created without a second request.

    Set `read_serializer_class` to the serializer the detail endpoint uses and
    writes will answer with the same representation a subsequent GET would.
    """

    read_serializer_class = None

    def get_read_serializer(self, instance):
        serializer_class = self.read_serializer_class or self.get_serializer_class()
        return serializer_class(instance, context=self.get_serializer_context())

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        data = self.get_read_serializer(serializer.instance).data
        return Response(data, status=status.HTTP_201_CREATED, headers=self.get_success_headers(data))

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Matches DRF's own UpdateModelMixin: a write can invalidate anything
        # prefetched when the instance was loaded.
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(self.get_read_serializer(serializer.instance).data)
