import django_filters
from .models import Trade

class TradeFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name='trade_date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='trade_date', lookup_expr='lte')
    market_pair = django_filters.CharFilter(method='filter_market_pair')
    strategy_id = django_filters.CharFilter(method='filter_strategy_id')
    session = django_filters.ChoiceFilter(field_name='trading_session', choices=Trade.SESSION_CHOICES)
    outcome = django_filters.ChoiceFilter(field_name='outcome', choices=Trade.OUTCOME_CHOICES)

    class Meta:
        model = Trade
        fields = ['buy_sell', 'trading_session', 'market_pair', 'session', 'outcome', 'strategies']

    def filter_market_pair(self, queryset, name, value):
        if value:
            pairs = [p.strip() for p in value.split(',')]
            return queryset.filter(market_pair__in=pairs)
        return queryset

    def filter_strategy_id(self, queryset, name, value):
        if value:
            ids = [i.strip() for i in value.split(',')]
            return queryset.filter(strategies__id__in=ids).distinct()
        return queryset

        