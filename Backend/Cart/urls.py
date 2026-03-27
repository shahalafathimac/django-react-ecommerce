from django.urls import path
from .views import AddToCartAPIView, CartAPIView, CartItemAPIView, ClearCartAPIView

urlpatterns = [
    path('', CartAPIView.as_view()),
    path('add/', AddToCartAPIView.as_view()),
    path('items/<int:item_id>/', CartItemAPIView.as_view()),
    path('clear/', ClearCartAPIView.as_view()),
]
