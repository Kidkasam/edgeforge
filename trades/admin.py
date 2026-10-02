from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.db.models import Count, Sum, Max
from .models import Trade, Strategy, EmailVerification

admin.site.site_header = "⚔️ EdgeForge Sovereign Engine"
admin.site.site_title = "EdgeForge Institutional Admin"
admin.site.index_title = "Sovereign Trade Management & Intelligence"


# ─── Custom filter: Has Journaled? ───
class HasJournaledListFilter(admin.SimpleListFilter):
    title = 'Journal Status'
    parameter_name = 'has_journaled'

    def lookups(self, request, model_admin):
        return (
            ('yes', '✅ Has Journaled'),
            ('no', '❌ No Trades Yet'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'yes':
            user_ids = Trade.objects.values_list('user_id', flat=True).distinct()
            return queryset.filter(id__in=user_ids)
        if self.value() == 'no':
            user_ids = Trade.objects.values_list('user_id', flat=True).distinct()
            return queryset.exclude(id__in=user_ids)
        return queryset


# ─── Custom User Admin ───
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        'username',
        'email',
        'has_journaled_badge',
        'trade_count_display',
        'total_user_pnl',
        'last_trade_date',
        'is_staff',
        'is_superuser',
        'date_joined',
    )
    list_filter = (
        HasJournaledListFilter,
        'is_staff',
        'is_superuser',
        'is_active',
        'date_joined',
    )
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        try:
            return qs.annotate(
                _trade_count=Count('trade'),
                _total_pnl=Sum('trade__profit_loss'),
                _last_trade=Max('trade__trade_date'),
            )
        except Exception:
            return qs

    def has_journaled_badge(self, obj):
        try:
            count = getattr(obj, '_trade_count', None)
            if count is None:
                count = Trade.objects.filter(user=obj).count()
            if count > 0:
                return format_html(
                    '<span style="color: #10b981; background: rgba(16,185,129,0.15); '
                    'padding: 3px 10px; border-radius: 12px; font-weight: 700; font-size: 11px; '
                    'border: 1px solid rgba(16,185,129,0.3);">'
                    '✅ ACTIVE ({} trades)</span>',
                    count
                )
        except Exception:
            pass
        return mark_safe(
            '<span style="color: #ef4444; background: rgba(239,68,68,0.12); '
            'padding: 3px 10px; border-radius: 12px; font-weight: 700; font-size: 11px; '
            'border: 1px solid rgba(239,68,68,0.25);">'
            '❌ NO TRADES (0)</span>'
        )
    has_journaled_badge.short_description = "Journal Status"
    has_journaled_badge.admin_order_field = '_trade_count'

    def trade_count_display(self, obj):
        try:
            count = getattr(obj, '_trade_count', None)
            if count is None:
                count = Trade.objects.filter(user=obj).count()
            color = "#10b981" if count > 0 else "#64748b"
            return format_html(
                '<span style="color: {}; font-weight: 700; font-size: 13px;">{}</span>',
                color, count
            )
        except Exception:
            return mark_safe('<span style="color: #64748b; font-weight: 700; font-size: 13px;">0</span>')
    trade_count_display.short_description = "Trades"
    trade_count_display.admin_order_field = '_trade_count'

    def total_user_pnl(self, obj):
        try:
            val = getattr(obj, '_total_pnl', None)
            if val is None:
                val = Trade.objects.filter(user=obj).aggregate(s=Sum('profit_loss'))['s']
            pnl = float(val or 0)
            if pnl > 0:
                color = "#10b981"
                prefix = "+"
            elif pnl < 0:
                color = "#ef4444"
                prefix = ""
            else:
                color = "#64748b"
                prefix = ""
            return format_html(
                '<span style="color: {}; font-weight: 700; font-size: 13px;">{}${:,.2f}</span>',
                color, prefix, pnl
            )
        except Exception:
            return mark_safe('<span style="color: #64748b; font-weight: 700; font-size: 13px;">$0.00</span>')
    total_user_pnl.short_description = "Total P&L"
    total_user_pnl.admin_order_field = '_total_pnl'

    def last_trade_date(self, obj):
        try:
            last = getattr(obj, '_last_trade', None)
            if last is None:
                last = Trade.objects.filter(user=obj).aggregate(m=Max('trade_date'))['m']
            if last:
                try:
                    formatted = last.strftime('%b %d, %Y')
                except Exception:
                    formatted = str(last)
                return format_html(
                    '<span style="font-size: 12px;">{}</span>',
                    formatted
                )
        except Exception:
            pass
        return mark_safe(
            '<span style="color: #94a3b8; font-size: 11px; font-style: italic;">Never</span>'
        )
    last_trade_date.short_description = "Last Trade"
    last_trade_date.admin_order_field = '_last_trade'

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
        pnl = float(obj.profit_loss or 0)
        if pnl > 0:
            color = "#10b981"
            prefix = "+"
        elif pnl < 0:
            color = "#ef4444"
            prefix = ""
        else:
            color = "#f59e0b"
            prefix = ""
        return format_html(
            '<span style="color: {}; font-weight: bold; font-size: 13px;">{}${:,.2f}</span>',
            color, prefix, pnl
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
            try:
                url = obj.screenshot.url
                return format_html(
                    '<a href="{}" target="_blank"><img src="{}" style="max-height: 38px; border-radius: 4px; border: 1px solid #334155;" /></a>',
                    url, url
                )
            except Exception:
                return mark_safe('<span style="color: #64748b; font-size: 11px;">Image unavailable</span>')
        return mark_safe('<span style="color: #64748b; font-size: 11px;">No image</span>')
    screenshot_preview.short_description = "Chart"
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
