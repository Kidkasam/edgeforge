from rest_framework import serializers
from .models import Trade, Strategy, AnalyticsSnapshot

class TradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = '__all__'
        read_only_fields = ['user']

class StrategySerializer(serializers.ModelSerializer):
    class Meta:
        model = Strategy
        fields = '__all__'
        read_only_fields = ['user']

class AnalyticsSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsSnapshot
        fields = '__all__'
        read_only_fields = ['user']
