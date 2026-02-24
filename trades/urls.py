from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterAPIView, LoginAPIView, LogoutAPIView,
    TradeViewSet, StrategyViewSet, AnalyticsSnapshotViewSet
)

router = DefaultRouter()
router.register(r'trades', TradeViewSet)
router.register(r'strategies', StrategyViewSet)
router.register(r'snapshots', AnalyticsSnapshotViewSet)

urlpatterns = [
    path('', include(router.urls)),        # ViewSets
    path('auth/register/', RegisterAPIView.as_view(), name='register'),
    path('auth/login/', LoginAPIView.as_view(), name='login'),
    path('auth/logout/', LogoutAPIView.as_view(), name='logout'),
]