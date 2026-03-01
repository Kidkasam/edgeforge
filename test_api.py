import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'edgeforge.settings')
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth.models import User
import json

def test():
    client = APIClient()
    user, _ = User.objects.get_or_create(username='test_user_cloudinary')
    client.force_authenticate(user=user)
    
    # Text Create Strategy
    res = client.post('/api/strategies/', {'name': 'My Strategy'}, format='json')
    print("Create Strat STATUS:", res.status_code)
    print("Create Strat RESPONSE:", res.data)
    
    strat_id = None
    if res.status_code == 201:
        strat_id = res.data['id']
        
    # Test Create Trade as multiform
    trade_data = {
        "market_pair": "EURUSD",
        "buy_sell": "BUY",
        "entry_price": "1.1000",
        "exit_price": "1.1050",
        "stop_loss": "1.0950",
        "take_profit": "1.1100",
        "lot_size": "0.1",
        "trade_date": "2023-01-01"
    }
    if strat_id:
        trade_data['strategies'] = [strat_id]
        
    res = client.post('/api/trades/', data=trade_data, format='multipart')
    print("Create Trade STATUS:", res.status_code)
    print("Create Trade RESPONSE:", res.data)

if __name__ == '__main__':
    test()
