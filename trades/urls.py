from django.urls import path
from .views import RegisterAPIView, LoginAPIView, LogoutAPIView
from rest_framework.routers import DefaultRouter
from .views import TradeViewSet, StrategyViewSet, AnalyticsSnapshotViewSet

router = DefaultRouter()
router.register(r'trades', TradeViewSet)
router.register(r'strategies', StrategyViewSet)
router.register(r'snapshots', AnalyticsSnapshotViewSet)

urlpatterns = router.urls

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
]