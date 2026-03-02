from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from django_filters.rest_framework import DjangoFilterBackend
from .filters import TradeFilter
from .models import Trade, Strategy
from .serializers import TradeSerializer, StrategySerializer, UserRegisterSerializer
from rest_framework.pagination import PageNumberPagination


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return

class CustomPagination(PageNumberPagination):
    page_size_query_param = 'page_size'

    def get_paginated_response(self, data):
        total_count = self.page.paginator.count
        current_count = len(data)
        showing_text = f"{current_count} of {total_count} trades"
        
        return Response({
            'count': total_count,
            'showing_text': showing_text,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })

class TradeViewSet(viewsets.ModelViewSet):
    queryset = Trade.objects.all()
    serializer_class = TradeSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]
    pagination_class = CustomPagination

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TradeFilter
    search_fields = ['market_pair', 'reflection']
    ordering_fields = ['trade_date', 'profit_loss', 'pips', 'risk_reward', 'created_at']
    ordering = ['-trade_date', '-created_at', ]

    def get_queryset(self):
        return Trade.objects.filter(user=self.request.user).prefetch_related('strategies')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class StrategyViewSet(viewsets.ModelViewSet):
    queryset = Strategy.objects.all()
    serializer_class = StrategySerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def get_queryset(self):
        return Strategy.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from django.db.models import Sum, Avg, Count, Case, When, FloatField, Q, Max, Min
from django.db.models.functions import TruncMonth

class OverviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def get(self, request):
        user = request.user
        trades = Trade.objects.filter(user=user)
        total_trades = trades.count()

        if total_trades == 0:
            return Response({
                "total_pnl": 0, "total_pips": 0, "win_rate": 0,
                "win_loss_record": "0W / 0L", "avg_win": 0, "avg_loss": 0,
                "avg_rr": 0, "profit_factor": 0, "total_trades": 0,
                "best_trade": 0, "worst_trade": 0
            })

        stats = trades.aggregate(
            total_pnl=Sum('profit_loss'),
            total_pips=Sum('pips'),
            avg_rr=Avg('risk_reward'),
            winning_trades=Count(Case(When(profit_loss__gt=0, then=1))),
            losing_trades=Count(Case(When(profit_loss__lt=0, then=1))),
            total_win_amount=Sum(Case(When(profit_loss__gt=0, then='profit_loss'), default=0, output_field=FloatField())),
            total_loss_amount=Sum(Case(When(profit_loss__lt=0, then='profit_loss'), default=0, output_field=FloatField())),
            avg_win=Avg(Case(When(profit_loss__gt=0, then='profit_loss'))),
            avg_loss=Avg(Case(When(profit_loss__lt=0, then='profit_loss'))),
            best_trade=Max('profit_loss'),
            worst_trade=Min('profit_loss'),
        )

        win_rate = round((stats['winning_trades'] / total_trades) * 100, 2)
        profit_factor = round(abs(stats['total_win_amount'] / stats['total_loss_amount']), 2) if stats['total_loss_amount'] != 0 else round(stats['total_win_amount'] or 0, 2)

        return Response({
            "total_pnl": round(stats['total_pnl'] or 0, 2),
            "total_pips": round(stats['total_pips'] or 0, 2),
            "win_rate": win_rate,
            "win_loss_record": f"{stats['winning_trades']}W / {stats['losing_trades']}L",
            "avg_win": round(stats['avg_win'] or 0, 2),
            "avg_loss": round(stats['avg_loss'] or 0, 2),
            "avg_rr": round(stats['avg_rr'] or 0, 2),
            "profit_factor": profit_factor,
            "total_trades": total_trades,
            "best_trade": round(stats['best_trade'] or 0, 2),
            "worst_trade": round(stats['worst_trade'] or 0, 2)
        })

class StatisticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def get(self, request):
        user = request.user
        trades = Trade.objects.filter(user=user)


        sessions = trades.values('trading_session').annotate(
            trades=Count('id'),
            total_pnl=Sum('profit_loss'),
            win_rate=Count(Case(When(profit_loss__gt=0, then=1))) * 100.0 / Count('id')
        )
        session_breakdown = []
        for s in sessions:
            if s['trading_session']:
                session_breakdown.append({
                    'session': s['trading_session'],
                    'trades': s['trades'],
                    'total_pnl': round(s['total_pnl'] or 0, 2),
                    'win_rate': round(s['win_rate'] or 0, 2)
                })


        monthly_stats = trades.annotate(month=TruncMonth('trade_date')).values('month').annotate(
            total_pnl=Sum('profit_loss')
        ).order_by('month')
        monthly_pnl = []
        for m in monthly_stats:
            monthly_pnl.append({
                'month': m['month'].strftime('%Y-%m'),
                'total_pnl': round(m['total_pnl'] or 0, 2)
            })

        return Response({
            "session_breakdown": session_breakdown,
            "monthly_pnl": monthly_pnl,
        })

@method_decorator(csrf_exempt, name='dispatch')
class RegisterAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        try:
            serializer = UserRegisterSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
from rest_framework.authtoken.models import Token

@method_decorator(csrf_exempt, name='dispatch')
class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "message": "Logged in successfully",
                "token": token.key,
                "username": user.username
            })
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
@method_decorator(csrf_exempt, name='dispatch')
class LogoutAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    def post(self, request):
        logout(request)
        return Response({"message": "Logged out successfully"})

class UserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
            "date_joined": user.date_joined,
        })
    
    def put(self, request):
        user = request.user
        user.email = request.data.get('email', user.email)
        user.save()
        return Response({"message": "Profile updated successfully"})
