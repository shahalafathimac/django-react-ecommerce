from django.urls import path
from .views import AdminOrderListAPIView, OrderListCreateAPIView, OrderStatusAPIView

urlpatterns = [
    path("", OrderListCreateAPIView.as_view()),
    path("admin/", AdminOrderListAPIView.as_view()),
    path("<int:order_id>/status/", OrderStatusAPIView.as_view()),
]
