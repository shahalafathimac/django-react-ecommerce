from  . models import Product,Category
from .serializers import ProductSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404


class ProductListAPIView(APIView):
    def get(self, request):
        try:
            category = request.query_params.get('category')
            queryset = Product.objects.select_related('category').all()

            if category:
                queryset = queryset.filter(category__name__iexact=category)

            if not queryset.exists():
                return Response(
                    {"message":"no product found"},
                    status = status.HTTP_404_NOT_FOUND
                )
            serializer = ProductSerializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {"error":str(e)},
                status = status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class ProductDetailAPIView(APIView):
    def get(self, request, pk):
        try:
            Product = get_object_or_404(
                Product.objects.select_related('category'),
                pk=pk
            )
            serializer = ProductSerializer(Product)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status = status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    
