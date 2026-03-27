from django.urls import path
from .views import (
    ProductCategoryListAPIView,
    ProductCreateAPIView,
    ProductDeleteAPIView,
    ProductDetailAPIView,
    ProductListAPIView,
    ProductUpdateAPIView,
)

urlpatterns = [
    path('products/',ProductListAPIView.as_view()),
    path('products/categories/', ProductCategoryListAPIView.as_view()),
    path('products/<int:pk>/',ProductDetailAPIView.as_view()),

     # optional admin APIs
    path('products/create/', ProductCreateAPIView.as_view()),
    path('products/update/<int:pk>/', ProductUpdateAPIView.as_view()),
    path('products/delete/<int:pk>/', ProductDeleteAPIView.as_view()),
]
