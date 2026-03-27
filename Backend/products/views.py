from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.response import Response

from core.api import SafeAPIView
from core.pagination import ProductPagination

from .models import Category, Product
from .serializers import ProductSerializer


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (getattr(user, 'role', None) == 'admin' or user.is_staff)
        )


# ✅ GET ALL PRODUCTS + FILTER + SEARCH
class ProductListAPIView(SafeAPIView):
    permission_classes = [AllowAny]
    pagination_class = ProductPagination

    def get(self, request):
        products = Product.objects.select_related('category').all().order_by('id')

        category = request.GET.get('category')
        search = request.GET.get('search')
        product_type = request.GET.get('type')
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        ordering = request.GET.get('ordering')

        if category and category != "All":
            products = products.filter(category__name__iexact=category)

        if search:
            products = products.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(type__icontains=search)
                | Q(category__name__icontains=search)
            )

        if product_type and product_type != "All":
            products = products.filter(type__iexact=product_type)

        if min_price:
            products = products.filter(price__gte=min_price)

        if max_price:
            products = products.filter(price__lte=max_price)

        allowed_ordering = {
            "price": "price",
            "-price": "-price",
            "name": "name",
            "-name": "-name",
            "stock": "stock",
            "-stock": "-stock",
        }
        if ordering in allowed_ordering:
            products = products.order_by(allowed_ordering[ordering], "id")

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(products, request, view=self)
        serializer = ProductSerializer(page, many=True)
        category_names = list(Category.objects.order_by("name").values_list("name", flat=True).distinct())
        type_names = list(
            Product.objects.exclude(type__isnull=True)
            .exclude(type__exact="")
            .order_by("type")
            .values_list("type", flat=True)
            .distinct()
        )
        return Response(
            {
                "count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
                "page": paginator.page.number,
                "page_size": paginator.get_page_size(request),
                "total_pages": paginator.page.paginator.num_pages,
                "results": serializer.data,
                "filters": {
                    "categories": category_names,
                    "types": type_names,
                },
            }
        )


class ProductCategoryListAPIView(SafeAPIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = list(Category.objects.order_by("name").values_list("name", flat=True).distinct())
        types = list(
            Product.objects.exclude(type__isnull=True)
            .exclude(type__exact="")
            .order_by("type")
            .values_list("type", flat=True)
            .distinct()
        )
        return Response({"categories": categories, "types": types})


# ✅ GET SINGLE PRODUCT
class ProductDetailAPIView(SafeAPIView):

    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            product = Product.objects.select_related('category').get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        serializer = ProductSerializer(product)
        return Response(serializer.data)


# ✅ CREATE PRODUCT (for admin)
class ProductCreateAPIView(SafeAPIView):
    permission_classes = [IsAdminRole]

    def post(self, request):
        serializer = ProductSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return self.validation_error(serializer)


# ✅ UPDATE PRODUCT
class ProductUpdateAPIView(SafeAPIView):
    permission_classes = [IsAdminRole]

    def put(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        serializer = ProductSerializer(product, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return self.validation_error(serializer)


# ✅ DELETE PRODUCT
class ProductDeleteAPIView(SafeAPIView):
    permission_classes = [IsAdminRole]

    def delete(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"error": "Not found"}, status=404)

        product.delete()
        return Response({"message": "Deleted successfully"})
