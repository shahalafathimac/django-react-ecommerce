from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.FloatField()
    stock = models.IntegerField()
    image = models.URLField()

    category = models.ForeignKey(Category, on_delete=models.CASCADE)

    type = models.CharField(max_length=100, default="Jewelry")

    def __str__(self):
        return self.name