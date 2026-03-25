from django.urls import path
from .views import ProductDetailAPIView,ProductListAPIView

urlpatterns = [
    path('products/',ProductListAPIView.as_view()),
    path('products/<int:pk>/',ProductDetailAPIView.as_view()),
]
