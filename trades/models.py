from django.db import models
# Add this at the top:
from django.contrib.auth.models import User


class Trade(models.Model):

    BUY_SELL_CHOICES = [
        ('BUY', 'Buy'),
        ('SELL', 'Sell'),
    ]

    SESSION_CHOICES = [
        ('ASIA', 'Asian'),
        ('LONDON','London'),
        ('NY', 'New York'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trades')
    market_pair = models.CharField(max_length=6)
    buy_sell = models.CharField(max_length=4, choices=BUY_SELL_CHOICES ) 
    entry_price = models.FloatField()
    exit_price = models.FloatField()
    stop_loss = models.FloatField()
    take_profit = models.FloatField()
    lot_size = models.FloatField()
    trading_session = models.CharField(max_length = 10, choices=SESSION_CHOICES, blank=True)
    trade_date =  models.DateField()
    reflection = models.TextField(blank=True)
    profit_loss = models.FloatField(default=0)
    pips = models.FloatField(default=0)
    risk_reward = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.market_pair} - {self.trade_date}"

    def save(self, *args, **kwargs):
        if self.entry_price and self.stop_loss and self.take_profit:

            pass
        super().save(*args, **kwargs)

# Create your models here.
