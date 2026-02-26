from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Trade, Strategy

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
class TradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = [
            'id', 'user', 'market_pair', 'buy_sell', 'entry_price', 'exit_price', 
            'stop_loss', 'take_profit', 'lot_size', 'trading_session', 
            'trade_date', 'reflection', 'strategies', 'commission', 'swap_fees',
            'pips', 'profit_loss', 'risk_reward', 'risk_amount', 'is_winner', 'outcome',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['pips', 'profit_loss', 'risk_reward', 'is_winner', 'outcome', 'user']

class StrategySerializer(serializers.ModelSerializer):
    class Meta:
        model = Strategy
        fields = '__all__'
        read_only_fields = ['user']
