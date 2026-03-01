from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator

class Strategy(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='strategies')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    class Meta:
        verbose_name_plural = "Strategies"

class Trade(models.Model):
    BUY_SELL_CHOICES = [
        ('BUY', 'Buy'),
        ('SELL', 'Sell'),
    ]

    SESSION_CHOICES = [
        ('ASIA', 'Asian'),
        ('LONDON', 'London'),
        ('NY', 'New York'),
    ]

    OUTCOME_CHOICES = [
        ('WIN', 'Win'),
        ('LOSS', 'Loss'),
        ('BE', 'Breakeven'),
    ]


    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    market_pair = models.CharField(max_length=15, db_index=True)
    buy_sell = models.CharField(max_length=4, choices=BUY_SELL_CHOICES)
    entry_price = models.FloatField()
    exit_price = models.FloatField()
    stop_loss = models.FloatField()
    take_profit = models.FloatField()
    lot_size = models.FloatField(validators=[MinValueValidator(0.01)])
    trading_session = models.CharField(max_length=10, choices=SESSION_CHOICES, blank=True)
    trade_date = models.DateField(db_index=True)
    reflection = models.TextField(blank=True)
    strategies = models.ManyToManyField(Strategy, related_name='trades', blank=True)
    screenshot = models.ImageField(upload_to='trade_screenshots/', blank=True, null=True)


    commission = models.FloatField(default=0.0)
    swap_fees = models.FloatField(default=0.0)


    pips = models.FloatField(default=0.0, editable=False)
    profit_loss = models.FloatField(default=0.0, editable=False)
    risk_reward = models.FloatField(default=0.0, editable=False)
    risk_amount = models.FloatField(default=0.0, editable=False)
    is_winner = models.BooleanField(default=False, editable=False)
    outcome = models.CharField(max_length=10, choices=OUTCOME_CHOICES, editable=False, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        pass

    def __str__(self):
        return f"{self.market_pair} ({self.buy_sell}) - {self.trade_date}"

    def save(self, *args, **kwargs):

        pair = self.market_pair.upper()
        if "JPY" in pair:
            multiplier = 100
        elif "XAU" in pair or "GOLD" in pair:
            multiplier = 10
        elif any(idx in pair for idx in ["US30", "NAS100", "GER30", "SPX", "UK100", "NDX", "DAX"]):
            multiplier = 1
        else:
            multiplier = 10000


        self.pips = round(abs(self.exit_price - self.entry_price) * multiplier, 2)


        if self.buy_sell == 'BUY':
            raw_pl = (self.exit_price - self.entry_price) * self.lot_size * multiplier
        else:
            raw_pl = (self.entry_price - self.exit_price) * self.lot_size * multiplier

        self.profit_loss = round(raw_pl - self.commission + self.swap_fees, 2)


        try:
            if self.buy_sell == 'BUY':
                risk = abs(self.entry_price - self.stop_loss)
                reward = abs(self.take_profit - self.entry_price)
            else:
                risk = abs(self.stop_loss - self.entry_price)
                reward = abs(self.entry_price - self.take_profit)

            if risk > 0:
                self.risk_reward = round(reward / risk, 2)
            else:
                self.risk_reward = 0.0
        except ZeroDivisionError:
            self.risk_reward = 0.0


        if self.buy_sell == 'BUY':
            self.risk_amount = round(abs(self.entry_price - self.stop_loss) * self.lot_size * multiplier, 2)
        else:
            self.risk_amount = round(abs(self.stop_loss - self.entry_price) * self.lot_size * multiplier, 2)


        if self.profit_loss > 0:
            self.outcome = 'WIN'
            self.is_winner = True
        elif self.profit_loss < 0:
            self.outcome = 'LOSS'
            self.is_winner = False
        else:
            self.outcome = 'BE'
            self.is_winner = False

        super().save(*args, **kwargs)





