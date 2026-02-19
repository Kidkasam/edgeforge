from rest_framework.routers import DefaultRouter
from .views import TradeViewSet, StrategyViewSet, AnalyticsSnapshotViewSet

router = DefaultRouter()
router.register(r'trades', TradeViewSet)
router.register(r'strategies', StrategyViewSet)
router.register(r'snapshots', AnalyticsSnapshotViewSet)

urlpatterns = router.urls
