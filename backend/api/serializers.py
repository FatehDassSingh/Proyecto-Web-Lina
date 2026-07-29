from rest_framework import serializers
from .models import Category, MenuItem, Commune, LeadCoupon, Order, OrderItem, OrderHistory, BusinessConfig, decrypt_value

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'

class CategoryDetailSerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'items']

class CommuneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commune
        fields = '__all__'

class LeadCouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadCoupon
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderHistory
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    history = OrderHistorySerializer(many=True, read_only=True)

    client_rut = serializers.SerializerMethodField()
    client_phone = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()

    def get_client_rut(self, obj):
        return decrypt_value(obj.client_rut)

    def get_client_phone(self, obj):
        return decrypt_value(obj.client_phone)

    def get_address(self, obj):
        return decrypt_value(obj.address)

    class Meta:
        model = Order
        fields = '__all__'

class BusinessConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessConfig
        fields = '__all__'
