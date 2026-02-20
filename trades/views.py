from rest_framework import viewsets, permissions
from .models import Trade, Strategy, AnalyticsSnapshot
from .serializers import TradeSerializer, StrategySerializer, AnalyticsSnapshotSerializer

class TradeViewSet(viewsets.ModelViewSet):
    queryset = Trade.objects.all()
    serializer_class = TradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Trade.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class StrategyViewSet(viewsets.ModelViewSet):
    queryset = Strategy.objects.all()
    serializer_class = StrategySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Strategy.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AnalyticsSnapshotViewSet(viewsets.ModelViewSet):
    queryset = AnalyticsSnapshot.objects.all()
    serializer_class = AnalyticsSnapshotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AnalyticsSnapshot.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
