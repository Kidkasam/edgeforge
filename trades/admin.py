from django.contrib import admin
from django.utils.html import format_html
from .models import Trade, Strategy, EmailVerification

admin.site.site_header = "⚔️ EdgeForge Sovereign Engine"
admin.site.site_title = "EdgeForge Institutional Admin"
admin.site.index_title = "Sovereign Trade Management & Intelligence"

@admin.register(Trade)
class TradeAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'market_pair',
        'colored_buy_sell',
        'entry_price',
        'exit_price',
        'colored_pnl',
        'pips',
        'risk_reward',
        'colored_outcome',
        'trading_session',
        'trade_date',
        'screenshot_preview',
    )
    list_filter = (
        'outcome',
        'buy_sell',
        'trading_session',
        'trade_date',
        'strategies',
    )
    search_fields = (
        'user__username',
        'user__email',
        'market_pair',
        'reflection',
    )
    date_hierarchy = 'trade_date'
    ordering = ('-trade_date', '-created_at')
    readonly_fields = (
        'pips',
        'profit_loss',
        'risk_reward',
        'risk_amount',
        'is_winner',
        'outcome',
        'screenshot_preview',
        'created_at',
        'updated_at',
    )
    filter_horizontal = ('strategies',)

    def colored_buy_sell(self, obj):
        color = "#10b981" if obj.buy_sell == 'BUY' else "#ef4444"
        bg = "rgba(16, 185, 129, 0.15)" if obj.buy_sell == 'BUY' else "rgba(239, 68, 68, 0.15)"
        return format_html(
            '<span style="color: {}; background: {}; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">{}</span>',
            color, bg, obj.buy_sell
        )
    colored_buy_sell.short_description = "Side"

    def colored_pnl(self, obj):
        if obj.profit_loss > 0:
            color = "#10b981"
            prefix = "+"
        elif obj.profit_loss < 0:
            color = "#ef4444"
            prefix = ""
        else:
            color = "#f59e0b"
            prefix = ""
        return format_html(
            '<span style="color: {}; font-weight: bold; font-size: 13px;">{}${:,.2f}</span>',
            color, prefix, obj.profit_loss
        )
    colored_pnl.short_description = "P&L"

    def colored_outcome(self, obj):
        colors = {
            'WIN': ('#10b981', 'rgba(16, 185, 129, 0.2)'),
            'LOSS': ('#ef4444', 'rgba(239, 68, 68, 0.2)'),
            'BE': ('#f59e0b', 'rgba(245, 158, 11, 0.2)'),
        }
        color, bg = colors.get(obj.outcome, ('#94a3b8', 'rgba(148, 163, 184, 0.2)'))
        return format_html(
            '<span style="color: {}; background: {}; border: 1px solid {}; padding: 2px 10px; border-radius: 12px; font-weight: 700; font-size: 11px;">{}</span>',
            color, bg, color, obj.outcome or 'PENDING'
        )
    colored_outcome.short_description = "Outcome"

    def screenshot_preview(self, obj):
        if obj.screenshot:
            return format_html(
                '<a href="{}" target="_blank"><img src="{}" style="max-height: 38px; border-radius: 4px; border: 1px solid #334155;" /></a>',
                obj.screenshot.url, obj.screenshot.url
            )
        return format_html('<span style="color: #64748b; font-size: 11px;">No image</span>')
    screenshot_preview.short_description = "Chart"

@admin.register(Strategy)
class StrategyAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'category', 'trades_count', 'created_at')
    search_fields = ('name', 'user__username', 'category')
    list_filter = ('category', 'created_at')

    def trades_count(self, obj):
        return obj.trades.count()
    trades_count.short_description = "Total Trades"

@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'verified', 'token', 'created_at')
    list_filter = ('verified',)
    search_fields = ('user__username', 'user__email', 'token')