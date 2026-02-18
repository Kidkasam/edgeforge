from django.db import models
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
    buy_sell = models.CharField(max_length=4, choices=BUY_SELL_CHOICES) 
    entry_price = models.FloatField()
    exit_price = models.FloatField()
    stop_loss = models.FloatField()
    take_profit = models.FloatField()
    lot_size = models.FloatField()
    trading_session = models.CharField(max_length=10, choices=SESSION_CHOICES, blank=True)
    trade_date = models.DateField()
    reflection = models.TextField(blank=True)
    
    
    profit_loss = models.FloatField(default=0)
    pips = models.FloatField(default=0)
    risk_reward = models.FloatField(default=0)
    
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-trade_date', '-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.market_pair} - {self.trade_date}"

    def save(self, *args, **kwargs):
       
        if self.entry_price and self.stop_loss and self.take_profit and self.exit_price:

            if self.buy_sell == 'BUY':
                self.profit_loss = (self.exit_price - self.entry_price) * self.lot_size
                self.pips = (self.exit_price - self.entry_price) * 10000
                self.risk_reward = abs((self.take_profit - self.entry_price) / (self.entry_price - self.stop_loss))
            elif self.buy_sell == 'SELL':
                self.profit_loss = (self.entry_price - self.exit_price) * self.lot_size
                self.pips = (self.entry_price - self.exit_price) * 10000
                self.risk_reward = abs((self.entry_price - self.take_profit) / (self.stop_loss - self.entry_price))

        super().save(*args, **kwargs)
