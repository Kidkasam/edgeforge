from django.db.models import Avg, Sum
from trades.models import trades
from .models import snapshot


def generate_snapshot (user):
    trades = trades.object.filter(user=user)
    total_trades = trades.count()
    total_pnl = trades.aggregate(Sum("profit_loss"))["profit_loss__sum"] or 0
    winning_trades =  trades.filter(profit_loss__gt=0).count()
    losing_trades = trades.filter(profit_loss__lt = 0).count()

    win_rate = 0
    if winning_trades> 0:
        win_rate=(winning_trades/total_trades)*100

    winning_trades =  trades.filter(profit_loss__gt=0).count()
    losing_trades = trades.filter(profit_loss__lt = 0).count()

    avg_rr = trades.aggregate(Avg("risk_reward"))["risk_reward__avg"] or 0
    avg_win = trades.filter(profit_loss__gt=0).aggregate(Avg("profit_loss"))["profit_loss__avg"] or 0
    avg_loss = trades.filter(profit_loss__lt=0).aggregate(Avg("profit_loss"))["profit_loss__avg"]or 0


    snapshot = AnalyticsSnapshot.objects.create(
        user=user,
        total_trades=total_trades,
        total_pnl=total_pnl,
        win_rate=win_rate,
        avg_risk_reward=avg_rr,
        avg_win=avg_win,
        avg_loss=avg_loss,
        winning_trades=winning_trades,
        losing_trades=losing_trades,
    )