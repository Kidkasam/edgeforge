import django_filters
from . models import Trade, AnalyticsSnapshot

class TradeFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(fieldname='trade_date', lookup_exp='gte')
    end_date = django_filters.DateFilter(fieldname='trade_date', lookup_exp='lte')
    winning = django_filters.BooleanFilter(method='filter_winning')


    class Meta:
        models= Trade
        fields = ['buy_Sell', 'trading_session', 'market_pair']

    def filter_winning(self, queryset, name, value):
        if value is True:
            return queryset.filter(profit_loss__gt=0)
        elif value is False:
            return queryset.filter(profit_loss__lte=0)
        return queryset

class SnapshotFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(fieldname='snapshot_date', lookup_exp='gte')
    end_date = django_filters.DateFilter(fieldname='snapshot_datesend', lookup_exp='lte')


    class Meta:
        models= AnalyticsSnapshot

        